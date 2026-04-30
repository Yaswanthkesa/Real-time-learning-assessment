import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import VideoUploader from '../components/VideoUploader';
import './CourseDetailPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Video {
  _id: string;
  filename: string;
  duration: number;
  thumbnail?: string;
  order: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;
  uploadedAt: string;
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

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
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

  const handleUploadComplete = () => {
    // Refresh videos list after upload
    fetchCourseData();
  };

  const handleProcessVideo = async (videoId: string) => {
    try {
      await axios.post(`${API_URL}/videos/${videoId}/process`);
      
      // Refresh to show updated status
      fetchCourseData();
      
      alert('Video processing started! This may take a few minutes.');
    } catch (err: any) {
      console.error('Error processing video:', err);
      alert(err.response?.data?.message || 'Failed to start processing');
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', color: '#FF9800' },
      processing: { label: 'Processing', color: '#2196F3' },
      completed: { label: 'Ready', color: '#4CAF50' },
      failed: { label: 'Failed', color: '#F44336' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className="status-badge"
        style={{ backgroundColor: config.color }}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="course-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-detail-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Course not found'}</p>
          <button onClick={() => navigate('/teacher/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Check if current user is the course owner
  const isOwner = user?.id === course.teacherId._id;

  return (
    <div className="course-detail-page">
      <div className="course-header">
        <button className="btn-back" onClick={() => navigate('/teacher/dashboard')}>
          ← Back to Dashboard
        </button>
        
        <div className="course-info">
          <h1>{course.name}</h1>
          <p className="course-description">{course.description}</p>
          <div className="course-meta">
            <span className="meta-item">📂 {course.category}</span>
            <span className="meta-item">📊 {course.difficulty}</span>
            <span className="meta-item">🎬 {videos.length} videos</span>
            <span className="meta-item">ID: {course.courseId}</span>
          </div>
        </div>
      </div>

      {isOwner && (
        <div className="upload-section">
          <h2>Upload Videos</h2>
          <VideoUploader courseId={courseId!} onUploadComplete={handleUploadComplete} />
        </div>
      )}

      <div className="videos-section">
        <h2>Course Videos</h2>
        
        {videos.length === 0 ? (
          <div className="empty-videos">
            <div className="empty-icon">🎬</div>
            <h3>No videos yet</h3>
            <p>Upload your first video to get started</p>
          </div>
        ) : (
          <div className="videos-list">
            {videos.map((video) => (
              <div key={video._id} className="video-item">
                <div className="video-thumbnail">
                  {video.thumbnail ? (
                    <img src={`/${video.thumbnail}`} alt={video.filename} />
                  ) : (
                    <div className="thumbnail-placeholder">
                      <span className="placeholder-icon">🎥</span>
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
                    <span>•</span>
                    <span>Uploaded: {new Date(video.uploadedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="video-status">
                    {getStatusBadge(video.processingStatus)}
                    {video.processingError && (
                      <span className="error-text">{video.processingError}</span>
                    )}
                    {isOwner && video.processingStatus === 'pending' && (
                      <button
                        className="btn-process"
                        onClick={() => handleProcessVideo(video._id)}
                      >
                        Process Video
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;
