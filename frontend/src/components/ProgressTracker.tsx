import React from 'react';
import './ProgressTracker.css';

interface VideoProgress {
  videoId: string;
  order: number;
  filename: string;
  duration: number;
  watched: boolean;
  timeSpent: number;
  mcqAttempts: Array<{
    mcqId: string;
    attempts: number;
    correct: boolean;
  }>;
  lastWatchedAt?: Date;
  completedAt?: Date;
}

interface ProgressTrackerProps {
  courseId: string;
  courseName: string;
  completionPercentage: number;
  completedVideos: number;
  totalVideos: number;
  videoProgress: VideoProgress[];
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  courseName,
  completionPercentage,
  completedVideos,
  totalVideos,
  videoProgress,
}) => {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeSpent = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const calculateMCQScore = (mcqAttempts: VideoProgress['mcqAttempts']): string => {
    if (mcqAttempts.length === 0) return 'N/A';
    
    const correctAnswers = mcqAttempts.filter((a) => a.correct).length;
    const totalQuestions = mcqAttempts.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    return `${correctAnswers}/${totalQuestions} (${percentage}%)`;
  };

  const getTotalTimeSpent = (): string => {
    const totalSeconds = videoProgress.reduce((sum, vp) => sum + vp.timeSpent, 0);
    return formatTimeSpent(totalSeconds);
  };

  return (
    <div className="progress-tracker">
      <div className="progress-header">
        <h2>Your Progress: {courseName}</h2>
      </div>

      <div className="progress-summary">
        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <div className="summary-label">Completion</div>
            <div className="summary-value">{completionPercentage}%</div>
            <div className="summary-detail">
              {completedVideos} of {totalVideos} videos
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">⏱️</div>
          <div className="summary-content">
            <div className="summary-label">Time Spent</div>
            <div className="summary-value">{getTotalTimeSpent()}</div>
            <div className="summary-detail">Total learning time</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">🎯</div>
          <div className="summary-content">
            <div className="summary-label">Videos Completed</div>
            <div className="summary-value">{completedVideos}</div>
            <div className="summary-detail">Out of {totalVideos} total</div>
          </div>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${completionPercentage}%` }}
          >
            {completionPercentage > 10 && (
              <span className="progress-bar-text">{completionPercentage}%</span>
            )}
          </div>
        </div>
      </div>

      <div className="video-progress-list">
        <h3>Video Progress</h3>
        
        {videoProgress.length === 0 ? (
          <div className="empty-progress">
            <p>No videos available in this course yet.</p>
          </div>
        ) : (
          <div className="progress-table">
            <div className="progress-table-header">
              <div className="col-order">#</div>
              <div className="col-video">Video</div>
              <div className="col-status">Status</div>
              <div className="col-mcq">MCQ Score</div>
              <div className="col-time">Time Spent</div>
            </div>

            {videoProgress.map((vp) => (
              <div
                key={vp.videoId}
                className={`progress-table-row ${vp.watched ? 'completed' : ''}`}
              >
                <div className="col-order">
                  <span className="video-order-badge">{vp.order}</span>
                </div>

                <div className="col-video">
                  <div className="video-name">{vp.filename}</div>
                  <div className="video-duration">{formatDuration(vp.duration)}</div>
                </div>

                <div className="col-status">
                  {vp.watched ? (
                    <span className="status-badge completed-badge">
                      ✓ Completed
                    </span>
                  ) : vp.mcqAttempts.length > 0 ? (
                    <span className="status-badge in-progress-badge">
                      ⏳ In Progress
                    </span>
                  ) : (
                    <span className="status-badge not-started-badge">
                      ○ Not Started
                    </span>
                  )}
                </div>

                <div className="col-mcq">
                  <span className="mcq-score">{calculateMCQScore(vp.mcqAttempts)}</span>
                </div>

                <div className="col-time">
                  <span className="time-spent">
                    {vp.timeSpent > 0 ? formatTimeSpent(vp.timeSpent) : '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;
