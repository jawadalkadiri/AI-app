const express = require("express");
const router = express.Router();
const aiService = require("../services/aiService");
const analysisRepository = require("../database/analysisRepository");

router.post("/analyze" , async (req, res) => {
    const { cv, jobDescription } = req.body;
    if (!cv || !jobDescription) {
        return res.status(400).json({ error: "CV and job description are required" });
    }

    try {
        const result = await aiService.analyzeJob(cv, jobDescription);
        analysisRepository.saveAnalysis(cv, jobDescription, result);
        res.json(result);
    } catch (error) {
        console.error("Error occurred while analyzing job:", error);
        res.status(500).json({ error: "An error occurred while analyzing the job" });
    }
})

router.get("/analytics", (req, res) => {
    const analyses = analysisRepository.getAllAnalyses();
    res.json(analyses);
});

router.get("/analytics/:id", (req, res) => {
    const analysisId = parseInt(req.params.id);
    const analysis = analysisRepository.getAnalysisById(analysisId);
    if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
    }
    res.json(analysis);
});

router.delete("/analytics/:id", (req, res) => {
    const analysisId = parseInt(req.params.id);
    const success = analysisRepository.deleteAnalysisById(analysisId);
    if (!success) {
        return res.status(404).json({ error: "Analysis not found" });
    }
    res.json({ message: "Analysis deleted successfully" });
});

module.exports = router;    