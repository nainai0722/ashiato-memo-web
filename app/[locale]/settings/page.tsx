'use client';

import { useAuth } from '@/lib/auth-context';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const languages = [
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  ];

  const handleLanguageChange = (newLocale: string) => {
    // Replace the locale in the current path
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const handleSignOut = async () => {
    if (confirm(t('settings.confirmSignOut'))) {
      await signOut();
      router.push('/');
    }
  };

  if (!user) {
    router.push('/');
    return null;
  }

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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('settings.account')}
          </h2>
          <div className="flex items-center space-x-4">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || ''}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-gray-900">{user.displayName}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
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
