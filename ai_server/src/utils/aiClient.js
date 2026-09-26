import { ChatGoogle } from '@langchain/google';
import { ApiError } from './apiError.js';
import getApiKey from './getApiKey.js';

function getModel() {
    const { apiKey, model } = getApiKey();
    return new ChatGoogle({
        model: model,
        temperature: 0,
        apiKey: apiKey,
    });
}

const extractText = (aiResponse) => {
    const content = aiResponse?.content;

    if (typeof content === 'string') return content;

    if (Array.isArray(content)) {
        return content
            .map((block) => {
                if (typeof block === 'string') return block;
                if (block && typeof block.text === 'string') return block.text;
                return '';
            })
            .join('\n');
    }

    return '';
};

const stripCodeFences = (text) => {
    let cleaned = text.trim();

    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(json)?/i, '');
    }
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.replace(/```$/, '');
    }

    return cleaned.trim();
};


export const callAIJson = async (systemPrompt, userPrompt) => {
    let aiResponse;
    const model = getModel();

    try {
        aiResponse = await model.invoke([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ]);
    } catch (err) {
        throw new ApiError(502, `AI request failed: ${err.message}`);
    }

    const rawText = extractText(aiResponse);
    const cleaned = stripCodeFences(rawText);

    try {
        return JSON.parse(cleaned);
    } catch (err) {
        throw new ApiError(
            502,
            `AI returned a response that could not be parsed as JSON: ${cleaned.slice(0, 500)}`
        );
    }
};

export default callAIJson;