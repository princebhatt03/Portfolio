import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set. Copy .env.example to .env first.');
  process.exit(1);
}

const app = express();

// Behind Vercel/Render the client IP arrives in X-Forwarded-For; without this
// the rate limiter sees every request as coming from the proxy.
app.set('trust proxy', 1);

// --- config ---
const MAX_MESSAGE_CHARS = 500;
const MAX_WORDS = 50;

// Origins allowed to call this API. Override in production with a comma-separated
// ALLOWED_ORIGINS env var. Without this, the endpoint is an open Gemini proxy that
// anyone can point at your API key.
const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ||
  'https://princebhatt03.github.io,http://localhost:3000,http://127.0.0.1:5500'
)
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin requests and curl send no Origin header.
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} is not allowed`));
    },
    methods: ['POST'],
  })
);

// Reject oversized bodies before they are parsed.
app.use(express.json({ limit: '4kb' }));

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10, // per IP per minute
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many messages. Please wait a minute and try again.' },
});

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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Grounding the model in real facts is what lets the front end answer most
// questions locally and hand only the unusual ones here.
//
// KEEP IN STEP WITH assets/data/profile.json — that file is the source of
// truth the browser answers from; this is the same material for the model.
const SYSTEM_PROMPT = `You are the AI assistant on Prince Bhatt's portfolio website.
You answer questions from recruiters, potential clients and other developers.

WHO HE IS
- Prince Bhatt, Full Stack Developer, based in Bhopal, Madhya Pradesh, India.
- Born 3 August 2002.
- Professional experience began March 2024. As of today that is 2+ years.
- B.Tech in Computer Science specialising in Internet of Things (IoT),
  Samrat Ashok Technological Institute (SATI), Vidisha. Nov 2021 - Jun 2025.
- Contact: princebhatt316@gmail.com
- GitHub: github.com/princebhatt03 | LinkedIn: linkedin.com/in/prince-bhatt-0958a725a
- Available for freelance work and open to new opportunities.

EXPERIENCE (most recent first, four roles in total)
1. Full Stack Developer, Neebha Web Services Pvt. Ltd. (Apr 2026 - present).
   React front ends; Node.js, Express and TypeScript services; MongoDB and SQL;
   authentication, authorisation and secure API communication in production.
2. Backend Developer, Moong Labs Technologies Pvt. Ltd. (Nov 2025 - Apr 2026).
   Enterprise gaming and analytics systems. Node.js + TypeScript modules, Redis
   caching, query optimisation, clean architecture.
3. Full Stack Developer, AUXES IT Solutions (Dec 2024 - Oct 2025).
   Built and deployed the company website on the MERN stack; REST APIs.
   Recognised for clean code and on-time delivery.
4. Web Development Intern, Quasar Digital Solutions, Bhopal (Mar 2024 - Oct 2024).
   UI and frontend work; responsive, interactive components. Certificate for
   outstanding performance.

SKILLS
- In production: JavaScript, TypeScript, Node.js, Express.js, React, MongoDB,
  REST APIs, Redis, Git, HTML, CSS.
- Comfortable: Next.js, React Native, Tailwind, Bootstrap, SQL, Java, Mongoose,
  JWT, OAuth, Google OAuth, Cloudinary, Postman, Razorpay, EJS, Multer.
- Learning: Docker, AWS, system design, CI/CD, Jest, GraphQL.

PROJECTS
- UrbanKart - MERN e-commerce. JWT and Google OAuth, role-based access, admin
  dashboard, Razorpay with server-side signature verification.
- Pizzeria - real-time pizza ordering. Order status as a server-side state
  machine pushed live to the customer view and the kitchen dashboard.
- Meta Photos - photo and video gallery. Multer uploads streamed to Cloudinary
  so the app server stays stateless. Node, Express, MongoDB, EJS.
- Live Location Tracker - real-time positions on a Leaflet map, throttled at
  the source before hitting the socket.
- QuickPick - earlier e-commerce build; API-driven catalogue, cart, payments.
- AUXES IT Solutions - the company's live website.

STRENGTHS
- Building complete features end to end, database through to interface.
- Backend work in Node.js and TypeScript: APIs, auth, caching, query performance.
- Shipping to a deadline.

HOW TO ANSWER
- Concise, professional, friendly. Around 40-50 words; never exceed 50 unless
  the user explicitly asks for detail.
- Answer only from the facts above. Never invent employers, dates, metrics,
  certifications, salary expectations, notice periods or availability.
- If asked something not covered here - salary, current or expected CTC, notice
  period, hourly or day rates, visa or relocation, references - say you do not
  have that detail and point them to princebhatt316@gmail.com.
- Refer to Prince in the third person. You are his assistant, not him.
- Decline politely if asked about anything unrelated to Prince's professional
  work, and steer back to the portfolio.`;

// --- Streaming chat endpoint with abort + 50-word cap ---
app.post('/api/chat', chatLimiter, async (req, res) => {
  const { message } = req.body ?? {};

  // Validate before spending a model call.
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'A message string is required.' });
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return res
      .status(413)
      .json({ error: `Please keep messages under ${MAX_MESSAGE_CHARS} characters.` });
  }

  // Prepare SSE headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // stops nginx-style proxies buffering the stream

  // Track client aborts
  let clientClosed = false;
  req.on('close', () => {
    clientClosed = true;
    // Express will end the socket; we just stop reading the model stream.
  });

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      // Sent as a real system instruction rather than pasted into the user turn,
      // so the visitor's message can't override it as easily.
      systemInstruction: SYSTEM_PROMPT,
    });

    const stream = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: message }] }],
      generationConfig: {
        // Keep short by design; server still enforces the word cap
        maxOutputTokens: 150,
        temperature: 0.7,
      },
    });

    let wordsSent = 0;

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
    console.error('Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Something went wrong' });
    } else {
      writeSSE(res, '[ERROR]');
      res.end();
    }
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

// CORS rejections and oversized bodies land here instead of crashing the process.
app.use((err, req, res, next) => {
  if (err?.message?.includes('is not allowed')) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body too large' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

// Vercel's Node runtime imports the app and handles the listening itself,
// so only bind a port when running this file directly (local dev / Render).
const isServerless = Boolean(process.env.VERCEL);
if (!isServerless) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

export default app;
