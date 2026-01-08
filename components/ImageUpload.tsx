'use client';

import { useState, useRef } from 'react';
import { uploadImage, validateImageFile } from '@/lib/storage';
import Image from 'next/image';

interface ImageUploadProps {
  userId: string;
  onImageUploaded: (imageUrl: string, caption?: string) => void;
  currentImageUrl?: string;
  currentCaption?: string;
  memoId?: string;
}

export default function ImageUpload({
  userId,
  onImageUploaded,
  currentImageUrl,
  currentCaption,
  memoId,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [caption, setCaption] = useState<string>(currentCaption || '');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Firebase Storage
      const imageUrl = await uploadImage(userId, file, memoId);
      onImageUploaded(imageUrl, caption);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('画像のアップロードに失敗しました');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setCaption('');
    setError(null);
    onImageUploaded('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCaptionChange = (newCaption: string) => {
    setCaption(newCaption);
    if (previewUrl) {
      onImageUploaded(previewUrl, newCaption);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {previewUrl ? (
        <div className="space-y-3">
          <div className="relative">
            <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={previewUrl}
                alt={caption || "Preview"}
                fill
                className="object-contain"
              />
            </div>
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              キャプション（オプション）
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => handleCaptionChange(e.target.value)}
              placeholder="画像の説明を入力..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      ) : (
        <button
          onClick={handleButtonClick}
          disabled={isUploading}
          className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-sm">アップロード中...</p>
            </>
          ) : (
            <>
              <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm font-medium">画像をアップロード</p>
              <p className="text-xs text-gray-500 mt-1">JPEG, PNG, GIF, WebP (最大5MB)</p>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
