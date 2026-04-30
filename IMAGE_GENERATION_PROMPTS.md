# Image Generation Prompts for IntelliSense Learning Platform

## Prompt 1: Complete System Architecture Diagram

```
Create a professional system architecture diagram for an educational video learning platform with the following layers:

**Top Layer - Frontend (React SPA):**
- Light blue rectangular container labeled "Frontend (React SPA)"
- Inside: 4 white boxes labeled "Auth Components", "Course Components", "Video Player", "Progress Tracking"
- Modern, clean design with rounded corners

**Second Layer - Backend (Node.js/Express):**
- Green rectangular container labeled "Backend (Node.js/Express)"
- Inside: 4 white boxes labeled "Auth Controller", "Course Controller", "Video Controller", "Analytics Controller"
- Below these: 1 centered box labeled "Video Processor Service"

**Third Layer - ML Processing Pipeline:**
- Purple/violet rectangular container labeled "Python ML Processing Pipeline"
- Inside: 4 connected boxes with arrows between them:
  1. "Audio Extraction (FFmpeg)"
  2. "Whisper ASR" 
  3. "Mistral 7B LLM"
  4. "Timestamp Mapping"
- Arrows showing left-to-right flow

**Bottom Layer - Database:**
- Orange rectangular container labeled "MongoDB Database"
- Inside: 6 white boxes in 2 rows:
  - Row 1: "Users", "Courses", "Videos", "MCQs"
  - Row 2: "Transcripts", "Progress"

**Connections between layers:**
- Bidirectional arrow between Frontend and Backend labeled "HTTPS/REST API"
- Unidirectional arrow from Backend to ML Pipeline labeled "IPC (spawn)"
- Bidirectional arrow from Backend to Database labeled "Mongoose ODM"

Style: Professional technical diagram, clean lines, modern color scheme (blue, green, purple, orange), white background, clear labels, hierarchical layout, suitable for academic research paper.
```

## Prompt 2: Video Processing Pipeline Flowchart

```
Create a detailed flowchart diagram showing the video processing pipeline with the following steps:

**Start:** "Teacher Uploads Video"
↓
**Step 1:** "Video Upload & Validation" (rectangle)
- Sub-text: "Format: MP4/AVI/MOV, Max: 500MB"
↓
**Step 2:** "FFmpeg Metadata Extraction" (rectangle)
- Sub-text: "Duration, Thumbnail (320x240)"
↓
**Step 3:** "Save to Database" (cylinder shape)
- Sub-text: "Status: Pending"
↓
**Decision Diamond:** "Teacher Triggers Processing?"
- Yes → Continue
- No → "Wait" (loop back)
↓
**Step 4:** "Audio Extraction" (rectangle)
- Sub-text: "FFmpeg: 16kHz mono WAV"
↓
**Step 5:** "Whisper Transcription" (rectangle with AI icon)
- Sub-text: "Base model, Time-aligned segments"
↓
**Step 6:** "LLM MCQ Generation" (rectangle with AI icon)
- Sub-text: "Mistral-7B or Groq API"
↓
**Step 7:** "Timestamp Mapping" (rectangle)
- Sub-text: "Keyword matching algorithm"
↓
**Step 8:** "Save Results" (cylinder shape)
- Sub-text: "Transcripts + MCQs"
↓
**End:** "Status: Completed"

**Error Path:** From any step → "Error Handler" → "Status: Failed"

Style: Professional flowchart, use standard flowchart symbols (rectangles for processes, diamonds for decisions, cylinders for database operations), blue and green color scheme, clear arrows with labels, suitable for academic publication.
```

## Prompt 3: ML Processing Pipeline Detailed Diagram

```
Create a detailed technical diagram of the machine learning processing pipeline:

**Input:** Video file icon on the left

**Stage 1 - Audio Extraction:**
- Box labeled "FFmpeg Audio Extraction"
- Technical details below: "16kHz sampling rate, Mono channel, WAV format"
- Output: Audio waveform icon

**Stage 2 - Speech Recognition:**
- Box labeled "OpenAI Whisper (Base Model)"
- Technical details: "74M parameters, Multilingual, Word-level timestamps"
- Inside box: Small neural network visualization
- Output: Text document icon with timestamps

**Stage 3 - Transcript Processing:**
- Box labeled "Transcript Segmentation"
- Shows: "Segment 1: [0:00-0:15] 'Introduction to...'"
- Shows: "Segment 2: [0:15-0:32] 'The main concept...'"
- Output: Structured text icon

**Stage 4 - MCQ Generation:**
- Box labeled "Mistral-7B-Instruct LLM"
- Technical details: "7B parameters, Temperature: 0.4, Max tokens: 1024"
- Inside: Brain/AI icon
- Prompt template shown: "Identify 3-5 key concepts..."
- Output: Question mark icons

**Stage 5 - Timestamp Mapping:**
- Box labeled "Keyword Matching Algorithm"
- Shows algorithm logic: "Extract keywords → Match with segments → Assign timestamps"
- Output: Timeline with markers

**Final Output:** 
- Database icon labeled "MongoDB"
- Shows: "Transcripts + MCQs + Timestamps"

**Alternative Path (shown with dotted line):**
- "Groq API (Cloud)" option branching from Stage 4
- Label: "Llama 3.3 70B - Faster processing"

Style: Horizontal flow diagram, left to right, technical illustration style, use icons for inputs/outputs, blue gradient boxes for processing stages, include technical specifications, arrows showing data flow, modern and professional design for research paper.
```

## Prompt 4: User Interaction Flow Diagram

```
Create a user journey flowchart showing two parallel workflows:

**Left Side - Teacher Workflow (Blue theme):**
1. "Login/Register" (rounded rectangle)
2. "Create Course" (rectangle) - Details: "Name, Description, Category, Difficulty"
3. "Upload Video" (rectangle with upload icon) - Details: "MP4/AVI/MOV, up to 500MB"
4. "Trigger Processing" (rectangle with gear icon)
5. "Wait for ML Processing" (hourglass icon) - Details: "15-20 min (CPU) or 3-5 min (GPU)"
6. "View Generated MCQs" (rectangle with checklist icon)
7. "Publish Course" (rectangle with checkmark)
8. "Monitor Analytics" (rectangle with chart icon) - Details: "Enrollment, Completion, MCQ accuracy"

**Right Side - Student Workflow (Green theme):**
1. "Login/Register" (rounded rectangle)
2. "Browse Courses" (rectangle with search icon)
3. "Enroll in Course" (rectangle with plus icon)
4. "Watch Video" (rectangle with play icon)
5. "MCQ Appears" (diamond decision) - Details: "At timestamp intervals"
6. "Answer MCQ" (rectangle with pencil icon)
7. "Receive Feedback" (rectangle) - Details: "Correct/Incorrect + Explanation"
8. "Continue Video" (loop back to step 4) or "Complete Video" (proceed)
9. "View Progress Dashboard" (rectangle with progress bar icon) - Details: "Completion %, MCQ scores"

**Connection between workflows:**
- Dotted line from Teacher's "Publish Course" to Student's "Browse Courses"
- Label: "Course becomes available"

Style: Dual-column flowchart, blue theme for teacher (left), green theme for student (right), use icons for visual appeal, clear arrows showing flow direction, include timing and detail annotations, professional design suitable for academic presentation.
```

## Prompt 5: Database Schema Diagram (Entity Relationship)

```
Create a professional Entity-Relationship Diagram (ERD) showing:

**Entities (as rectangles with rounded corners):**

1. **User** (Blue)
   - Attributes: _id, name, email, password, role, googleId, profilePicture
   - Key indicator: _id (underlined)

2. **Course** (Green)
   - Attributes: _id, name, description, category, difficulty, teacherId, courseId, thumbnail
   - Key indicator: _id (underlined)

3. **Video** (Orange)
   - Attributes: _id, courseId, filename, filepath, duration, thumbnail, order, processingStatus
   - Key indicator: _id (underlined)

4. **Transcript** (Purple)
   - Attributes: _id, videoId, segments[], fullText
   - Key indicator: _id (underlined)

5. **MCQ** (Red)
   - Attributes: _id, videoId, conceptTitle, question, options[], correctAnswer, timestamp
   - Key indicator: _id (underlined)

6. **Progress** (Teal)
   - Attributes: _id, studentId, videoId, courseId, watchedDuration, completionPercentage, mcqsAttempted, mcqsCorrect
   - Key indicator: _id (underlined)

**Relationships (shown with lines and cardinality):**
- User (1) ──teaches──> (N) Course [teacherId]
- Course (1) ──contains──> (N) Video [courseId]
- Video (1) ──has──> (1) Transcript [videoId]
- Video (1) ──has──> (N) MCQ [videoId]
- User (1) ──tracks──> (N) Progress [studentId]
- Video (1) ──tracked_by──> (N) Progress [videoId]
- Course (1) ──tracked_by──> (N) Progress [courseId]

**Cardinality notation:**
- Use crow's foot notation (1, N)
- Show foreign key relationships with dashed lines
- Label relationship lines with relationship names

Style: Professional ERD diagram, distinct colors for each entity, clear relationship lines, crow's foot notation for cardinality, white background, suitable for academic database design documentation.
```

## Prompt 6: Authentication Flow Diagram

```
Create a sequence diagram showing authentication flows:

**Actors (vertical lifelines):**
1. User (stick figure icon)
2. Frontend (React) (blue box)
3. Backend API (green box)
4. MongoDB (orange cylinder)
5. Google OAuth (red box)

**Scenario 1 - Email/Password Login (top half):**
1. User → Frontend: "Enter credentials"
2. Frontend → Backend: "POST /api/auth/login {email, password}"
3. Backend → MongoDB: "Find user by email"
4. MongoDB → Backend: "User data"
5. Backend: "Verify password (bcrypt)"
6. Backend: "Generate JWT token"
7. Backend → Frontend: "Return {token, user}"
8. Frontend: "Store token in localStorage"
9. Frontend → User: "Redirect to dashboard"

**Scenario 2 - Google OAuth (bottom half):**
1. User → Frontend: "Click 'Sign in with Google'"
2. Frontend → Google OAuth: "Redirect to Google"
3. Google OAuth → User: "Google login page"
4. User → Google OAuth: "Authorize"
5. Google OAuth → Backend: "GET /api/auth/google/callback {code}"
6. Backend → Google OAuth: "Exchange code for profile"
7. Google OAuth → Backend: "User profile data"
8. Backend → MongoDB: "Find or create user"
9. Backend: "Generate JWT token"
10. Backend → Frontend: "Redirect with token"
11. Frontend → User: "Redirect to dashboard"

Style: UML sequence diagram, vertical lifelines for each component, horizontal arrows for messages, numbered steps, activation boxes showing processing, clear labels, professional design for technical documentation.
```

## Prompt 7: MCQ Generation and Display Flow

```
Create an illustrated workflow diagram showing:

**Part 1 - MCQ Generation (Backend Process):**

Box 1: "Video Transcript"
- Shows sample text: "React is a JavaScript library for building user interfaces..."

↓ (Arrow labeled "Input to LLM")

Box 2: "Mistral-7B LLM Processing"
- Shows prompt template
- Neural network visualization
- Temperature: 0.4

↓ (Arrow labeled "LLM Output")

Box 3: "Generated MCQ"
- Shows JSON structure:
```json
{
  "title": "React Basics",
  "question": "What is React?",
  "options": ["A. Framework", "B. Library", "C. Language", "D. Tool"],
  "answer": "B"
}
```

↓ (Arrow labeled "Timestamp Mapping")

Box 4: "MCQ with Timestamp"
- Shows: "Display at 00:45"
- Timeline visualization

↓ (Arrow labeled "Save to Database")

Box 5: "MongoDB Storage"
- Database icon

**Part 2 - MCQ Display (Frontend Process):**

Box 6: "Student Watches Video"
- Video player interface mockup

↓ (Arrow labeled "Time = 00:45")

Box 7: "MCQ Overlay Appears"
- Mockup of MCQ popup over video
- Video pauses automatically

↓ (Arrow labeled "Student selects answer")

Box 8: "Answer Validation"
- Check mark or X icon
- Shows correct answer if wrong

↓ (Arrow labeled "Update progress")

Box 9: "Progress Tracking"
- Shows: "MCQs Attempted: +1"
- Shows: "MCQs Correct: +1 (if correct)"

↓ (Arrow labeled "Resume")

Box 10: "Video Continues"
- Play button icon

Style: Vertical flow diagram with two distinct sections, use mockup illustrations for UI elements, include code snippets and JSON examples, use icons (play, pause, check, X), blue-green gradient color scheme, modern and visually appealing for presentation slides or paper figures.
```

## Prompt 8: System Performance Comparison Chart

```
Create an infographic-style comparison chart showing three processing modes:

**Three columns side by side:**

**Column 1 - Full Local Mode:**
- Icon: Desktop computer with GPU
- Title: "Full Local Processing"
- Components:
  * Whisper: Base model (74M params)
  * LLM: Mistral-7B (7B params)
- Performance metrics:
  * CPU: 15-20 min per 10-min video
  * GPU: 3-5 min per 10-min video
  * Cost: FREE
  * Accuracy: ★★★★★ (5 stars)
- Pros: No API costs, Full privacy, Offline capable
- Cons: Requires setup, Slower on CPU, High memory usage

**Column 2 - Fast Local Mode:**
- Icon: Laptop computer
- Title: "Fast Local Processing"
- Components:
  * Whisper: Tiny model (39M params)
  * LLM: Flan-T5 (small)
- Performance metrics:
  * CPU: 5-8 min per 10-min video
  * GPU: 2-3 min per 10-min video
  * Cost: FREE
  * Accuracy: ★★★☆☆ (3 stars)
- Pros: Faster processing, Lower memory, Good for testing
- Cons: Lower accuracy, Simpler MCQs

**Column 3 - Cloud API Mode:**
- Icon: Cloud with lightning bolt
- Title: "Groq API Processing"
- Components:
  * Whisper: Base model (local)
  * LLM: Llama 3.3 70B (cloud)
- Performance metrics:
  * Processing: 3-5 min per 10-min video
  * Cost: ~$0.05 per video
  * Accuracy: ★★★★★ (5 stars)
- Pros: Fastest overall, No local GPU needed, High quality
- Cons: Requires API key, Internet needed, Per-use cost

**Bottom section:**
- Bar chart comparing processing times
- X-axis: Processing modes
- Y-axis: Time in minutes
- Bars showing CPU vs GPU performance

Style: Modern infographic design, use icons and visual elements, color-coded columns (blue, green, orange), star ratings for quality, clear metrics, professional layout suitable for presentation or paper appendix.
```

---

## Tips for Using These Prompts:

1. **For AI Image Generators (DALL-E, Midjourney, Stable Diffusion):**
   - Add "professional technical diagram" or "academic research paper figure"
   - Specify "clean, minimalist design" for better results
   - May need to generate in parts and combine

2. **For Diagramming Tools (Lucidchart, Draw.io, Figma):**
   - Use these prompts as blueprints
   - Follow the structure and layout described
   - Easier to get exact technical accuracy

3. **For PowerPoint/Google Slides:**
   - Use SmartArt for flowcharts
   - Use shapes and connectors for architecture diagrams
   - Follow the color schemes suggested

4. **Recommended Approach:**
   - Use **Draw.io** or **Lucidchart** for Prompts 1, 2, 5, 6 (technical diagrams)
   - Use **Figma** or **Canva** for Prompts 3, 4, 7, 8 (more visual/infographic style)
   - Export as high-resolution PNG or SVG for paper inclusion

5. **Color Palette Suggestion:**
   - Frontend: #3B82F6 (Blue)
   - Backend: #10B981 (Green)
   - ML Pipeline: #8B5CF6 (Purple)
   - Database: #F59E0B (Orange)
   - User/Auth: #EF4444 (Red)
   - Progress: #14B8A6 (Teal)
