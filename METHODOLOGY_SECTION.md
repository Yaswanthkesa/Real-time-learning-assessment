# METHODOLOGY

## 3.1 System Architecture and Design

The IntelliSense Learning Platform was developed as a full-stack web application utilizing a three-tier architecture comprising the presentation layer (frontend), application layer (backend), and data layer (database). The system was designed to facilitate intelligent video-based learning through automated content analysis and interactive assessment generation.

### 3.1.1 Technology Stack

**Frontend Technologies:**
- React 19.2.5 with TypeScript for type-safe component development
- React Router DOM 7.14.2 for client-side routing and navigation
- React Player 2.16.0 for video playback with custom controls
- Axios 1.15.2 for HTTP client communication
- Context API for global state management

**Backend Technologies:**
- Node.js with Express.js 4.18.2 framework for RESTful API development
- TypeScript 5.3.2 for enhanced code quality and maintainability
- MongoDB 8.0.0 with Mongoose ODM for data persistence
- JSON Web Tokens (JWT) for stateless authentication
- Passport.js with Google OAuth 2.0 strategy for third-party authentication
- Multer for multipart/form-data handling and file uploads
- FFmpeg (fluent-ffmpeg 2.1.2) for video processing and thumbnail extraction

**Machine Learning Stack:**
- Python 3.8+ as the ML runtime environment
- PyTorch 2.0.0+ for deep learning model execution
- OpenAI Whisper (base model) for automatic speech recognition
- Mistral-7B-Instruct-v0.2 for natural language understanding and MCQ generation
- HuggingFace Transformers 4.30.0+ for model loading and inference
- Alternative: Groq API with Llama 3.3 70B for cloud-based processing

### 3.1.2 System Architecture

The system follows a microservices-inspired architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React SPA)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Auth    │  │  Course  │  │  Video   │  │ Progress │   │
│  │Components│  │Components│  │ Player   │  │ Tracking │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │ HTTPS/REST API
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Node.js/Express)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │  Course  │  │  Video   │  │Analytics │   │
│  │Controller│  │Controller│  │Controller│  │Controller│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                            │                                 │
│                  ┌──────────────────┐                       │
│                  │ Video Processor  │                       │
│                  │    Service       │                       │
│                  └──────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                            │ IPC (spawn)
┌─────────────────────────────────────────────────────────────┐
│              Python ML Processing Pipeline                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Audio   │→ │ Whisper  │→ │ Mistral  │→ │Timestamp │   │
│  │Extraction│  │   ASR    │  │  7B LLM  │  │ Mapping  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │ Courses  │  │  Videos  │  │   MCQs   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐                                │
│  │Transcripts│ │ Progress │                                │
│  └──────────┘  └──────────┘                                │
└─────────────────────────────────────────────────────────────┘
```

## 3.2 Data Model Design

The database schema was designed using MongoDB's document-oriented approach with the following collections:

### 3.2.1 User Collection
- **Fields**: name, email, password (hashed), role (teacher/student), googleId, profilePicture, bio
- **Authentication**: bcrypt with 10-round salt for password hashing
- **Indexes**: Unique index on email, sparse index on googleId, index on role

### 3.2.2 Course Collection
- **Fields**: name, description, category, difficulty (beginner/intermediate/advanced), teacherId, courseId (auto-generated), thumbnail
- **Relationships**: References User collection via teacherId
- **Indexes**: Index on teacherId, text index on name for search, unique index on courseId

### 3.2.3 Video Collection
- **Fields**: courseId, filename, filepath, duration, thumbnail, order, processingStatus (pending/processing/completed/failed), processingError, uploadedAt, processedAt
- **Relationships**: References Course collection via courseId
- **Indexes**: Index on courseId, compound unique index on (courseId, order)

### 3.2.4 Transcript Collection
- **Fields**: videoId, segments (array of {start, end, text}), fullText
- **Relationships**: References Video collection via videoId
- **Purpose**: Stores time-aligned transcription data

### 3.2.5 MCQ Collection
- **Fields**: videoId, conceptTitle, question, options (array of 4 strings), correctAnswer (A/B/C/D), timestamp
- **Relationships**: References Video collection via videoId
- **Validation**: Exactly 4 options required, correctAnswer must be A/B/C/D
- **Indexes**: Compound index on (videoId, timestamp)

### 3.2.6 Progress Collection
- **Fields**: studentId, videoId, courseId, watchedDuration, totalDuration, completionPercentage, mcqsAttempted, mcqsCorrect, lastWatchedAt
- **Relationships**: References User, Video, and Course collections
- **Purpose**: Tracks student learning progress and performance

## 3.3 Video Processing Pipeline

The core innovation of the system lies in its automated video processing pipeline, which transforms raw educational videos into interactive learning experiences.

### 3.3.1 Video Upload and Preprocessing

**Step 1: File Upload**
- Multer middleware configured with disk storage strategy
- Accepted formats: MP4, AVI, MOV (validated via file extension)
- Maximum file size: 500MB
- Filename sanitization: Non-alphanumeric characters replaced with underscores
- Timestamp-based naming: `{timestamp}-{sanitized_filename}`

**Step 2: Metadata Extraction**
- FFmpeg probe used to extract video duration
- Thumbnail generation at 10% timestamp using FFmpeg screenshots
- Output resolution: 320x240 pixels
- Video record created with status 'pending'

### 3.3.2 Machine Learning Processing Pipeline

The ML processing pipeline operates asynchronously to avoid blocking the main application thread. Three processing modes were implemented:

**Mode 1: Full Local Processing (Default)**
- Whisper base model for transcription
- Mistral-7B-Instruct-v0.2 for MCQ generation
- Processing time: ~15-20 minutes per 10-minute video (CPU)
- Cost: Free after initial setup

**Mode 2: Fast Local Processing**
- Whisper tiny model for transcription
- Flan-T5 for MCQ generation
- Processing time: ~5-8 minutes per 10-minute video (CPU)
- Trade-off: Lower accuracy for faster processing

**Mode 3: Cloud-Based Processing (Groq API)**
- Whisper base model for transcription (local)
- Groq Llama 3.3 70B for MCQ generation (cloud)
- Processing time: ~3-5 minutes per 10-minute video
- Requires API key and internet connectivity

### 3.3.3 Audio Extraction

```python
command = [
    "ffmpeg",
    "-i", video_path,      # Input video file
    "-ar", "16000",        # Sample rate: 16kHz (Whisper requirement)
    "-ac", "1",            # Audio channels: mono
    "-y",                  # Overwrite output file
    audio_path             # Output WAV file
]
```

The audio extraction process converts video to 16kHz mono WAV format, which is the optimal input format for Whisper models.

### 3.3.4 Automatic Speech Recognition (ASR)

**Whisper Model Configuration:**
- Model variant: base (74M parameters)
- Input: 16kHz mono audio
- Output: Time-aligned segments with start/end timestamps and text

**Transcription Process:**
```python
result = whisper_model.transcribe(audio_path)
segments = [{
    "start": seg["start"],
    "end": seg["end"],
    "text": seg["text"].strip()
} for seg in result["segments"]]
```

The Whisper model automatically:
- Detects language (supports 99 languages)
- Segments speech into logical units
- Provides word-level timestamps
- Handles background noise and multiple speakers

### 3.3.5 Multiple Choice Question Generation

**LLM Prompt Engineering:**

The system uses a carefully crafted prompt template to ensure consistent MCQ generation:

```
You are an AI tutor.

From the transcript below:
1. Identify 3 to 5 key learning concepts
2. For EACH concept, write ONE multiple choice question
3. Each MCQ must have exactly 4 options

Return ONLY valid JSON array:
[
  {
    "title": "Concept Name",
    "question": "What is...?",
    "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
    "answer": "A"
  }
]

Transcript: {truncated_transcript}
```

**LLM Configuration:**
- Model: Mistral-7B-Instruct-v0.2 (local) or Llama 3.3 70B (Groq API)
- Temperature: 0.4 (balanced creativity and consistency)
- Max tokens: 1024 (local) / 2000 (API)
- Sampling: Enabled for diverse question generation

**Response Validation:**
- JSON parsing with regex extraction
- Schema validation: title, question, options (4), answer (A/B/C/D)
- Fallback mechanism: Generic MCQs if LLM fails

### 3.3.6 Timestamp Mapping Algorithm

The timestamp mapping algorithm associates each MCQ with a relevant video segment using keyword matching:

```python
def map_to_timestamps(concepts, segments, total_duration):
    mapped = []
    for i, concept in enumerate(concepts):
        # Extract keywords from concept title (words > 3 characters)
        title_words = set(concept["title"].lower().split())
        
        # Find segment with keyword overlap
        best_seg = None
        for seg in segments:
            seg_words = set(seg["text"].lower().split())
            overlap = [w for w in title_words 
                      if len(w) > 3 and w in seg_words]
            if overlap:
                best_seg = seg
                break
        
        # Use matched segment or fallback to even distribution
        if best_seg:
            timestamp = best_seg["start"]
        else:
            timestamp = (i / len(concepts)) * total_duration
        
        mapped.append({
            "concept": concept,
            "start": timestamp,
            "end": timestamp + 30  # 30-second window
        })
    
    return sorted(mapped, key=lambda x: x["start"])
```

**Algorithm Features:**
- Keyword-based semantic matching
- Fallback to uniform distribution if no match found
- Chronological ordering of MCQs
- Configurable time window for question display

## 3.4 Authentication and Authorization

### 3.4.1 Authentication Mechanisms

**JWT-Based Authentication:**
- Token generation upon successful login
- Payload: user ID, issued at timestamp
- Secret key: Environment variable (JWT_SECRET)
- Token transmission: Authorization header (Bearer scheme)
- Token verification: Middleware on protected routes

**Google OAuth 2.0 Integration:**
- Strategy: passport-google-oauth20
- Scopes: profile, email
- Flow: Authorization code grant
- User matching: Email-based lookup
- Account linking: GoogleId stored for existing users

### 3.4.2 Authorization Model

**Role-Based Access Control (RBAC):**

| Role    | Permissions                                                    |
|---------|---------------------------------------------------------------|
| Teacher | Create courses, upload videos, trigger processing, view analytics |
| Student | Browse courses, watch videos, answer MCQs, track progress     |

**Middleware Implementation:**
```typescript
export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  req.user = { id: decoded.id };
  next();
};

export const requireRole = (role: string) => {
  return async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
```

## 3.5 Frontend Implementation

### 3.5.1 Component Architecture

The frontend follows a component-based architecture with clear separation between presentational and container components:

**Page Components:**
- LoginPage, RegisterPage: Authentication interfaces
- DashboardPage: Role-based dashboard routing
- TeacherDashboard: Course management interface
- StudentDashboard: Course browsing interface
- VideoWatchPage: Video player with MCQ overlay
- MyProgressPage: Student progress visualization
- AnalyticsDashboard: Teacher analytics interface

**Reusable Components:**
- Navbar: Navigation with authentication state
- ProtectedRoute: Route guard for authenticated users
- CourseCreator: Multi-step course creation form
- VideoPlayer: Custom video player with MCQ integration

### 3.5.2 State Management

**Context API Implementation:**
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );
  
  // Authentication methods implementation
  
  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3.5.3 Video Player Integration

**React Player Configuration:**
- Progressive streaming support with HTTP range requests
- Custom controls for play/pause, seek, volume
- MCQ overlay triggered at specified timestamps
- Progress tracking with periodic updates
- Playback state management (playing, paused, seeking)

**MCQ Display Logic:**
```typescript
useEffect(() => {
  const currentTime = playerRef.current?.getCurrentTime();
  const activeMCQ = mcqs.find(
    mcq => currentTime >= mcq.timestamp && 
           currentTime < mcq.timestamp + 30
  );
  
  if (activeMCQ && !answeredMCQs.includes(activeMCQ._id)) {
    setShowMCQ(true);
    setCurrentMCQ(activeMCQ);
    playerRef.current?.pause();
  }
}, [playedSeconds]);
```

## 3.6 API Design

### 3.6.1 RESTful Endpoints

**Authentication Routes:**
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/google` - Initiate Google OAuth
- GET `/api/auth/google/callback` - OAuth callback handler
- GET `/api/auth/me` - Get current user profile

**Course Routes:**
- POST `/api/courses` - Create course (Teacher)
- GET `/api/courses` - List all courses
- GET `/api/courses/:courseId` - Get course details
- PUT `/api/courses/:courseId` - Update course (Teacher)
- DELETE `/api/courses/:courseId` - Delete course (Teacher)

**Video Routes:**
- POST `/api/courses/:courseId/videos` - Upload video (Teacher)
- GET `/api/videos/:videoId` - Get video details with MCQs
- GET `/api/videos/:videoId/stream` - Stream video with range support
- POST `/api/videos/:videoId/process` - Trigger ML processing (Teacher)
- GET `/api/courses/:courseId/videos` - List course videos

**Progress Routes:**
- POST `/api/progress/update` - Update watch progress
- POST `/api/progress/mcq` - Submit MCQ answer
- GET `/api/progress/student/:studentId` - Get student progress
- GET `/api/progress/video/:videoId` - Get video progress

**Analytics Routes:**
- GET `/api/analytics/teacher/:teacherId` - Teacher analytics dashboard
- GET `/api/analytics/course/:courseId` - Course-specific analytics
- GET `/api/analytics/video/:videoId` - Video engagement metrics

### 3.6.2 Video Streaming Implementation

**HTTP Range Request Support:**
```typescript
export const streamVideo = async (req, res) => {
  const video = await Video.findById(req.params.videoId);
  const videoPath = video.filepath;
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    });
    
    fs.createReadStream(videoPath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    });
    fs.createReadStream(videoPath).pipe(res);
  }
};
```

## 3.7 Progress Tracking and Analytics

### 3.7.1 Progress Tracking Mechanism

**Watch Progress Calculation:**
```typescript
const updateProgress = async (studentId, videoId, watchedDuration) => {
  const video = await Video.findById(videoId);
  const completionPercentage = (watchedDuration / video.duration) * 100;
  
  await Progress.findOneAndUpdate(
    { studentId, videoId },
    {
      watchedDuration,
      totalDuration: video.duration,
      completionPercentage,
      lastWatchedAt: new Date()
    },
    { upsert: true }
  );
};
```

**MCQ Performance Tracking:**
```typescript
const submitMCQAnswer = async (studentId, videoId, mcqId, answer) => {
  const mcq = await MCQ.findById(mcqId);
  const isCorrect = mcq.correctAnswer === answer;
  
  await Progress.findOneAndUpdate(
    { studentId, videoId },
    {
      $inc: {
        mcqsAttempted: 1,
        mcqsCorrect: isCorrect ? 1 : 0
      }
    }
  );
  
  return { isCorrect, correctAnswer: mcq.correctAnswer };
};
```

### 3.7.2 Analytics Aggregation

**Teacher Analytics Queries:**
```typescript
// Course enrollment statistics
const enrollmentStats = await Progress.aggregate([
  { $match: { courseId: mongoose.Types.ObjectId(courseId) } },
  { $group: {
      _id: '$courseId',
      totalStudents: { $addToSet: '$studentId' },
      avgCompletion: { $avg: '$completionPercentage' },
      totalMCQsAttempted: { $sum: '$mcqsAttempted' },
      totalMCQsCorrect: { $sum: '$mcqsCorrect' }
    }
  }
]);

// Video engagement metrics
const videoEngagement = await Progress.aggregate([
  { $match: { videoId: mongoose.Types.ObjectId(videoId) } },
  { $group: {
      _id: '$videoId',
      avgWatchTime: { $avg: '$watchedDuration' },
      completionRate: { $avg: '$completionPercentage' },
      mcqAccuracy: {
        $avg: {
          $cond: [
            { $gt: ['$mcqsAttempted', 0] },
            { $divide: ['$mcqsCorrect', '$mcqsAttempted'] },
            0
          ]
        }
      }
    }
  }
]);
```

## 3.8 Error Handling and Validation

### 3.8.1 Input Validation

**Mongoose Schema Validation:**
- Required field validation
- String length constraints (min/max)
- Enum validation for categorical fields
- Custom validators for complex rules
- Unique constraints on indexes

**Request Validation:**
- File type validation (video formats)
- File size limits (500MB maximum)
- JWT token verification
- Role-based authorization checks

### 3.8.2 Error Handling Strategy

**Backend Error Middleware:**
```typescript
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});
```

**ML Processing Error Handling:**
- Retry logic for LLM API calls (2 attempts)
- Fallback MCQ generation on failure
- Processing status tracking (pending/processing/completed/failed)
- Error message storage for debugging

## 3.9 Deployment Considerations

### 3.9.1 Environment Configuration

**Backend Environment Variables:**
- `MONGODB_URI`: Database connection string
- `JWT_SECRET`: Token signing secret
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: OAuth credentials
- `USE_GROQ_API`: Enable cloud-based processing
- `GROQ_API_KEY`: Groq API authentication
- `USE_FAST_MODE`: Enable fast local processing
- `PORT`: Server port (default: 5000)

**Frontend Environment Variables:**
- `REACT_APP_API_URL`: Backend API base URL

### 3.9.2 Performance Optimization

**Backend Optimizations:**
- Database indexing on frequently queried fields
- Asynchronous video processing (non-blocking)
- Video streaming with range requests (progressive loading)
- Connection pooling for MongoDB
- Graceful error handling and retry mechanisms

**Frontend Optimizations:**
- Code splitting with React.lazy()
- Memoization of expensive computations
- Debounced progress updates
- Lazy loading of video thumbnails
- Context-based state management (avoiding prop drilling)

**ML Processing Optimizations:**
- Model caching (loaded once, reused)
- GPU acceleration when available
- Transcript truncation (3000 characters for LLM)
- Batch processing capability
- Alternative processing modes (fast/cloud)

## 3.10 Testing Strategy

### 3.10.1 Testing Framework

**Backend Testing:**
- Jest for unit and integration testing
- Test coverage for controllers, services, and models
- Mock data for database operations
- API endpoint testing with supertest

**Frontend Testing:**
- React Testing Library for component testing
- Jest for unit tests
- User event simulation for interaction testing
- Mock API responses with axios-mock-adapter

### 3.10.2 ML Pipeline Testing

**Python Test Scripts:**
- `test_ml_setup.py`: Verify model installation
- `test_quick_ml.py`: End-to-end pipeline test
- Manual testing with sample videos
- Output validation (JSON schema, MCQ format)

## 3.11 Development Workflow

### 3.11.1 Version Control

- Git for source code management
- Feature branch workflow
- Separate frontend and backend development
- Environment-specific configuration files

### 3.11.2 Development Tools

**Backend Development:**
- Nodemon for automatic server restart
- TypeScript compiler for type checking
- ESLint for code quality
- Postman for API testing

**Frontend Development:**
- React Scripts for development server
- TypeScript for type safety
- Browser DevTools for debugging
- React Developer Tools extension

**ML Development:**
- Jupyter notebooks for experimentation
- Python virtual environments
- Model download scripts
- Performance profiling tools

---

This methodology section provides a comprehensive overview of the technical implementation, architectural decisions, and development processes employed in building the IntelliSense Learning Platform. The system successfully integrates modern web technologies with state-of-the-art machine learning models to create an intelligent, interactive video learning experience.
