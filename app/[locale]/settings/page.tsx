'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { getUserProfile, saveUserProfile } from '@/lib/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { UserProfile } from '@/types';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const languages = [
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  ];

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const userProfile = await getUserProfile(user.uid);
      if (userProfile) {
        setProfile(userProfile);
        setEditName(userProfile.displayName);
        setEditBio(userProfile.bio || '');
      } else {
        // Use Google account info as default
        setEditName(user.displayName || '');
        setEditBio('');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const handleSignOut = async () => {
    if (confirm(t('settings.confirmSignOut'))) {
      await signOut();
      router.push('/');
    }
  };

  const handleEditStart = () => {
    setEditName(profile?.displayName || user?.displayName || '');
    setEditBio(profile?.bio || '');
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditName(profile?.displayName || user?.displayName || '');
    setEditBio(profile?.bio || '');
  };

  const handleEditSave = async () => {
    if (!user || !editName.trim()) return;

    try {
      setIsSaving(true);
      await saveUserProfile(user.uid, {
        displayName: editName.trim(),
        bio: editBio.trim(),
        photoURL: profile?.photoURL || user.photoURL || undefined,
      });
      setProfile((prev) => ({
        ...prev!,
        uid: user.uid,
        displayName: editName.trim(),
        bio: editBio.trim(),
        createdAt: prev?.createdAt || new Date(),
      }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(t('common.error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('画像サイズは5MB以下にしてください');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const storageRef = ref(storage, `profile-images/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await saveUserProfile(user.uid, {
        displayName: profile?.displayName || user.displayName || '',
        bio: profile?.bio || '',
        photoURL: downloadURL,
      });

      setProfile((prev) => ({
        ...prev!,
        uid: user.uid,
        displayName: prev?.displayName || user.displayName || '',
        photoURL: downloadURL,
        createdAt: prev?.createdAt || new Date(),
      }));
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert(t('common.error'));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (!user) {
    router.push('/');
    return null;
  }

  const displayName = profile?.displayName || user.displayName || '';
  const photoURL = profile?.photoURL || user.photoURL || '';
  const bio = profile?.bio || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/memos" className="text-blue-600 hover:text-blue-700">
              ← {t('nav.memos')}
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{t('settings.title')}</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* User Info Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('settings.account')}
            </h2>
            {!isEditing && (
              <button
                onClick={handleEditStart}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {t('settings.editProfile')}
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : isEditing ? (
            /* Edit Mode */
            <div className="space-y-4">
              {/* Photo */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    onClick={handlePhotoClick}
                    disabled={isUploadingPhoto}
                    className="relative group"
                  >
                    {photoURL ? (
                      <img
                        src={photoURL}
                        alt={displayName}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-2xl text-gray-500">👤</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUploadingPhoto ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      ) : (
                        <span className="text-white text-xs">📷</span>
                      )}
                    </div>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500">{t('settings.tapToChangePhoto')}</p>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.displayName')}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('settings.displayNamePlaceholder')}
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.bio')}
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder={t('settings.bioPlaceholder')}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleEditCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={isSaving || !editName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="flex items-start space-x-4">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={displayName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-500">👤</span>
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">{displayName}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                {bio && (
                  <p className="text-sm text-gray-700 mt-2">{bio}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Language Selection */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('settings.language')}
          </h2>
          <div className="space-y-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  locale === lang.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-medium text-gray-900">{lang.name}</span>
                </div>
                {locale === lang.code && (
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('settings.about')}
          </h2>
          <div className="space-y-3">
            <Link
              href="/settings/about"
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-gray-50 transition-all"
            >
              <span className="text-gray-700">{t('settings.aboutApp')}</span>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Sign Out */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <button
            onClick={handleSignOut}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            {t('auth.signOut')}
          </button>
        </div>
      </main>
    </div>
  );
}
