import { supabase } from './supabaseService';

const BUCKET_NAME = 'media'; // The name of your bucket in Supabase

/**
 * Uploads a file to a specified path in the Supabase storage bucket.
 * @param file The file to upload.
 * @param path The path where the file will be stored in the bucket.
 * @returns The public URL of the uploaded file.
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Upload failed, no data returned.');
  }

  // Get the public URL for the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  if (!publicUrl) {
    throw new Error('Could not get public URL for the uploaded file.');
  }

  return publicUrl;
};
