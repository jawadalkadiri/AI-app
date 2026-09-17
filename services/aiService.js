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
                    Classify each job skill as required, preferred, or bonus based on the wording
                    and context of the job description.                    
                    Classify evidenceLevel using these definitions:
                        - none: the CV provides no evidence of the skill.
                        - little: the skill is mentioned, studied, or shows only basic familiarity.
                        - more: there is practical evidence such as personal or academic projects.
                        - professional: there is clear professional/work experience using the skill.
                    A skill must be classified as a strength, weak skill, or missing skill based on the evidence in the CV. Do not put the same skill in multiple categories.
                    Return JSON with exactly these fields:
                    skills: array of objects that contain an object for each skill with the following properties:
                        name: string
                        category: string (required, preferred, bonus)
                        evidenceLevel: string (none, little, more, professional)
                        importance: number (0-100) representing the skill's relative importance
                        within its category. The importance values of all skills within the same
                        category must add up to 100.                     
                    strengths: array of strings
                    weakSkills: array of strings
                    missingSkills: array of strings
                    recommendation: string
                    Do not calculate or return matchScore. The application will calculate it. `
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
    if( !result.skills || !result.strengths || !result.weakSkills || !result.missingSkills || !result.recommendation) {
        throw new Error("Invalid response format from the AI model");
    }
    else if(!Array.isArray(result.skills) || !Array.isArray(result.strengths) || !Array.isArray(result.weakSkills) || !Array.isArray(result.missingSkills) || typeof result.recommendation !== 'string') {
        throw new Error("Invalid data types in the response from the AI model");
    }
    else if(result.skills.every(skill => typeof skill.name === 'string' && typeof skill.category === 'string' && ['required', 'preferred', 'bonus'].includes(skill.category) && typeof skill.evidenceLevel === 'string' && ['none', 'little', 'more', 'professional'].includes(skill.evidenceLevel) && typeof skill.importance === 'number' && skill.importance >= 0 && skill.importance <= 100) === false) {
        throw new Error("Invalid skill object structure in the response from the AI model");
    }
    
    const requiredSkills = result.skills.filter(skill => skill.category === 'required');
    const preferredSkills = result.skills.filter(skill => skill.category === 'preferred');
    const bonusSkills = result.skills.filter(skill => skill.category === 'bonus');

    const requiredImportanceTotal = requiredSkills.reduce((total, skill) => total + skill.importance, 0);
    const preferredImportanceTotal = preferredSkills.reduce((total, skill) => total + skill.importance, 0);
    const bonusImportanceTotal = bonusSkills.reduce((total, skill) => total + skill.importance, 0);

   if(requiredSkills.length > 0 && requiredImportanceTotal !== 100) {
        throw new Error("Total importance of required skills must equal 100");
    }

    if(preferredSkills.length > 0 && preferredImportanceTotal !== 100) {
        throw new Error("Total importance of preferred skills must equal 100");
    }

    if(bonusSkills.length > 0 && bonusImportanceTotal !== 100) {
        throw new Error("Total importance of bonus skills must equal 100");
    }

    const evidenceWeights = {
        none: 0,
        little: 0.2,
        more: 0.7,
        professional: 1
    };

    const categoryWeights = {
        required: 0.7,
        preferred: 0.2,
        bonus: 0.1
    };


    let activeCategoryWeights = 0;

    if(requiredSkills.length > 0) activeCategoryWeights += categoryWeights.required;
    if(preferredSkills.length > 0) activeCategoryWeights += categoryWeights.preferred;
    if(bonusSkills.length > 0) activeCategoryWeights += categoryWeights.bonus; 
    
    if(activeCategoryWeights === 0) {
        throw new Error("No skills provided in the analysis result");
    }

    const normalizedCategoryWeight = {
        required: categoryWeights.required / activeCategoryWeights,
        preferred: categoryWeights.preferred / activeCategoryWeights,
        bonus: categoryWeights.bonus / activeCategoryWeights
    };

    let matchScore = 0;

    for (const skill of result.skills){
        matchScore += skill.importance * evidenceWeights[skill.evidenceLevel] * normalizedCategoryWeight[skill.category];
    }

    result.matchScore = Math.round(matchScore);

    return result;
}

module.exports = {
    analyzeJob
};