// Firestore database operations for AshiatoMemo
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import { AshiatoMemo, MemoBlock, UserProfile } from '@/types';

const MEMOS_COLLECTION = 'memos';
const USERS_COLLECTION = 'users';

// Convert Firestore timestamp to Date
function convertTimestamp(data: any): any {
  if (data instanceof Timestamp) {
    return data.toDate();
  }
  if (Array.isArray(data)) {
    return data.map(convertTimestamp);
  }
  if (data && typeof data === 'object') {
    const converted: any = {};
    for (const key in data) {
      converted[key] = convertTimestamp(data[key]);
    }
    return converted;
  }
  return data;
}

// Create a new memo
export async function createMemo(
  userId: string,
  title: string,
  blocks: MemoBlock[],
  isPublic: boolean = false,
  userName?: string
): Promise<string> {
  const memoData = {
    userId,
    userName: userName || null,
    title,
    blocks,
    isPublic,
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, MEMOS_COLLECTION), memoData);
  return docRef.id;
}

// Get a single memo by ID
export async function getMemo(memoId: string): Promise<AshiatoMemo | null> {
  const docRef = doc(db, MEMOS_COLLECTION, memoId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = convertTimestamp(docSnap.data());
    return { id: docSnap.id, ...data } as AshiatoMemo;
  }

  return null;
}

// Get all memos for a user
export async function getUserMemos(userId: string): Promise<AshiatoMemo[]> {
  const q = query(
    collection(db, MEMOS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = convertTimestamp(doc.data());
    return { id: doc.id, ...data } as AshiatoMemo;
  });
}

// Get all public memos
export async function getPublicMemos(): Promise<AshiatoMemo[]> {
  const q = query(
    collection(db, MEMOS_COLLECTION),
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = convertTimestamp(doc.data());
    return { id: doc.id, ...data } as AshiatoMemo;
  });
}

// Search memos by keyword
export async function searchMemos(
  userId: string,
  keyword: string
): Promise<AshiatoMemo[]> {
  // Note: Firestore doesn't support full-text search natively
  // This is a simple implementation that fetches all user memos and filters client-side
  const allMemos = await getUserMemos(userId);

  if (!keyword) return allMemos;

  const lowerKeyword = keyword.toLowerCase();
  return allMemos.filter((memo) => {
    const titleMatch = memo.title.toLowerCase().includes(lowerKeyword);
    const blocksMatch = memo.blocks.some(
      (block) =>
        block.text?.toLowerCase().includes(lowerKeyword) ||
        block.tags.some((tag) => tag.toLowerCase().includes(lowerKeyword))
    );
    return titleMatch || blocksMatch;
  });
}

// Filter memos by tag
export async function filterMemosByTag(
  userId: string,
  tag: string
): Promise<AshiatoMemo[]> {
  const allMemos = await getUserMemos(userId);
  return allMemos.filter((memo) =>
    memo.blocks.some((block) => block.tags.includes(tag))
  );
}

// Update a memo
export async function updateMemo(
  memoId: string,
  updates: Partial<Omit<AshiatoMemo, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, MEMOS_COLLECTION, memoId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

// Delete a memo
export async function deleteMemo(memoId: string): Promise<void> {
  const docRef = doc(db, MEMOS_COLLECTION, memoId);
  await deleteDoc(docRef);
}

// Get memo statistics for analysis
export async function getMemoStats(userId: string) {
  const memos = await getUserMemos(userId);

  // Total memos count
  const totalMemos = memos.length;

  // Count memos with reflection tag
  const reflectionMemos = memos.filter((memo) =>
    memo.blocks.some((block) => block.tags.includes('#反省'))
  ).length;

  // Count memos in current month
  const now = new Date();
  const currentMonthMemos = memos.filter((memo) => {
    const memoDate = memo.createdAt;
    return (
      memoDate.getMonth() === now.getMonth() &&
      memoDate.getFullYear() === now.getFullYear()
    );
  }).length;

  // Get tag frequency
  const tagCount: Record<string, number> = {};
  memos.forEach((memo) => {
    memo.blocks.forEach((block) => {
      block.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
  });

  // Get top 5 tags
  const topTags = Object.entries(tagCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  // Get monthly memo counts (last 6 months)
  const monthlyData: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const count = memos.filter((memo) => {
      const memoDate = memo.createdAt;
      return (
        memoDate.getMonth() === date.getMonth() &&
        memoDate.getFullYear() === date.getFullYear()
      );
    }).length;
    monthlyData.push({ month, count });
  }

  return {
    totalMemos,
    reflectionMemos,
    currentMonthMemos,
    topTags,
    monthlyData,
  };
}

// ==================== User Profile Functions ====================

// Get user profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = convertTimestamp(docSnap.data());
    return { uid: docSnap.id, ...data } as UserProfile;
  }

  return null;
}

// Create or update user profile
export async function saveUserProfile(
  uid: string,
  profile: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    // Update existing profile
    await updateDoc(docRef, {
      ...profile,
      updatedAt: Timestamp.now(),
    });
  } else {
    // Create new profile
    const { setDoc } = await import('firebase/firestore');
    await setDoc(docRef, {
      ...profile,
      createdAt: Timestamp.now(),
    });
  }
}
