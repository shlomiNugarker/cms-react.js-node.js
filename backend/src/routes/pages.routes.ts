import express from 'express';
import * as pagesController from '../controllers/pages.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = express.Router();

// Public routes
router.get('/', pagesController.getAllPages);
router.get('/slug/:slug', pagesController.getPageBySlug);
router.get('/:id', pagesController.getPageById);

// Protected routes - only admin and editor roles can create, update, or delete pages
router.post('/', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  pagesController.validatePage, 
  pagesController.createPage
);

router.put('/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  pagesController.validatePage, 
  pagesController.updatePage
);

router.delete('/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  pagesController.deletePage
);

export default router; 