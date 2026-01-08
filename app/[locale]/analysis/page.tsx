'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { getMemoStats } from '@/lib/firestore';
import Link from 'next/link';

interface MemoStats {
  totalMemos: number;
  reflectionMemos: number;
  currentMonthMemos: number;
  topTags: { tag: string; count: number }[];
  monthlyData: { month: string; count: number }[];
}

export default function AnalysisPage() {
  const { user, loading } = useAuth();
  const t = useTranslations();
  const router = useRouter();

  const [stats, setStats] = useState<MemoStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const data = await getMemoStats(user.uid);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const locale = window.location.pathname.split('/')[1] || 'ja';
    if (locale === 'ja') {
      return `${month}月`;
    } else if (locale === 'zh') {
      return `${month}月`;
    }
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en', { month: 'short' });
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
            <Link href="/memos" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('nav.memos')}
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{t('analysis.title')}</h1>
            <Link
              href="/settings"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ⚙️ {t('settings.title')}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        ) : stats ? (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('analysis.totalMemos')}</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalMemos}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('analysis.reflectionMemos')}</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.reflectionMemos}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('analysis.currentMonthMemos')}</p>
                    <p className="text-3xl font-bold text-green-600">{stats.currentMonthMemos}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Tags */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('analysis.topTags')}</h2>
              {stats.topTags.length > 0 ? (
                <div className="space-y-4">
                  {stats.topTags.map((item, index) => (
                    <div key={item.tag} className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{item.tag}</span>
                          <span className="text-sm text-gray-600">{item.count}回</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(item.count / (stats.topTags[0]?.count || 1)) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">{t('analysis.noData')}</p>
              )}
            </div>

            {/* Monthly Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('analysis.monthlyChart')}</h2>
              {stats.monthlyData.length > 0 ? (
                <div className="flex items-end justify-between gap-2 h-64">
                  {stats.monthlyData.map((item) => {
                    const maxCount = Math.max(...stats.monthlyData.map((d) => d.count), 1);
                    const height = (item.count / maxCount) * 100;
                    return (
                      <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">{item.count}</div>
                        <div
                          className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-500"
                          style={{ height: `${height}%`, minHeight: item.count > 0 ? '20px' : '0' }}
                        ></div>
                        <div className="text-xs text-gray-600">{formatMonth(item.month)}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">{t('analysis.noData')}</p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">{t('analysis.noData')}</p>
          </div>
        )}
      </main>
    </div>
  );
}
