import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import type { IncomingMessage, ServerResponse } from 'node:http';

interface ExtendedRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string>;
}

interface ExtendedResponse extends ServerResponse {
  status: (code: number) => ExtendedResponse;
  json: (data: any) => void;
}

/**
 * Vercel Serverless Function: POST /api/upload
 * Generates client upload tokens for direct-to-blob uploads from the browser.
 */
export default async function handler(
  req: ExtendedRequest,
  res: ExtendedResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Parse body if it came as a string or raw buffer
    let body: HandleUploadBody;
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else if (req.body && typeof req.body === 'object') {
      body = req.body as HandleUploadBody;
    } else {
      // Collect stream if body is not pre-parsed
      const chunks: Uint8Array[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const rawText = Buffer.concat(chunks).toString('utf-8');
      body = JSON.parse(rawText || '{}');
    }

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname: string, clientPayload: string | null) => {
        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/avif',
          ],
          maximumSizeInBytes: 15 * 1024 * 1024, // 15MB limit
          tokenPayload: JSON.stringify({
            owner: 'MarkRyan — Creative Developer & Technical Architect',
            path: pathname,
            clientPayload: clientPayload || null,
            authorizedAt: new Date().toISOString(),
          }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('[Vercel Blob] Asset successfully uploaded:', blob.url);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error: any) {
    console.error('[Vercel Blob API] Upload token generation error:', error);
    return res.status(400).json({ error: error.message || 'Failed to process blob upload' });
  }
}
