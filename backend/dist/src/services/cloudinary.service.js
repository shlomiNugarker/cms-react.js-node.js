"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCloudinaryUrl = exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
// Configure Cloudinary with credentials
cloudinary_1.v2.config({
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
const uploadToCloudinary = (filePath, options = {}) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if Cloudinary is properly configured
        if (!isConfigured()) {
            console.warn('Cloudinary is not fully configured. Check your environment variables.');
        }
        const result = yield cloudinary_1.v2.uploader.upload(filePath, options);
        return result;
    }
    catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
});
exports.uploadToCloudinary = uploadToCloudinary;
/**
 * Delete a file from Cloudinary by public_id
 * @param publicId The public ID of the resource
 * @returns Deletion result
 */
const deleteFromCloudinary = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.v2.uploader.destroy(publicId);
        return result;
    }
    catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
});
exports.deleteFromCloudinary = deleteFromCloudinary;
/**
 * Generate a Cloudinary URL with transformations
 * @param publicId The public ID of the resource
 * @param options Transformation options
 * @returns Transformed URL
 */
const getCloudinaryUrl = (publicId, options = {}) => {
    return cloudinary_1.v2.url(publicId, options);
};
exports.getCloudinaryUrl = getCloudinaryUrl;
exports.default = {
    uploadToCloudinary: exports.uploadToCloudinary,
    deleteFromCloudinary: exports.deleteFromCloudinary,
    getCloudinaryUrl: exports.getCloudinaryUrl,
};
