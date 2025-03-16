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
exports.deleteContent = exports.updateContent = exports.getContentBySlug = exports.getContentById = exports.getAllContent = exports.createContent = void 0;
const Content_1 = __importDefault(require("../models/Content"));
const mongoose_1 = __importDefault(require("mongoose"));
// Create new content
const createContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, content, contentType, status, categories, tags, metadata, featuredImage } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-');
        // Check if slug already exists
        const existingContent = yield Content_1.default.findOne({ slug });
        if (existingContent) {
            return res.status(400).json({ message: 'Content with this title already exists' });
        }
        const newContent = new Content_1.default({
            title,
            slug,
            content,
            contentType: contentType || 'post',
            status: status || 'draft',
            author: req.user._id,
            categories: categories || [],
            tags: tags || [],
            metadata: metadata || {},
            featuredImage,
        });
        const savedContent = yield newContent.save();
        res.status(201).json(savedContent);
    }
    catch (error) {
        console.error('Error creating content:', error);
        res.status(500).json({ message: 'Error creating content', error });
    }
});
exports.createContent = createContent;
// Get all content with pagination and filtering
const getAllContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, contentType, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Build filter object
        const filter = {};
        if (contentType)
            filter.contentType = contentType;
        if (status)
            filter.status = status;
        // Add text search if provided
        if (search) {
            filter.$text = { $search: search };
        }
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const contents = yield Content_1.default.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .populate('author', 'username email');
        const total = yield Content_1.default.countDocuments(filter);
        res.status(200).json({
            contents,
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            total,
        });
    }
    catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ message: 'Error fetching content', error });
    }
});
exports.getAllContent = getAllContent;
// Get content by ID
const getContentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid content ID' });
        }
        const content = yield Content_1.default.findById(id).populate('author', 'username email');
        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }
        res.status(200).json(content);
    }
    catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ message: 'Error fetching content', error });
    }
});
exports.getContentById = getContentById;
// Get content by slug
const getContentBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const content = yield Content_1.default.findOne({ slug }).populate('author', 'username email');
        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }
        res.status(200).json(content);
    }
    catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ message: 'Error fetching content', error });
    }
});
exports.getContentBySlug = getContentBySlug;
// Update content
const updateContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, content, contentType, status, categories, tags, metadata, featuredImage } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid content ID' });
        }
        const existingContent = yield Content_1.default.findById(id);
        if (!existingContent) {
            return res.status(404).json({ message: 'Content not found' });
        }
        // Check if user is author or admin
        if (existingContent.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this content' });
        }
        // Generate new slug if title changed
        let slug = existingContent.slug;
        if (title && title !== existingContent.title) {
            slug = title
                .toLowerCase()
                .replace(/[^\w\s]/gi, '')
                .replace(/\s+/g, '-');
            // Check if new slug already exists (excluding current content)
            const slugExists = yield Content_1.default.findOne({ slug, _id: { $ne: id } });
            if (slugExists) {
                return res.status(400).json({ message: 'Content with this title already exists' });
            }
        }
        const updatedContent = yield Content_1.default.findByIdAndUpdate(id, {
            title: title || existingContent.title,
            slug,
            content: content || existingContent.content,
            contentType: contentType || existingContent.contentType,
            status: status || existingContent.status,
            categories: categories || existingContent.categories,
            tags: tags || existingContent.tags,
            metadata: metadata || existingContent.metadata,
            featuredImage: featuredImage || existingContent.featuredImage,
        }, { new: true }).populate('author', 'username email');
        res.status(200).json(updatedContent);
    }
    catch (error) {
        console.error('Error updating content:', error);
        res.status(500).json({ message: 'Error updating content', error });
    }
});
exports.updateContent = updateContent;
// Delete content
const deleteContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid content ID' });
        }
        const content = yield Content_1.default.findById(id);
        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }
        // Check if user is author or admin
        if (content.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this content' });
        }
        yield Content_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: 'Content deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({ message: 'Error deleting content', error });
    }
});
exports.deleteContent = deleteContent;
