'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { getMemo, updateMemo } from '@/lib/firestore';
import { MemoBlock, COMMON_TAGS } from '@/types';
import Link from 'next/link';

export default function EditMemoPage() {
  const { user } = useAuth();
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const memoId = params.id as string;

  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<MemoBlock[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

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
      const memo = await getMemo(memoId);
      if (!memo) {
        alert('メモが見つかりませんでした');
        router.push('/memos');
        return;
      }
      setTitle(memo.title);
      setBlocks(memo.blocks);
      setIsPublic(memo.isPublic || false);
    } catch (error) {
      console.error('Error loading memo:', error);
      alert(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const currentBlock = blocks[currentIndex];

  const handleTextChange = (text: string) => {
    setBlocks((prev) =>
      prev.map((block, index) =>
        index === currentIndex ? { ...block, text } : block
      )
    );
  };

  const handleTagToggle = (tag: string) => {
    setBlocks((prev) =>
      prev.map((block, index) =>
        index === currentIndex
          ? {
              ...block,
              tags: block.tags.includes(tag)
                ? block.tags.filter((t) => t !== tag)
                : [...block.tags, tag],
            }
          : block
      )
    );
  };

  const handleNext = () => {
    if (currentIndex < blocks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }

    try {
      setIsSaving(true);
      const userName = isPublic ? (user?.displayName || user?.email?.split('@')[0] || 'Anonymous') : undefined;
      await updateMemo(memoId, { title, blocks, isPublic, userName });
      alert('メモを更新しました！');
      router.push(`/memos/${memoId}`);
    } catch (error) {
      console.error('Error updating memo:', error);
      alert(t('common.error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !currentBlock) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/memos/${memoId}`} className="text-blue-600 hover:text-blue-700">
              ← {t('common.cancel')}
            </Link>
            <div className="flex-1 mx-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / blocks.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-center text-gray-600 mt-1">
                {currentIndex + 1} / {blocks.length}
              </p>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Input (shown on first page) */}
        {currentIndex === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('memo.title')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('memo.titlePlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        )}

        {/* Category Editor */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentBlock.categoryName}
            </h2>
          </div>

          {/* Text Area */}
          <div className="mb-6">
            <textarea
              value={currentBlock.text || ''}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="記録内容を入力..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={10}
            />
            <p className="text-right text-sm text-gray-500 mt-2">
              {currentBlock.text?.length || 0} {t('editor.characterCount')}
            </p>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {t('memo.tags')}
            </p>
            <div className="flex flex-wrap gap-2">
              {COMMON_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    currentBlock.tags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Public Setting (shown on last page) */}
          {currentIndex === blocks.length - 1 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{t('memo.isPublic')}</h3>
                  <p className="text-xs text-gray-500">{t('memo.isPublicDescription')}</p>
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
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← {t('editor.previous')}
            </button>

            {currentIndex === blocks.length - 1 ? (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? t('common.loading') : t('memo.save')}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {t('editor.next')} →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
