import express from 'express';
import {
  createFormSubmission,
  getFormSubmissions,
  getFormSubmissionById,
  updateFormSubmissionStatus,
  deleteFormSubmission,
} from '../controllers/formSubmissionController';
import { authenticateToken, isAdmin } from '../middlewares/auth';

const router = express.Router();

// Public route for form submission
router.post('/', createFormSubmission);

// Protected routes for admin
router.get('/', authenticateToken, isAdmin, getFormSubmissions);
router.get('/:id', authenticateToken, isAdmin, getFormSubmissionById);
router.patch('/:id/status', authenticateToken, isAdmin, updateFormSubmissionStatus);
router.delete('/:id', authenticateToken, isAdmin, deleteFormSubmission);

export default router; 