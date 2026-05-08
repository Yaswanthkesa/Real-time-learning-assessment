# IntelliSense Learning Platform - Complete Project Overview

## 📋 Project Summary

**IntelliSense** is an AI-powered video-based learning platform that automatically generates interactive multiple-choice questions (MCQs) from educational videos. The platform uses machine learning to transcribe videos and create contextually relevant questions that appear at specific timestamps during video playback.

---

## 🎯 Core Features Implemented

### 1. **Automated Video Processing Pipeline**
- Upload educational videos (MP4, AVI, MOV formats, up to 500MB)
- Automatic audio extraction using FFmpeg
- Speech-to-text transcription using OpenAI Whisper
- AI-powered MCQ generation using Mistral-7B or Groq API
- Automatic timestamp mapping for questions

### 2. **Role-Based User System**
- **Teachers**: Create courses, upload videos, trigger processing, view analytics
- **Students**: Browse courses, watch videos, answer MCQs, track progress
- Google OAuth 2.0 integration for easy sign-in
- JWT-based authentication for secure API access

### 3. **Interactive Video Player**
- Custom video player with React Player
- MCQs appear as overlays at relevant timestamps
- Video automatically pauses when questions appear
- Resume playback after answering
- Progress tracking (watch time, completion percentage)

### 4. **Progress Tracking & Analytics**
- Real-time watch progress updates (every 5 seconds)
- MCQ performance tracking (attempts, correct answers, accuracy)
- Student progress dashboard with completion metrics
- Teacher analytics dashboard with engagement statistics

### 5. **Three ML Processing Modes**
- **Fast Mode**: Whisper tiny + Flan-T5 (5-8 min per 10-min video)
- **Cloud Mode**: Groq API with Llama 3.3 70B (3-5 min per 10-min video)
- **Full Mode**: Whisper base + Mistral-7B (15-20 min CPU, 3-5 min GPU)

---

## 🏗️ Technical Architecture

### **Frontend (React + TypeScript)**
```
Technology Stack:
- React 19.2.5 with TypeScript
- React Router DOM 7.14.2 for navigation
- React Player 2.16.0 for video playback
- Axios 1.15.2 for API communication
- Context API for state management

Key Components:
├── Authentication
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── SelectRolePage.tsx
├── Teacher Interface
│   ├── TeacherDashboard.tsx (course management)
│   ├── CourseDetailPage.tsx (video upload)
│   └── AnalyticsDashboard.tsx (student metrics)
├── Student Interface
│   ├── StudentDashboard.tsx (course browser)
│   ├── VideoWatchPage.tsx (interactive player)
│   └── MyProgressPage.tsx (progress tracking)
└── Shared
    ├── ProfilePage.tsx
    └── AuthSuccessPage.tsx (OAuth callback)
```

### **Backend (Node.js + Express)**
```
Technology Stack:
- Node.js with Express.js 4.18.2
- MongoDB 8.0.0 with Mongoose ODM
- JWT for authentication
- Passport.js for Google OAuth 2.0
- Multer for file uploads
- FFmpeg for video processing

Project Structure:
backend/src/
├── config/
│   ├── database.ts (MongoDB connection)
│   └── passport.ts (OAuth strategy)
├── controllers/
│   ├── authController.ts (login, register, OAuth)
│   ├── courseController.ts (CRUD operations)
│   ├── videoController.ts (upload, stream, process)
│   ├── progressController.ts (tracking, MCQ submission)
│   └── analyticsController.ts (teacher metrics)
├── middleware/
│   ├── auth.ts (JWT verification)
│   └── roleCheck.ts (RBAC)
├── models/
│   ├── User.ts (authentication, roles)
│   ├── Course.ts (course metadata)
│   ├── Video.ts (video files, processing status)
│   ├── Transcript.ts (time-aligned segments)
│   ├── MCQ.ts (questions with timestamps)
│   └── Progress.ts (student metrics)
├── routes/
│   ├── authRoutes.ts
│   ├── courseRoutes.ts
│   ├── videoRoutes.ts
│   ├── progressRoutes.ts
│   └── analyticsRoutes.ts
├── services/
│   └── videoProcessor.ts (ML pipeline orchestration)
└── index.ts (Express server)
```

### **Machine Learning Pipeline (Python)**
```
Technology Stack:
- Python 3.8+
- PyTorch 2.0.0+
- OpenAI Whisper (base model, 74M parameters)
- Mistral-7B-Instruct-v0.2 (7B parameters)
- HuggingFace Transformers 4.30.0+
- Alternative: Groq API (cloud-based)

ML Scripts:
├── ml_processor.py (Full mode: Whisper base + Mistral-7B)
├── ml_processor_fast.py (Fast mode: Whisper tiny + Flan-T5)
├── ml_processor_groq.py (Cloud mode: Groq API)
├── download_models.py (model downloader)
└── test_ml_setup.py (validation script)
```

---

## 🔄 Video Processing Workflow

```
1. Teacher uploads video
   ↓
2. Backend saves video file (status: 'pending')
   ↓
3. Teacher triggers processing
   ↓
4. Backend spawns Python process
   ↓
5. FFmpeg extracts audio (16kHz mono WAV)
   ↓
6. Whisper transcribes audio → time-aligned segments
   ↓
7. Mistral-7B/Groq generates MCQs from transcript
   ↓
8. Timestamp mapping: match MCQ keywords to transcript segments
   ↓
9. Save transcripts and MCQs to MongoDB
   ↓
10. Update video status to 'completed'
```

---

## 🗄️ Database Schema (MongoDB)

### **Collections & Relationships**

```javascript
Users {
  _id: ObjectId
  email: String (unique, indexed)
  password: String (hashed)
  name: String
  role: 'teacher' | 'student'
  googleId: String (optional)
}

Courses {
  _id: ObjectId
  title: String
  description: String
  teacher: ObjectId → Users (indexed)
  createdAt: Date
}

Videos {
  _id: ObjectId
  title: String
  filename: String
  duration: Number
  thumbnailPath: String
  course: ObjectId → Courses (indexed)
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed'
  uploadedAt: Date
}

Transcripts {
  _id: ObjectId
  video: ObjectId → Videos (indexed)
  segments: [{
    start: Number,
    end: Number,
    text: String
  }]
}

MCQs {
  _id: ObjectId
  video: ObjectId → Videos (indexed)
  timestamp: Number
  concept: String
  question: String
  options: [String] (4 options)
  correctAnswer: Number (0-3)
  explanation: String
}

Progress {
  _id: ObjectId
  student: ObjectId → Users (indexed)
  video: ObjectId → Videos (indexed)
  watchedDuration: Number
  completionPercentage: Number
  mcqsAttempted: Number
  mcqsCorrect: Number
  lastWatched: Date
}
```

---

## 🔐 Authentication & Authorization

### **Authentication Methods**
1. **JWT Authentication**
   - User logs in with email/password
   - Backend returns signed JWT token
   - Token stored in localStorage
   - Sent via Authorization header: `Bearer <token>`
   - Middleware verifies token on protected routes

2. **Google OAuth 2.0**
   - Passport.js handles OAuth flow
   - Users matched by email
   - New users auto-created with Google profile data
   - Returns JWT token after successful OAuth

### **Authorization (RBAC)**
- **Teacher Permissions**: Create courses, upload videos, trigger processing, view analytics
- **Student Permissions**: Browse courses, watch videos, answer MCQs, track progress
- Middleware validates roles before executing operations

---

## 🎨 User Interfaces

### **Teacher Workflow**
1. **Login/Register** → Select "Teacher" role
2. **Dashboard** → View all courses, create new course
3. **Course Detail** → Upload videos, view video list
4. **Trigger Processing** → Start ML pipeline for video
5. **Analytics** → View student engagement and MCQ performance

### **Student Workflow**
1. **Login/Register** → Select "Student" role
2. **Dashboard** → Browse available courses
3. **Course View** → See course videos and progress
4. **Watch Video** → Interactive player with MCQ overlays
5. **Progress** → Track completion and MCQ accuracy

---

## 🚀 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - OAuth initiation
- `GET /api/auth/google/callback` - OAuth callback

### **Courses**
- `POST /api/courses` - Create course (Teacher)
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course (Teacher)
- `DELETE /api/courses/:id` - Delete course (Teacher)

### **Videos**
- `POST /api/courses/:courseId/videos` - Upload video (Teacher)
- `GET /api/videos/:id` - Get video details
- `GET /api/videos/:id/stream` - Stream video (range requests)
- `POST /api/videos/:id/process` - Trigger ML processing (Teacher)
- `GET /api/videos/:id/transcripts` - Get transcripts
- `GET /api/videos/:id/mcqs` - Get MCQs

### **Progress**
- `POST /api/progress/update` - Update watch progress
- `POST /api/progress/mcq` - Submit MCQ answer
- `GET /api/progress/student/:id` - Get student progress
- `GET /api/progress/video/:videoId` - Get video progress

### **Analytics**
- `GET /api/analytics/course/:courseId` - Course statistics (Teacher)
- `GET /api/analytics/video/:videoId` - Video engagement (Teacher)

---

## 🤖 Machine Learning Details

### **Whisper Transcription**
```python
# Load model (cached after first load)
model = whisper.load_model("base")

# Transcribe audio
result = model.transcribe(
    audio_path,
    language="en",
    task="transcribe",
    word_timestamps=True
)

# Output: time-aligned segments
[
  {"start": 0.0, "end": 15.3, "text": "Introduction to React..."},
  {"start": 15.3, "end": 32.1, "text": "Components are..."}
]
```

### **MCQ Generation (Mistral-7B)**
```python
# Prompt engineering
prompt = f"""
Generate 3-5 multiple-choice questions from this transcript:
{transcript_text}

Return JSON format:
[{{
  "concept": "Main topic",
  "question": "Question text?",
  "options": ["A", "B", "C", "D"],
  "correct_answer": 0,
  "explanation": "Why this is correct"
}}]
"""

# Generate with temperature 0.4 for consistency
output = model.generate(prompt, max_tokens=1024, temperature=0.4)
```

### **Timestamp Mapping Algorithm**
```python
def map_timestamp(mcq_concept, transcript_segments):
    # Extract keywords from concept (words > 3 chars)
    keywords = set(word.lower() for word in mcq_concept.split() if len(word) > 3)
    
    # Find segment with keyword overlap
    for segment in transcript_segments:
        segment_words = set(segment["text"].lower().split())
        if keywords.intersection(segment_words):
            return segment["start"]
    
    # Fallback: distribute evenly
    return distribute_evenly(mcq_index, total_mcqs, video_duration)
```

---

## ⚙️ Configuration & Environment

### **Backend Environment Variables**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/intellisense
JWT_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# ML Processing Mode
USE_GROQ_API=true  # false for local ML
GROQ_API_KEY=your-groq-api-key
```

### **Frontend Environment Variables**
```env
REACT_APP_API_URL=http://localhost:5000
```

---

## 📊 Performance Optimizations

### **Backend**
- Database indexing on foreign keys (courseId, videoId, studentId)
- Asynchronous video processing (non-blocking)
- Video streaming with HTTP range requests
- Model caching (load once, reuse)

### **Frontend**
- Code splitting with React.lazy()
- Memoization of expensive computations
- Debounced progress updates (5-second intervals)
- Lazy loading of video thumbnails

### **ML Pipeline**
- GPU acceleration when available
- Transcript truncation to 3000 characters for LLM
- Retry logic (2 attempts) for failed processing
- Fallback MCQ generation if LLM fails

---

## 🧪 Testing Strategy

### **Unit Tests**
- Controller functions (Jest)
- Service layer logic
- Utility functions

### **Integration Tests**
- API endpoint testing
- Database operations
- Authentication flow

### **End-to-End Tests**
- ML pipeline with sample videos
- Complete user workflows
- Video upload → processing → playback

---

## 🚀 Deployment Architecture

### **Recommended Setup**
- **Frontend**: Vercel (optimized for React, free tier)
- **Backend**: Railway (supports Node.js + Python + file storage)
- **Database**: MongoDB Atlas (free tier, 512MB)

### **Deployment Files Created**
- `deploy-setup.bat` / `deploy-setup.sh` - Automated setup scripts
- `QUICK_DEPLOY.md` - Fast deployment guide
- `DEPLOYMENT_STEPS.md` - Detailed step-by-step instructions
- `VERCEL_DEPLOYMENT_GUIDE.md` - Vercel-specific guide
- `railway.json` - Railway configuration
- `vercel.json` - Vercel configuration

---

## 📁 Project File Structure

```
Real-time-learning-assessment/
├── frontend/                    # React application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── contexts/           # React Context (AuthContext)
│   │   ├── pages/              # Page components
│   │   ├── App.tsx             # Main app component
│   │   └── index.tsx           # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── config/             # Database, Passport config
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth, RBAC middleware
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   └── index.ts            # Express server
│   ├── uploads/                # Video, audio, thumbnail storage
│   ├── ml_processor.py         # Full ML pipeline
│   ├── ml_processor_fast.py    # Fast ML pipeline
│   ├── ml_processor_groq.py    # Cloud ML pipeline
│   ├── requirements.txt        # Python dependencies
│   ├── package.json            # Node dependencies
│   └── tsconfig.json
│
├── .gitignore
├── README.md                    # Project overview
├── METHODOLOGY_SECTION_CONCISE.md  # Technical methodology
├── QUICK_DEPLOY.md             # Quick deployment guide
├── DEPLOYMENT_STEPS.md         # Detailed deployment steps
└── PROJECT_COMPLETE_OVERVIEW.md # This file
```

---

## 🔧 Development Workflow

### **Local Development Setup**
1. Clone repository
2. Install dependencies (npm install in both frontend and backend)
3. Setup MongoDB locally or use MongoDB Atlas
4. Configure environment variables
5. (Optional) Setup Python ML environment
6. Run backend: `npm run dev` (port 5000)
7. Run frontend: `npm start` (port 3000)

### **Git Workflow**
- Feature branch development
- Separate frontend and backend commits
- Environment-specific configuration files
- .gitignore for node_modules, uploads, .env

---

## 🎓 Key Learning Outcomes

### **Technical Skills Demonstrated**
1. Full-stack web development (React + Node.js)
2. RESTful API design and implementation
3. Database design and optimization (MongoDB)
4. Machine learning integration (Whisper, Mistral-7B)
5. Authentication & authorization (JWT, OAuth 2.0)
6. Video processing (FFmpeg)
7. Real-time progress tracking
8. Cloud deployment (Vercel, Railway)

### **Software Engineering Practices**
1. Three-tier architecture
2. Role-based access control
3. Error handling and validation
4. Performance optimization
5. Code organization and modularity
6. Environment configuration management
7. Testing strategy
8. Documentation

---

## 🛠️ Technologies Used

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19.2.5, TypeScript, React Router, React Player, Axios, Context API |
| **Backend** | Node.js, Express.js 4.18.2, MongoDB 8.0.0, Mongoose, JWT, Passport.js |
| **Authentication** | JWT, Google OAuth 2.0, bcryptjs |
| **Video Processing** | FFmpeg, Multer |
| **Machine Learning** | Python 3.8+, PyTorch, Whisper, Mistral-7B, HuggingFace Transformers, Groq API |
| **Deployment** | Vercel (Frontend), Railway (Backend), MongoDB Atlas (Database) |
| **Development Tools** | TypeScript, Nodemon, Jest, React Testing Library, Git |

---

## 📈 Future Enhancements (Roadmap)

- [ ] Multi-language support for transcription
- [ ] Real-time collaboration features
- [ ] Video annotations and bookmarks
- [ ] Mobile app development (React Native)
- [ ] Advanced analytics with charts (Chart.js)
- [ ] Export progress reports (PDF)
- [ ] Integration with LMS platforms (Moodle, Canvas)
- [ ] Live streaming support
- [ ] Peer-to-peer discussions
- [ ] Gamification (badges, leaderboards)

---

## 🎯 Project Achievements

✅ **Fully functional full-stack application**
✅ **AI-powered automated content generation**
✅ **Role-based user system with OAuth**
✅ **Interactive video player with MCQ overlays**
✅ **Real-time progress tracking**
✅ **Teacher analytics dashboard**
✅ **Three ML processing modes (fast, cloud, full)**
✅ **Production-ready deployment configuration**
✅ **Comprehensive documentation**

---

## 📞 Support & Resources

- **GitHub Repository**: https://github.com/Yaswanthkesa/Real-time-learning-assessment
- **Documentation**: See README.md, METHODOLOGY_SECTION_CONCISE.md
- **Deployment Guides**: QUICK_DEPLOY.md, DEPLOYMENT_STEPS.md
- **ML Setup**: backend/ML_SETUP.md

---

## 👨‍💻 Author

**Yaswanth Kesa**
- GitHub: [@Yaswanthkesa](https://github.com/Yaswanthkesa)

---

## 📝 License

This project is licensed under the MIT License.

---

**Last Updated**: May 1, 2026

---

## 💡 How to Use This Document

This document serves as a **complete reference** for understanding the IntelliSense Learning Platform. Use it to:

1. **Explain the project** to others (professors, recruiters, collaborators)
2. **Onboard new developers** to the codebase
3. **Document your work** for portfolios or presentations
4. **Provide context to AI assistants** when asking for help
5. **Reference architecture decisions** during development

Simply share this document or copy relevant sections when needed!
