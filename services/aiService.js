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
                    Return JSON with exactly these fields:
                    matchScore: number from 0 to 100
                    strengths: array of strings
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
    if(result.matchScore === undefined || !result.strengths || !result.missingSkills || !result.recommendation) {
        throw new Error("Invalid response format from the AI model");
    }
    else if(typeof result.matchScore !== 'number' || !Array.isArray(result.strengths) || !Array.isArray(result.missingSkills) || typeof result.recommendation !== 'string') {
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