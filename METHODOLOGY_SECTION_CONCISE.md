# METHODOLOGY

## 3.1 System Architecture

The IntelliSense Learning Platform was developed as a full-stack web application utilizing a three-tier architecture: presentation layer (React frontend), application layer (Node.js backend), and data layer (MongoDB database). The system integrates machine learning models for automated video content analysis and interactive assessment generation.

### 3.1.1 Technology Stack

**Frontend:** React 19.2.5 with TypeScript, React Router DOM for navigation, React Player for video playback, and Axios for API communication.

**Backend:** Node.js with Express.js 4.18.2, MongoDB 8.0.0 with Mongoose ODM, JWT for authentication, Passport.js for Google OAuth 2.0, Multer for file uploads, and FFmpeg for video processing.

**Machine Learning:** Python 3.8+ runtime, PyTorch 2.0.0+, OpenAI Whisper (base model) for speech recognition, Mistral-7B-Instruct-v0.2 for MCQ generation, and HuggingFace Transformers 4.30.0+ for model inference.

### 3.1.2 System Architecture Overview

```
Frontend (React) ↔ REST API ↔ Backend (Node.js/Express)
                                    ↓ IPC
                              Python ML Pipeline
                                    ↓
                              MongoDB Database
```

The architecture follows a microservices-inspired design with clear separation between web services and ML processing. The backend spawns Python processes for computationally intensive ML tasks, maintaining non-blocking operation for user requests.

## 3.2 Database Design

The MongoDB schema consists of six collections with the following relationships:

- **Users**: Authentication data (email, password hash, role, OAuth credentials)
- **Courses**: Course metadata with reference to teacher (User)
- **Videos**: Video files with processing status, linked to courses
- **Transcripts**: Time-aligned speech segments, linked to videos
- **MCQs**: Multiple-choice questions with timestamps, linked to videos
- **Progress**: Student learning metrics (watch time, completion %, MCQ scores)

Key indexes were implemented on foreign keys (courseId, videoId, studentId) and frequently queried fields (email, processingStatus) to optimize query performance.

## 3.3 Video Processing Pipeline

The core ML pipeline transforms educational videos into interactive learning content through four stages:

### 3.3.1 Video Upload and Preprocessing

Videos are uploaded via multipart/form-data with validation for format (MP4/AVI/MOV) and size (500MB limit). FFmpeg extracts metadata (duration) and generates thumbnails at 10% timestamp. Videos are stored with status 'pending' until processing is triggered.

### 3.3.2 Audio Extraction

FFmpeg converts video to 16kHz mono WAV format, optimized for Whisper model input:
```bash
ffmpeg -i video.mp4 -ar 16000 -ac 1 audio.wav
```

### 3.3.3 Automatic Speech Recognition

OpenAI Whisper (base model, 74M parameters) transcribes audio into time-aligned segments. The model provides word-level timestamps and supports multilingual content. Output format:
```json
{
  "start": 0.0,
  "end": 15.3,
  "text": "Introduction to React components..."
}
```

### 3.3.4 MCQ Generation

Mistral-7B-Instruct-v0.2 generates 3-5 multiple-choice questions from the transcript using prompt engineering. The LLM is configured with temperature 0.4 for consistent output and max_tokens 1024. The prompt instructs the model to:
1. Identify key learning concepts
2. Generate one MCQ per concept with exactly 4 options
3. Return structured JSON output

Alternative processing modes include:
- **Fast Mode**: Whisper tiny + Flan-T5 (5-8 min per 10-min video)
- **Cloud Mode**: Groq API with Llama 3.3 70B (3-5 min per 10-min video)
- **Full Mode**: Whisper base + Mistral-7B (15-20 min CPU, 3-5 min GPU)

### 3.3.5 Timestamp Mapping

MCQs are mapped to video timestamps using keyword matching:
```python
# Extract keywords from concept title (words > 3 chars)
title_words = set(concept["title"].lower().split())

# Find transcript segment with keyword overlap
for segment in segments:
    seg_words = set(segment["text"].lower().split())
    if title_words.intersection(seg_words):
        timestamp = segment["start"]
        break
```

If no match is found, MCQs are distributed evenly across video duration.

## 3.4 Authentication and Authorization

### 3.4.1 Authentication

Two authentication mechanisms were implemented:

**JWT Authentication:** Users receive a signed token upon login containing user ID and expiration. Tokens are transmitted via Authorization header (Bearer scheme) and verified by middleware on protected routes.

**Google OAuth 2.0:** Passport.js strategy handles OAuth flow. Users are matched by email; new users are created automatically with profile data from Google.

### 3.4.2 Authorization

Role-based access control (RBAC) restricts operations:
- **Teachers**: Create courses, upload videos, trigger processing, view analytics
- **Students**: Browse courses, watch videos, answer MCQs, track progress

Middleware validates user roles before executing protected operations.

## 3.5 Frontend Implementation

### 3.5.1 Component Architecture

The React application uses functional components with hooks for state management. Key components include:

- **Authentication**: LoginPage, RegisterPage with form validation
- **Teacher Interface**: CourseCreator, VideoUploader, AnalyticsDashboard
- **Student Interface**: CourseBrowser, VideoWatchPage with MCQ overlay, ProgressDashboard
- **Shared**: Navbar, ProtectedRoute wrapper for authentication

### 3.5.2 Video Player Integration

React Player handles video playback with custom controls. MCQs are displayed as overlays when video time matches MCQ timestamps. The player pauses automatically when MCQs appear, resuming after student submission.

```typescript
useEffect(() => {
  const currentTime = playerRef.current?.getCurrentTime();
  const activeMCQ = mcqs.find(
    mcq => currentTime >= mcq.timestamp && 
           currentTime < mcq.timestamp + 30
  );
  if (activeMCQ && !answered) {
    setShowMCQ(true);
    playerRef.current?.pause();
  }
}, [playedSeconds]);
```

### 3.5.3 State Management

Context API manages global authentication state (user, token, login/logout functions). Local component state handles UI interactions and form data.

## 3.6 API Design

RESTful endpoints follow standard HTTP methods and status codes:

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - OAuth initiation

**Courses:**
- `POST /api/courses` - Create course (Teacher)
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Course details

**Videos:**
- `POST /api/courses/:courseId/videos` - Upload video (Teacher)
- `GET /api/videos/:id/stream` - Stream video with range support
- `POST /api/videos/:id/process` - Trigger ML processing (Teacher)

**Progress:**
- `POST /api/progress/update` - Update watch progress
- `POST /api/progress/mcq` - Submit MCQ answer
- `GET /api/progress/student/:id` - Student progress

Video streaming implements HTTP range requests for progressive loading, enabling seek operations and bandwidth optimization.

## 3.7 Progress Tracking and Analytics

### 3.7.1 Progress Tracking

Student progress is tracked through two metrics:

**Watch Progress:** Updated periodically (every 5 seconds) with watched duration and completion percentage:
```typescript
completionPercentage = (watchedDuration / totalDuration) * 100
```

**MCQ Performance:** Tracks attempts and correct answers per video. Accuracy calculated as:
```typescript
accuracy = (mcqsCorrect / mcqsAttempted) * 100
```

### 3.7.2 Analytics

Teacher analytics aggregate student data using MongoDB aggregation pipeline:
- Course enrollment statistics (total students, average completion)
- Video engagement metrics (average watch time, completion rate)
- MCQ performance analysis (accuracy by video, concept difficulty)

## 3.8 Error Handling and Validation

### 3.8.1 Input Validation

Mongoose schemas enforce data integrity with required fields, type validation, string length constraints, and enum validation. File uploads validate format and size before processing.

### 3.8.2 Error Handling

Backend implements centralized error handling middleware that logs errors and returns appropriate HTTP status codes. ML processing includes retry logic (2 attempts) and fallback MCQ generation if LLM fails. Video processing status tracks failures with error messages for debugging.

## 3.9 Performance Optimization

**Backend:** Database indexing on foreign keys and frequently queried fields, asynchronous video processing to avoid blocking, video streaming with range requests for progressive loading.

**Frontend:** Code splitting with React.lazy(), memoization of expensive computations, debounced progress updates (5-second intervals).

**ML Processing:** Model caching (loaded once, reused for multiple videos), GPU acceleration when available, transcript truncation to 3000 characters for LLM input.

## 3.10 Development and Testing

**Development Tools:** TypeScript for type safety, Nodemon for auto-restart, Jest for unit testing, React Testing Library for component testing.

**Testing Strategy:** Unit tests for controllers and services, integration tests for API endpoints, end-to-end tests for ML pipeline with sample videos.

**Version Control:** Git with feature branch workflow, separate frontend and backend development, environment-specific configuration files.

---

This methodology provides a comprehensive overview of the technical implementation, covering system architecture, ML pipeline, authentication, frontend/backend design, and optimization strategies employed in building the IntelliSense Learning Platform.
