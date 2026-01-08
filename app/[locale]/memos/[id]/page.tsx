'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { getMemo, deleteMemo } from '@/lib/firestore';
import { AshiatoMemo } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

export default function MemoDetailPage() {
  const { user } = useAuth();
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const memoId = params.id as string;

  const [memo, setMemo] = useState<AshiatoMemo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    loadMemo();
  }, [user, memoId]);

  const loadMemo = async () => {
    try {
      setIsLoading(true);
      const fetchedMemo = await getMemo(memoId);
      if (!fetchedMemo) {
        alert('メモが見つかりませんでした');
        router.push('/memos');
        return;
      }
      setMemo(fetchedMemo);
    } catch (error) {
      console.error('Error loading memo:', error);
      alert(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('memo.confirmDelete'))) return;

    try {
      await deleteMemo(memoId);
      router.push('/memos');
    } catch (error) {
      console.error('Error deleting memo:', error);
      alert(t('common.error'));
    }
  };

  const handleCopyBlock = async (blockId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBlockId(blockId);
      setTimeout(() => setCopiedBlockId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!memo) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/memos" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('nav.memos')}
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href={`/memos/${memoId}/edit`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('memo.edit')}
              </Link>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                {t('memo.delete')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{memo.title}</h1>
          <p className="text-gray-500 text-sm">{formatDate(memo.createdAt)}</p>
        </div>

        {/* Blocks */}
        <div className="space-y-6">
          {memo.blocks
            .filter((block) => block.text?.trim() || block.imageUrl)
            .map((block, index) => (
              <div key={block.id} className="bg-white rounded-2xl shadow-sm p-6 relative group">
                {/* Copy Button (only for text blocks) */}
                {block.text && (
                  <button
                    onClick={() => handleCopyBlock(block.id, block.text || '')}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="コピー"
                  >
                    {copiedBlockId === block.id ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                )}

                {/* Category Name */}
                <div className="flex items-start justify-between mb-3 pr-10">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {index + 1}. {block.categoryName}
                  </h3>
                  {block.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {block.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Image Block */}
                {block.type === 'image' && block.imageUrl && (
                  <div className="mb-4">
                    <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={block.imageUrl}
                        alt={block.caption || block.categoryName}
                        fill
                        className="object-contain"
                      />
                    </div>
                    {block.caption && (
                      <p className="mt-2 text-sm text-gray-600 italic">
                        {block.caption}
                      </p>
                    )}
                  </div>
                )}

                {/* Text Content */}
                {block.text && (
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {block.text}
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Empty State */}
        {memo.blocks.filter((block) => block.text?.trim()).length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
            <p className="text-gray-600">このメモには記録内容がありません</p>
          </div>
        )}

        {/* Toast Notification */}
        {copiedBlockId && (
          <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in">
            コピーしました
          </div>
        )}
      </main>
    </div>
  );
}
