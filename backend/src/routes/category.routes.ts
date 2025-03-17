import express from 'express';
import * as categoryController from '../controllers/category.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = express.Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/id/:id', categoryController.getCategoryById);
router.get('/slug/:slug', categoryController.getCategoryBySlug);

// Protected routes (admin only)
router.post('/', authMiddleware,roleMiddleware(['admin']),  categoryController.createCategory);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), categoryController.updateCategory);
router.delete('/:id', authMiddleware,roleMiddleware(['admin']),  categoryController.deleteCategory);

export default router; 