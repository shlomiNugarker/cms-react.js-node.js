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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCloudinaryStatus = exports.deleteMedia = exports.updateMedia = exports.getMediaById = exports.getAllMedia = exports.addEmbeddedMedia = exports.uploadMedia = void 0;
const Media_1 = __importDefault(require("../models/Media"));
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = __importDefault(require("fs"));
const cloudinary_service_1 = __importDefault(require("../services/cloudinary.service"));
// Upload media file
const uploadMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const { originalname, mimetype, size, filename, path: filePath } = req.file;
        // Generate URL for the file
        const baseUrl = process.env.BASE_URL || `http://${req.get('host')}`;
        const url = `${baseUrl}/uploads/${filename}`;
        // Always attempt to use Cloudinary if configured
        let cloudinaryResult;
        const useCloudinary = process.env.USE_CLOUDINARY === 'true';
        if (useCloudinary) {
            try {
                console.log('Uploading to Cloudinary:', filePath);
                // Upload to Cloudinary
                cloudinaryResult = yield cloudinary_service_1.default.uploadToCloudinary(filePath, {
                    resource_type: mimetype.startsWith('video/') ? 'video' : 'auto',
                    folder: 'media',
                });
                console.log('Cloudinary upload result:', cloudinaryResult ? 'success' : 'failure');
            }
            catch (cloudinaryError) {
                console.error('Error uploading to Cloudinary:', cloudinaryError);
                // Continue with local storage if Cloudinary fails
            }
        }
        else {
            console.log('Cloudinary uploads disabled, using local storage');
        }
        const newMedia = new Media_1.default({
            filename,
            originalname,
            mimetype,
            size,
            path: filePath,
            url: (cloudinaryResult === null || cloudinaryResult === void 0 ? void 0 : cloudinaryResult.secure_url) || url,
            mediaType: 'file',
            uploadedBy: req.user._id,
        });
        const savedMedia = yield newMedia.save();
        res.status(201).json(savedMedia);
    }
    catch (error) {
        console.error('Error uploading media:', error);
        res.status(500).json({ message: 'Error uploading media', error });
    }
});
exports.uploadMedia = uploadMedia;
// Add embedded media (YouTube, Vimeo)
const addEmbeddedMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { url, sourceType, embedCode, title, alt, caption } = req.body;
        if (!url || !sourceType || !embedCode) {
            return res.status(400).json({ message: 'URL, sourceType and embedCode are required' });
        }
        // Generate a unique filename for the embedded media
        const filename = `embedded_${sourceType}_${Date.now()}`;
        const newMedia = new Media_1.default({
            filename,
            originalname: title || `Embedded ${sourceType} video`,
            mimetype: 'video/embedded',
            size: 0,
            path: '',
            url,
            mediaType: 'embedded',
            sourceType,
            embedCode,
            alt,
            caption,
            uploadedBy: req.user._id,
        });
        const savedMedia = yield newMedia.save();
        res.status(201).json(savedMedia);
    }
    catch (error) {
        console.error('Error adding embedded media:', error);
        res.status(500).json({ message: 'Error adding embedded media', error });
    }
});
exports.addEmbeddedMedia = addEmbeddedMedia;
// Get all media files with pagination and filtering
const getAllMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 20, mimetype, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Build filter object
        const filter = {};
        if (mimetype) {
            // Handle multiple mimetypes (e.g. image/*, video/*)
            if (mimetype.includes('*')) {
                const mimePrefix = mimetype.split('*')[0];
                filter.mimetype = { $regex: new RegExp(`^${mimePrefix}`) };
            }
            else {
                filter.mimetype = mimetype;
            }
        }
        // Add text search if provided
        if (search) {
            filter.$or = [
                { originalname: { $regex: search, $options: 'i' } },
                { alt: { $regex: search, $options: 'i' } },
                { caption: { $regex: search, $options: 'i' } },
            ];
        }
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const mediaFiles = yield Media_1.default.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .populate('uploadedBy', 'username email');
        const total = yield Media_1.default.countDocuments(filter);
        res.status(200).json({
            mediaFiles,
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            total,
        });
    }
    catch (error) {
        console.error('Error fetching media files:', error);
        res.status(500).json({ message: 'Error fetching media files', error });
    }
});
exports.getAllMedia = getAllMedia;
// Get media by ID
const getMediaById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid media ID' });
        }
        const media = yield Media_1.default.findById(id).populate('uploadedBy', 'username email');
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }
        res.status(200).json(media);
    }
    catch (error) {
        console.error('Error fetching media:', error);
        res.status(500).json({ message: 'Error fetching media', error });
    }
});
exports.getMediaById = getMediaById;
// Update media
const updateMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { id } = req.params;
        const { alt, caption, url, embedCode } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid media ID' });
        }
        const media = yield Media_1.default.findById(id);
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }
        // Update media properties
        if (alt !== undefined)
            media.alt = alt;
        if (caption !== undefined)
            media.caption = caption;
        if (url !== undefined && media.mediaType === 'embedded')
            media.url = url;
        if (embedCode !== undefined && media.mediaType === 'embedded')
            media.embedCode = embedCode;
        const updatedMedia = yield media.save();
        res.json(updatedMedia);
    }
    catch (error) {
        console.error('Error updating media:', error);
        res.status(500).json({ message: 'Error updating media', error });
    }
});
exports.updateMedia = updateMedia;
// Delete media
const deleteMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No media IDs provided' });
        }
        // Find all media items to delete
        const mediaItems = yield Media_1.default.find({ _id: { $in: ids } });
        if (mediaItems.length === 0) {
            return res.status(404).json({ message: 'No media found with provided IDs' });
        }
        // Delete files from storage
        for (const media of mediaItems) {
            if (media.mediaType === 'file') {
                // Check if it's a Cloudinary URL
                if (media.url.includes('cloudinary.com')) {
                    // Extract public_id from URL
                    const publicId = media.url.split('/').slice(-1)[0].split('.')[0];
                    try {
                        yield cloudinary_service_1.default.deleteFromCloudinary(publicId);
                    }
                    catch (err) {
                        console.error(`Error deleting file from Cloudinary: ${publicId}`, err);
                    }
                }
                else if (fs_1.default.existsSync(media.path)) {
                    // Delete local file
                    fs_1.default.unlinkSync(media.path);
                }
            }
        }
        // Delete media documents from database
        yield Media_1.default.deleteMany({ _id: { $in: ids } });
        res.json({ message: 'Media deleted successfully', count: mediaItems.length });
    }
    catch (error) {
        console.error('Error deleting media:', error);
        res.status(500).json({ message: 'Error deleting media', error });
    }
});
exports.deleteMedia = deleteMedia;
// Check Cloudinary configuration status
const getCloudinaryStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isEnabled = process.env.USE_CLOUDINARY === 'true';
        const hasCloudName = !!process.env.CLOUDINARY_CLOUD_NAME;
        const hasApiKey = !!process.env.CLOUDINARY_API_KEY;
        const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET;
        const isFullyConfigured = isEnabled && hasCloudName && hasApiKey && hasApiSecret;
        res.json({
            enabled: isFullyConfigured,
            status: {
                enabled: isEnabled,
                cloudName: hasCloudName,
                apiKey: hasApiKey,
                apiSecret: hasApiSecret
            }
        });
    }
    catch (error) {
        console.error('Error checking Cloudinary status:', error);
        res.status(500).json({ message: 'Error checking Cloudinary status', error });
    }
});
exports.getCloudinaryStatus = getCloudinaryStatus;
