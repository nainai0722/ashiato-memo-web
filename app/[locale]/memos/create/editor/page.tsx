'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MemoBlock,
  RecordType,
  RecordMode,
  COMMON_TAGS,
  DEFAULT_BUILDING_CATEGORIES,
  DEFAULT_ACTIVITY_CATEGORIES,
  CategoryData,
  CATEGORY_HINTS,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

function EditorContent() {
  const { user } = useAuth();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [recordType, setRecordType] = useState<RecordType | null>(null);
  const [recordMode, setRecordMode] = useState<RecordMode | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryDataMap, setCategoryDataMap] = useState<Map<string, CategoryData>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [blocks, setBlocks] = useState<MemoBlock[]>([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const typeParam = searchParams.get('recordType') as RecordType | null;
    const modeParam = searchParams.get('recordMode') as RecordMode | null;
    const categoriesParam = searchParams.get('categories');

    if (!typeParam || !modeParam || !categoriesParam) {
      router.push('/memos/create');
      return;
    }

    setRecordType(typeParam);
    setRecordMode(modeParam);
    const categoryList = categoriesParam.split(',');
    setCategories(categoryList);

    // Create category data map
    const allCategories =
      typeParam === 'building'
        ? DEFAULT_BUILDING_CATEGORIES
        : DEFAULT_ACTIVITY_CATEGORIES;
    const dataMap = new Map<string, CategoryData>();
    allCategories.forEach((cat) => {
      dataMap.set(cat.name, cat);
    });
    setCategoryDataMap(dataMap);

    // Initialize blocks
    const initialBlocks: MemoBlock[] = categoryList.map((categoryName, index) => ({
      id: uuidv4(),
      type: 'text',
      text: '',
      categoryName,
      tags: [],
      order: index,
    }));
    setBlocks(initialBlocks);
  }, [searchParams, router]);

  const currentBlock = blocks[currentIndex];
  const currentCategory = currentBlock ? categoryDataMap.get(currentBlock.categoryName) : null;

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

  const handleUseTemplate = (template: string) => {
    setBlocks((prev) =>
      prev.map((block, index) =>
        index === currentIndex
          ? { ...block, text: (block.text || '') + (block.text ? '\n\n' : '') + template }
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

  const handleReview = () => {
    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }

    const reviewData = {
      title,
      blocks,
      recordType,
      recordMode,
    };

    sessionStorage.setItem('reviewData', JSON.stringify(reviewData));
    router.push('/memos/create/review');
  };

  if (!user || !currentBlock) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/memos/create" className="text-blue-600 hover:text-blue-700">
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
            {currentCategory && (
              <p className="text-gray-600 text-sm">{currentCategory.hint}</p>
            )}
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

          {/* Templates */}
          {currentCategory && currentCategory.templates.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {t('editor.hint')}
              </p>
              <div className="flex flex-wrap gap-2">
                {currentCategory.templates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => handleUseTemplate(template)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 border border-gray-300"
                  >
                    {t('editor.useTemplate')}: {template.split('\n')[0].slice(0, 20)}...
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hint Templates */}
          {CATEGORY_HINTS[currentBlock.categoryName] && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {t('editor.detailedTemplates')}
              </p>
              <div className="grid md:grid-cols-2 gap-2">
                {CATEGORY_HINTS[currentBlock.categoryName].map((hintTemplate, index) => (
                  <button
                    key={index}
                    onClick={() => handleUseTemplate(hintTemplate.template)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 rounded-lg text-sm text-gray-800 border border-purple-200 text-left transition-all"
                  >
                    <span className="font-medium text-purple-700">📝 {hintTemplate.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

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
                onClick={handleReview}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                {t('editor.review')} →
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

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
