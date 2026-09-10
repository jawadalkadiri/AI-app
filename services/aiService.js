const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function analyzeJob(cv, jobDescription) {
   const response = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: `You are a job application assistant.
                    Analyze the candidate CV against the job description.
                    Required/core skills should have the highest impact 70%, preferred skills less impact 20%, and bonus skills the lowest impact 10%. Candidate skill level/evidence should also affect how much credit they receive.
                    We should be sure of the candidate's experience in each skill if the skills he have doesnt have any evidence of his work and his experience the scoring percentage gonna change,
                    no evidence of the skill no credit, little evidence 20% of the total credit we assigned, more evidence like projects etc... 70% of the total credits, professional evidence with 100% of the total credits.
                    If one or more requirement categories are absent, redistribute their weight proportionally among the categories that are present so the scoring weights always total 100%.
                    A skill must be classified as a strength, weak skill, or missing skill based on the evidence in the CV. Do not put the same skill in multiple categories.
                    Return JSON with exactly these fields:
                    matchScore: number from 0 to 100
                    strengths: array of strings
                    weakSkills: array of strings
                    missingSkills: array of strings
                    recommendation: string`
            },
            { 
                role: "user",
              content: `CV: ${cv}\nJob Description: ${jobDescription}`
             }
        ],
        model: "openai/gpt-oss-20b",
        response_format: {
            type: "json_object"
        }
    });

    if (!response || !response.choices || response.choices.length === 0) {
        throw new Error("Failed to get a response from the AI model");
    }
    const result = JSON.parse(response.choices[0].message.content);
    if(result.matchScore === undefined || !result.strengths || !result.weakSkills || !result.missingSkills || !result.recommendation) {
        throw new Error("Invalid response format from the AI model");
    }
    else if(typeof result.matchScore !== 'number' || !Array.isArray(result.strengths) || !Array.isArray(result.weakSkills) || !Array.isArray(result.missingSkills) || typeof result.recommendation !== 'string') {
        throw new Error("Invalid data types in the response from the AI model");
    }
    else if(result.matchScore < 0 || result.matchScore > 100) {
        throw new Error("matchScore is out of the expected range (0-100)");
    }
    return result;
}

module.exports = {
    analyzeJob
};