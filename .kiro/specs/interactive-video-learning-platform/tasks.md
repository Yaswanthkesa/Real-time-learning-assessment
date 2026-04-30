# Implementation Plan: Interactive Video Learning Platform

## Overview

This implementation plan breaks down the Interactive Video Learning Platform into actionable coding tasks following a 5-sprint roadmap. The platform uses the MERN stack (MongoDB, Express, React, Node.js) with TypeScript, integrating Whisper for transcription and an LLM for MCQ generation. Each task builds incrementally toward a working adaptive learning system.

## Tasks

### Sprint 1: Foundation (Week 1-2)

- [x] 1. Set up project structure and dependencies
  - Create root directory with `backend/` and `frontend/` folders
  - Initialize backend: `npm init` with TypeScript, Express, Mongoose, bcrypt, jsonwebtoken, cors, dotenv
  - Initialize frontend: `npx create-react-app frontend --template typescript`
  - Install frontend dependencies: React Router, Axios, React Player
  - Create `.env` files for both backend and frontend with environment variables
  - Set up TypeScript configurations (`tsconfig.json`) for backend
  - Create basic folder structure: `backend/src/{models,controllers,routes,middleware,services,config}`
  - _Requirements: 16.1, 16.2_

- [x] 2. Configure MongoDB connection and database setup
  - [x] 2.1 Create database configuration module
    - Write `backend/src/config/database.ts` with Mongoose connection logic
    - Implement connection error handling and retry logic
    - Add connection success/failure logging
    - _Requirements: 16.1_
  
  - [x] 2.2 Define User model with authentication fields
    - Create `backend/src/models/User.ts` with schema: name, email (unique), password (hashed), role, profilePicture, bio, timestamps
    - Add email index and role index
    - Implement pre-save hook for password hashing with bcrypt (10 salt rounds)
    - _Requirements: 1.2, 1.6, 2.1_
  
  - [ ]* 2.3 Write unit tests for User model
    - Test password hashing on save
    - Test email uniqueness constraint
    - Test required field validation
    - _Requirements: 1.6, 1.7_

- [x] 3. Implement authentication system
  - [x] 3.1 Create authentication controller
    - Write `backend/src/controllers/authController.ts` with register, login, and getProfile functions
    - Implement registration: validate email format, password strength (min 8 chars), check duplicate emails
    - Implement login: verify credentials, generate JWT token (7-day expiration)
    - Implement getProfile: return authenticated user data
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7_
  
  - [x] 3.2 Create JWT authentication middleware
    - Write `backend/src/middleware/auth.ts` to verify JWT tokens from Authorization header
    - Extract user ID and role from token and attach to request object
    - Return 401 error for missing or invalid tokens
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [x] 3.3 Create role-based authorization middleware
    - Write `backend/src/middleware/roleCheck.ts` to verify user roles
    - Implement teacher-only and student-only middleware functions
    - Return 403 error for unauthorized role access
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [x] 3.4 Create authentication routes
    - Write `backend/src/routes/authRoutes.ts` with POST /register, POST /login, GET /profile
    - Apply authentication middleware to /profile route
    - _Requirements: 1.1, 1.4_
  
  - [ ]* 3.5 Write unit tests for authentication
    - Test successful registration and login
    - Test duplicate email rejection
    - Test invalid credentials error
    - Test JWT token generation and validation
    - _Requirements: 1.4, 1.5, 1.7, 1.8, 1.9_

- [ ] 3.6 Implement Google OAuth authentication
  - [ ] 3.6.1 Set up Google OAuth backend
    - Install passport and passport-google-oauth20 packages
    - Configure Google OAuth strategy in `backend/src/config/passport.ts`
    - Create OAuth callback route in authRoutes: GET /auth/google, GET /auth/google/callback
    - Generate JWT token after successful Google authentication
    - Handle first-time Google users (prompt for role selection)
    - _Requirements: 1.2, 1.5, 1.6, 1.10_
  
  - [ ] 3.6.2 Add Google OAuth to frontend
    - Add "Sign in with Google" button to LoginPage and RegisterPage
    - Implement OAuth redirect flow
    - Handle OAuth callback and token storage
    - Add role selection modal for first-time Google users
    - _Requirements: 1.2, 1.5, 1.10_

- [x] 4. Build basic frontend authentication UI
  - [x] 4.1 Create authentication context and routing
    - Write `frontend/src/contexts/AuthContext.tsx` with login, register, logout functions
    - Store JWT token in localStorage
    - Implement token persistence on page reload
    - Set up React Router with public and protected routes
    - _Requirements: 1.1, 1.4_
  
  - [x] 4.2 Create registration and login pages
    - Write `frontend/src/pages/RegisterPage.tsx` with form: name, email, password, role selection
    - Write `frontend/src/pages/LoginPage.tsx` with email and password fields
    - Implement form validation: email format, password min 8 characters
    - Display error messages for failed authentication
    - Redirect to dashboard on successful login
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 4.3 Create protected route component
    - Write `frontend/src/components/ProtectedRoute.tsx` to check authentication status
    - Redirect unauthenticated users to login page
    - _Requirements: 13.1, 13.2_
  
  - [x] 4.4 Create navigation bar with role-based menu
    - Write `frontend/src/components/Navbar.tsx` with conditional rendering based on user role
    - Show teacher-specific links (Create Course, My Courses, Analytics) for teachers
    - Show student-specific links (Browse Courses, My Progress) for students
    - Add logout button
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

### Sprint 2: Course Management (Week 3-4)

- [x] 6. Implement course data model and CRUD operations
  - [x] 6.1 Create Course model
    - Write `backend/src/models/Course.ts` with schema: name, description, category, difficulty, teacherId (ref User), thumbnail, timestamps
    - Add teacherId index and text index on name for search
    - Validate name length (3-100 chars) and description length (10-1000 chars)
    - _Requirements: 3.2, 3.3, 3.4, 3.6, 16.2_
  
  - [x] 6.2 Create course controller with CRUD operations
    - Write `backend/src/controllers/courseController.ts` with createCourse, getCourses, getCourseById, deleteCourse
    - Implement createCourse: validate inputs, auto-generate Course_ID, associate with teacher
    - Implement getCourses: support search by name (case-insensitive) and Course_ID
    - Implement getCourseById: return course with associated videos
    - Implement deleteCourse: cascade delete videos and MCQs, verify teacher ownership
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 9.1, 9.2, 9.3, 9.4, 16.7_
  
  - [x] 6.3 Create course routes
    - Write `backend/src/routes/courseRoutes.ts` with POST /, GET /, GET /:courseId, DELETE /:courseId
    - Apply teacher-only middleware to POST and DELETE routes
    - _Requirements: 14.1, 14.2_
  
  - [ ]* 6.4 Write unit tests for course operations
    - Test course creation with valid data
    - Test validation errors for invalid name/description lengths
    - Test search by name and Course_ID
    - Test teacher ownership verification for delete
    - _Requirements: 3.3, 3.4, 9.2, 9.3_

- [x] 7. Build teacher course management UI
  - [x] 7.1 Create teacher dashboard page
    - Write `frontend/src/pages/TeacherDashboard.tsx` to display teacher's courses
    - Fetch courses from API on component mount
    - Display course cards with name, description, category, difficulty, thumbnail
    - Add "Create Course" button
    - _Requirements: 9.4_
  
  - [x] 7.2 Create course creation form
    - Write `frontend/src/components/CourseCreator.tsx` with fields: name, description, category, difficulty
    - Implement form validation matching backend requirements
    - Submit form data to POST /api/courses endpoint
    - Redirect to course detail page on success
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 7.3 Create course card component
    - Write `frontend/src/components/CourseCard.tsx` to display course summary
    - Show course name, teacher name, category, difficulty, thumbnail
    - Add click handler to navigate to course detail page
    - _Requirements: 9.4_

- [x] 8. Implement video upload functionality
  - [x] 8.1 Create Video model
    - Write `backend/src/models/Video.ts` with schema: courseId (ref Course), filename, filepath, duration, thumbnail, order, processingStatus, processingError, uploadedAt, processedAt
    - Add courseId index and compound unique index on courseId + order
    - Set default processingStatus to "pending"
    - _Requirements: 4.3, 4.6, 15.5, 16.3_
  
  - [x] 8.2 Create video upload controller
    - Write `backend/src/controllers/videoController.ts` with uploadVideo function
    - Use multer middleware for file upload handling
    - Validate file format (MP4, AVI, MOV) and size (max 500MB)
    - Store video in `uploads/videos/` directory with sanitized filename
    - Extract thumbnail using ffmpeg
    - Calculate video duration using ffmpeg
    - Save video metadata to database with auto-incremented order
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  
  - [x] 8.3 Create video routes
    - Write `backend/src/routes/videoRoutes.ts` with POST /courses/:courseId/videos, GET /videos/:videoId, GET /videos/:videoId/stream
    - Apply teacher-only middleware to POST route
    - Implement video streaming endpoint with range request support
    - _Requirements: 14.2_
  
  - [ ]* 8.4 Write unit tests for video upload
    - Test file format validation
    - Test file size validation
    - Test thumbnail extraction
    - Test video order assignment
    - _Requirements: 4.1, 4.2, 4.4, 4.7_

- [x] 9. Build video upload UI
  - [x] 9.1 Create video uploader component
    - Write `frontend/src/components/VideoUploader.tsx` with file input and upload button
    - Support multiple file selection
    - Display upload progress bar for each file
    - Validate file format and size on client side before upload
    - Show success/error messages after upload
    - _Requirements: 4.1, 4.2, 4.5_
  
  - [x] 9.2 Create course detail page for teachers
    - Write `frontend/src/pages/CourseDetailPage.tsx` to show course info and video list
    - Display uploaded videos with thumbnails, duration, and processing status
    - Add VideoUploader component to page
    - Show video order numbers
    - _Requirements: 4.6, 4.7, 15.5_

- [x] 10. Implement student course search and discovery
  - [x] 10.1 Create student course search page
    - Write `frontend/src/pages/StudentDashboard.tsx` with search input
    - Implement search by course name or Course_ID
    - Display search results using CourseCard components
    - Show all matching courses regardless of teacher
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  
  - [x] 10.2 Create course detail page for students
    - Write `frontend/src/pages/StudentCourseView.tsx` to show course info and video list
    - Display videos with lock/unlock status based on progress
    - Only allow clicking on unlocked videos
    - Show visual indicator for locked videos
    - _Requirements: 10.1, 10.2, 10.5_

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

### Sprint 3: Video Processing (Week 5-6)

- [x] 12. Set up video processing infrastructure
  - [x] 12.1 Create Transcript and MCQ models
    - Write `backend/src/models/Transcript.ts` with schema: videoId (ref Video, unique), segments (array of {start, end, text}), fullText, createdAt
    - Write `backend/src/models/MCQ.ts` with schema: videoId (ref Video), conceptTitle, question, options (array of 4 strings), correctAnswer, timestamp, createdAt
    - Add videoId unique index to Transcript
    - Add compound index on videoId + timestamp to MCQ for sorting
    - _Requirements: 5.2, 6.6, 16.4_
  
  - [x] 12.2 Create video processing service structure
    - Write `backend/src/services/videoProcessor.ts` with processVideo, extractAudio, transcribeAudio, generateMCQs, mapTimestamps functions
    - Define TypeScript interfaces: TranscriptSegment, Concept, MCQ, ProcessingResult
    - Implement error handling for each processing step
    - _Requirements: 5.1, 5.4, 15.1, 15.2, 15.3_

- [x] 13. Implement Whisper transcription integration
  - [x] 13.1 Implement audio extraction
    - Write extractAudio function using ffmpeg to convert video to WAV (16kHz, mono, PCM)
    - Save audio file to temporary directory
    - Return audio file path
    - _Requirements: 5.1_
  
  - [x] 13.2 Implement Whisper transcription
    - Write transcribeAudio function to call Whisper API or local model
    - Parse Whisper response to extract segments with start, end, text
    - Validate transcription completed within 2 minutes for 10-minute videos
    - Store complete transcription in Transcript model
    - Handle transcription failures with error logging
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 13.3 Write unit tests for transcription
    - Test audio extraction with valid video file
    - Test Whisper API response parsing
    - Test transcription timeout handling
    - _Requirements: 5.4, 5.5_

- [x] 14. Implement LLM MCQ generation
  - [x] 14.1 Implement concept extraction and MCQ generation
    - Write generateMCQs function to call LLM API with transcript (truncated to 3000 chars)
    - Use prompt: "Identify 3 to 5 key learning concepts and generate one MCQ per concept with 4 options (A, B, C, D)"
    - Parse JSON response from LLM
    - Validate each concept has title, question, 4 options, and correct answer (A/B/C/D)
    - Filter out invalid concepts
    - Implement retry logic (up to 2 retries) for LLM failures
    - _Requirements: 6.1, 6.2, 6.3, 15.2_
  
  - [ ]* 14.2 Write unit tests for MCQ generation
    - Test LLM response parsing
    - Test MCQ validation (4 options, correct answer format)
    - Test retry logic on failure
    - _Requirements: 6.2, 6.3, 15.2_

- [x] 15. Implement timestamp mapping algorithm
  - [x] 15.1 Implement keyword-based timestamp mapping
    - Write mapTimestamps function to match concept titles to transcript segments
    - Extract keywords from concept title (words > 3 characters)
    - Search transcript segments for keyword matches
    - Assign timestamp from first matching segment
    - Fallback to even distribution if no match found: (conceptIndex / totalConcepts) × videoDuration
    - Sort MCQs by timestamp in ascending order
    - Store MCQs in MCQ model
    - _Requirements: 6.4, 6.5, 6.6, 6.7_
  
  - [ ]* 15.2 Write unit tests for timestamp mapping
    - Test keyword matching with exact matches
    - Test fallback to even distribution
    - Test MCQ sorting by timestamp
    - _Requirements: 6.4, 6.5, 6.7_

- [x] 16. Integrate processing pipeline with video controller
  - [x] 16.1 Create processing trigger endpoint
    - Add processVideo function to videoController
    - Create POST /videos/:videoId/process route
    - Trigger processing asynchronously (don't block response)
    - Update video processingStatus to "processing"
    - Call videoProcessor.processVideo in background
    - Update processingStatus to "completed" or "failed" based on result
    - Store processingError if failed
    - _Requirements: 5.1, 15.1, 15.2, 15.3, 15.4, 15.5_
  
  - [x] 16.2 Add processing status check to video endpoint
    - Modify GET /videos/:videoId to include processingStatus and MCQs
    - Return MCQs sorted by timestamp if processing completed
    - Return empty MCQ array if processing pending or in progress
    - _Requirements: 15.5_
  
  - [ ]* 16.3 Write integration tests for processing pipeline
    - Test end-to-end processing: upload → transcribe → generate MCQs → map timestamps
    - Test processing status transitions
    - Test error handling for each processing step
    - _Requirements: 5.4, 15.1, 15.2, 15.3_

- [ ] 17. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

### Sprint 4: Student Experience (Week 7-8)

- [x] 18. Implement student progress tracking
  - [x] 18.1 Create Progress model
    - Write `backend/src/models/Progress.ts` with schema: studentId (ref User), videoId (ref Video), courseId (ref Course), watched (boolean), mcqAttempts (array of {mcqId, attempts, lastAnswer, correct}), timeSpent, lastWatchedAt, completedAt
    - Add compound unique index on studentId + videoId
    - Add compound index on studentId + courseId for course progress queries
    - Add courseId index for analytics
    - _Requirements: 11.2, 11.3, 16.5_
  
  - [x] 18.2 Create progress controller
    - Write `backend/src/controllers/progressController.ts` with submitMCQAnswer, getCourseProgress, markVideoWatched functions
    - Implement submitMCQAnswer: validate answer, update mcqAttempts, return correct/incorrect status
    - Implement getCourseProgress: calculate completion percentage, return video progress array
    - Implement markVideoWatched: set watched to true, set completedAt, unlock next video
    - _Requirements: 8.1, 8.5, 8.6, 10.3, 10.4, 11.1, 11.4_
  
  - [x] 18.3 Create progress routes
    - Write `backend/src/routes/progressRoutes.ts` with POST /mcq-answer, GET /course/:courseId, POST /mark-watched
    - Apply student-only middleware to all routes
    - _Requirements: 14.4_
  
  - [ ]* 18.4 Write unit tests for progress tracking
    - Test MCQ answer validation
    - Test completion percentage calculation
    - Test video unlock logic
    - _Requirements: 8.1, 8.2, 10.3, 10.4, 11.1_

- [x] 19. Build video player with MCQ overlay
  - [x] 19.1 Create video player component
    - Write `frontend/src/components/VideoPlayer.tsx` using react-player library
    - Implement video playback controls
    - Track current playback time
    - Trigger processing on first watch if status is "pending"
    - _Requirements: 5.1, 7.1_
  
  - [x] 19.2 Create MCQ overlay component
    - Write `frontend/src/components/MCQOverlay.tsx` with black background overlay
    - Display concept title, question text, and 4 options
    - Implement option selection with visual highlighting
    - Add submit button
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [x] 19.3 Implement MCQ display logic
    - Pause video when playback time reaches MCQ timestamp
    - Show MCQOverlay component
    - Handle answer submission to backend
    - Display feedback message (correct/incorrect with correct answer shown)
    - Resume video to next concept on correct answer
    - Replay video from current concept's timestamp on incorrect answer (NOT from beginning)
    - Keep student on same MCQ until correct answer is provided
    - Track MCQ attempts per concept
    - _Requirements: 7.1, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_
  
  - [ ]* 19.4 Write unit tests for video player
    - Test MCQ overlay display at correct timestamps
    - Test video pause on MCQ
    - Test video resume on correct answer
    - Test video replay from concept timestamp on incorrect answer
    - _Requirements: 7.1, 8.2, 8.3, 8.4_

- [x] 20. Implement video sequence enforcement
  - [x] 20.1 Add video unlock logic to progress controller
    - Modify markVideoWatched to check if all MCQs answered correctly
    - Query next video in course by order
    - Return nextVideoUnlocked flag in response
    - _Requirements: 10.2, 10.3, 10.4_
  
  - [x] 20.2 Update student course view with lock status
    - Modify StudentCourseView to fetch student progress
    - Display lock icon on videos not yet accessible
    - Disable click on locked videos
    - Show unlock status visually (green checkmark for watched, lock for locked, play icon for current)
    - _Requirements: 10.1, 10.2, 10.5_
  
  - [ ]* 20.3 Write integration tests for video sequence
    - Test first video is unlocked by default
    - Test next video unlocks after completing current video
    - Test locked videos cannot be accessed
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 21. Build student progress dashboard
  - [x] 21.1 Create progress tracker component
    - Write `frontend/src/components/ProgressTracker.tsx` to display course progress
    - Show completion percentage with progress bar
    - Display list of videos with MCQ scores
    - Show time spent on each video
    - Update progress in real-time after completing videos
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [x] 21.2 Add progress tracker to student dashboard
    - Integrate ProgressTracker into StudentDashboard
    - Fetch progress data for enrolled courses
    - Display progress for each course
    - _Requirements: 11.4, 11.5_

- [ ] 22. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

### Sprint 5: Analytics & Polish (Week 9-10)

- [x] 23. Implement teacher analytics
  - [x] 23.1 Create analytics controller
    - Write `backend/src/controllers/analyticsController.ts` with getCourseAnalytics function
    - Aggregate student enrollment count per course
    - Calculate average MCQ score across all students
    - Calculate question-level accuracy (correct attempts / total attempts per MCQ)
    - Retrieve student-level MCQ scores
    - Verify teacher ownership of course before returning analytics
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [x] 23.2 Create analytics routes
    - Write `backend/src/routes/analyticsRoutes.ts` with GET /course/:courseId
    - Apply teacher-only middleware
    - _Requirements: 14.3_
  
  - [ ]* 23.3 Write unit tests for analytics
    - Test enrollment count calculation
    - Test average MCQ score calculation
    - Test question-level accuracy calculation
    - Test teacher ownership verification
    - _Requirements: 12.1, 12.2, 12.3, 12.5_

- [x] 24. Build teacher analytics dashboard
  - [x] 24.1 Create analytics dashboard component
    - Write `frontend/src/pages/AnalyticsDashboard.tsx` to display course analytics
    - Show total student enrollment count
    - Display average MCQ score with visual chart
    - Show question-level accuracy table
    - Display student-level performance table
    - Add course filter dropdown
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [x] 24.2 Add analytics link to teacher navigation
    - Update Navbar to include "Analytics" link for teachers
    - Navigate to AnalyticsDashboard on click
    - _Requirements: 14.3_

- [x] 25. Implement profile management
  - [x] 25.1 Create profile update controller
    - Add updateProfile function to authController
    - Validate profile picture format (JPEG, PNG) and size (max 5MB)
    - Update user profile fields: name, bio, profilePicture
    - Return updated user data
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 25.2 Create profile update route
    - Add PUT /api/auth/profile route
    - Apply authentication middleware
    - _Requirements: 2.2_
  
  - [x] 25.3 Create profile page UI
    - Write `frontend/src/pages/ProfilePage.tsx` with form for name, bio, profile picture
    - Implement file upload for profile picture with validation
    - Display current profile information
    - Show success message on update
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ]* 25.4 Write unit tests for profile management
    - Test profile update with valid data
    - Test profile picture validation
    - _Requirements: 2.3, 2.4_

- [x] 26. Add comprehensive error handling and validation
  - [x] 26.1 Create global error handler middleware
    - Write `backend/src/middleware/errorHandler.ts` to catch all errors
    - Return standardized error response: {success: false, message, error}
    - Use appropriate HTTP status codes (400, 401, 403, 404, 500)
    - Log errors to console in development mode
    - _Requirements: 15.1, 15.2, 15.3, 15.4_
  
  - [x] 26.2 Add input validation to all controllers
    - Validate request body fields for all POST/PUT endpoints
    - Return 400 errors for invalid inputs with descriptive messages
    - _Requirements: 1.3, 3.3, 3.4, 4.1, 4.2_
  
  - [x] 26.3 Implement frontend error handling
    - Create error boundary component for React
    - Display user-friendly error messages for API failures
    - Add retry mechanisms for failed operations
    - Show loading states during async operations
    - _Requirements: 15.4_

- [x] 27. Testing and bug fixes
  - [ ]* 27.1 Run full test suite
    - Execute all unit tests and integration tests
    - Fix any failing tests
    - Achieve minimum 80% code coverage
  
  - [x] 27.2 Perform manual end-to-end testing
    - Test complete teacher workflow: register → create course → upload videos → view analytics
    - Test complete student workflow: register → search course → watch videos → answer MCQs → track progress
    - Test adaptive learning: wrong answer → video replays from concept → correct answer → video continues to next concept
    - Test video sequence enforcement: complete video → next video unlocks
    - Identify and fix bugs
    - _Requirements: All_
  
  - [x] 27.3 Optimize performance
    - Add database indexes for frequently queried fields
    - Implement pagination for course search results
    - Optimize video streaming with range requests
    - Add loading indicators to improve perceived performance
    - _Requirements: 9.1, 9.4_

- [x] 28. Deployment preparation
  - [x] 28.1 Configure production environment variables
    - Set up production MongoDB connection string (MongoDB Atlas)
    - Configure JWT secret for production
    - Set up video storage path for production
    - Configure LLM API keys
    - _Requirements: 16.1, 16.2, 16.3_
  
  - [x] 28.2 Create deployment documentation
    - Write README.md with setup instructions
    - Document environment variables
    - Document API endpoints
    - Create deployment guide for Heroku/Railway (backend) and Vercel/Netlify (frontend)
  
  - [x] 28.3 Deploy application
    - Deploy backend to Heroku or Railway
    - Deploy frontend to Vercel or Netlify
    - Configure CORS for production domains
    - Test deployed application end-to-end
    - _Requirements: All_

- [ ] 29. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at the end of each sprint
- The implementation follows the MERN stack with TypeScript for type safety
- Video processing is asynchronous to avoid blocking API responses
- All authentication uses JWT tokens with bcrypt password hashing
- The adaptive learning mechanism (restart on wrong answer) is core to the student experience
- Sequential video unlocking enforces progressive learning
- Teacher analytics provide insights into student engagement and performance
