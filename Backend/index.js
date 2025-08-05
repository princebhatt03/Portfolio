const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Use your FREE API key from Google AI Studio
const API_KEY = 'AIzaSyDH2e9z0zyFv61bMuutPN7vB6wtdN2WlQw';

app.post('/chat', async (req, res) => {
  const prompt = req.body.prompt;

  if (!prompt) {
    return res.status(400).json({ reply: 'Prompt is required.' });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok || data.error) {
      return res
        .status(500)
        .json({ reply: data.error?.message || 'Gemini API error' });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No response from Gemini.';

    res.json({ reply });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ reply: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Gemini backend running at http://localhost:${PORT}`);
});
