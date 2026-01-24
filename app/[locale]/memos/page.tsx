'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { getUserMemos, getPublicMemos, deleteMemo, searchMemos, filterMemosByTag } from '@/lib/firestore';
import { AshiatoMemo, COMMON_TAGS } from '@/types';
import Link from 'next/link';

type TabType = 'my' | 'public';

export default function MemosPage() {
  const { user, loading, signOut } = useAuth();
  const t = useTranslations();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('my');
  const [myMemos, setMyMemos] = useState<AshiatoMemo[]>([]);
  const [publicMemos, setPublicMemos] = useState<AshiatoMemo[]>([]);
  const [memos, setMemos] = useState<AshiatoMemo[]>([]);
  const [filteredMemos, setFilteredMemos] = useState<AshiatoMemo[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadAllMemos();
    }
  }, [user]);

  useEffect(() => {
    // タブ切り替え時にメモをフィルタリング
    if (activeTab === 'my') {
      setMemos(myMemos);
      setFilteredMemos(myMemos);
    } else {
      setMemos(publicMemos);
      setFilteredMemos(publicMemos);
    }
    setSearchKeyword('');
    setSelectedTag('');
  }, [activeTab, myMemos, publicMemos]);

  const loadAllMemos = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      // 自分のメモと公開メモを並行して取得
      const [userMemos, allPublicMemos] = await Promise.all([
        getUserMemos(user.uid),
        getPublicMemos()
      ]);
      setMyMemos(userMemos);
      setPublicMemos(allPublicMemos);
      // 初期表示は自分のメモ
      setMemos(userMemos);
      setFilteredMemos(userMemos);
    } catch (error) {
      console.error('Error loading memos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMemos = async () => {
    await loadAllMemos();
  };

  const handleSearch = async (keyword: string) => {
    if (!user) return;

    setSearchKeyword(keyword);
    setSelectedTag('');

    if (!keyword) {
      setFilteredMemos(memos);
      return;
    }

    try {
      const results = await searchMemos(user.uid, keyword);
      setFilteredMemos(results);
    } catch (error) {
      console.error('Error searching memos:', error);
    }
  };

  const handleTagFilter = async (tag: string) => {
    if (!user) return;

    if (tag === selectedTag) {
      setSelectedTag('');
      setFilteredMemos(memos);
      return;
    }

    setSelectedTag(tag);
    setSearchKeyword('');

    try {
      const results = await filterMemosByTag(user.uid, tag);
      setFilteredMemos(results);
    } catch (error) {
      console.error('Error filtering by tag:', error);
    }
  };

  const handleDelete = async (memoId: string) => {
    if (!confirm(t('memo.confirmDelete'))) return;

    try {
      await deleteMemo(memoId);
      await loadMemos();
    } catch (error) {
      console.error('Error deleting memo:', error);
      alert(t('common.error'));
    }
  };

  const formatDate = (date: Date) => {
    const locale = window.location.pathname.split('/')[1] || 'ja';
    if (locale === 'ja' || locale === 'zh') {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    }
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{t('app.title')}</h1>
            <div className="flex items-center gap-4">
              <Link
                href="/analysis"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                📊 {t('nav.analysis')}
              </Link>
              <Link
                href="/settings"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ⚙️ {t('settings.title')}
              </Link>
              <span className="text-sm text-gray-600 hidden sm:inline">{user.displayName || user.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('my')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📝 {t('memo.myMemos')} ({myMemos.length})
            </button>
            <button
              onClick={() => setActiveTab('public')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'public'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🌐 {t('memo.publicMemos')} ({publicMemos.length})
            </button>
          </nav>
        </div>

        {/* Search and Create Button */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('memo.searchPlaceholder')}
              value={searchKeyword}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Link
            href="/memos/create"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
          >
            + {t('memo.create')}
          </Link>
        </div>

        {/* Tag Filter */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">{t('memo.filterByTag')}</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagFilter(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Memo List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        ) : filteredMemos.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-gray-600">{t('memo.noMemos')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMemos.map((memo) => (
              <div
                key={memo.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Link href={`/memos/${memo.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                          {memo.title}
                        </h3>
                      </Link>
                      {memo.isPublic && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          🌐 {t('memo.public')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <span>{formatDate(memo.createdAt)}</span>
                      {activeTab === 'public' && memo.userName && (
                        <span className="text-gray-400">
                          • {t('memo.by')} {memo.userName}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {memo.blocks
                        .flatMap((block) => block.tags)
                        .filter((tag, index, self) => self.indexOf(tag) === index)
                        .slice(0, 5)
                        .map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                    <p className="text-gray-600 line-clamp-2">
                      {memo.blocks
                        .filter((block) => block.text)
                        .map((block) => block.text)
                        .join(' ')
                        .slice(0, 150)}
                      ...
                    </p>
                  </div>
                  {/* 自分のメモのみ編集・削除を表示 */}
                  {memo.userId === user?.uid && (
                    <div className="ml-4 flex flex-col gap-2">
                      <Link
                        href={`/memos/${memo.id}/edit`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {t('memo.edit')}
                      </Link>
                      <button
                        onClick={() => handleDelete(memo.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        {t('memo.delete')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
