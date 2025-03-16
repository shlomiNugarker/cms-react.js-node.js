import express from 'express';
import * as categoryController from '../controllers/category.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/id/:id', categoryController.getCategoryById);
router.get('/slug/:slug', categoryController.getCategoryBySlug);

// Protected routes (admin only)
router.post('/', authMiddleware, categoryController.createCategory);
router.put('/:id', authMiddleware, categoryController.updateCategory);
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

export default router; 