import { Request, Response } from 'express';
import Course from '../models/Course';
import Video from '../models/Video';
import MCQ from '../models/MCQ';
import Progress from '../models/Progress';
import User from '../models/User';

// @desc    Get course analytics
// @route   GET /api/analytics/course/:courseId
// @access  Private (Teacher only - course owner)
export const getCourseAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const teacherId = (req as any).user.id;
    const { courseId } = req.params;

    // Verify course exists and belongs to teacher
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
        message: 'Not authorized to view analytics for this course',
      });
      return;
    }

    // Get all videos in course
    const videos = await Video.find({ courseId }).sort({ order: 1 });
    const videoIds = videos.map((v) => v._id);

    // Get all MCQs for course videos
    const mcqs = await MCQ.find({ videoId: { $in: videoIds } });

    // Get all progress records for this course
    const progressRecords = await Progress.find({ courseId });

    // Calculate enrollment count (unique students who have progress)
    const enrolledStudentIds = new Set(
      progressRecords.map((p) => p.studentId.toString())
    );
    const enrollmentCount = enrolledStudentIds.size;

    // Calculate average MCQ score across all students
    let totalCorrectAnswers = 0;
    let totalAttempts = 0;

    progressRecords.forEach((progress) => {
      progress.mcqAttempts.forEach((attempt) => {
        if (attempt.correct) {
          totalCorrectAnswers++;
        }
        totalAttempts++;
      });
    });

    const avgMcqScore =
      totalAttempts > 0
        ? Math.round((totalCorrectAnswers / totalAttempts) * 100)
        : 0;

    // Calculate question-level accuracy
    const questionAccuracy = mcqs.map((mcq) => {
      let correctCount = 0;
      let totalCount = 0;

      progressRecords.forEach((progress) => {
        const attempt = progress.mcqAttempts.find(
          (a) => a.mcqId.toString() === mcq._id.toString()
        );
        if (attempt) {
          if (attempt.correct) {
            correctCount++;
          }
          totalCount++;
        }
      });

      const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

      return {
        mcqId: mcq._id,
        conceptTitle: mcq.conceptTitle,
        question: mcq.question,
        correctCount,
        totalCount,
        accuracy,
      };
    });

    // Get student-level MCQ scores
    const studentScores = await Promise.all(
      Array.from(enrolledStudentIds).map(async (studentId) => {
        const student = await User.findById(studentId).select('name email');
        const studentProgress = progressRecords.filter(
          (p) => p.studentId.toString() === studentId
        );

        let studentCorrect = 0;
        let studentTotal = 0;

        studentProgress.forEach((progress) => {
          progress.mcqAttempts.forEach((attempt) => {
            if (attempt.correct) {
              studentCorrect++;
            }
            studentTotal++;
          });
        });

        const score =
          studentTotal > 0 ? Math.round((studentCorrect / studentTotal) * 100) : 0;

        // Calculate completion percentage
        const completedVideos = studentProgress.filter((p) => p.watched).length;
        const completionPercentage =
          videos.length > 0 ? Math.round((completedVideos / videos.length) * 100) : 0;

        return {
          studentId,
          studentName: student?.name || 'Unknown',
          studentEmail: student?.email || 'Unknown',
          mcqScore: score,
          correctAnswers: studentCorrect,
          totalQuestions: studentTotal,
          completionPercentage,
          completedVideos,
          totalVideos: videos.length,
        };
      })
    );

    // Sort by MCQ score descending
    studentScores.sort((a, b) => b.mcqScore - a.mcqScore);

    res.status(200).json({
      success: true,
      courseId,
      courseName: course.name,
      enrollmentCount,
      avgMcqScore,
      totalVideos: videos.length,
      totalMCQs: mcqs.length,
      questionAccuracy,
      studentScores,
    });
  } catch (error: any) {
    console.error('Get course analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
