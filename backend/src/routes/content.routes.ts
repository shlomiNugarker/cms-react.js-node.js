import express from 'express';
import * as contentController from '../controllers/content.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', contentController.getAllContent);
router.get('/slug/:slug', contentController.getContentBySlug);
router.get('/id/:id', contentController.getContentById);
router.get('/:id', contentController.getContentById);

// Protected routes
router.post('/', authMiddleware, contentController.createContent);
router.put('/:id', authMiddleware, contentController.updateContent);
router.delete('/:id', authMiddleware, contentController.deleteContent);

export default router; 