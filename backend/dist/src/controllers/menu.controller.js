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
exports.deleteMenu = exports.updateMenu = exports.getMenuBySlug = exports.getAllMenus = exports.createMenu = void 0;
const Menu_1 = require("../models/Menu");
const mongoose_1 = __importDefault(require("mongoose"));
// Create new menu
const createMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to create menus' });
        }
        const { name, slug, description, location, items } = req.body;
        // Check if slug already exists
        const existingMenu = yield Menu_1.Menu.findOne({ slug });
        if (existingMenu) {
            return res.status(400).json({ message: 'Menu with this slug already exists' });
        }
        const newMenu = new Menu_1.Menu({
            name,
            slug,
            description,
            location,
            items: items || []
        });
        const savedMenu = yield newMenu.save();
        res.status(201).json(savedMenu);
    }
    catch (error) {
        console.error('Error creating menu:', error);
        res.status(500).json({ message: 'Error creating menu', error });
    }
});
exports.createMenu = createMenu;
// Get all menus
const getAllMenus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const menus = yield Menu_1.Menu.find();
        res.status(200).json(menus);
    }
    catch (error) {
        console.error('Error fetching menus:', error);
        res.status(500).json({ message: 'Error fetching menus', error });
    }
});
exports.getAllMenus = getAllMenus;
// Get menu by slug
const getMenuBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const menu = yield Menu_1.Menu.findOne({ slug });
        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }
        res.status(200).json(menu);
    }
    catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ message: 'Error fetching menu', error });
    }
});
exports.getMenuBySlug = getMenuBySlug;
// Update menu
const updateMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update menus' });
        }
        const { id } = req.params;
        const { name, description, location, items, isActive } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid menu ID' });
        }
        const menu = yield Menu_1.Menu.findById(id);
        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }
        const updatedMenu = yield Menu_1.Menu.findByIdAndUpdate(id, {
            name: name || menu.name,
            description: description !== undefined ? description : menu.description,
            location: location !== undefined ? location : menu.location,
            items: items || menu.items,
            isActive: isActive !== undefined ? isActive : menu.isActive
        }, { new: true });
        res.status(200).json(updatedMenu);
    }
    catch (error) {
        console.error('Error updating menu:', error);
        res.status(500).json({ message: 'Error updating menu', error });
    }
});
exports.updateMenu = updateMenu;
// Delete menu
const deleteMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete menus' });
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid menu ID' });
        }
        const menu = yield Menu_1.Menu.findById(id);
        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }
        yield Menu_1.Menu.findByIdAndDelete(id);
        res.status(200).json({ message: 'Menu deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting menu:', error);
        res.status(500).json({ message: 'Error deleting menu', error });
    }
});
exports.deleteMenu = deleteMenu;
