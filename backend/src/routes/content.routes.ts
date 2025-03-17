import express from 'express';
import * as contentController from '../controllers/content.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = express.Router();

// Public routes
router.get('/', contentController.getAllContent);
router.get('/slug/:slug', contentController.getContentBySlug);
router.get('/:id', contentController.getContentById);

// Protected routes - only admin and editor roles can create, update, or delete content
router.post('/', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  contentController.validateContent, 
  contentController.createContent
);

router.put('/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  contentController.validateContent, 
  contentController.updateContent
);

router.delete('/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  contentController.deleteContent
);

export default router; 