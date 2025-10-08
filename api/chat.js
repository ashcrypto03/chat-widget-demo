// Vercel serverless function that forwards to your n8n webhook
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  try {
    const upstream = process.env.N8N_WEBHOOK_URL; // e.g. https://your-n8n/webhook-test/chat
    if (!upstream) throw new Error('Missing N8N_WEBHOOK_URL');

    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    const r = await fetch(upstream, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body
    });

    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { reply: text }; }
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: 'upstream_error', detail: String(e) });
  }
};
