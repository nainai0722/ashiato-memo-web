// Firestore database operations for AshiatoMemo
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
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
const TITLES_COLLECTION = 'titles';

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
  prefecture?: string,
  district?: string,
  facilityCategory?: string,
  activityCategory?: string
): Promise<string> {
  const memoData: Record<string, unknown> = {
    userId,
    title,
    blocks,
    isPublic,
    createdAt: Timestamp.now(),
  };
  if (prefecture) memoData.prefecture = prefecture;
  if (district) memoData.district = district;
  if (facilityCategory) memoData.facilityCategory = facilityCategory;
  if (activityCategory) memoData.activityCategory = activityCategory;

  const docRef = await addDoc(collection(db, MEMOS_COLLECTION), memoData);

  // タイトルをtitlesコレクションに保存（重複しないよう更新）
  await saveTitle(userId, title);

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

// Get multiple user profiles by IDs (for displaying usernames on public memos)
export async function getUserProfiles(uids: string[]): Promise<Map<string, UserProfile>> {
  const profiles = new Map<string, UserProfile>();

  // Remove duplicates
  const uniqueUids = [...new Set(uids)];

  // Fetch profiles in parallel
  const promises = uniqueUids.map(async (uid) => {
    const profile = await getUserProfile(uid);
    if (profile) {
      profiles.set(uid, profile);
    }
  });

  await Promise.all(promises);
  return profiles;
}

// ==================== Title Functions ====================

export interface TitleEntry {
  id: string;
  title: string;
  userId: string;
  usageCount: number;
  lastUsedAt: Date;
  createdAt: Date;
}

// タイトルを保存または更新
export async function saveTitle(userId: string, title: string): Promise<void> {
  if (!title.trim()) return;

  // タイトルをキーとして使用（ユーザーIDと組み合わせて一意にする）
  const titleKey = `${userId}_${title}`;
  const docRef = doc(db, TITLES_COLLECTION, titleKey);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    // 既存のタイトルの使用回数を更新
    const data = docSnap.data();
    await updateDoc(docRef, {
      usageCount: (data.usageCount || 1) + 1,
      lastUsedAt: Timestamp.now(),
    });
  } else {
    // 新しいタイトルを作成
    await setDoc(docRef, {
      title: title.trim(),
      userId,
      usageCount: 1,
      lastUsedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
  }
}

// ユーザーのタイトル候補を取得
export async function getUserTitles(userId: string): Promise<TitleEntry[]> {
  const q = query(
    collection(db, TITLES_COLLECTION),
    where('userId', '==', userId),
    orderBy('lastUsedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = convertTimestamp(doc.data());
    return { id: doc.id, ...data } as TitleEntry;
  });
}

// タイトル候補を検索（部分一致）
export async function searchTitles(userId: string, keyword: string): Promise<TitleEntry[]> {
  if (!keyword.trim()) return [];

  const allTitles = await getUserTitles(userId);
  const lowerKeyword = keyword.toLowerCase();

  return allTitles
    .filter((entry) => entry.title.toLowerCase().includes(lowerKeyword))
    .slice(0, 10); // 最大10件
}

// ==================== User Profile Functions ====================

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
