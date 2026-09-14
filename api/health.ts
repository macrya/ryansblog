import type { IncomingMessage, ServerResponse } from 'node:http';

interface ExtendedResponse extends ServerResponse {
  status: (code: number) => ExtendedResponse;
  json: (data: any) => void;
}

/**
 * Vercel Serverless Function: GET /api/health
 */
export default function handler(
  req: IncomingMessage,
  res: ExtendedResponse
) {
  const data = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    service: 'MarkRyan CMS & Portfolio on Vercel',
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.writeHead(200);
  res.end(JSON.stringify(data));
}
