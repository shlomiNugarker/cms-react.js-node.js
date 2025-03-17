import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

// Log configuration status
const isConfigured = () => {
  const hasCloudName = !!process.env.CLOUDINARY_CLOUD_NAME;
  const hasApiKey = !!process.env.CLOUDINARY_API_KEY;
  const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET;
  const isEnabled = process.env.USE_CLOUDINARY === 'true';
  
  console.log('Cloudinary configuration status:');
  console.log(`- USE_CLOUDINARY: ${isEnabled ? 'enabled' : 'disabled'}`);
  console.log(`- Cloud Name: ${hasCloudName ? 'configured' : 'missing'}`);
  console.log(`- API Key: ${hasApiKey ? 'configured' : 'missing'}`);
  console.log(`- API Secret: ${hasApiSecret ? 'configured' : 'missing'}`);
  
  return hasCloudName && hasApiKey && hasApiSecret && isEnabled;
};

// Log configuration status at startup
console.log('Checking Cloudinary configuration...');
isConfigured();

/**
 * Upload a file to Cloudinary
 * @param filePath Path to the file
 * @param options Upload options
 * @returns Upload result
 */
export const uploadToCloudinary = async (filePath: string, options: any = {}) => {
  try {
    // Check if Cloudinary is properly configured
    if (!isConfigured()) {
      console.warn('Cloudinary is not fully configured. Check your environment variables.');
    }
    
    const result = await cloudinary.uploader.upload(filePath, options);
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete a file from Cloudinary by public_id
 * @param publicId The public ID of the resource
 * @returns Deletion result
 */
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Generate a Cloudinary URL with transformations
 * @param publicId The public ID of the resource
 * @param options Transformation options
 * @returns Transformed URL
 */
export const getCloudinaryUrl = (publicId: string, options: any = {}) => {
  return cloudinary.url(publicId, options);
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
  getCloudinaryUrl,
}; 