
// Fix: Add explicit string types to prevent TypeScript from inferring literal types,
// which causes a compile error in the configuration check below.
const CLOUDINARY_CLOUD_NAME: string = 'dlqxsa8zl'; // TODO: Replace with your Cloudinary cloud name
const CLOUDINARY_UPLOAD_PRESET: string = 'dlqxsa8zl'; // TODO: Replace with your unsigned upload preset

/**
 * Uploads an image file to Cloudinary.
 * @param file The image file to upload.
 * @returns A promise that resolves with the secure URL of the uploaded image.
 */
export const uploadImage = async (file: File): Promise<string> => {
    // Fallback to FileReader if Cloudinary is not configured
    if (CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME' || CLOUDINARY_UPLOAD_PRESET === 'YOUR_UPLOAD_PRESET' || CLOUDINARY_CLOUD_NAME === 'dorgffs0z') {
        console.warn("Cloudinary is not configured. Falling back to base64 encoding. Please configure in services/cloudinaryService.ts");
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    resolve(reader.result as string);
                } else {
                    reject('Failed to read file');
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
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
        console.error("Error uploading image to Cloudinary:", error);
        // Fallback to FileReader in case of upload error, so the app can still function.
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    resolve(reader.result as string);
                } else {
                    reject('Failed to read file after Cloudinary error');
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
};
