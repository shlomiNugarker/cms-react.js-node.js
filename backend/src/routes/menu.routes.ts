import express from 'express';
import * as menuController from '../controllers/menu.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = express.Router();

// Public routes
router.get('/', menuController.getAllMenus);
router.get('/:slug', menuController.getMenuBySlug);

// Protected routes (admin only)
router.post('/', authMiddleware, roleMiddleware(['admin']),  menuController.createMenu);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), menuController.updateMenu);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), menuController.deleteMenu);

export default router; 