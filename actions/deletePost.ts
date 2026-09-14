'use server';

// Re-export from src/actions/deletePost for Next.js App Router root aliases
export * from '../src/actions/deletePost';
export { deletePost as default } from '../src/actions/deletePost';
