import { StateGraph, END, START } from '@langchain/langgraph';
import { tavily } from '@tavily/core';
import { callAIJson } from './aiClient.js';
import {
    buildProfileAnalysisPrompt,
    buildSearchQueriesPrompt,
    buildJobRankingPrompt,
} from './jobfinderPrompts.js';

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const graphChannels = {
    resume: null,
    interviewContext: null,
    profile: null,
    searchQueries: null,
    rawResults: null,
    jobs: null,
};

const analyzeProfile = async (state) => {
    const { systemPrompt, userPrompt } = buildProfileAnalysisPrompt({
        resume: state.resume,
        interviewContext: state.interviewContext,
    });
    const profile = await callAIJson(systemPrompt, userPrompt);
    return { profile };
};

const generateSearchQueries = async (state) => {
    const { systemPrompt, userPrompt } = buildSearchQueriesPrompt({ profile: state.profile });
    const result = await callAIJson(systemPrompt, userPrompt);
    return { searchQueries: result.queries || [] };
};

const LLM_TEXT_LIMIT = 2500;
const DB_DESC_LIMIT = 3000;

const MIN_JD_LENGTH = 400;

const cleanDescription = (text = '', limit = DB_DESC_LIMIT) =>
    text
        .replace(/^[A-Z][a-z]{2} \d{1,2}, \d{4}\s*[—-]\s*/, '')
        .replace(/\.{0,3}\s*Read more\s*$/i, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, limit);

const fetchFullDescriptions = async (urls) => {
    const map = new Map();
    if (!urls.length) return map;

    try {
        const response = await tvly.extract(urls, {
            extractDepth: 'advanced',
            format: 'text',
        });
        for (const r of response.results || []) {
            map.set(r.url, r.rawContent || '');
        }
        for (const f of response.failedResults || []) {
            console.warn(`Extract failed for ${f.url}: ${f.error}`);
        }
    } catch (err) {
        console.error('Tavily extract failed:', err.message);
    }
    return map;
};

const cleanText = (text = '', limit) =>
    text.replace(/\s+/g, ' ').trim().slice(0, limit);

const searchJobsTavily = async (state) => {
    const seen = new Set();
    const allResults = [];

    for (const query of state.searchQueries) {
        try {
            const response = await tvly.search(query, {
                maxResults: 10,
                includeRawContent: 'text',
                timeRange: 'month',
            });

            for (const r of response.results || []) {
                if (!r.url || seen.has(r.url)) continue;
                seen.add(r.url);
                allResults.push({
                    title: r.title,
                    url: r.url,
                    content: r.content,
                    rawContent: r.rawContent || '',
                });
            }
        } catch (err) {
            console.error(`Tavily search failed for "${query}":`, err.message);
        }
    }

    return { rawResults: allResults };
};

const rankAndSelectJobs = async (state) => {
    const forLLM = state.rawResults.map((r) => ({
        title: r.title,
        url: r.url,
        content: cleanText(r.rawContent, LLM_TEXT_LIMIT),
    }));

    const { systemPrompt, userPrompt } = buildJobRankingPrompt({
        profile: state.profile,
        rawResults: forLLM,
    });
    const result = await callAIJson(systemPrompt, userPrompt);

    const byUrl = new Map(state.rawResults.map((r) => [r.url, r]));

    const picked = (Array.isArray(result.jobs) ? result.jobs : [])
        .filter((j) => j && byUrl.has(j.url))
        .slice(0, 10);

    const needExtract = picked
        .filter((j) => cleanDescription(byUrl.get(j.url).rawContent).length < MIN_JD_LENGTH)
        .map((j) => j.url);

    const extracted = await fetchFullDescriptions(needExtract);

    const jobs = picked.map((j) => {
        const searchText = cleanDescription(byUrl.get(j.url).rawContent);
        const extractedText = cleanDescription(extracted.get(j.url) || '');

        const description =
            searchText.length >= MIN_JD_LENGTH ? searchText
                : extractedText.length >= MIN_JD_LENGTH ? extractedText
                    : null;

        const pct = Math.round(Number(j.matchPercentage));
        return {
            title: j.title,
            company: j.company ?? null,
            url: j.url,
            matchReason: j.matchReason ?? null,
            matchPercentage: Number.isFinite(pct) ? Math.min(100, Math.max(0, pct)) : null,
            location: j.location ?? null,
            postedAgo: j.postedAgo ?? null,
            description,
        };
    });

    return { jobs };
};

const graph = new StateGraph({ channels: graphChannels })
    .addNode('analyzeProfile', analyzeProfile)
    .addNode('generateSearchQueries', generateSearchQueries)
    .addNode('searchJobsTavily', searchJobsTavily)
    .addNode('rankAndSelectJobs', rankAndSelectJobs)
    .addEdge(START, 'analyzeProfile')
    .addEdge('analyzeProfile', 'generateSearchQueries')
    .addEdge('generateSearchQueries', 'searchJobsTavily')
    .addEdge('searchJobsTavily', 'rankAndSelectJobs')
    .addEdge('rankAndSelectJobs', END);

const jobFinderGraph = graph.compile();

export const runJobFinderAgent = async ({ resume, interviewContext }) => {
    const finalState = await jobFinderGraph.invoke({ resume, interviewContext });
    return finalState;
};