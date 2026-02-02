// Firebase Storage operations for image uploads
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload an image to Firebase Storage
 * @param userId - User ID for organizing uploads
 * @param file - Image file to upload
 * @param memoId - Optional memo ID for organizing uploads
 * @returns Download URL of the uploaded image
 */
export async function uploadImage(
  userId: string,
  file: File,
  memoId?: string
): Promise<string> {
  // Create a unique filename
  const timestamp = Date.now();
  const filename = `${timestamp}_${file.name}`;

  // Create storage reference
  const path = memoId
    ? `users/${userId}/memos/${memoId}/${filename}`
    : `users/${userId}/temp/${filename}`;

  const storageRef = ref(storage, path);

  // Upload file
  await uploadBytes(storageRef, file);

  // Get download URL
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

/**
 * Delete an image from Firebase Storage
 * @param imageUrl - Full download URL of the image to delete
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract path from download URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);

    if (!pathMatch) {
      throw new Error('Invalid image URL');
    }

    const path = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, path);

    // Delete file
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error if image doesn't exist
  }
}

/**
 * Compress image to target size using Canvas API
 */
export async function compressImage(
  file: File,
  maxSizeBytes: number = 1024 * 1024
): Promise<File> {
  if (file.size <= maxSizeBytes) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }

      // Scale down if needed
      const maxDim = 2048;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const tryCompress = (quality: number, scale: number): void => {
        const w = Math.round(width * scale);
        const h = Math.round(height * scale);
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            if (blob.size <= maxSizeBytes || quality <= 0.1) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else if (quality > 0.3) {
              tryCompress(quality - 0.2, scale);
            } else {
              tryCompress(quality, scale * 0.8);
            }
          },
          'image/jpeg',
          quality
        );
      };

      tryCompress(0.8, 1);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validate image file
 * @param file - File to validate
 * @returns Error message if invalid, null if valid
 */
export function validateImageFile(file: File): string | null {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return '画像ファイル（JPEG、PNG、GIF、WebP）のみアップロード可能です';
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return 'ファイルサイズは5MB以下にしてください';
  }

  return null;
}
