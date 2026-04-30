import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import Video from '../models/Video';
import Course from '../models/Course';
import MCQ from '../models/MCQ';
import { processVideo } from '../services/videoProcessor';

// Configure multer for video upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/videos';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename and add timestamp
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    cb(null, `${timestamp}-${sanitized}`);
  },
});

// File filter for video formats
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedFormats = ['.mp4', '.avi', '.mov'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedFormats.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only MP4, AVI, and MOV are allowed.'));
  }
};

// Multer upload configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
});

// Helper function to get video duration using ffmpeg
const getVideoDuration = (filepath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filepath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const duration = metadata.format.duration || 0;
        resolve(Math.round(duration));
      }
    });
  });
};

// Helper function to extract thumbnail using ffmpeg
const extractThumbnail = (videoPath: string, thumbnailPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['10%'],
        filename: path.basename(thumbnailPath),
        folder: path.dirname(thumbnailPath),
        size: '320x240',
      })
      .on('end', () => resolve(thumbnailPath))
      .on('error', (err) => reject(err));
  });
};

// @desc    Upload video to course
// @route   POST /api/courses/:courseId/videos
// @access  Private (Teacher only)
export const uploadVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const teacherId = (req as any).user.id;

    // Validate course exists and belongs to teacher
    const course = await Course.findById(courseId);
    
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found',
      });
      return;
    }

    if (course.teacherId.toString() !== teacherId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to upload videos to this course',
      });
      return;
    }

    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No video file provided',
      });
      return;
    }

    const file = req.file;
    const filepath = file.path;

    try {
      // Get video duration
      const duration = await getVideoDuration(filepath);

      // Extract thumbnail
      const thumbnailDir = 'uploads/thumbnails';
      if (!fs.existsSync(thumbnailDir)) {
        fs.mkdirSync(thumbnailDir, { recursive: true });
      }
      
      const thumbnailFilename = `${path.parse(file.filename).name}.jpg`;
      const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
      
      let thumbnail: string | undefined;
      try {
        await extractThumbnail(filepath, thumbnailPath);
        thumbnail = thumbnailPath;
      } catch (thumbError) {
        console.error('Thumbnail extraction failed:', thumbError);
        // Continue without thumbnail
      }

      // Get next order number for this course
      const lastVideo = await Video.findOne({ courseId })
        .sort({ order: -1 })
        .limit(1);
      
      const order = lastVideo ? lastVideo.order + 1 : 1;

      // Create video record
      const video = await Video.create({
        courseId,
        filename: file.originalname,
        filepath,
        duration,
        thumbnail,
        order,
        processingStatus: 'pending',
        uploadedAt: new Date(),
      });

      res.status(201).json({
        success: true,
        video,
        message: 'Video uploaded successfully',
      });
    } catch (processingError: any) {
      // Clean up uploaded file if processing fails
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      
      throw new Error(`Video processing failed: ${processingError.message}`);
    }
  } catch (error: any) {
    console.error('Upload video error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error uploading video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get video by ID
// @route   GET /api/videos/:videoId
// @desc    Get video by ID with MCQs
// @route   GET /api/videos/:videoId
// @access  Public
export const getVideoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId).populate('courseId', 'name teacherId');

    if (!video) {
      res.status(404).json({
        success: false,
        message: 'Video not found',
      });
      return;
    }

    // Fetch MCQs for this video
    const mcqs = await MCQ.find({ videoId }).sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      video,
      mcqs,
      processingStatus: video.processingStatus,
    });
  } catch (error: any) {
    console.error('Get video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Stream video with range support
// @route   GET /api/videos/:videoId/stream
// @access  Public
export const streamVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
      res.status(404).json({
        success: false,
        message: 'Video not found',
      });
      return;
    }

    const videoPath = video.filepath;

    if (!fs.existsSync(videoPath)) {
      res.status(404).json({
        success: false,
        message: 'Video file not found on server',
      });
      return;
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // No range, send entire file
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error: any) {
    console.error('Stream video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error streaming video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get all videos for a course
// @route   GET /api/courses/:courseId/videos
// @access  Public
export const getCourseVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found',
      });
      return;
    }

    const videos = await Video.find({ courseId }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error: any) {
    console.error('Get course videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching videos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


// @desc    Trigger video processing
// @route   POST /api/videos/:videoId/process
// @access  Private (Teacher only)
export const triggerProcessing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params;
    const teacherId = (req as any).user.id;

    const video = await Video.findById(videoId).populate('courseId');

    if (!video) {
      res.status(404).json({
        success: false,
        message: 'Video not found',
      });
      return;
    }

    // Verify teacher ownership
    const course = video.courseId as any;
    if (course.teacherId.toString() !== teacherId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to process this video',
      });
      return;
    }

    // Check if already processing or completed
    if (video.processingStatus === 'processing') {
      res.status(400).json({
        success: false,
        message: 'Video is already being processed',
      });
      return;
    }

    if (video.processingStatus === 'completed') {
      res.status(400).json({
        success: false,
        message: 'Video has already been processed',
      });
      return;
    }

    // Trigger processing asynchronously (don't block response)
    processVideo(videoId).catch((error) => {
      console.error('Background processing error:', error);
    });

    res.status(200).json({
      success: true,
      message: 'Video processing started',
      video: {
        _id: video._id,
        processingStatus: 'processing',
      },
    });
  } catch (error: any) {
    console.error('Trigger processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error triggering processing',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get video with MCQs
// @route   GET /api/videos/:videoId/mcqs
// @access  Public
export const getVideoWithMCQs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId).populate('courseId', 'name teacherId');

    if (!video) {
      res.status(404).json({
        success: false,
        message: 'Video not found',
      });
      return;
    }

    // Get MCQs if processing is completed
    let mcqs = [];
    if (video.processingStatus === 'completed') {
      const MCQ = require('../models/MCQ').default;
      mcqs = await MCQ.find({ videoId }).sort({ timestamp: 1 });
    }

    res.status(200).json({
      success: true,
      video,
      mcqs,
    });
  } catch (error: any) {
    console.error('Get video with MCQs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
