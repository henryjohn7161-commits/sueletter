// api/generate-letter.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not set on this deployment' });
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
        max_tokens: Math.min(Math.max(max_tokens, 800), 1400),
        reasoning_effort: "none",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API Error:', JSON.stringify(data));
      let errMsg;
      if (data.error && typeof data.error === 'object') {
        errMsg = data.error.message || JSON.stringify(data.error);
      } else {
        errMsg = data.error || data.details || `Request failed with status ${response.status}`;
      }
      return res.status(response.status).json({ error: errMsg });
    }

    // Strip any leaked reasoning/thinking tags before returning to the client
    if (data?.choices?.[0]?.message?.content) {
      data.choices[0].message.content = data.choices[0].message.content
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .trim();
    }

    const finishReason = data?.choices?.[0]?.finish_reason;
    if (!data?.choices?.[0]?.message?.content) {
      console.error('Empty letter content. finish_reason:', finishReason, 'raw:', JSON.stringify(data));
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate letter' });
  }
}