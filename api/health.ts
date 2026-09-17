import type { IncomingMessage, ServerResponse } from 'node:http';
import { checkRateLimit, getClientIp } from './_utils/security';

interface ExtendedResponse extends ServerResponse {
  status: (code: number) => ExtendedResponse;
  json: (data: any) => void;
}

/**
 * Vercel Serverless Function: GET /api/health
 * Production health and readiness monitoring endpoint.
 */
export default function handler(
  req: IncomingMessage,
  res: ExtendedResponse
) {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`health:${clientIp}`, { windowMs: 60000, max: 120 });

  if (!rateLimit.allowed) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(429);
    res.end(JSON.stringify({ status: 'rate_limited', error: 'Too Many Requests' }));
    return;
  }

  const memoryUsage = process.memoryUsage();

  const data = {
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    service: 'MarkRyan CMS & Portfolio API',
    checks: {
      serverlessEngine: 'operational',
      memory: {
        rssMb: Math.round(memoryUsage.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
      },
    },
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.writeHead(200);
  res.end(JSON.stringify(data));
}
