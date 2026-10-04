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

const searchJobsTavily = async (state) => {
    const allResults = [];

    for (const query of state.searchQueries) {
        const response = await tvly.search(query, { max_results: 10 });
        console.log(response.results);
        const resultsForThisQuery = (response.results || []).map((r) => ({
            title: r.title,
            url: r.url,
            content: r.content,
        }));
        allResults.push(...resultsForThisQuery);
    }

    return { rawResults: allResults };
};

const rankAndSelectJobs = async (state) => {
    const { systemPrompt, userPrompt } = buildJobRankingPrompt({
        profile: state.profile,
        rawResults: state.rawResults,
    });
    const result = await callAIJson(systemPrompt, userPrompt);
    return { jobs: Array.isArray(result.jobs) ? result.jobs.slice(0, 10) : [] };
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