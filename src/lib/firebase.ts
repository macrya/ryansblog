import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getDocsFromServer,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  type Firestore,
  writeBatch,
} from 'firebase/firestore';

import firebaseConfig from '../../firebase-applet-config.json';
import type { Poem, CuriosityEssay, ComputerArticle, DiaryPost, BlogComment } from '../types';
import {
  INITIAL_POEMS,
  INITIAL_CURIOSITIES,
  INITIAL_COMPUTER_ARTICLES,
  INITIAL_DIARY_POSTS,
  INITIAL_COMMENTS,
} from '../data/initialContent';

// 1. Initialize Firebase App
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 3. Initialize Firestore with specific provisioned database
export const db: Firestore = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase App Check if recaptcha site key is provided
if (typeof window !== 'undefined') {
  const recaptchaKey = (firebaseConfig as any).recaptchaSiteKey || ((import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY);
  if (recaptchaKey && recaptchaKey.trim().length > 0) {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (appCheckErr) {
      console.warn('App Check initialization notice:', appCheckErr);
    }
  }
}

// 4. Test connection on boot as mandated by Firebase specification
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline cache mode.');
    }
  }
}
testFirestoreConnection();

export const SUPERADMIN_EMAIL = 'kimmarkryan5@gmail.com';

/**
 * Check if the given Firebase user has admin authorization.
 */
export async function verifyUserIsAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  if (user.email && user.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()) {
    // Ensure admin document exists for rules ABAC
    try {
      await setDoc(
        doc(db, 'admins', user.uid),
        {
          email: user.email,
          role: 'superadmin',
          lastSeen: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Could not update admin doc:', e);
    }
    return true;
  }

  try {
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    return adminDoc.exists();
  } catch (err) {
    console.warn('Error verifying admin authorization:', err);
    return false;
  }
}

export function normalizePoemFromFirestore(docData: any): Poem {
  let stanzas: string[][] = [];
  if (Array.isArray(docData.stanzas)) {
    stanzas = docData.stanzas.map((s: any) => {
      if (Array.isArray(s)) return s;
      if (typeof s === 'string') return s.split('\n');
      if (s && Array.isArray(s.lines)) return s.lines;
      return [String(s)];
    });
  }
  return {
    ...docData,
    stanzas,
  };
}

export function preparePoemForFirestore(poem: Poem): any {
  return {
    ...poem,
    // Flatten 2D string[][] stanzas to 1D string[] array for Firestore compliance
    stanzas: poem.stanzas.map((stanza) =>
      Array.isArray(stanza) ? stanza.join('\n') : String(stanza)
    ),
  };
}

// -------------------------------------------------------------
// REALTIME PERSISTENT SUBSCRIPTIONS (Live sync across browsers)
// -------------------------------------------------------------

export function subscribeToPoems(onUpdate: (poems: Poem[]) => void) {
  const colRef = collection(db, 'poems');
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        return;
      }
      const data = snapshot.docs.map((d) => normalizePoemFromFirestore(d.data()));
      if (data.length > 0) {
        onUpdate(data);
      }
    },
    (err) => {
      console.warn('Poems subscription error, falling back:', err);
    }
  );
}

export function subscribeToCuriosities(onUpdate: (essays: CuriosityEssay[]) => void) {
  const colRef = collection(db, 'curiosities');
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        return;
      }
      const data = snapshot.docs.map((d) => d.data() as CuriosityEssay);
      if (data.length > 0) {
        onUpdate(data);
      }
    },
    (err) => {
      console.warn('Curiosities subscription error:', err);
    }
  );
}

export function subscribeToComputerArticles(onUpdate: (articles: ComputerArticle[]) => void) {
  const colRef = collection(db, 'computerArticles');
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        return;
      }
      const data = snapshot.docs.map((d) => d.data() as ComputerArticle);
      if (data.length > 0) {
        onUpdate(data);
      }
    },
    (err) => {
      console.warn('Computer articles subscription error:', err);
    }
  );
}

export function subscribeToDiaryPosts(
  onUpdate: (posts: DiaryPost[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'diaryPosts');
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        return;
      }
      const data = snapshot.docs.map((d) => d.data() as DiaryPost);
      if (data.length > 0) {
        // Sort newest first
        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        onUpdate(data);
      }
    },
    (err) => {
      console.warn('Diary posts subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Direct runtime server fetch: forces server-side retrieval bypassing client disk cache
 */
export async function fetchDiaryPostsFromCloud(forceServer = true): Promise<DiaryPost[]> {
  try {
    const colRef = collection(db, 'diaryPosts');
    const snapshot = forceServer ? await getDocsFromServer(colRef) : await getDocs(colRef);
    if (snapshot.empty) return [];
    const posts = snapshot.docs.map((d) => d.data() as DiaryPost);
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return posts;
  } catch (err) {
    console.warn('Direct server fetch for diary posts fallback:', err);
    return [];
  }
}

export function subscribeToComments(
  onUpdate: (comments: BlogComment[]) => void,
  isAdmin = false
) {
  const colRef = collection(db, 'comments');
  const q = isAdmin ? colRef : query(colRef, where('status', '==', 'approved'));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
        return;
      }
      const data = snapshot.docs.map((d) => d.data() as BlogComment);
      onUpdate(data);
    },
    (err) => {
      console.warn('Comments subscription error:', err);
    }
  );
}

// -------------------------------------------------------------
// DURABLE PERSISTENT WRITES (Cloud Firestore)
// -------------------------------------------------------------

export async function persistPoem(poem: Poem): Promise<void> {
  await setDoc(doc(db, 'poems', poem.id), preparePoemForFirestore(poem), { merge: true });
}

export async function deletePoemFromCloud(poemId: string): Promise<void> {
  await deleteDoc(doc(db, 'poems', poemId));
}

export async function persistCuriosity(essay: CuriosityEssay): Promise<void> {
  await setDoc(doc(db, 'curiosities', essay.id), essay, { merge: true });
}

export async function deleteCuriosityFromCloud(essayId: string): Promise<void> {
  await deleteDoc(doc(db, 'curiosities', essayId));
}

export async function persistComputerArticle(article: ComputerArticle): Promise<void> {
  await setDoc(doc(db, 'computerArticles', article.id), article, { merge: true });
}

export async function deleteComputerArticleFromCloud(articleId: string): Promise<void> {
  await deleteDoc(doc(db, 'computerArticles', articleId));
}

export async function persistDiaryPost(post: DiaryPost): Promise<void> {
  const record: DiaryPost = {
    ...post,
    published: post.published !== false,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'diaryPosts', post.id), record, { merge: true });
}

export async function deleteDiaryPostFromCloud(postId: string): Promise<void> {
  await deleteDoc(doc(db, 'diaryPosts', postId));
}

export async function persistComment(comment: BlogComment): Promise<void> {
  await setDoc(doc(db, 'comments', comment.id), comment, { merge: true });
}

export async function updateCommentStatusInCloud(commentId: string, status: 'approved' | 'pending' | 'flagged'): Promise<void> {
  await setDoc(doc(db, 'comments', commentId), { status }, { merge: true });
}

export async function deleteCommentFromCloud(commentId: string): Promise<void> {
  await deleteDoc(doc(db, 'comments', commentId));
}

// -------------------------------------------------------------
// INITIAL SEEDING & SITE RESETS (Guarantees Content Across Versions)
// -------------------------------------------------------------

/**
 * Ensures initial curated content exists in Cloud Firestore so that
 * fresh visitors, new deployments, and different devices all see the
 * complete portfolio seamlessly without losing any user edits.
 */
export async function seedInitialContentIfEmpty(): Promise<boolean> {
  try {
    const checkDoc = await getDoc(doc(db, 'settings', 'initial_seed_completed'));
    if (checkDoc.exists()) {
      return false; // Already seeded in cloud
    }

    const batch = writeBatch(db);

    // Seed Poems (prepared for Firestore schema)
    for (const poem of INITIAL_POEMS) {
      batch.set(doc(db, 'poems', poem.id), preparePoemForFirestore(poem));
    }
    // Seed Curiosities
    for (const essay of INITIAL_CURIOSITIES) {
      batch.set(doc(db, 'curiosities', essay.id), essay);
    }
    // Seed Computer Articles
    for (const art of INITIAL_COMPUTER_ARTICLES) {
      batch.set(doc(db, 'computerArticles', art.id), art);
    }
    // Seed Diary Posts
    for (const post of INITIAL_DIARY_POSTS) {
      batch.set(doc(db, 'diaryPosts', post.id), { ...post, published: true });
    }
    // Seed Comments
    for (const comment of INITIAL_COMMENTS) {
      batch.set(doc(db, 'comments', comment.id), comment);
    }

    // Mark seed completed
    batch.set(doc(db, 'settings', 'initial_seed_completed'), {
      seededAt: new Date().toISOString(),
      version: '1.0.0',
    });

    await batch.commit();
    return true;
  } catch (err) {
    console.warn('Initial Firestore seed skipped or deferred:', err);
    return false;
  }
}

/**
 * Resets Cloud Firestore to the curated portfolio default state.
 */
export async function resetCloudToDefaults(): Promise<void> {
  const batch = writeBatch(db);
  for (const poem of INITIAL_POEMS) {
    batch.set(doc(db, 'poems', poem.id), preparePoemForFirestore(poem));
  }
  for (const essay of INITIAL_CURIOSITIES) {
    batch.set(doc(db, 'curiosities', essay.id), essay);
  }
  for (const art of INITIAL_COMPUTER_ARTICLES) {
    batch.set(doc(db, 'computerArticles', art.id), art);
  }
  for (const post of INITIAL_DIARY_POSTS) {
    batch.set(doc(db, 'diaryPosts', post.id), { ...post, published: true });
  }
  for (const comment of INITIAL_COMMENTS) {
    batch.set(doc(db, 'comments', comment.id), comment);
  }
  await batch.commit();
}

/**
 * Clears all cloud content for a clean slate.
 */
export async function clearCloudContent(
  currentPoems: Poem[],
  currentCuriosities: CuriosityEssay[],
  currentArticles: ComputerArticle[],
  currentDiary: DiaryPost[],
  currentComments: BlogComment[]
): Promise<void> {
  const batch = writeBatch(db);
  for (const p of currentPoems) {
    batch.delete(doc(db, 'poems', p.id));
  }
  for (const c of currentCuriosities) {
    batch.delete(doc(db, 'curiosities', c.id));
  }
  for (const a of currentArticles) {
    batch.delete(doc(db, 'computerArticles', a.id));
  }
  for (const d of currentDiary) {
    batch.delete(doc(db, 'diaryPosts', d.id));
  }
  for (const cm of currentComments) {
    batch.delete(doc(db, 'comments', cm.id));
  }
  await batch.commit();
}
