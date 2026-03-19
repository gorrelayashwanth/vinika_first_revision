// Firebase Storage Service — Product Image Upload & Management

import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";

export interface UploadProgress {
  progress: number;
  url?: string;
  error?: string;
}

/**
 * Upload a product image to Firebase Storage
 * @param file - The File object to upload
 * @param productId - The product ID to namespace images
 * @param onProgress - Callback for upload progress
 * @returns Promise that resolves with the download URL
 */
export const uploadProductImage = (
  file: File,
  productId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storageRef = ref(storage, `products/${productId}/${Date.now()}_${safeName}`);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      (error) => {
        console.error("Upload error:", error);
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
};

/**
 * Delete a product image from Firebase Storage by its full URL
 */
export const deleteProductImage = async (url: string) => {
  try {
    // Extract the path from a Firebase Storage URL
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (err) {
    console.error("Failed to delete image:", err);
  }
};

/**
 * Returns true if a string is a Firebase Storage URL
 */
export const isFirebaseUrl = (url: string): boolean => {
  return url.startsWith("https://firebasestorage.googleapis.com") || url.startsWith("gs://");
};
