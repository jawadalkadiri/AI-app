require("dotenv").config();
const {db} = require("./database/db");
const express = require('express');
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());
const port = process.env.PORT || 3000;


const aiRoutes = require('./routes/aiRoutes');

app.use('/api/ai', aiRoutes);




app.get('/api/ai/models', async (req, res) => {
    const models = await groq.models.list();
    res.json(models);
});






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
