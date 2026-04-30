import express from 'express';
import {
  createCourse,
  getCourses,
  getCourseById,
  deleteCourse,
  updateCourse,
} from '../controllers/courseController';
import { authenticate } from '../middleware/auth';
import { requireTeacher } from '../middleware/roleCheck';

const router = express.Router();

// @route   POST /api/courses
// @desc    Create new course
// @access  Private (Teacher only)
router.post('/', authenticate, requireTeacher, createCourse);

// @route   GET /api/courses
// @desc    Get all courses (with optional search)
// @access  Public
router.get('/', getCourses);

// @route   GET /api/courses/:courseId
// @desc    Get single course by ID
// @access  Public
router.get('/:courseId', getCourseById);

// @route   PUT /api/courses/:courseId
// @desc    Update course
// @access  Private (Teacher only - must be owner)
router.put('/:courseId', authenticate, requireTeacher, updateCourse);

// @route   DELETE /api/courses/:courseId
// @desc    Delete course
// @access  Private (Teacher only - must be owner)
router.delete('/:courseId', authenticate, requireTeacher, deleteCourse);

export default router;
