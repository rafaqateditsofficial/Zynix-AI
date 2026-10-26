// Vercel serverless function. Set ANTHROPIC_API_KEY in Vercel > Settings > Environment Variables.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: 'Missing API key' });
  const { message } = req.body || {};
  if (!message || message.length > 4000) return res.status(400).json({ error: 'Bad message' });
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.MODEL || 'claude-sonnet-5-5', max_tokens: 1000,
      system: 'You are Zynix AI, a helpful, concise assistant.', messages: [{ role: 'user', content: message }] })
  });
  if (!r.ok) return res.status(502).json({ error: 'Upstream error' });
  const d = await r.json();
  res.status(200).json({ text: d.content.filter(b => b.type === 'text').map(b => b.text).join('') });
}
