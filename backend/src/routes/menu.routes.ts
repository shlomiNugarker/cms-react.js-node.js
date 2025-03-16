import express from 'express';
import * as menuController from '../controllers/menu.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', menuController.getAllMenus);
router.get('/:slug', menuController.getMenuBySlug);

// Protected routes (admin only)
router.post('/', authMiddleware, menuController.createMenu);
router.put('/:id', authMiddleware, menuController.updateMenu);
router.delete('/:id', authMiddleware, menuController.deleteMenu);

export default router; 