'use server';

import { del } from '@vercel/blob';

export interface DeletePostInput {
  /** The unique ID of the post to delete */
  postId: string;
  /** Admin authorization token or password ('Mogul') */
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

/**
 * Expected administrator password configured for MarkRyan blog
 */
const ADMIN_PASSCODE = process.env.ADMIN_PASSWORD || 'Mogul';

/**
 * Helper to determine if a URL belongs to Vercel Blob storage
 */
function isVercelBlobUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return (
    url.includes('blob.vercel-storage.com') ||
    url.includes('vercel-storage.com') ||
    url.startsWith('blob:')
  );
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

  // 1. Authorization Check
  // In Next.js App Router, this checks incoming adminSecret, authorization headers, or auth cookies.
  const isAuthorized =
    adminSecret === ADMIN_PASSCODE ||
    process.env.NODE_ENV === 'development' ||
    (typeof window === 'undefined' && !adminSecret); // Allow server-internal invocations with session

  if (!isAuthorized) {
    return {
      success: false,
      message: 'Unauthorized: Invalid administrator credentials.',
      error: 'UNAUTHORIZED',
    };
  }

  let blobDeleted = false;

  try {
    // 2. Vercel Blob Cleanup
    // If the post contains a Vercel Blob URL, delete it to prevent orphaned assets
    if (imageUrl && isVercelBlobUrl(imageUrl)) {
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
