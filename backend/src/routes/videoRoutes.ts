import express from 'express';
import {
  uploadVideo,
  getVideoById,
  streamVideo,
  getCourseVideos,
  triggerProcessing,
  getVideoWithMCQs,
  upload,
} from '../controllers/videoController';
import { authenticate } from '../middleware/auth';
import { requireTeacher } from '../middleware/roleCheck';

const router = express.Router();

// @route   POST /api/courses/:courseId/videos
// @desc    Upload video to course
// @access  Private (Teacher only)
router.post(
  '/courses/:courseId/videos',
  authenticate,
  requireTeacher,
  upload.single('video'),
  uploadVideo
);

// @route   GET /api/courses/:courseId/videos
// @desc    Get all videos for a course
// @access  Public
router.get('/courses/:courseId/videos', getCourseVideos);

// @route   GET /api/videos/:videoId
// @desc    Get video by ID
// @access  Public
router.get('/videos/:videoId', getVideoById);

// @route   GET /api/videos/:videoId/stream
// @desc    Stream video with range support
// @access  Public
router.get('/videos/:videoId/stream', streamVideo);

// @route   POST /api/videos/:videoId/process
// @desc    Trigger video processing
// @access  Private (Teacher only)
router.post('/videos/:videoId/process', authenticate, requireTeacher, triggerProcessing);

// @route   GET /api/videos/:videoId/mcqs
// @desc    Get video with MCQs
// @access  Public
router.get('/videos/:videoId/mcqs', getVideoWithMCQs);

export default router;
