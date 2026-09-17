const { db } = require("./db");

function saveAnalysis(cv, jobDescription, analysisResult, companyName, position) {
    const { matchScore, strengths, missingSkills, recommendation, weakSkills, skills } = analysisResult;
    const missingSkillsString = JSON.stringify(missingSkills);
    const strengthsString = JSON.stringify(strengths);
    const weakSkillsString = JSON.stringify(weakSkills);
    const skillsString = JSON.stringify(skills);
    db.prepare('INSERT INTO analytics (cv, jobDescription, matchScore, strengths, missingSkills, recommendation, companyName, position, weakSkills, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(cv, jobDescription, matchScore, strengthsString, missingSkillsString, recommendation, companyName, position, weakSkillsString, skillsString);
}

function getAllAnalyses() {
    const analyses = db.prepare('SELECT * FROM analytics').all();
    analyses.forEach(analysis => {
        analysis.strengths = JSON.parse(analysis.strengths);
        analysis.missingSkills = JSON.parse(analysis.missingSkills);
        analysis.weakSkills =analysis.weakSkills ? JSON.parse(analysis.weakSkills) : [];
        analysis.skills =analysis.skills ? JSON.parse(analysis.skills) : [];
    });
    return analyses;
}

function getAnalysisById(id) {
    const analysis = db.prepare('SELECT * FROM analytics WHERE id = ?').get(id);
    if (analysis) {
        analysis.strengths = JSON.parse(analysis.strengths);
        analysis.missingSkills = JSON.parse(analysis.missingSkills);
        analysis.weakSkills =analysis.weakSkills ? JSON.parse(analysis.weakSkills) : [];
        analysis.skills =analysis.skills ? JSON.parse(analysis.skills) : [];
    }
    return analysis;
}

function getAnalysesByCompany(companyName) {
    const analyses = db.prepare('SELECT * FROM analytics WHERE companyName LIKE ?').all(`%${companyName}%`);
    analyses.forEach(analysis => {
        analysis.strengths = JSON.parse(analysis.strengths);
        analysis.missingSkills = JSON.parse(analysis.missingSkills);
        analysis.weakSkills = analysis.weakSkills ? JSON.parse(analysis.weakSkills) : [];
        analysis.skills =analysis.skills ? JSON.parse(analysis.skills) : [];
    });
    return analyses;
}

function deleteAnalysisById(id) {
    const result = db.prepare('DELETE FROM analytics WHERE id = ?').run(id);
    return result.changes > 0;
}

module.exports = {
    saveAnalysis,
    getAllAnalyses,
    getAnalysisById,
    getAnalysesByCompany,
    deleteAnalysisById
};
