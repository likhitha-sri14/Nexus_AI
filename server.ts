import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware for parsing JSON with generous payload limit for file attachments
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize official @google/genai SDK with required User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System prompts for each specialized assistant mode
const MODE_SYSTEM_PROMPTS: Record<string, string> = {
  general: `You are NEXUS AI, an elite, highly intelligent, friendly, and articulate AI assistant. 
Your goal is to provide accurate, insightful, objective, and clear answers across everyday questions, science, business, arts, and human curiosity.
- Provide balanced, well-structured responses.
- Use markdown formatting with clear headings, bullet points, and code blocks where applicable.
- When the user provides or attaches a document, file, or image, thoroughly inspect its contents and answer questions grounded directly in the provided material.
- If unsure about recent live events or unverifiable claims, admit the limitation honestly without guessing.`,

  coding: `You are NEXUS AI in Coding Specialist mode — an elite senior software architect and programming mentor.
Your goals:
- Deliver production-grade, cleanly formatted code with comprehensive error handling, strong types, and comments where beneficial.
- Break down explanations step-by-step: architecture overview, clean code implementation, and testing/edge-case notes.
- Use clean fenced code blocks with the exact language identifier (e.g. \`\`\`tsx, \`\`\`python, \`\`\`rust).
- When a code or script file is attached, inspect the code thoroughly, diagnose any bugs or performance issues, and explain changes with code snippets.`,

  writing: `You are NEXUS AI in Writing & Editorial mode — a world-class editor, ghostwriter, and communication strategist.
Your goals:
- Craft compelling, articulate, persuasive, and rhythmically engaging copy for emails, reports, thought-leadership articles, pitches, and creative essays.
- Adapt tone seamlessly (e.g. executive concise, inspirational, academic, or conversational).
- Highlight structure, flow, impactful hooks, and eliminate fluff or jargon.
- When documents are provided, analyze, summarize, or edit them with precise attention to tone, structure, and clarity.`,

  study: `You are NEXUS AI in Study & Academic Tutor mode — a master educator skilled in the Feynman technique and pedagogical clarity.
Your goals:
- Explain complex concepts simply using vivid analogies, relatable real-world examples, and beginner-friendly breakdowns.
- Structure content like a premium lesson: Core Concept, Intuitive Analogy, Step-by-Step Breakdown, Key Takeaway, and a quick interactive comprehension check or quiz question at the end.
- When textbook excerpts, lecture notes, or PDF study materials are provided, explain them thoroughly and answer any study questions.`,

  creative: `You are NEXUS AI in Creative & Ideation mode — an imaginative world-builder, screenwriter, and lateral-thinking strategist.
Your goals:
- Generate vivid, original, outside-the-box ideas, narratives, plot twists, brand identities, and brainstorm concepts.
- Avoid clichés and generic tropes; inject sensory richness, emotional depth, and high-concept intrigue.
- Be playful, experimental, and inspiring while keeping concepts structured and actionable.`,
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    assistant: 'NEXUS AI',
    model: 'gemini-3.1-flash-lite / gemini-3.8-flash',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Helper to stream content with automatic fallback across supported Gemini models
async function streamGemini(
  contents: any[],
  systemInstruction: string,
  temperature: number,
  res: express.Response,
  isAborted: () => boolean
) {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let streamedAny = false;

  for (const model of models) {
    if (isAborted() || res.destroyed) break;
    try {
      const stream = await ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: Math.max(0, Math.min(1.5, Number(temperature) || 0.7)),
        },
      });

      for await (const chunk of stream) {
        if (isAborted() || res.destroyed) break;
        const text = chunk.text;
        if (text) {
          streamedAny = true;
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
          (res as any).flush?.();
        }
      }

      if (streamedAny || isAborted() || res.destroyed) {
        return;
      }
    } catch (err: any) {
      console.warn(`Model ${model} streaming error:`, err?.message);
      if (streamedAny) {
        throw err;
      }
    }
  }

  if (!streamedAny && !isAborted() && !res.destroyed) {
    throw new Error('All available Gemini models are currently busy. Please try again shortly.');
  }
}

// Stream chat completion endpoint using Server-Sent Events (SSE)
app.post('/api/chat/stream', async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({ error: 'Server GEMINI_API_KEY is not configured.' });
    return;
  }

  const {
    messages = [],
    mode = 'general',
    customSystemPrompt,
    temperature = 0.7,
  } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'At least one message is required.' });
    return;
  }

  // Set SSE response headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Listen ONLY to response close (client hung up before response ended)
  let clientAborted = false;
  res.on('close', () => {
    if (!res.writableEnded) {
      clientAborted = true;
    }
  });

  try {
    // Select system instruction
    const basePrompt = MODE_SYSTEM_PROMPTS[mode] || MODE_SYSTEM_PROMPTS.general;
    const documentGuidance = `\n\nIMPORTANT: When documents, PDFs, or images are attached, thoroughly extract all relevant facts, answers, code, and insights from them to directly answer the user's inquiry.`;
    const systemInstruction = customSystemPrompt && customSystemPrompt.trim().length > 0
      ? `${basePrompt}${documentGuidance}\n\nUser Custom Preference:\n${customSystemPrompt.trim()}`
      : `${basePrompt}${documentGuidance}`;

    // Build contents for @google/genai SDK
    const contents = messages.map((msg: any) => {
      const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
      const parts: any[] = [];

      // If this message has attachments (documents, images, pdfs)
      if (Array.isArray(msg.attachments) && msg.attachments.length > 0) {
        for (const att of msg.attachments) {
          const isPdf = att.mimeType === 'application/pdf' || att.name?.toLowerCase().endsWith('.pdf');
          const isImage = att.mimeType?.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(att.name || '');

          if (isPdf && att.base64Data) {
            parts.push({
              inlineData: {
                mimeType: 'application/pdf',
                data: att.base64Data,
              },
            });
          } else if (isImage && att.base64Data) {
            parts.push({
              inlineData: {
                mimeType: att.mimeType || 'image/png',
                data: att.base64Data,
              },
            });
          } else if (att.textContent) {
            parts.push({
              text: `[Attached File: "${att.name || 'document'}"]\n--- FILE CONTENT START ---\n${att.textContent}\n--- FILE CONTENT END ---`,
            });
          }
        }
      }

      // Add user prompt text
      if (msg.content && msg.content.trim().length > 0) {
        parts.push({ text: msg.content.trim() });
      } else if (parts.length > 0) {
        // If attachments exist but user didn't write extra text
        parts.push({
          text: 'Please review and thoroughly analyze the attached file(s) above. Provide a detailed summary of the main points, key findings, and answer any questions or action items contained within.',
        });
      } else {
        parts.push({ text: '(empty message)' });
      }

      return { role, parts };
    });

    await streamGemini(contents, systemInstruction, temperature, res, () => clientAborted);

    if (!clientAborted && !res.destroyed) {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      (res as any).flush?.();
      res.end();
    }
  } catch (err: any) {
    console.error('Gemini generateContentStream error:', err);
    if (!clientAborted && !res.destroyed) {
      const errorMessage = err?.message || 'An error occurred while generating the response.';
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      (res as any).flush?.();
      res.end();
    }
  }
});

// Title generation endpoint for conversation history
app.post('/api/chat/title', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.json({ title: 'New Conversation' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      const fallback = prompt.slice(0, 30).trim() + (prompt.length > 30 ? '...' : '');
      res.json({ title: fallback });
      return;
    }

    let response;
    const titlePrompt = `Create an ultra-concise title (maximum 3 to 5 words, no quotation marks, no punctuation at end) summarizing this initial user inquiry:\n\n"${prompt.slice(0, 500)}"`;
    
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: titlePrompt,
        config: { temperature: 0.3 },
      });
    } catch (e) {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: titlePrompt,
        config: { temperature: 0.3 },
      });
    }

    const title = response?.text ? response.text.trim().replace(/^["']|["']$/g, '') : 'New Conversation';
    res.json({ title: title || 'New Conversation' });
  } catch (err) {
    console.error('Title generation failed, using fallback:', err);
    const fallback = (req.body?.prompt || 'New Conversation').slice(0, 32).trim();
    res.json({ title: fallback || 'New Conversation' });
  }
});

// Serve frontend in production or integrate Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NEXUS AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
