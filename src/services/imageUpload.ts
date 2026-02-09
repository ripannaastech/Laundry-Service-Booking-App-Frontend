// ImgBB Image Upload Service
const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '062499640037b87a330cb09793b95435';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

export interface ImgBBResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium?: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  error?: {
    message: string;
    code: number;
  };
}

/**
 * Upload a single image to ImgBB
 * @param file - File object or base64 string
 * @returns Promise with the uploaded image URL
 */
export const uploadImage = async (file: File | string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);

    if (typeof file === 'string') {
      // If it's a base64 string, remove the data URL prefix if present
      const base64Data = file.includes('base64,') ? file.split('base64,')[1] : file;
      formData.append('image', base64Data);
    } else {
      // If it's a File object
      formData.append('image', file);
    }

    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    const result: ImgBBResponse = await response.json();

    if (result.success && result.data) {
      return result.data.display_url;
    } else {
      throw new Error(result.error?.message || 'Failed to upload image');
    }
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

/**
 * Upload multiple images to ImgBB
 * @param files - Array of File objects
 * @returns Promise with array of uploaded image URLs
 */
export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImage(file));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Multiple image upload error:', error);
    throw error;
  }
};

/**
 * Convert File to base64 string
 * @param file - File object
 * @returns Promise with base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Validate image file
 * @param file - File object
 * @param maxSizeMB - Maximum file size in MB (default 5MB)
 * @returns Object with isValid and error message
 */
export const validateImageFile = (file: File, maxSizeMB: number = 5): { isValid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.' };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: `File size exceeds ${maxSizeMB}MB limit.` };
  }
  
  return { isValid: true };
};

export default {
  uploadImage,
  uploadMultipleImages,
  fileToBase64,
  validateImageFile,
};
