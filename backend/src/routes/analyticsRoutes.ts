import express from 'express';
import { getCourseAnalytics } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';
import { requireTeacher } from '../middleware/roleCheck';

const router = express.Router();

// All routes require authentication and teacher role
router.use(authenticate);
router.use(requireTeacher);

// @route   GET /api/analytics/course/:courseId
// @desc    Get course analytics
// @access  Private (Teacher only)
router.get('/course/:courseId', getCourseAnalytics);

export default router;
