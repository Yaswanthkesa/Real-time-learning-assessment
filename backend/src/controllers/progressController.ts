import { Request, Response } from 'express';
import Progress from '../models/Progress';
import MCQ from '../models/MCQ';
import Video from '../models/Video';
import Course from '../models/Course';

// @desc    Submit MCQ answer
// @route   POST /api/progress/mcq-answer
// @access  Private (Student only)
export const submitMCQAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = (req as any).user.id;
    const { videoId, mcqId, answer } = req.body;

    // Validate input
    if (!videoId || !mcqId || !answer) {
      res.status(400).json({
        success: false,
        message: 'Video ID, MCQ ID, and answer are required',
      });
      return;
    }

    if (!['A', 'B', 'C', 'D'].includes(answer)) {
      res.status(400).json({
        success: false,
        message: 'Answer must be A, B, C, or D',
      });
      return;
    }

    // Get MCQ to check correct answer
    const mcq = await MCQ.findById(mcqId);
    if (!mcq) {
      res.status(404).json({
        success: false,
        message: 'MCQ not found',
      });
      return;
    }

    // Get video to get courseId
    const video = await Video.findById(videoId);
    if (!video) {
      res.status(404).json({
        success: false,
        message: 'Video not found',
      });
      return;
    }

    const isCorrect = answer === mcq.correctAnswer;

    // Find or create progress record
    let progress = await Progress.findOne({ studentId, videoId });

    if (!progress) {
      progress = await Progress.create({
        studentId,
        videoId,
        courseId: video.courseId,
        watched: false,
        mcqAttempts: [],
        timeSpent: 0,
      });
    }

    // Update MCQ attempt
    const existingAttemptIndex = progress.mcqAttempts.findIndex(
      (attempt) => attempt.mcqId.toString() === mcqId
    );

    if (existingAttemptIndex >= 0) {
      // Update existing attempt
      progress.mcqAttempts[existingAttemptIndex].attempts += 1;
      progress.mcqAttempts[existingAttemptIndex].lastAnswer = answer;
      progress.mcqAttempts[existingAttemptIndex].correct = isCorrect;
    } else {
      // Add new attempt
      progress.mcqAttempts.push({
        mcqId,
        attempts: 1,
        lastAnswer: answer,
        correct: isCorrect,
      });
    }

    progress.lastWatchedAt = new Date();
    await progress.save();

    res.status(200).json({
      success: true,
      correct: isCorrect,
      correctAnswer: mcq.correctAnswer,
      shouldReplayFromTimestamp: isCorrect ? null : mcq.timestamp,
      attempts: existingAttemptIndex >= 0 
        ? progress.mcqAttempts[existingAttemptIndex].attempts 
        : 1,
    });
  } catch (error: any) {
    console.error('Submit MCQ answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting answer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Mark video as watched
// @route   POST /api/progress/mark-watched
// @access  Private (Student only)
export const markVideoWatched = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = (req as any).user.id;
    const { videoId } = req.body;

    if (!videoId) {
      res.status(400).json({
        success: false,
        message: 'Video ID is required',
      });
      return;
    }

    // Get video
    const video = await Video.findById(videoId);
    if (!video) {
      res.status(404).json({
        success: false,
        message: 'Video not found',
      });
      return;
    }

    // Get all MCQs for this video
    const mcqs = await MCQ.find({ videoId });

    // Find progress record
    let progress = await Progress.findOne({ studentId, videoId });

    if (!progress) {
      progress = await Progress.create({
        studentId,
        videoId,
        courseId: video.courseId,
        watched: false,
        mcqAttempts: [],
        timeSpent: 0,
      });
    }

    // Check if all MCQs have been answered correctly
    const allMCQsCorrect = mcqs.every((mcq) => {
      const attempt = progress!.mcqAttempts.find(
        (a) => a.mcqId.toString() === mcq._id.toString()
      );
      return attempt && attempt.correct;
    });

    if (!allMCQsCorrect) {
      res.status(400).json({
        success: false,
        message: 'All MCQs must be answered correctly before marking as watched',
      });
      return;
    }

    // Mark as watched
    progress.watched = true;
    progress.completedAt = new Date();
    await progress.save();

    // Get next video in course
    const nextVideo = await Video.findOne({
      courseId: video.courseId,
      order: video.order + 1,
    });

    res.status(200).json({
      success: true,
      message: 'Video marked as watched',
      nextVideoUnlocked: !!nextVideo,
      nextVideoId: nextVideo?._id,
    });
  } catch (error: any) {
    console.error('Mark video watched error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking video as watched',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get course progress for student
// @route   GET /api/progress/course/:courseId
// @access  Private (Student only)
export const getCourseProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = (req as any).user.id;
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

    // Get all videos in course
    const videos = await Video.find({ courseId }).sort({ order: 1 });

    // Get progress for all videos
    const progressRecords = await Progress.find({
      studentId,
      courseId,
    });

    // Calculate completion percentage
    const completedVideos = progressRecords.filter((p) => p.watched).length;
    const totalVideos = videos.length;
    const completionPercentage = totalVideos > 0 
      ? Math.round((completedVideos / totalVideos) * 100) 
      : 0;

    // Build video progress array
    const videoProgress = videos.map((video) => {
      const progress = progressRecords.find(
        (p) => p.videoId.toString() === video._id.toString()
      );

      return {
        videoId: video._id,
        order: video.order,
        filename: video.filename,
        duration: video.duration,
        watched: progress?.watched || false,
        timeSpent: progress?.timeSpent || 0,
        mcqAttempts: progress?.mcqAttempts || [],
        lastWatchedAt: progress?.lastWatchedAt,
        completedAt: progress?.completedAt,
      };
    });

    res.status(200).json({
      success: true,
      courseId,
      completionPercentage,
      completedVideos,
      totalVideos,
      videoProgress,
    });
  } catch (error: any) {
    console.error('Get course progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get video progress for student
// @route   GET /api/progress/video/:videoId
// @access  Private (Student only)
export const getVideoProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = (req as any).user.id;
    const { videoId } = req.params;

    // Get video
    const video = await Video.findById(videoId);
    if (!video) {
      res.status(404).json({
        success: false,
        message: 'Video not found',
      });
      return;
    }

    // Get progress
    const progress = await Progress.findOne({ studentId, videoId });

    // Check if video is unlocked
    const previousVideo = await Video.findOne({
      courseId: video.courseId,
      order: video.order - 1,
    });

    let isUnlocked = video.order === 1; // First video is always unlocked

    if (previousVideo) {
      const previousProgress = await Progress.findOne({
        studentId,
        videoId: previousVideo._id,
      });
      isUnlocked = previousProgress?.watched || false;
    }

    res.status(200).json({
      success: true,
      videoId,
      isUnlocked,
      watched: progress?.watched || false,
      mcqAttempts: progress?.mcqAttempts || [],
      timeSpent: progress?.timeSpent || 0,
      lastWatchedAt: progress?.lastWatchedAt,
      completedAt: progress?.completedAt,
    });
  } catch (error: any) {
    console.error('Get video progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching video progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
