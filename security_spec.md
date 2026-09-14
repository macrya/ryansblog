# Security Specification: Authorization & Content Persistence

## 1. Data Invariants
- **Identity Integrity**: Only authenticated administrators whose UID is registered in `/admins/{adminId}` have write (create, update, delete) permissions on articles, poems, curiosities, and diary posts.
- **Public Content Access**: Readers can read published poems, curiosity dossiers, computing articles, diary posts, and approved comments.
- **Comment Creation Guard**: Any reader can submit a comment, but the initial status MUST be either 'pending' or 'approved', and cannot be set to arbitrary values. Unauthenticated users cannot delete or alter other comments.
- **Field Size Limits**: All string inputs (titles, author names, stanzas, content) must be strictly bounded to prevent Denial-of-Wallet or storage exhaustion attacks.

## 2. Dirty Dozen Invalidation Payloads
1. Unauthorized user attempting `delete` on `/poems/poem-1` -> REJECT (requires `isAdmin()`).
2. Unauthorized user attempting `set` on `/diaryPosts/post-99` -> REJECT (requires `isAdmin()`).
3. Reader trying to elevate comment to arbitrary status or modify other comments -> REJECT.
4. Oversized title injection (>500 chars) -> REJECT (violates string size constraint).
5. Document ID poisoning with path traversal or invalid characters -> REJECT (violates `isValidId`).
6. Unauthenticated write to `/admins/{uid}` -> REJECT (users cannot self-promote to admin).
7. Modifying non-whitelisted fields during update -> REJECT.
8. Comment submission missing required fields (`authorName`, `content`) -> REJECT.
9. Reader attempting to read comments with 'flagged' or unapproved status without admin privileges -> REJECT.
10. Reader attempting to update system-level configuration or admin tables -> REJECT.
11. Mass payload injection with 10MB text body -> REJECT.
12. Attempt to bypass catch-all rule with arbitrary subcollection -> REJECT (default-deny).
