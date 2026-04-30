import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StudentCourseView.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Video {
  _id: string;
  filename: string;
  duration: number;
  thumbnail?: string;
  order: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

interface Course {
  _id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  courseId: string;
  teacherId: {
    _id: string;
    name: string;
  };
}

const StudentCourseView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await axios.get(`${API_URL}/courses/${courseId}`);
      setCourse(courseResponse.data.course);

      // Fetch videos
      const videosResponse = await axios.get(`${API_URL}/courses/${courseId}/videos`);
      setVideos(videosResponse.data.videos);

      // Fetch progress
      try {
        const progressResponse = await axios.get(`${API_URL}/progress/course/${courseId}`);
        setProgress(progressResponse.data);
      } catch (progErr) {
        // Progress might not exist yet, that's okay
        console.log('No progress yet');
      }

      setError(null);
    } catch (err: any) {
      console.error('Error fetching course data:', err);
      setError(err.response?.data?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isVideoUnlocked = (videoOrder: number): boolean => {
    // First video is always unlocked
    if (videoOrder === 1) return true;

    // Check if previous video is completed
    if (progress && progress.videoProgress) {
      const previousVideo = progress.videoProgress.find((vp: any) => vp.order === videoOrder - 1);
      return previousVideo?.watched || false;
    }

    return false;
  };

  const isVideoWatched = (videoId: string): boolean => {
    if (!progress || !progress.videoProgress) return false;
    const videoProgress = progress.videoProgress.find((vp: any) => vp.videoId === videoId);
    return videoProgress?.watched || false;
  };

  const handleVideoClick = (video: Video) => {
    if (!isVideoUnlocked(video.order)) {
      return; // Video is locked
    }

    if (video.processingStatus !== 'completed') {
      return; // Video not ready
    }

    // Navigate to video player (will be implemented in later tasks)
    navigate(`/student/courses/${courseId}/videos/${video._id}`);
  };

  if (loading) {
    return (
      <div className="student-course-view">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="student-course-view">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Course not found'}</p>
          <button onClick={() => navigate('/dashboard')}>
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-course-view">
      <div className="course-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Back to Courses
        </button>
        
        <div className="course-info">
          <h1>{course.name}</h1>
          <p className="course-description">{course.description}</p>
          <div className="course-meta">
            <span className="meta-item">📂 {course.category}</span>
            <span className="meta-item">📊 {course.difficulty}</span>
            <span className="meta-item">👤 {course.teacherId.name}</span>
            <span className="meta-item">🎬 {videos.length} videos</span>
          </div>
        </div>
      </div>

      <div className="videos-section">
        <h2>Course Content</h2>
        
        {videos.length === 0 ? (
          <div className="empty-videos">
            <div className="empty-icon">🎬</div>
            <h3>No videos available yet</h3>
            <p>The instructor hasn't uploaded any videos for this course</p>
          </div>
        ) : (
          <div className="videos-list">
            {videos.map((video) => {
              const unlocked = isVideoUnlocked(video.order);
              const watched = isVideoWatched(video._id);
              const ready = video.processingStatus === 'completed';
              const clickable = unlocked && ready;

              return (
                <div
                  key={video._id}
                  className={`video-item ${!unlocked ? 'locked' : ''} ${watched ? 'watched' : ''} ${!ready ? 'processing' : ''} ${clickable ? 'clickable' : ''}`}
                  onClick={() => clickable && handleVideoClick(video)}
                >
                  <div className="video-thumbnail">
                    {video.thumbnail ? (
                      <img src={`/${video.thumbnail}`} alt={video.filename} />
                    ) : (
                      <div className="thumbnail-placeholder">
                        <span className="placeholder-icon">🎥</span>
                      </div>
                    )}
                    
                    {!unlocked && (
                      <div className="lock-overlay">
                        <span className="lock-icon">🔒</span>
                      </div>
                    )}
                    
                    {unlocked && ready && (
                      <div className="play-overlay">
                        <span className="play-icon">▶</span>
                      </div>
                    )}
                    
                    <div className="video-duration">{formatDuration(video.duration)}</div>
                  </div>

                  <div className="video-info">
                    <div className="video-header">
                      <span className="video-order">#{video.order}</span>
                      <h3 className="video-title">{video.filename}</h3>
                    </div>
                    
                    <div className="video-meta">
                      <span>Duration: {formatDuration(video.duration)}</span>
                    </div>

                    <div className="video-status">
                      {watched && (
                        <span className="status-badge watched-badge">
                          ✓ Completed
                        </span>
                      )}
                      {!watched && !unlocked && (
                        <span className="status-badge locked-badge">
                          🔒 Locked
                        </span>
                      )}
                      {!watched && unlocked && video.processingStatus === 'pending' && (
                        <span className="status-badge processing-badge">
                          ⏳ Processing
                        </span>
                      )}
                      {!watched && unlocked && video.processingStatus === 'processing' && (
                        <span className="status-badge processing-badge">
                          ⚙️ Processing
                        </span>
                      )}
                      {!watched && unlocked && video.processingStatus === 'failed' && (
                        <span className="status-badge error-badge">
                          ❌ Failed
                        </span>
                      )}
                      {!watched && unlocked && video.processingStatus === 'completed' && (
                        <span className="status-badge ready-badge">
                          ✓ Ready to watch
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="info-box">
        <h3>📌 How it works</h3>
        <ul>
          <li>Videos are unlocked sequentially as you complete them</li>
          <li>Watch each video and answer the quiz questions correctly to unlock the next one</li>
          <li>Track your progress as you advance through the course</li>
        </ul>
      </div>
    </div>
  );
};

export default StudentCourseView;
