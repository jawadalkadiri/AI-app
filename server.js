require("dotenv").config();

const express = require('express');
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());
const port = process.env.PORT || 3000;

const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

app.post('/api/ai/chat', async (req, res) => {
    const { cv, jobDescription } = req.body;

    if (!cv || !jobDescription) {
        return res.status(400).json({ error: "CV and job description are required" });
    }

try {
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
        return res.status(500).json({ error: "Failed to get a response from the AI model" });
    }
    const result = JSON.parse(response.choices[0].message.content);
    res.json(result);
} catch (error) {
    console.error("Error occurred while processing AI request:", error);
    return res.status(500).json({ error: "An error occurred while processing the AI request" });
}


app.get('/api/ai/models', async (req, res) => {
    const models = await groq.models.list();
    res.json(models);
});


const Database = require('better-sqlite3');
const db = new Database('users.db');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);
`);



app.get('/api/users', (req, res) => {
    res.json(db.prepare('SELECT * FROM users').all());
});

app.get('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId); 
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
});

app.post('/api/users', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    db.prepare('INSERT INTO users (name) VALUES (?)').run(name);
    
    res.status(201).json({ message: 'User added successfully' });

})

app.delete('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    if (result.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
});

app.get('/', (req, res) => {
    res.json({ message: 'AI Backend API is running!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
