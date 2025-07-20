const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "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",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "My Chatbot App",
  },
});

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Missing message' });

  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemma-3n-e2b-it:free",
      messages: [
        { 
            role: "system", 
            content: message 
        }
      ],
    });

    const reply = completion.choices?.[0]?.message?.content || "(Không có phản hồi)";
    res.json({ reply });
  } catch (err) {
    console.error("OpenRouter error:", err?.response?.data || err.message);
    res.status(500).json({ error: 'OpenRouter API error', detail: err?.response?.data || err.message });
  }
});

module.exports = router;
