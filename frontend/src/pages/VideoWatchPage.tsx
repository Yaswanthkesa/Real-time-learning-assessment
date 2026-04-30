import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import VideoPlayer from '../components/VideoPlayer';
import './VideoWatchPage.css';

interface Video {
  _id: string;
  filename: string;
  duration: number;
  order: number;
}

interface Course {
  _id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
}

const VideoWatchPage: React.FC = () => {
  const { courseId, videoId } = useParams<{ courseId: string; videoId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch course details
        const courseResponse = await axios.get(
          `http://localhost:5000/api/courses/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCourse(courseResponse.data.course);

        // Fetch video details
        const videoResponse = await axios.get(
          `http://localhost:5000/api/videos/${videoId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setVideo(videoResponse.data.video);

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load video');
        setLoading(false);
      }
    };

    if (courseId && videoId) {
      fetchData();
    }
  }, [courseId, videoId]);

  const handleBackToCourse = () => {
    navigate(`/student/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="video-watch-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-watch-page">
        <div className="error">{error}</div>
        <button onClick={handleBackToCourse} className="back-btn">
          Back to Course
        </button>
      </div>
    );
  }

  return (
    <div className="video-watch-page">
      <div className="video-header">
        <button onClick={handleBackToCourse} className="back-btn">
          ← Back to Course
        </button>
        <div className="video-info">
          <h1>{course?.name}</h1>
          <h2>Video {video?.order}: {video?.filename}</h2>
        </div>
      </div>

      {videoId && courseId && (
        <VideoPlayer videoId={videoId} courseId={courseId} />
      )}

      <div className="video-instructions">
        <h3>How to Watch</h3>
        <ul>
          <li>Watch the video carefully</li>
          <li>Multiple-choice questions will appear at key moments</li>
          <li>Answer correctly to continue to the next concept</li>
          <li>If you answer incorrectly, the video will replay from the current concept</li>
          <li>Complete all questions to finish the video and unlock the next one</li>
        </ul>
      </div>
    </div>
  );
};

export default VideoWatchPage;
