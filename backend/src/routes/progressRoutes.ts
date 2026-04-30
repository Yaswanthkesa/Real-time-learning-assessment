import express from 'express';
import {
  submitMCQAnswer,
  markVideoWatched,
  getCourseProgress,
  getVideoProgress,
} from '../controllers/progressController';
import { authenticate } from '../middleware/auth';
import { requireStudent } from '../middleware/roleCheck';

const router = express.Router();

// @route   POST /api/progress/mcq-answer
// @desc    Submit MCQ answer
// @access  Private (Student only)
router.post('/mcq-answer', authenticate, requireStudent, submitMCQAnswer);

// @route   POST /api/progress/mark-watched
// @desc    Mark video as watched
// @access  Private (Student only)
router.post('/mark-watched', authenticate, requireStudent, markVideoWatched);

// @route   GET /api/progress/course/:courseId
// @desc    Get course progress for student
// @access  Private (Student only)
router.get('/course/:courseId', authenticate, requireStudent, getCourseProgress);

// @route   GET /api/progress/video/:videoId
// @desc    Get video progress for student
// @access  Private (Student only)
router.get('/video/:videoId', authenticate, requireStudent, getVideoProgress);

export default router;
