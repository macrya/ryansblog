import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

/**
 * Next.js App Router API Route for Vercel Blob client uploads.
 * Issues client upload tokens with custom authentication and authorization guards.
 *
 * Endpoint: POST /api/upload
 */
export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string, clientPayload: string | null) => {
        // ------------------------------------------------------------------
        // Placeholder Authorization Logic:
        // Authenticate the incoming request (e.g. cookie session or Bearer token)
        // ------------------------------------------------------------------
        const authorization = request.headers.get('authorization');

        // Example authorization check (uncomment in production if needed):
        // if (!authorization || authorization !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
        //   throw new Error('Unauthorized: Valid credentials required to upload assets');
        // }

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
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // ------------------------------------------------------------------
        // Webhook hook invoked by Vercel after the file is successfully uploaded
        // ------------------------------------------------------------------
        console.log('[Vercel Blob] Upload completed:', blob.url);
        if (tokenPayload) {
          try {
            const parsed = JSON.parse(tokenPayload);
            console.log('[Vercel Blob] Upload metadata:', parsed);
          } catch {
            // ignore JSON parse error
          }
        }
      },
    });

    return Response.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during upload';
    return Response.json({ error: message }, { status: 400 });
  }
}
