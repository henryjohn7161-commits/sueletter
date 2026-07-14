// api/generate-letter.js
export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, temperature = 0.7, max_tokens = 1500 } = req.body;

    // Basic validation — reject requests missing the actual letter data
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid messages' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "qwen/qwen3.6-27b", // hardcoded server-side — the client can no longer choose the model
        messages,
        temperature,
        max_tokens,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API Error:', data);
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Failed to generate letter' });
  }
}