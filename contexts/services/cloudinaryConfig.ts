// This file now uses placeholder values for Cloudinary configuration.
// IMPORTANT: You must replace these with your actual Cloudinary credentials for media uploads to work.
export const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUDINARY_CLOUD_NAME";
export const CLOUDINARY_UPLOAD_PRESET = "YOUR_CLOUDINARY_UPLOAD_PRESET";

// This check helps in debugging deployment issues.
if (CLOUDINARY_CLOUD_NAME === "YOUR_CLOUDINARY_CLOUD_NAME" || CLOUDINARY_UPLOAD_PRESET === "YOUR_CLOUDINARY_UPLOAD_PRESET") {
    console.error(
        "Cloudinary configuration is using placeholder values. " +
        "Please set your actual CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in 'contexts/services/cloudinaryConfig.ts'."
    );
}
