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
    return JSON.parse(response.choices[0].message.content);
}

module.exports = {
    analyzeJob
};