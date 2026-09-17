import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];

function isSafePathname(pathname: string): boolean {
  if (!pathname || typeof pathname !== 'string') return false;
  if (pathname.length > 255) return false;
  if (pathname.includes('..') || pathname.includes('\\') || pathname.includes('\0')) return false;
  const lower = pathname.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * Next.js App Router API Route for Vercel Blob client uploads.
 * Issues client upload tokens with strict pathname validation and size constraints.
 *
 * Endpoint: POST /api/upload
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string, clientPayload: string | null) => {
        if (!isSafePathname(pathname)) {
          throw new Error('Invalid upload filename or extension. Permitted: JPG, PNG, WEBP, GIF, AVIF.');
        }

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
            owner: 'MarkRyan Creative CMS',
            path: pathname,
            clientPayload: clientPayload || null,
            authorizedAt: new Date().toISOString(),
          }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('[Vercel Blob] Upload completed successfully:', blob.url);
      },
    });

    return Response.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during upload';
    return Response.json({ success: false, error: 'UPLOAD_ERROR', message }, { status: 400 });
  }
}
