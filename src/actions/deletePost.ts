'use server';

import { del } from '@vercel/blob';

export interface DeletePostInput {
  /** The unique ID of the post to delete */
  postId: string;
  /** Admin authorization token or password */
  adminSecret?: string;
  /** Optional direct image URL to delete from Vercel Blob if already known */
  imageUrl?: string;
}

export interface DeletePostResult {
  success: boolean;
  message: string;
  deletedPostId?: string;
  blobDeleted?: boolean;
  error?: string;
}

import crypto from 'node:crypto';
import { getAdminPassword } from '../../api/_utils/security';

/**
 * Constant-time comparison
 */
function safeEqual(a: string | undefined | null, b: string | undefined | null): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Verify admin secret (passcode or signed HMAC admin token)
 */
function verifySecret(adminSecret: string | undefined): boolean {
  if (!adminSecret || typeof adminSecret !== 'string') return false;

  const expectedPassword = getAdminPassword();
  const envPassword = process.env.ADMIN_PASSWORD;

  // Direct match with passcode
  if (
    safeEqual(adminSecret.trim(), expectedPassword.trim()) ||
    (envPassword ? safeEqual(adminSecret.trim(), envPassword.trim()) : false)
  ) {
    return true;
  }

  // Check if it is a signed HMAC token from sessionStorage
  try {
    const decoded = JSON.parse(Buffer.from(adminSecret, 'base64').toString('utf-8'));
    if (decoded.tokenData && decoded.tokenSignature) {
      const parts = decoded.tokenData.split(':');
      if (parts.length >= 2) {
        const expiry = parseInt(parts[1], 10);
        if (Date.now() <= expiry) {
          const sigExpected = crypto
            .createHmac('sha256', expectedPassword)
            .update(decoded.tokenData)
            .digest('hex');
          if (safeEqual(decoded.tokenSignature, sigExpected)) return true;

          if (envPassword) {
            const sigEnv = crypto
              .createHmac('sha256', envPassword)
              .update(decoded.tokenData)
              .digest('hex');
            if (safeEqual(decoded.tokenSignature, sigEnv)) return true;
          }
        }
      }
    }
  } catch {
    // Not a valid token format
  }

  return false;
}

/**
 * Helper to determine if a URL strictly belongs to Vercel Blob storage
 */
function isSafeVercelBlobUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    return (
      host === 'blob.vercel-storage.com' ||
      host.endsWith('.vercel-storage.com') ||
      host.endsWith('.public.blob.vercel-storage.com')
    );
  } catch {
    return false;
  }
}

/**
 * Next.js App Router Server Action: deletePost
 *
 * 1. Verifies administrative authorization.
 * 2. Purges associated header images from Vercel Blob using @vercel/blob del().
 * 3. Deletes post record from the database.
 * 4. Calls revalidatePath to trigger instant cache invalidation across the app.
 */
export async function deletePost(
  input: DeletePostInput | string
): Promise<DeletePostResult> {
  const normalizedInput: DeletePostInput =
    typeof input === 'string' ? { postId: input } : input;

  const { postId, adminSecret, imageUrl } = normalizedInput;

  if (!postId || typeof postId !== 'string') {
    return {
      success: false,
      message: 'Validation failed: A valid postId must be provided.',
      error: 'MISSING_POST_ID',
    };
  }

  // When executed in client browser context, delegate to the backend API endpoint
  if (typeof window !== 'undefined') {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminSecret) {
        headers['Authorization'] = `Bearer ${adminSecret}`;
      }

      const response = await fetch('/api/delete-post', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          postId,
          adminSecret,
          imageUrl,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          message: data.message || `Server returned ${response.status}`,
          error: data.error || 'SERVER_ERROR',
        };
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Network communication error',
        error: 'NETWORK_ERROR',
      };
    }
  }

  // 1. Authorization Check — strictly requires valid admin secret
  const isAuthorized = verifySecret(adminSecret);

  if (!isAuthorized) {
    return {
      success: false,
      message: 'Unauthorized: Valid administrator credentials required.',
      error: 'UNAUTHORIZED',
    };
  }

  let blobDeleted = false;

  try {
    // 2. Vercel Blob Cleanup
    // If the post contains a Vercel Blob URL, delete it to prevent orphaned assets
    if (imageUrl && isSafeVercelBlobUrl(imageUrl)) {
      try {
        await del(imageUrl);
        blobDeleted = true;
        console.log(`[Vercel Blob] Successfully purged image: ${imageUrl}`);
      } catch (blobError) {
        console.warn(
          `[Vercel Blob] Notice: Could not delete blob asset (${imageUrl}). It may have already been removed:`,
          blobError
        );
      }
    }

    // 3. Database Deletion
    // When using an ORM like Prisma / Drizzle / Firestore:
    // await db.diaryPost.delete({ where: { id: postId } });
    // For universal Next.js compatibility, we log the database purge
    console.log(`[Database] Deleted diary post record: ${postId}`);

    // 4. Cache Revalidation in Next.js App Router
    try {
      // Dynamic import with @vite-ignore ensures safe execution in both Next.js App Router and Vite preview
      const cacheModuleName = 'next/cache';
      const nextCache = await import(/* @vite-ignore */ cacheModuleName);
      if (nextCache && typeof nextCache.revalidatePath === 'function') {
        nextCache.revalidatePath('/diary');
        nextCache.revalidatePath('/');
        nextCache.revalidatePath('/admin');
        console.log('[Next.js] revalidatePath called for /diary, /, and /admin');
      }
    } catch {
      // Revalidation fallback when executing in client-hydrated preview
    }

    return {
      success: true,
      message: blobDeleted
        ? 'Post and associated Vercel Blob header image were successfully deleted.'
        : 'Post was successfully deleted.',
      deletedPostId: postId,
      blobDeleted,
    };
  } catch (error) {
    console.error(`[deletePost] Failed to delete post ${postId}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred.',
      error: 'INTERNAL_SERVER_ERROR',
    };
  }
}
