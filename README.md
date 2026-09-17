# MarkRyan — Personal Website & Diary Blog CMS

A production-ready personal website, portfolio, and diary blog CMS featuring:
- **The Poet / Writer**: Curated poetry collection with clean typography.
- **Curiosities / Random Knowledge**: Architecture and engineering essays with read-time estimators and interactive search.
- **Computer Stuff**: Technical architectural case studies and distributed systems writing.
- **The Diary Page**: Zen mode with blank, unlined page aesthetic, threaded comments, and moderation.
- **Admins Page & CMS Studio**: Protected by Firebase Authentication (and optionally configured `ADMIN_PASSWORD` environment variable), featuring a 16:9 canvas crop tool, direct-to-blob upload pipeline via `@vercel/blob`, and secure post deletion with orphan asset cleanup.
- **Accurate Date Handling**: Localized, hydration-safe date display with semantic HTML5 `<time>` tags.
- **Syndication**: Auto-generated `/rss.xml` feed with Edge CDN caching headers.

---

## Canonical Deployment

The canonical production URL is:
**https://ryansblog-u3o9.vercel.app**

---

## Deploying to Vercel

### Option 1: Git Integration (Recommended)
1. Push this repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com/dashboard), click **Add New...** -> **Project**.
3. Select your repository. Vercel will automatically detect the **Vite** framework from `vercel.json`.
4. Click **Deploy**.

### Option 2: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

---

## Setting Up Vercel Blob Storage

For 16:9 header image uploads and automatic deletion via `del()`:
1. In your project dashboard on Vercel, navigate to the **Storage** tab.
2. Click **Create Database** and select **Blob**.
3. Choose a store name (e.g., `markryan-blog-blob`) and click **Create**.
4. Link the Blob store to your project. Vercel will automatically set the `BLOB_READ_WRITE_TOKEN` environment variable in your production and preview environments.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | Read/write token for Vercel Blob storage | (Auto-populated by Vercel) |
| `ADMIN_PASSWORD` | Passcode to access Admin Dashboard & CMS | (Set in Vercel environment variables) |
| `APP_URL` | Canonical public URL | `https://ryansblog-u3o9.vercel.app` |

---

## Project Structure & Architecture on Vercel

- `vercel.json`: Defines Vite build output (`dist`), client-side SPA routing (`/((?!api/).*)` -> `/index.html`), security headers, and asset caching.
- `api/upload.ts`: Vercel Serverless Function handling client token authorization via `handleUpload()` from `@vercel/blob/client`.
- `api/delete-post.ts`: Vercel Serverless Function authorizing admin credentials (via `ADMIN_PASSWORD` or HMAC bearer token) and invoking `@vercel/blob`'s `del()` method.
- `api/rss.ts`: Serverless endpoint serving `/rss.xml` with XML headers and Edge caching.
- `api/health.ts`: Health check endpoint.
- `src/lib/dateUtils.ts`: Deterministic date formatting using native `Intl.DateTimeFormat`.
- `src/components/DateDisplay.tsx`: Hydration-safe semantic date component.
- `src/components/DeleteButton.tsx`: Client-side deletion component with `useTransition` loading state, confirmation modal, and toast feedback.
