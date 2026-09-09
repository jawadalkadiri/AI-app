const { db } = require("./db");

function saveAnalysis(cv, jobDescription, analysisResult) {
    const { matchScore, strengths, missingSkills, recommendation } = analysisResult;
    const missingSkillsString = JSON.stringify(missingSkills);
    const strengthsString = JSON.stringify(strengths);
    db.prepare('INSERT INTO analytics (cv, jobDescription, matchScore, strengths, missingSkills, recommendation) VALUES (?, ?, ?, ?, ?, ?)').run(cv, jobDescription, matchScore, strengthsString, missingSkillsString, recommendation);
}

function getAllAnalyses() {
    const analyses = db.prepare('SELECT * FROM analytics').all();
    analyses.forEach(analysis => {
        analysis.strengths = JSON.parse(analysis.strengths);
        analysis.missingSkills = JSON.parse(analysis.missingSkills);
    });
    return analyses;
}

function getAnalysisById(id) {
    const analysis = db.prepare('SELECT * FROM analytics WHERE id = ?').get(id);
    if (analysis) {
        analysis.strengths = JSON.parse(analysis.strengths);
        analysis.missingSkills = JSON.parse(analysis.missingSkills);
    }
    return analysis;
}

function deleteAnalysisById(id) {
    const result = db.prepare('DELETE FROM analytics WHERE id = ?').run(id);
    return result.changes > 0;
}

module.exports = {
    saveAnalysis,
    getAllAnalyses,
    getAnalysisById,
    deleteAnalysisById
};
