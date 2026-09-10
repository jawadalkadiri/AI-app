const express = require("express");
const router = express.Router();
const aiService = require("../services/aiService");
const analysisRepository = require("../database/analysisRepository");

router.post("/analyze" , async (req, res) => {
    const { cv, jobDescription, companyName, position } = req.body;
    if (!cv || !jobDescription || !companyName || !position) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const result = await aiService.analyzeJob(cv, jobDescription);
        analysisRepository.saveAnalysis(cv, jobDescription, result, companyName, position);
        res.json(result);
    } catch (error) {
        console.error("Error occurred while analyzing job:", error);
        res.status(500).json({ error: "An error occurred while analyzing the job" });
    }
})

router.get("/analytics", (req, res) => {
    const companyName = req.query.companyName;
    if (companyName) {
        const filteredAnalyses = analysisRepository.getAnalysesByCompany(companyName);
        return res.json(filteredAnalyses);
    }
    if (!companyName) {
        return res.status(400).json({ error: "companyName query parameter is required or company not found" });
    }
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