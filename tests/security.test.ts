import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  timingSafeEqual,
  signAdminToken,
  verifyAdminToken,
  sanitizeText,
  checkRateLimit,
  isSafeVercelBlobUrl,
} from '../api/_utils/security';

test('1. timingSafeEqual prevents timing attacks and handles varied inputs', () => {
  assert.equal(timingSafeEqual('supersecret123', 'supersecret123'), true);
  assert.equal(timingSafeEqual('supersecret123', 'wrongsecret456'), false);
  assert.equal(timingSafeEqual('', ''), true);
  assert.equal(timingSafeEqual('short', 'a much longer string than short'), false);
  assert.equal(timingSafeEqual(null, undefined), false);
  assert.equal(timingSafeEqual('secret', undefined), false);
});

test('2. signAdminToken and verifyAdminToken issue and validate cryptographic HMAC tokens', () => {
  const secret = 'my-long-production-admin-passphrase-2026';
  const token = signAdminToken(secret, 60000);

  assert.ok(typeof token === 'string' && token.length > 20);
  assert.equal(verifyAdminToken(token, secret), true);
  assert.equal(verifyAdminToken(token, 'different-secret'), false);
  assert.equal(verifyAdminToken('tampered.payload.token', secret), false);
  assert.equal(verifyAdminToken('', secret), false);

  // Expired token test
  const expiredToken = signAdminToken(secret, -1000);
  assert.equal(verifyAdminToken(expiredToken, secret), false);
});

test('3. sanitizeText neutralizes HTML injection / XSS payloads', () => {
  const rawInput = '<script>alert("pwned")</script><b>Hello</b>';
  const clean = sanitizeText(rawInput, 100);
  assert.equal(clean.includes('<script>'), false);
  assert.equal(clean.includes('</script>'), false);
  assert.equal(clean.includes('&lt;script&gt;'), true);

  // Length truncation
  const longInput = 'A'.repeat(500);
  const truncated = sanitizeText(longInput, 50);
  assert.equal(truncated.length, 50);
});

test('4. isSafeVercelBlobUrl validates Vercel Blob domains and blocks SSRF vectors', () => {
  assert.equal(isSafeVercelBlobUrl('https://my-store.public.blob.vercel-storage.com/image.png'), true);
  assert.equal(isSafeVercelBlobUrl('https://blob.vercel-storage.com/asset.jpg'), true);

  // Block SSRF / malicious targets
  assert.equal(isSafeVercelBlobUrl('http://blob.vercel-storage.com/asset.jpg'), false); // No HTTP
  assert.equal(isSafeVercelBlobUrl('https://169.254.169.254/latest/meta-data'), false); // AWS/GCP Metadata
  assert.equal(isSafeVercelBlobUrl('https://evil.com/blob.vercel-storage.com'), false);
  assert.equal(isSafeVercelBlobUrl('https://localhost:8080/private'), false);
  assert.equal(isSafeVercelBlobUrl('javascript:alert(1)'), false);
  assert.equal(isSafeVercelBlobUrl(''), false);
});

test('5. checkRateLimit enforces sliding window limits', () => {
  const key = `test-ip-${Date.now()}`;
  const opts = { windowMs: 10000, max: 3 };

  const r1 = checkRateLimit(key, opts);
  assert.equal(r1.allowed, true);
  assert.equal(r1.remaining, 2);

  const r2 = checkRateLimit(key, opts);
  assert.equal(r2.allowed, true);
  assert.equal(r2.remaining, 1);

  const r3 = checkRateLimit(key, opts);
  assert.equal(r3.allowed, true);
  assert.equal(r3.remaining, 0);

  // 4th request must be blocked
  const r4 = checkRateLimit(key, opts);
  assert.equal(r4.allowed, false);
  assert.equal(r4.remaining, 0);
});

test('6. Secret Scanning Regression Guard: No hardcoded secrets in source files', () => {
  const filesToCheck = [
    path.resolve(process.cwd(), 'src/components/AdminLoginModal.tsx'),
    path.resolve(process.cwd(), 'src/components/DeleteButton.tsx'),
    path.resolve(process.cwd(), 'src/components/Navigation.tsx'),
    path.resolve(process.cwd(), 'src/components/DiarySection.tsx'),
    path.resolve(process.cwd(), 'src/actions/deletePost.ts'),
    path.resolve(process.cwd(), 'api/delete-post.ts'),
    path.resolve(process.cwd(), '.env.example'),
    path.resolve(process.cwd(), 'README.md'),
  ];

  for (const file of filesToCheck) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      assert.equal(
        content.includes('Mogul'),
        false,
        `Hardcoded password 'Mogul' leaked in file: ${file}`
      );
      assert.equal(
        content.includes('MarkRyanMogul2026!'),
        false,
        `Hardcoded credential leaked in file: ${file}`
      );
    }
  }
});
