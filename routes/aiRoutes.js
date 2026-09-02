const express = require("express");
const router = express.Router();
const aiService = require("../services/aiService");

router.post("/analyze" , async (req, res) => {
    const { cv, jobDescription } = req.body;
    if (!cv || !jobDescription) {
        return res.status(400).json({ error: "CV and job description are required" });
    }

    try {
        const result = await aiService.analyzeJob(cv, jobDescription);
        res.json(result);
    } catch (error) {
        console.error("Error occurred while analyzing job:", error);
        res.status(500).json({ error: "An error occurred while analyzing the job" });
    }
})

module.exports = router;    