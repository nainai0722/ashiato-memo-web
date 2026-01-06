'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  RecordType,
  RecordMode,
  DEFAULT_BUILDING_CATEGORIES,
  DEFAULT_ACTIVITY_CATEGORIES,
  CUSTOM_BUILDING_CATEGORIES,
  CUSTOM_ACTIVITY_CATEGORIES,
} from '@/types';
import Link from 'next/link';

export default function CreateMemoPage() {
  const { user } = useAuth();
  const t = useTranslations();
  const router = useRouter();

  const [recordType, setRecordType] = useState<RecordType | null>(null);
  const [recordMode, setRecordMode] = useState<RecordMode | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleRecordTypeSelect = (type: RecordType) => {
    setRecordType(type);
    setRecordMode(null);
    setSelectedCategories([]);
  };

  const handleRecordModeSelect = (mode: RecordMode) => {
    setRecordMode(mode);
    if (mode === 'default') {
      const defaultCategories =
        recordType === 'building'
          ? DEFAULT_BUILDING_CATEGORIES.map((cat) => cat.name)
          : DEFAULT_ACTIVITY_CATEGORIES.map((cat) => cat.name);
      setSelectedCategories(defaultCategories);
    } else {
      setSelectedCategories([]);
    }
  };

  const handleCustomCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleStartEditing = () => {
    if (!user || !recordType || !recordMode || selectedCategories.length === 0) return;

    const params = new URLSearchParams({
      recordType,
      recordMode,
      categories: selectedCategories.join(','),
    });

    router.push(`/memos/create/editor?${params.toString()}`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/memos" className="text-blue-600 hover:text-blue-700">
              ← {t('nav.memos')}
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{t('memo.create')}</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Record Type Selection */}
        {!recordType && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {t('recordType.title')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => handleRecordTypeSelect('building')}
                className="p-8 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">🏢</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                    {t('recordType.building')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    公園、博物館、水族館など
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleRecordTypeSelect('activity')}
                className="p-8 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                    {t('recordType.activity')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    イベント、遊び、体験など
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Record Mode Selection */}
        {recordType && !recordMode && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={() => setRecordType(null)}
              className="text-blue-600 hover:text-blue-700 mb-4"
            >
              ← {t('common.cancel')}
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {t('recordMode.title')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => handleRecordModeSelect('default')}
                className="p-8 border-2 border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600">
                    {t('recordMode.default')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('recordMode.defaultDescription')}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    ({DEFAULT_BUILDING_CATEGORIES.length}項目)
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleRecordModeSelect('custom')}
                className="p-8 border-2 border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">⚙️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600">
                    {t('recordMode.custom')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('recordMode.customDescription')}
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Custom Category Selection */}
        {recordType && recordMode === 'custom' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={() => setRecordMode(null)}
              className="text-blue-600 hover:text-blue-700 mb-4"
            >
              ← {t('common.cancel')}
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              記録する項目を選択
            </h2>
            <p className="text-center text-gray-600 mb-6">
              最低1つ、最大10項目まで選択できます
            </p>

            <div className="grid md:grid-cols-2 gap-3 mb-8">
              {(recordType === 'building'
                ? CUSTOM_BUILDING_CATEGORIES
                : CUSTOM_ACTIVITY_CATEGORIES
              ).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCustomCategoryToggle(category)}
                  disabled={
                    !selectedCategories.includes(category) &&
                    selectedCategories.length >= 10
                  }
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedCategories.includes(category)
                      ? 'border-purple-500 bg-purple-50 text-purple-900'
                      : 'border-gray-300 hover:border-purple-300 text-gray-700'
                  } ${
                    !selectedCategories.includes(category) &&
                    selectedCategories.length >= 10
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category}</span>
                    {selectedCategories.includes(category) && (
                      <svg
                        className="w-5 h-5 text-purple-600"
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
                  </div>
                </button>
              ))}
            </div>

            <p className="text-center text-sm text-gray-600 mb-4">
              選択中: {selectedCategories.length}項目
            </p>

            <button
              onClick={handleStartEditing}
              disabled={selectedCategories.length === 0}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {t('editor.next')}
            </button>
          </div>
        )}

        {/* Step 3 (Alternative): Default Mode Confirmation */}
        {recordType && recordMode === 'default' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={() => setRecordMode(null)}
              className="text-blue-600 hover:text-blue-700 mb-4"
            >
              ← {t('common.cancel')}
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              デフォルト項目で記録します
            </h2>
            <p className="text-center text-gray-600 mb-6">
              以下の{selectedCategories.length}項目で記録します
            </p>

            <div className="space-y-2 mb-8">
              {selectedCategories.map((category, index) => (
                <div
                  key={category}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <span className="font-medium text-gray-900">
                    {index + 1}. {category}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartEditing}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
            >
              {t('editor.next')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
