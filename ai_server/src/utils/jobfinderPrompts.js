export const buildProfileAnalysisPrompt = ({ resume, interviewContext }) => {
    const systemPrompt = `You are an expert technical recruiter. Analyze a candidate's resume AND their past interview performance to determine their real skill profile.

        Provide:
        - "experienceLevel": one of "fresher", "junior", "mid", "senior", "lead", based on years of experience, seniority of roles/projects, and interview performance.
        - "yearsOfExperience": your best numeric estimate of total years of relevant professional experience (0 if a fresher with no professional experience).
        - "developerTypes": an array of 1 to 3 short labels describing what kind of developer they are, based on their skills, project descriptions, and experience descriptions. Pick from (or use something equally specific if nothing fits): "frontend developer", "backend developer", "fullstack developer", "ml developer", "ai developer", "agent developer", "java developer", "python developer", "fastapi developer", "spring boot developer", "devops engineer", "mobile developer", "data engineer". A candidate can genuinely be a combination (e.g. ["frontend developer", "agent developer"]) — only include types that are clearly supported by the resume.
        - "profileSummary": a short 2-3 sentence summary of this candidate's overall profile, written like a recruiter's note, mentioning how their interview performance (if any) factors into how strong a candidate they are.

        If the candidate has completed interviews with a good average score, treat that as a positive signal that strengthens their profile (e.g. a mid-level-looking resume with a strong interview score can be described as a stronger candidate). If they have a poor average score, mention it as a gap even if the resume looks technically fine. If they have no completed interviews yet, do not penalize them — just don't mention interview performance.

        Output ONLY valid JSON matching the schema below. No markdown fences, no commentary.

        JSON schema:
        {
        "experienceLevel": "fresher | junior | mid | senior | lead",
        "yearsOfExperience": number,
        "developerTypes": ["string"],
        "profileSummary": "string"
        }
    `;

    const userPrompt = `Candidate resume data (JSON):
        ${JSON.stringify(resume?.parsedData || {}, null, 2)}

        Interview track record:
        ${JSON.stringify(interviewContext, null, 2)}
    `;

    return { systemPrompt, userPrompt };
};


export const buildSearchQueriesPrompt = ({ profile }) => {
    const systemPrompt = `You are a job-search specialist. Given a candidate's profile, write 3 to 4 short, realistic search engine queries that would surface CURRENT, OPEN job postings that fit them well.

        Rules:
        - Each query should read like something a person would actually type into Google to find job postings (e.g. "backend developer jobs remote node.js", "entry level frontend developer hiring react").
        - Vary the queries across the candidate's different developer types / seniority / key skills so they cover different angles, not near-duplicates of each other.
        - Do not include any specific company names.
        - Keep each query under 10 words.

        Output ONLY valid JSON matching the schema below. No markdown fences, no commentary.

        JSON schema:
        { "queries": ["string"] }
    `;

    const userPrompt = `Candidate profile (JSON):
        ${JSON.stringify(profile, null, 2)}
    `;

    return { systemPrompt, userPrompt };
};


export const buildJobRankingPrompt = ({ profile, rawResults }) => {
    const systemPrompt = `You are an expert technical recruiter. You will receive a candidate's profile and a list of raw web search results (titles, URLs, and short content snippets) gathered from several job-search queries.
 
        Your job: select the best 10 results that are genuinely relevant, real, open job postings matching the candidate's profile.
        
        Rules:
        - Only pick results that look like actual job postings (not blog posts, "top 10 companies" articles, generic career advice pages, or job-board homepages with no specific role).
        - Prefer postings that clearly match the candidate's developer type(s) and experience level.
        - Remove duplicates (same job posted on multiple sites, or the same URL appearing twice).
        - If fewer than 10 genuinely good postings exist in the results, return fewer rather than padding with irrelevant ones.
        - For each selected job, write a one-sentence "matchReason" explaining specifically why it fits this candidate.
        - Use the "url" EXACTLY as given in the raw results — never invent or modify a URL.
        - Extract "title" and "company" from the result's title/content if identifiable; use null for "company" if it cannot be determined.
        
        Output ONLY valid JSON matching the schema below. No markdown fences, no commentary.
        
        JSON schema:
        {
            "jobs": [
                { "title": "string", "company": "string | null", "url": "string", "matchReason": "string" }
            ]
        }
    `;
 
    const userPrompt = `Candidate profile (JSON):
        ${JSON.stringify(profile, null, 2)}
        
        Raw search results (JSON):
        ${JSON.stringify(rawResults, null, 2)}
    `;
 
    return { systemPrompt, userPrompt };
};