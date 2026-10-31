import { processCatchUpRequest, CatchUpRequestBody } from '../src/server/catchupHandler';

interface MinimalVercelReq {
  method?: string;
  body: any;
}

interface MinimalVercelRes {
  status: (code: number) => MinimalVercelRes;
  json: (data: any) => void;
}

export default async function handler(req: MinimalVercelReq, res: MinimalVercelRes) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body: CatchUpRequestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const summary = await processCatchUpRequest(body);
    return res.status(200).json(summary);
  } catch (error) {
    console.error('API Error in /api/catchup:', error);
    return res.status(500).json({ error: 'Failed to process catch-up summary' });
  }
}
