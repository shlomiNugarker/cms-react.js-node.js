import express from 'express';
import * as postsController from '../controllers/posts.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = express.Router();

// Public routes
router.get('/', postsController.getAllPosts);
router.get('/category/:category', postsController.getPostsByCategory);
router.get('/tag/:tag', postsController.getPostsByTag);
router.get('/slug/:slug', postsController.getPostBySlug);
router.get('/:id', postsController.getPostById);

// Protected routes - only admin and editor roles can create, update, or delete posts
router.post('/', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  postsController.validatePost, 
  postsController.createPost
);

router.put('/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  postsController.validatePost, 
  postsController.updatePost
);

router.delete('/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  postsController.deletePost
);

export default router; 