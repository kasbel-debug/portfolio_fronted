// server/routes/chat.js
const express = require('express');
const { OpenAI } = require('openai');
const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Store conversation history (in production, use a database)
let conversationHistory = new Map();

// Portfolio context - customize this with your information
const PORTFOLIO_CONTEXT = `
You are an AI assistant for a portfolio website. Here's information about the owner:
- Name: KASTURI BELAN
- Role: Full Stack Developer
- Skills: HTML, CSS, JavaScript, React, Node.js, Python, MongoDB, SQL
- Experience: TATA CONSULTANCY SERVICES
- Projects: B2C Salad Bowl Subscription Service
- Contact: 7796859469
`;

// POST /api/chat - Handle chat messages
router.post('/', async (req, res) => {
    try {
        const { message, sessionId = 'default' } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get or create conversation history for this session
        if (!conversationHistory.has(sessionId)) {
            conversationHistory.set(sessionId, [
                { role: 'system', content: PORTFOLIO_CONTEXT }
            ]);
        }

        const history = conversationHistory.get(sessionId);
        
        // Add user message to history
        history.push({ role: 'user', content: message });

        // Get AI response
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: history,
            max_tokens: 150,
            temperature: 0.7,
        });

        const aiResponse = completion.choices[0].message.content;

        // Add AI response to history
        history.push({ role: 'assistant', content: aiResponse });

        // Keep conversation history manageable (last 10 messages)
        if (history.length > 21) { // 1 system + 20 messages
            history.splice(1, 2); // Remove oldest user+assistant pair
        }

        res.json({
            response: aiResponse,
            sessionId: sessionId
        });

    } catch (error) {
        console.error('Chat error:', error);
        
        if (error.code === 'insufficient_quota') {
            res.status(400).json({ 
                error: 'API quota exceeded. Please try again later.' 
            });
        } else {
            res.status(500).json({ 
                error: 'Sorry, I encountered an error. Please try again.' 
            });
        }
    }
});

// GET /api/chat/health - Health check
router.get('/health', (req, res) => {
    res.json({ status: 'Chat service is running!' });
});

module.exports = router;