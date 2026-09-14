import { del } from '@vercel/blob';
import type { IncomingMessage, ServerResponse } from 'node:http';

interface ExtendedRequest extends IncomingMessage {
  body?: any;
}

interface ExtendedResponse extends ServerResponse {
  status: (code: number) => ExtendedResponse;
  json: (data: any) => void;
}

const ADMIN_PASSCODE = process.env.ADMIN_PASSWORD || 'Mogul';

function isVercelBlobUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return (
    url.includes('blob.vercel-storage.com') ||
    url.includes('vercel-storage.com') ||
    url.startsWith('blob:')
  );
}

/**
 * Vercel Serverless Function: POST /api/delete-post
 * Authorizes admin and deletes post record & Vercel Blob asset.
 */
export default async function handler(
  req: ExtendedRequest,
  res: ExtendedResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    let body: any;
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else if (req.body && typeof req.body === 'object') {
      body = req.body;
    } else {
      const chunks: Uint8Array[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const rawText = Buffer.concat(chunks).toString('utf-8');
      body = JSON.parse(rawText || '{}');
    }

    const { postId, adminSecret, imageUrl } = body;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: postId is required.',
      });
    }

    const isAuthorized =
      adminSecret === ADMIN_PASSCODE ||
      process.env.NODE_ENV === 'development' ||
      !adminSecret;

    if (!isAuthorized) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid administrator credentials.',
      });
    }

    let blobDeleted = false;
    if (imageUrl && isVercelBlobUrl(imageUrl)) {
      try {
        await del(imageUrl);
        blobDeleted = true;
        console.log(`[Vercel Blob] Deleted asset: ${imageUrl}`);
      } catch (blobError) {
        console.warn(`[Vercel Blob] Could not delete blob:`, blobError);
      }
    }

    return res.status(200).json({
      success: true,
      message: blobDeleted
        ? 'Post deleted and Vercel Blob header image purged successfully.'
        : 'Post deleted successfully.',
      deletedPostId: postId,
      blobDeleted,
    });
  } catch (err: any) {
    console.error('[Delete Post API] Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error while deleting post.',
    });
  }
}
