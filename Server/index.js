import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- helpers ---
function sliceByWords(str, maxWords) {
  // returns the substring containing up to maxWords whole words
  // and the number of words in that slice
  if (maxWords <= 0 || !str) return { slice: '', words: 0 };
  const re = /[^\s]+/g;
  let match;
  let count = 0;
  let endIdx = 0;
  while ((match = re.exec(str)) !== null) {
    count++;
    endIdx = match.index + match[0].length;
    if (count === maxWords) break;
  }
  if (count < maxWords) return { slice: str, words: count };
  return { slice: str.slice(0, endIdx), words: maxWords };
}

function writeSSE(res, data) {
  // replace newlines to avoid breaking SSE frame boundaries
  const safe = String(data).replace(/\r?\n/g, ' ');
  res.write(`data: ${safe}\n\n`);
}

// --- Streaming chat endpoint with abort + 50-word cap ---
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  // Prepare SSE headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  // If you use a proxy/CDN that buffers, you may need additional config to allow streaming.

  // Track client aborts
  let clientClosed = false;
  req.on('close', () => {
    clientClosed = true;
    // Express will end the socket; we just stop reading the model stream.
  });

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const stream = await model.generateContentStream({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are an AI assistant for my portfolio website.
Keep answers concise, professional, and helpful.
Default length: ~40–50 words; do not exceed 50 words.
Only go longer if the user explicitly asks for a detailed explanation.

User message: ${message}`,
            },
          ],
        },
      ],
      generationConfig: {
        // Keep short by design; server still enforces 50-word hard cap
        maxOutputTokens: 150,
        temperature: 0.7,
      },
    });

    let wordsSent = 0;
    const MAX_WORDS = 50;

    for await (const chunk of stream.stream) {
      if (clientClosed) break;
      const piece = chunk?.text?.() ?? '';
      if (!piece) continue;

      // Only send up to remaining words
      const remaining = MAX_WORDS - wordsSent;
      if (remaining <= 0) break;

      const { slice, words } = sliceByWords(piece, remaining);
      if (slice) writeSSE(res, slice);
      wordsSent += words;

      if (wordsSent >= MAX_WORDS) break;
    }

    if (!clientClosed) {
      writeSSE(res, '[DONE]');
      res.end();
    }
  } catch (error) {
    console.error('Error:', error);
    if (!res.headersSent) {
      res.status(500).send('Something went wrong');
    } else {
      writeSSE(res, '[ERROR]');
      res.end();
    }
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
