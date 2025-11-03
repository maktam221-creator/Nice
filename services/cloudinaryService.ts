// Fix: Add explicit string types to prevent TypeScript from inferring literal types,
// which causes a compile error in the configuration check below.
const CLOUDINARY_CLOUD_NAME: string = 'dlqxsa8zl'; // TODO: Replace with your Cloudinary cloud name
const CLOUDINARY_UPLOAD_PRESET: string = 'dlqxsa8zl'; // TODO: Replace with your unsigned upload preset

/**
 * Uploads an image or video file to Cloudinary.
 * @param file The file to upload.
 * @param resourceType The type of resource ('image' or 'video').
 * @returns A promise that resolves with the secure URL of the uploaded media.
 */
export const uploadMedia = async (file: File, resourceType: 'image' | 'video'): Promise<string> => {
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
