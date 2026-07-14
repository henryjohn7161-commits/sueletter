// /api/elaborate-dispute.js
// Vercel serverless function. Expands a brief dispute description into a
// detailed professional narrative using Groq's OpenAI-compatible API.
//
// REQUIRED: set GROQ_API_KEY in your Vercel project's Environment Variables
// (Project Settings -> Environment Variables), for Production, Preview, and
// Development, then redeploy. Get a key at https://console.groq.com/keys

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, currency, amount, incidentDate, dispute } = req.body || {};

    // Basic validation — reject requests missing the actual dispute text
    if (!dispute || !String(dispute).trim()) {
      return res.status(400).json({ error: 'Missing or invalid dispute text' });
    }

    const prompt = `You are helping someone draft a formal demand letter. Expand the brief description below into a detailed, professional, factual dispute narrative of 4-6 sentences suitable for a legal demand letter.

Rules:
- Do not invent facts, dates, or figures that contradict or go beyond what is given.
- Only elaborate on clarity, structure, and professional tone.
- Write in first person, past tense where appropriate.
- Output ONLY the narrative paragraph. No headers, no markdown, no commentary, no quotation marks.

Letter type: ${type || 'general dispute'}
Incident date: ${incidentDate || 'not specified'}
Amount involved: ${currency || ''}${amount || ''}
Brief description provided by the user: "${dispute}"`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b", // hardcoded server-side — the client can no longer choose the model
        messages: [
          { role: 'system', content: 'You are a professional legal writing assistant. Output only the requested text, nothing else.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API Error:', data);
      return res.status(response.status).json(data);
    }

    // Shape matches what the front-end expects: data.choices[0].message.content
    res.status(200).json(data);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Failed to elaborate dispute' });
  }
}