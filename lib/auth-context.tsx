'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebase';
import { getUserProfile, saveUserProfile } from './firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// ユーザープロファイルが存在しない場合は作成する
async function ensureUserProfile(user: User) {
  console.log('ensureUserProfile called for:', user.uid, user.displayName);
  try {
    const existingProfile = await getUserProfile(user.uid);
    console.log('Existing profile:', existingProfile);
    if (!existingProfile) {
      // Google認証情報からプロファイルを作成
      console.log('Creating new profile...');
      await saveUserProfile(user.uid, {
        displayName: user.displayName || 'ユーザー',
        photoURL: user.photoURL || undefined,
        bio: '',
      });
      console.log('User profile created for:', user.uid);
    } else {
      console.log('Profile already exists, skipping creation');
    }
  } catch (error) {
    console.error('Error ensuring user profile:', error);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // ログイン時にプロファイルを確認・作成
        await ensureUserProfile(user);
      }
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Google認証成功時にプロファイルを確認・作成
      if (result.user) {
        await ensureUserProfile(result.user);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
