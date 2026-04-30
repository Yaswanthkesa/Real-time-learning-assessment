import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import MCQOverlay from './MCQOverlay';
import './VideoPlayer.css';

interface MCQ {
  _id: string;
  conceptTitle: string;
  question: string;
  options: string[];
  correctAnswer: string;
  timestamp: number;
}

interface VideoPlayerProps {
  videoId: string;
  courseId: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, courseId }) => {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [currentMCQ, setCurrentMCQ] = useState<MCQ | null>(null);
  const [showMCQ, setShowMCQ] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [answeredMCQs, setAnsweredMCQs] = useState<Set<string>>(new Set());
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [lastCorrectMCQTimestamp, setLastCorrectMCQTimestamp] = useState<number>(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Trigger video processing
  const triggerProcessing = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/videos/${videoId}/process`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProcessingStatus('processing');
    } catch (err: any) {
      console.error('Error triggering processing:', err);
    }
  }, [videoId]);

  // Fetch video data and MCQs
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/videos/${videoId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { video, mcqs: videoMCQs, processingStatus: status } = response.data;
        
        console.log('📹 Video loaded:', video.filename);
        console.log('📊 Processing status:', status);
        console.log('❓ MCQs found:', videoMCQs?.length || 0);
        
        if (videoMCQs && videoMCQs.length > 0) {
          console.log('🎯 MCQ timestamps:', videoMCQs.map((m: MCQ) => `${m.timestamp}s`).join(', '));
        }
        
        setVideoUrl(`http://localhost:5000/api/videos/${videoId}/stream`);
        setProcessingStatus(status);
        
        if (videoMCQs && videoMCQs.length > 0) {
          setMcqs(videoMCQs);
        }
        
        setLoading(false);

        // Trigger processing if status is pending
        if (status === 'pending') {
          await triggerProcessing();
        }
      } catch (err: any) {
        console.error('Error fetching video:', err);
        setError(err.response?.data?.message || 'Failed to load video');
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [videoId, triggerProcessing]);

  // Check for MCQ at current timestamp
  useEffect(() => {
    // Only check for MCQs after video has started playing and played for at least 1 second
    if (mcqs.length === 0 || !playing || !hasStartedPlaying || currentTime < 1) return;

    const currentMCQIndex = mcqs.findIndex(
      (mcq) =>
        currentTime >= mcq.timestamp && 
        currentTime < mcq.timestamp + 2 && 
        !answeredMCQs.has(mcq._id)
    );

    if (currentMCQIndex !== -1) {
      const mcq = mcqs[currentMCQIndex];
      console.log(`🎯 MCQ triggered at ${currentTime}s (timestamp: ${mcq.timestamp}s)`);
      setCurrentMCQ(mcq);
      setShowMCQ(true);
      setPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [currentTime, mcqs, playing, answeredMCQs, hasStartedPlaying]);

  // Handle progress update
  const handleProgress = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle play/pause
  const handlePlay = () => {
    setPlaying(true);
    setHasStartedPlaying(true);
  };
  const handlePause = () => setPlaying(false);

  // Handle MCQ answer submission
  const handleMCQSubmit = async (answer: string, isCorrect: boolean, replayTimestamp?: number) => {
    if (isCorrect && currentMCQ) {
      // Mark MCQ as answered
      setAnsweredMCQs((prev) => new Set(prev).add(currentMCQ._id));
      
      // Save this MCQ's timestamp as the last correct one
      setLastCorrectMCQTimestamp(currentMCQ.timestamp);
      console.log(`✅ Correct! Saved checkpoint at ${currentMCQ.timestamp}s`);
      
      // Close overlay and resume video
      setShowMCQ(false);
      setCurrentMCQ(null);
      
      // Use setTimeout to avoid play/pause conflict
      setTimeout(() => {
        if (videoRef.current) {
          setPlaying(true);
          videoRef.current.play().catch(err => console.log('Play error:', err));
        }
      }, 100);
    } else if (replayTimestamp !== undefined && currentMCQ) {
      // Incorrect answer: replay from last correctly answered MCQ timestamp
      const replayFrom = lastCorrectMCQTimestamp;
      console.log(`❌ Wrong answer - replaying from ${replayFrom}s (last correct MCQ)`);
      
      // Don't mark this MCQ as answered - student needs to answer it again
      setShowMCQ(false);
      setCurrentMCQ(null);
      
      // Use setTimeout to avoid play/pause conflict
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = replayFrom;
          setPlaying(true);
          videoRef.current.play().catch(err => console.log('Play error:', err));
        }
      }, 100);
    }
  };

  // Handle video end
  const handleEnded = async () => {
    // Check if all MCQs are answered
    if (answeredMCQs.size === mcqs.length && mcqs.length > 0) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          'http://localhost:5000/api/progress/mark-watched',
          { videoId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert('Congratulations! You have completed this video.');
      } catch (err: any) {
        console.error('Error marking video as watched:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="video-player-container">
        <div className="loading">Loading video...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-player-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="video-player-container">
      <div className="player-wrapper">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          onTimeUpdate={handleProgress}
          onEnded={handleEnded}
          onPlay={handlePlay}
          onPause={handlePause}
          style={{ width: '100%', height: '100%' }}
        />
        
        {showMCQ && currentMCQ && (
          <MCQOverlay
            mcq={currentMCQ}
            videoId={videoId}
            onSubmit={handleMCQSubmit}
          />
        )}
      </div>

      {processingStatus === 'processing' && (
        <div className="processing-notice">
          <p>⏳ Video is being processed. MCQs will appear once processing is complete.</p>
        </div>
      )}

      {processingStatus === 'failed' && (
        <div className="processing-error">
          <p>❌ Video processing failed. Please try again later.</p>
        </div>
      )}

      {mcqs.length > 0 && (
        <div className="mcq-progress">
          <p>
            MCQs Answered: {answeredMCQs.size} / {mcqs.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
