import React, { useState } from 'react';
import axios from 'axios';
import './VideoUploader.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface VideoFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  videoId?: string;
}

interface VideoUploaderProps {
  courseId: string;
  onUploadComplete?: () => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ courseId, onUploadComplete }) => {
  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file format
    const allowedFormats = ['video/mp4', 'video/avi', 'video/quicktime'];
    if (!allowedFormats.includes(file.type)) {
      return 'Invalid file format. Only MP4, AVI, and MOV are allowed.';
    }

    // Check file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size exceeds 500MB limit.';
    }

    return null;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: VideoFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file);
      
      if (error) {
        newFiles.push({
          file,
          progress: 0,
          status: 'error',
          error,
        });
      } else {
        newFiles.push({
          file,
          progress: 0,
          status: 'pending',
        });
      }
    }

    setVideoFiles((prev) => [...prev, ...newFiles]);
  };

  const uploadFile = async (index: number) => {
    const videoFile = videoFiles[index];
    
    if (videoFile.status !== 'pending') return;

    const formData = new FormData();
    formData.append('video', videoFile.file);

    try {
      // Update status to uploading
      setVideoFiles((prev) =>
        prev.map((vf, i) =>
          i === index ? { ...vf, status: 'uploading' as const } : vf
        )
      );

      const response = await axios.post(
        `${API_URL}/courses/${courseId}/videos`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            
            setVideoFiles((prev) =>
              prev.map((vf, i) =>
                i === index ? { ...vf, progress } : vf
              )
            );
          },
        }
      );

      // Update status to success
      setVideoFiles((prev) =>
        prev.map((vf, i) =>
          i === index
            ? {
                ...vf,
                status: 'success' as const,
                progress: 100,
                videoId: response.data.video._id,
              }
            : vf
        )
      );

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setVideoFiles((prev) =>
        prev.map((vf, i) =>
          i === index
            ? {
                ...vf,
                status: 'error' as const,
                error: error.response?.data?.message || 'Upload failed',
              }
            : vf
        )
      );
    }
  };

  const handleUploadAll = () => {
    videoFiles.forEach((vf, index) => {
      if (vf.status === 'pending') {
        uploadFile(index);
      }
    });
  };

  const handleRemove = (index: number) => {
    setVideoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const pendingCount = videoFiles.filter((vf) => vf.status === 'pending').length;

  return (
    <div className="video-uploader">
      <div
        className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="dropzone-content">
          <div className="upload-icon">📹</div>
          <h3>Upload Videos</h3>
          <p>Drag and drop video files here, or click to browse</p>
          <p className="file-info">Supported formats: MP4, AVI, MOV (Max 500MB)</p>
          <input
            type="file"
            id="video-input"
            accept="video/mp4,video/avi,video/quicktime"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: 'none' }}
          />
          <label htmlFor="video-input" className="btn-browse">
            Browse Files
          </label>
        </div>
      </div>

      {videoFiles.length > 0 && (
        <div className="upload-list">
          <div className="upload-list-header">
            <h4>Upload Queue ({videoFiles.length})</h4>
            {pendingCount > 0 && (
              <button className="btn-upload-all" onClick={handleUploadAll}>
                Upload All ({pendingCount})
              </button>
            )}
          </div>

          <div className="upload-items">
            {videoFiles.map((videoFile, index) => (
              <div key={index} className={`upload-item ${videoFile.status}`}>
                <div className="upload-item-info">
                  <div className="file-icon">🎬</div>
                  <div className="file-details">
                    <div className="file-name">{videoFile.file.name}</div>
                    <div className="file-size">{formatFileSize(videoFile.file.size)}</div>
                  </div>
                </div>

                <div className="upload-item-status">
                  {videoFile.status === 'pending' && (
                    <button
                      className="btn-upload-single"
                      onClick={() => uploadFile(index)}
                    >
                      Upload
                    </button>
                  )}

                  {videoFile.status === 'uploading' && (
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${videoFile.progress}%` }}
                        />
                      </div>
                      <span className="progress-text">{videoFile.progress}%</span>
                    </div>
                  )}

                  {videoFile.status === 'success' && (
                    <div className="status-success">
                      <span className="status-icon">✓</span>
                      <span>Uploaded</span>
                    </div>
                  )}

                  {videoFile.status === 'error' && (
                    <div className="status-error">
                      <span className="status-icon">✗</span>
                      <span>{videoFile.error}</span>
                    </div>
                  )}

                  <button
                    className="btn-remove"
                    onClick={() => handleRemove(index)}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
