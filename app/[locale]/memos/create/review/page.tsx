'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createMemo } from '@/lib/firestore';
import { MemoBlock } from '@/types';
import Link from 'next/link';

interface ReviewData {
  title: string;
  blocks: MemoBlock[];
  recordType: string;
  recordMode: string;
}

export default function ReviewPage() {
  const { user } = useAuth();
  const t = useTranslations();
  const router = useRouter();
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('reviewData');
    if (!data) {
      router.push('/memos/create');
      return;
    }

    try {
      const parsed = JSON.parse(data);
      setReviewData(parsed);
    } catch (error) {
      console.error('Error parsing review data:', error);
      router.push('/memos/create');
    }
  }, [router]);

  const handleSave = async () => {
    if (!user || !reviewData) return;

    try {
      setIsSaving(true);
      await createMemo(user.uid, reviewData.title, reviewData.blocks, isPublic);
      sessionStorage.removeItem('reviewData');
      alert('記録を保存しました！');
      router.push('/memos');
    } catch (error) {
      console.error('Error saving memo:', error);
      alert(t('common.error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    router.back();
  };

  if (!user || !reviewData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleEdit}
              className="text-blue-600 hover:text-blue-700"
            >
              ← {t('memo.edit')}
            </button>
            <h1 className="text-xl font-bold text-gray-900">{t('editor.review')}</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-3xl font-bold text-gray-900">{reviewData.title}</h2>
          <p className="text-sm text-gray-500 mt-2">
            {reviewData.recordType === 'building' ? '建物・施設' : '活動'} /{' '}
            {reviewData.recordMode === 'default' ? 'デフォルト記録' : 'カスタム記録'}
          </p>
        </div>

        {/* Blocks */}
        <div className="space-y-6 mb-8">
          {reviewData.blocks
            .filter((block) => block.text?.trim())
            .map((block, index) => (
              <div key={block.id} className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-start justify-between mb-3">
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
                <div className="text-gray-700 whitespace-pre-wrap">{block.text}</div>
              </div>
            ))}
        </div>

        {/* Empty blocks message */}
        {reviewData.blocks.filter((block) => block.text?.trim()).length === 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 text-center mb-8">
            <p className="text-yellow-800 font-medium">
              記録内容が入力されていません。編集に戻って内容を入力してください。
            </p>
          </div>
        )}

        {/* Public Setting */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t('memo.isPublic')}</h3>
              <p className="text-sm text-gray-500">{t('memo.isPublicDescription')}</p>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublic ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {isPublic && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                🌐 この記録は「みんなの記録」タブで公開されます。投稿者名は設定のプロフィールで編集できます。
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleEdit}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            {t('memo.edit')}
          </button>
          <button
            onClick={handleSave}
            disabled={
              isSaving ||
              reviewData.blocks.filter((block) => block.text?.trim()).length === 0
            }
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? t('common.loading') : t('memo.save')}
          </button>
        </div>
      </main>
    </div>
  );
}
