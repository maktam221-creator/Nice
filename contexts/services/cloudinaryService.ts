/**
 * Uploads an image or video file to Cloudinary.
 * @param file The file to upload.
 * @param resourceType The type of resource ('image' or 'video').
 * @returns A promise that resolves with the secure URL of the uploaded media.
 */
export const uploadMedia = async (file: File, resourceType: 'image' | 'video'): Promise<string> => {
    // هام: يجب توفير إعدادات Cloudinary كمتغيرات بيئة (environment variables).
    const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
    const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;

    // التحقق من أن الإعدادات قد تم تعريفها
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        const errorMessage = "إعدادات Cloudinary غير موجودة. يرجى التأكد من تعريف متغيرات البيئة CLOUDINARY_CLOUD_NAME و CLOUDINARY_UPLOAD_PRESET.";
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error(`Error uploading ${resourceType} to Cloudinary:`, error);
        throw error;
    }
};