import { handleRecommend } from './_lib/recommend.js';

// Vercel serverless function: POST /api/recommend  { query: string }
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const { status, body } = await handleRecommend(req.body, {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || undefined,
    ip,
  });
  return res.status(status).json(body);
}
