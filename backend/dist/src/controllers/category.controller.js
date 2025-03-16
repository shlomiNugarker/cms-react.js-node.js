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
exports.deleteCategory = exports.updateCategory = exports.getCategoryBySlug = exports.getCategoryById = exports.getAllCategories = exports.createCategory = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const mongoose_1 = __importDefault(require("mongoose"));
// Create new category
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, parent } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to create categories' });
        }
        // Generate slug from name
        const slug = name
            .toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-');
        // Check if slug already exists
        const existingCategory = yield Category_1.default.findOne({ slug });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category with this name already exists' });
        }
        // Validate parent category if provided
        if (parent && !mongoose_1.default.Types.ObjectId.isValid(parent)) {
            return res.status(400).json({ message: 'Invalid parent category ID' });
        }
        const newCategory = new Category_1.default({
            name,
            slug,
            description,
            parent,
        });
        const savedCategory = yield newCategory.save();
        res.status(201).json(savedCategory);
    }
    catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Error creating category', error });
    }
});
exports.createCategory = createCategory;
// Get all categories
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield Category_1.default.find().populate('parent', 'name slug');
        res.status(200).json(categories);
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories', error });
    }
});
exports.getAllCategories = getAllCategories;
// Get category by ID
const getCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid category ID' });
        }
        const category = yield Category_1.default.findById(id).populate('parent', 'name slug');
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    }
    catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Error fetching category', error });
    }
});
exports.getCategoryById = getCategoryById;
// Get category by slug
const getCategoryBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const category = yield Category_1.default.findOne({ slug }).populate('parent', 'name slug');
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    }
    catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Error fetching category', error });
    }
});
exports.getCategoryBySlug = getCategoryBySlug;
// Update category
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description, parent } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update categories' });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid category ID' });
        }
        const existingCategory = yield Category_1.default.findById(id);
        if (!existingCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        // Generate new slug if name changed
        let slug = existingCategory.slug;
        if (name && name !== existingCategory.name) {
            slug = name
                .toLowerCase()
                .replace(/[^\w\s]/gi, '')
                .replace(/\s+/g, '-');
            // Check if new slug already exists (excluding current category)
            const slugExists = yield Category_1.default.findOne({ slug, _id: { $ne: id } });
            if (slugExists) {
                return res.status(400).json({ message: 'Category with this name already exists' });
            }
        }
        // Validate parent category if provided
        if (parent) {
            if (!mongoose_1.default.Types.ObjectId.isValid(parent)) {
                return res.status(400).json({ message: 'Invalid parent category ID' });
            }
            // Prevent circular reference
            if (parent.toString() === id) {
                return res.status(400).json({ message: 'Category cannot be its own parent' });
            }
        }
        const updatedCategory = yield Category_1.default.findByIdAndUpdate(id, {
            name: name || existingCategory.name,
            slug,
            description: description !== undefined ? description : existingCategory.description,
            parent: parent || existingCategory.parent,
        }, { new: true }).populate('parent', 'name slug');
        res.status(200).json(updatedCategory);
    }
    catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Error updating category', error });
    }
});
exports.updateCategory = updateCategory;
// Delete category
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete categories' });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid category ID' });
        }
        const category = yield Category_1.default.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        // Check if category has children
        const childCategories = yield Category_1.default.find({ parent: id });
        if (childCategories.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete category with child categories. Please delete or reassign child categories first.',
                childCategories
            });
        }
        yield Category_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Error deleting category', error });
    }
});
exports.deleteCategory = deleteCategory;
