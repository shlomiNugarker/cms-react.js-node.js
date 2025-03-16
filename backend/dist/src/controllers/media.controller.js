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
exports.deleteMedia = exports.updateMedia = exports.getMediaById = exports.getAllMedia = exports.uploadMedia = void 0;
const Media_1 = __importDefault(require("../models/Media"));
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = __importDefault(require("fs"));
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
        const newMedia = new Media_1.default({
            filename,
            originalname,
            mimetype,
            size,
            path: filePath,
            url,
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
// Update media metadata
const updateMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { alt, caption } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid media ID' });
        }
        const media = yield Media_1.default.findById(id);
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }
        // Check if user is uploader or admin
        if (media.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this media' });
        }
        const updatedMedia = yield Media_1.default.findByIdAndUpdate(id, {
            alt: alt !== undefined ? alt : media.alt,
            caption: caption !== undefined ? caption : media.caption,
        }, { new: true }).populate('uploadedBy', 'username email');
        res.status(200).json(updatedMedia);
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
        const { id } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid media ID' });
        }
        const media = yield Media_1.default.findById(id);
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }
        // Check if user is uploader or admin
        if (media.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this media' });
        }
        // Delete file from filesystem
        try {
            fs_1.default.unlinkSync(media.path);
        }
        catch (err) {
            console.error('Error deleting file from filesystem:', err);
            // Continue with deletion from database even if file deletion fails
        }
        yield Media_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: 'Media deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting media:', error);
        res.status(500).json({ message: 'Error deleting media', error });
    }
});
exports.deleteMedia = deleteMedia;
