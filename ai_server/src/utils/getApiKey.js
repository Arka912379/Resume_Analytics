let getIndex = 0;
const apiArray = [
    {key: process.env.GOOGLE_API_KEY_0, countUse: 0, model: 'gemini-2.5-flash'}, 
    {key: process.env.GOOGLE_API_KEY_1, countUse: 0, model: 'gemini-2.5-flash'}, 
    {key: process.env.GOOGLE_API_KEY_2, countUse: 0, model: 'gemini-3.5-flash'}
];
const getApiKey = () => {
    const apiKey = apiArray[getIndex].key;
    const model = apiArray[getIndex].model;
    apiArray[getIndex].countUse += 1;
    getIndex = (getIndex + 1) % apiArray.length;
    console.log("API Key used:", apiKey, "Count:", apiArray[getIndex].countUse, "Next Index:", getIndex);
    return { apiKey, model };
}
export default getApiKey;