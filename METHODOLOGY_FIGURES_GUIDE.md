# METHODOLOGY SECTION - FIGURE PLACEMENT GUIDE

This document provides detailed instructions for inserting figures into Section 3: Methodology of your research paper. Each figure includes placement location, caption, in-text reference, and detailed diagram description for creation.

---

## 3.1 SYSTEM OVERVIEW

### **Figure 1: System Architecture Diagram**

**Placement Location:** After the first paragraph (after "...consistent output formats across all processing pathways.")

**In-text Reference to Add:** 
Add this sentence at the end of the first paragraph:
> "The overall system architecture is illustrated in Fig. 1."

**Figure Caption:**
```
Fig. 1. System architecture of the proposed AI-powered video learning platform showing the three-tier architecture with presentation layer (React frontend), application layer (Node.js backend), and machine learning pipeline (Python).
```

**Diagram Description for Creation (draw.io/Lucidchart):**

**Components (Top to Bottom):**

1. **Top Layer - Presentation Layer (Blue Box)**
   - Label: "Presentation Layer"
   - Contains: "React Frontend"
   - Sub-components in smaller boxes:
     - "Video Player Component"
     - "MCQ Overlay Component"
     - "Progress Tracker"
     - "Dashboard UI"

2. **Middle Layer - Application Layer (Green Box)**
   - Label: "Application Layer"
   - Contains: "Node.js + Express Backend"
   - Sub-components in smaller boxes:
     - "Video Upload Service"
     - "Authentication Service"
     - "Progress Tracking Service"
     - "Analytics Service"

3. **Bottom Left - ML Pipeline (Orange Box)**
   - Label: "Machine Learning Pipeline"
   - Contains: "Python ML Processor"
   - Sub-components in smaller boxes:
     - "FFmpeg Audio Extractor"
     - "Whisper Transcription"
     - "LLM MCQ Generator"
     - "Timestamp Mapper"

4. **Bottom Right - Data Layer (Purple Box)**
   - Label: "Data Persistence Layer"
   - Contains: "MongoDB Database"
   - Sub-components in smaller boxes:
     - "Videos Collection"
     - "Transcripts Collection"
     - "MCQs Collection"
     - "Progress Collection"

5. **Side Box - Processing Modes (Yellow Box)**
   - Label: "Processing Modes"
   - Three options listed:
     - "Fast: Whisper tiny + Flan-T5"
     - "Cloud: Whisper base + Groq API"
     - "Full: Whisper base + Mistral-7B"

**Connections (Arrows):**
- Bidirectional arrow from Presentation Layer to Application Layer (labeled "REST API")
- Unidirectional arrow from Application Layer to ML Pipeline (labeled "IPC / Subprocess")
- Bidirectional arrow from Application Layer to Data Layer (labeled "Mongoose ODM")
- Unidirectional arrow from ML Pipeline to Data Layer (labeled "Store Results")
- Dotted arrow from Processing Modes to ML Pipeline (labeled "Configuration")

**Layout:** Use hierarchical top-down layout with clear separation between layers.

---

## 3.2 DATA ACQUISITION AND PREPROCESSING

### **Figure 2: Video Processing Flowchart**

**Placement Location:** After the second paragraph (after "...to conserve storage resources.")

**In-text Reference to Add:**
Add this sentence at the end of the second paragraph:
> "The complete preprocessing workflow is depicted in Fig. 2."

**Figure Caption:**
```
Fig. 2. Flowchart illustrating the data acquisition and preprocessing pipeline from video upload to audio extraction, including validation and error handling mechanisms.
```

**Flowchart Description for Creation:**

**Flowchart Elements (Top to Bottom):**

1. **Start (Rounded Rectangle):** "Video Upload Request"

2. **Process (Rectangle):** "Receive Video File via HTTP POST"

3. **Decision (Diamond):** "Valid Format? (MP4/AVI/MOV)"
   - NO → **Process:** "Return Error: Invalid Format" → **End**
   - YES → Continue

4. **Decision (Diamond):** "Size ≤ 500MB?"
   - NO → **Process:** "Return Error: File Too Large" → **End**
   - YES → Continue

5. **Process (Rectangle):** "Save Video to Filesystem"

6. **Process (Rectangle):** "Store Metadata in MongoDB (Status: Pending)"

7. **Process (Rectangle):** "Generate Unique Filename with Timestamp"

8. **Process (Rectangle):** "Trigger Processing (User Action)"

9. **Process (Rectangle):** "Update Status: Processing"

10. **Process (Rectangle):** "Execute FFmpeg Audio Extraction"
    - Sub-label: "Command: ffmpeg -i video.mp4 -ar 16000 -ac 1 audio.wav"

11. **Decision (Diamond):** "Extraction Successful?"
    - NO → **Process:** "Update Status: Failed, Log Error" → **End**
    - YES → Continue

12. **Process (Rectangle):** "Audio File Created (16kHz, Mono, WAV)"

13. **Process (Rectangle):** "Pass to ML Pipeline"

14. **End (Rounded Rectangle):** "Ready for Transcription"

**Connections:** Use solid arrows with flow direction. Add labels on decision branches (YES/NO).

**Colors:** 
- Start/End: Green
- Process: Blue
- Decision: Yellow
- Error paths: Red

---

## 3.3 SPEECH-TO-TEXT TRANSCRIPTION MODEL

### **Figure 3: Whisper Model Architecture (Optional)**

**Placement Location:** After the second paragraph (after "...without requiring additional post-processing alignment algorithms, which is critical for synchronizing questions with video playback positions.")

**In-text Reference to Add:**
Add this sentence at the end of the second paragraph:
> "The Whisper model architecture is shown in Fig. 3."

**Figure Caption:**
```
Fig. 3. OpenAI Whisper encoder-decoder architecture showing the audio processing pipeline from mel-spectrogram input to time-aligned transcript output.
```

**Diagram Description for Creation:**

**Components (Left to Right):**

1. **Input (Trapezoid):** "Audio Waveform (16kHz Mono)"

2. **Process (Rectangle):** "Mel-Spectrogram Computation"
   - Sub-label: "80 mel-frequency bins"

3. **Encoder Block (Large Blue Box):**
   - Label: "Transformer Encoder"
   - Contains stacked layers:
     - "Multi-Head Self-Attention" (×6 layers for base model)
     - "Feed-Forward Network"
     - "Layer Normalization"
   - Note: "74M parameters (base)"

4. **Middle Representation (Cylinder):** "Contextual Audio Representations"

5. **Decoder Block (Large Green Box):**
   - Label: "Transformer Decoder"
   - Contains stacked layers:
     - "Masked Self-Attention"
     - "Cross-Attention to Encoder"
     - "Feed-Forward Network"
     - "Layer Normalization"
   - Note: "Autoregressive Generation"

6. **Multitask Heads (Three parallel boxes):**
   - "Speech Recognition Head"
   - "Timestamp Prediction Head"
   - "Language ID Head"

7. **Output (Trapezoid):** "Time-Aligned Transcript Segments"
   - Example: "[0.0s-15.3s] Introduction to React..."

**Connections:**
- Solid arrows showing data flow from left to right
- Dotted arrows from decoder to multitask heads
- Feedback loop from decoder output back to decoder input (autoregressive)

---

## 3.4 MCQ GENERATION USING LANGUAGE MODELS

### **Figure 4: LLM-Based MCQ Generation Pipeline (MANDATORY)**

**Placement Location:** After the third paragraph (after "...Questions failing validation are discarded to maintain output quality.")

**In-text Reference to Add:**
Add this sentence at the end of the third paragraph:
> "The complete MCQ generation pipeline is illustrated in Fig. 4."

**Figure Caption:**
```
Fig. 4. Language model-based MCQ generation pipeline showing prompt engineering, model inference with Mistral-7B, and structured output validation.
```

**Diagram Description for Creation:**

**Components (Top to Bottom, with branching):**

1. **Input (Parallelogram):** "Transcript Segments from Whisper"

2. **Process (Rectangle):** "Concatenate Segments into Full Transcript"

3. **Process (Rectangle):** "Truncate to 3000 Characters"

4. **Process (Rectangle):** "Construct Prompt with Instructions"
   - Sub-components in dashed box:
     - "System Instruction: 'You are an AI tutor...'"
     - "Task: 'Identify 3-5 key concepts'"
     - "Format: 'Return JSON array'"
     - "Example Output Structure"
     - "Transcript Text"

5. **Decision (Diamond):** "Processing Mode?"
   - Branch 1: "Full" → **Process:** "Mistral-7B-Instruct (7B params, Local)"
   - Branch 2: "Cloud" → **Process:** "Groq API + Llama 3.3 70B"
   - Branch 3: "Fast" → **Process:** "Flan-T5-base (850M params)"

6. **Process (Rectangle):** "Model Inference"
   - Sub-label: "Temperature: 0.4, Max Tokens: 1024, FP16 Precision"

7. **Process (Rectangle):** "Generate MCQ JSON Response"

8. **Process (Rectangle):** "Extract JSON using Regex Pattern"

9. **Decision (Diamond):** "Valid JSON?"
   - NO → **Process:** "Retry (Max 2 attempts)" → Loop back to Model Inference
   - YES → Continue

10. **Process (Rectangle):** "Validate Each MCQ Structure"
    - Checklist in sub-box:
      - "✓ Has 'title' field"
      - "✓ Has 'question' field"
      - "✓ Has exactly 4 'options'"
      - "✓ Has valid 'answer' (A/B/C/D)"

11. **Decision (Diamond):** "All Validations Pass?"
    - NO → **Process:** "Use Fallback MCQ Generator" → Continue
    - YES → Continue

12. **Output (Parallelogram):** "Validated MCQ Array"
    - Example: "[{title, question, options[], answer}]"

**Connections:** 
- Solid arrows for main flow
- Dotted arrows for retry loops
- Red arrows for fallback paths

**Colors:**
- Input/Output: Light blue
- Processing: Blue
- Decision: Yellow
- Model inference: Orange
- Validation: Green
- Fallback: Red

---

## 3.5 TIMESTAMP MAPPING ALGORITHM

### **Figure 5: Timestamp Mapping Algorithm Flowchart**

**Placement Location:** After the third paragraph (after "...ensuring logical sequencing during playback.")

**In-text Reference to Add:**
Add this sentence at the end of the third paragraph:
> "The timestamp mapping algorithm is detailed in Fig. 5."

**Figure Caption:**
```
Fig. 5. Keyword-based timestamp mapping algorithm flowchart showing semantic matching between MCQ concepts and transcript segments with fallback distribution strategy.
```

**Flowchart Description for Creation:**

**Flowchart Elements:**

1. **Start (Rounded Rectangle):** "Input: MCQs Array, Transcript Segments"

2. **Process (Rectangle):** "Initialize: mapped_mcqs = []"

3. **Process (Rectangle):** "For each MCQ in MCQs Array"

4. **Process (Rectangle):** "Extract Concept Title Keywords"
   - Sub-label: "Tokenize, filter words > 3 chars, lowercase"

5. **Process (Rectangle):** "Initialize: best_segment = None"

6. **Process (Rectangle):** "For each Segment in Transcript"

7. **Process (Rectangle):** "Extract Segment Words (tokenize, lowercase)"

8. **Process (Rectangle):** "Compute Keyword Overlap"
   - Sub-label: "overlap = concept_keywords ∩ segment_words"

9. **Decision (Diamond):** "Overlap Found?"
   - YES → **Process:** "Set best_segment = current segment" → **Process:** "Break loop" → Continue to Step 12
   - NO → **Process:** "Continue to next segment" → Loop back to Step 6

10. **Decision (Diamond):** "All Segments Checked?"
    - NO → Loop back to Step 6
    - YES → Continue

11. **Decision (Diamond):** "best_segment Found?"
    - YES → **Process:** "Assign timestamp = best_segment.start"
    - NO → **Process:** "Use Fallback: Distribute Evenly"
      - Sub-label: "timestamp = (mcq_index / total_mcqs) × video_duration"

12. **Process (Rectangle):** "Append {mcq, timestamp} to mapped_mcqs"

13. **Decision (Diamond):** "More MCQs?"
    - YES → Loop back to Step 3
    - NO → Continue

14. **Process (Rectangle):** "Sort mapped_mcqs by timestamp (ascending)"

15. **Output (Rounded Rectangle):** "Return: Timestamp-Mapped MCQs"

**Connections:** Use arrows with clear flow direction. Add loop-back arrows for iterations.

**Colors:**
- Start/End: Green
- Process: Blue
- Decision: Yellow
- Fallback: Orange

---

## 3.6 SYSTEM INTEGRATION AND BACKEND PROCESSING

### **Figure 6: Backend-ML Pipeline Integration Diagram**

**Placement Location:** After the second paragraph (after "...timestamp, and video reference. This normalized schema enables efficient querying by video, timestamp range, or concept.")

**In-text Reference to Add:**
Add this sentence at the end of the second paragraph:
> "The integration architecture between backend and ML pipeline is shown in Fig. 6."

**Figure Caption:**
```
Fig. 6. System integration diagram showing inter-process communication between Node.js backend and Python ML pipeline through subprocess spawning and JSON data exchange.
```

**Diagram Description for Creation:**

**Components (Two main sections):**

**Left Section - Node.js Backend (Green Box):**
1. **Component:** "Express.js Server"
2. **Component:** "Video Processing Service"
   - Methods listed:
     - "processVideo(videoId)"
     - "updateStatus(status)"
     - "saveResults(data)"
3. **Component:** "Mongoose ODM"
4. **Component:** "MongoDB Connection"

**Right Section - Python ML Pipeline (Orange Box):**
1. **Component:** "ml_processor.py Script"
2. **Component:** "Main Processing Function"
   - Steps listed:
     - "extract_audio()"
     - "transcribe_audio()"
     - "generate_mcqs()"
     - "map_timestamps()"
3. **Component:** "Model Loader"
   - "Whisper Model"
   - "LLM Model"

**Middle Section - Communication Channel (Gray Box):**
1. **Component:** "Subprocess Spawn"
   - Command: "python ml_processor.py video.mp4 audio.wav"
2. **Component:** "STDOUT Stream" (JSON output)
3. **Component:** "STDERR Stream" (Progress logs)
4. **Component:** "Exit Code Handler"

**Bottom Section - Database (Purple Box):**
1. **Collections:**
   - "Videos Collection"
   - "Transcripts Collection"
   - "MCQs Collection"

**Connections:**
- Arrow from Video Processing Service to Subprocess Spawn (labeled "spawn()")
- Arrow from Subprocess Spawn to ml_processor.py (labeled "Execute")
- Arrow from ml_processor.py to STDOUT (labeled "JSON Result")
- Arrow from ml_processor.py to STDERR (labeled "Progress Logs")
- Arrow from STDOUT to Video Processing Service (labeled "Parse JSON")
- Arrow from Video Processing Service to MongoDB (labeled "Save Results")
- Bidirectional arrow between Model Loader and Processing Function (labeled "Load Models")

**Sequence Numbers:** Add numbers 1-8 to show execution order.

---

## 3.7 FRONTEND INTERACTION AND USER EXPERIENCE

### **Figure 7: Teacher Dashboard Screenshot**

**Placement Location:** After the first paragraph (after "...maintaining data privacy and system security.")

**In-text Reference to Add:**
Add this sentence at the end of the first paragraph:
> "The teacher dashboard interface is shown in Fig. 7, while the interactive video player with MCQ overlay is presented in Fig. 8."

**Figure Caption:**
```
Fig. 7. Teacher dashboard interface showing course management, video upload functionality, and processing status indicators.
```

**Screenshot Instructions:**
- **Screen to Capture:** Teacher Dashboard page
- **Required Elements Visible:**
  - Course list with course cards
  - "Create New Course" button
  - Video upload section
  - Processing status indicators (pending/processing/completed)
  - Navigation bar with user profile
- **Annotations to Add (optional):**
  - Red box around "Upload Video" button
  - Red box around "Trigger Processing" button
  - Arrow pointing to processing status

---

### **Figure 8: Interactive Video Player with MCQ Overlay Screenshot**

**Placement Location:** Immediately after Figure 7 reference (in the same paragraph)

**Figure Caption:**
```
Fig. 8. Interactive video player interface displaying an MCQ overlay with question, multiple-choice options, and immediate feedback mechanism during video playback.
```

**Screenshot Instructions:**
- **Screen to Capture:** Video Watch page with active MCQ overlay
- **Required Elements Visible:**
  - Video player with paused video
  - MCQ overlay modal in center
  - Question text clearly visible
  - Four radio button options (A, B, C, D)
  - "Submit Answer" button
  - Semi-transparent backdrop
  - Video progress bar showing timestamp
- **Ideal State:** Capture after answer submission showing:
  - Correct answer highlighted in green
  - Incorrect answer (if selected) in red
  - Explanation text visible
  - "Continue" button to resume video
- **Annotations to Add (optional):**
  - Arrow pointing to timestamp where MCQ appeared
  - Label: "MCQ appears at timestamp 1:23"
  - Arrow pointing to pause indicator

---

### **Figure 9: Student Progress Dashboard Screenshot**

**Placement Location:** After the second paragraph (after "...per-video and per-course performance statistics.")

**In-text Reference to Add:**
Add this sentence at the end of the second paragraph:
> "Student progress tracking is visualized in Fig. 9."

**Figure Caption:**
```
Fig. 9. Student progress dashboard displaying course completion percentages, video watch progress, and MCQ performance metrics.
```

**Screenshot Instructions:**
- **Screen to Capture:** Student Progress/My Progress page
- **Required Elements Visible:**
  - List of enrolled courses
  - Completion percentage for each course
  - Individual video progress bars
  - MCQ accuracy statistics
  - "Videos Watched" counter
  - "Questions Answered" counter
  - Overall performance metrics
- **Annotations to Add (optional):**
  - Highlight completion percentage (e.g., circle "75% Complete")
  - Arrow pointing to MCQ accuracy (e.g., "85% Accuracy")

---

### **Figure 10: Analytics Dashboard Screenshot (Optional)**

**Placement Location:** After the second paragraph (same location as Fig. 9 reference)

**In-text Reference to Add:**
Add this to the same sentence as Fig. 9:
> "Student progress tracking is visualized in Fig. 9, while teacher analytics are presented in Fig. 10."

**Figure Caption:**
```
Fig. 10. Teacher analytics dashboard showing aggregated student engagement metrics, average completion rates, and MCQ performance analysis across courses.
```

**Screenshot Instructions:**
- **Screen to Capture:** Analytics Dashboard page (Teacher view)
- **Required Elements Visible:**
  - Course enrollment statistics
  - Average completion rate chart/graph
  - Video engagement metrics table
  - MCQ accuracy by concept
  - Student performance summary
  - Time-series engagement graph (if available)
- **Annotations to Add (optional):**
  - Highlight key metrics with boxes
  - Label important statistics

---

## 3.8 PERFORMANCE OPTIMIZATION TECHNIQUES

### **Figure 11: Database Indexing Strategy Diagram**

**Placement Location:** After the first paragraph (after "...reducing query latency from hundreds of milliseconds to single-digit milliseconds.")

**In-text Reference to Add:**
Add this sentence at the end of the first paragraph:
> "The database indexing strategy is illustrated in Fig. 11."

**Figure Caption:**
```
Fig. 11. MongoDB indexing strategy showing compound indexes on frequently queried fields to optimize query performance.
```

**Diagram Description for Creation:**

**Components:**

**Top Section - Collections (Three boxes):**

1. **Videos Collection (Blue Box):**
   - Fields listed:
     - "_id (Primary Key)"
     - "courseId"
     - "processingStatus"
     - "uploadedAt"
   - Indexes shown with key icon:
     - "Index 1: {courseId: 1}"
     - "Index 2: {processingStatus: 1}"
     - "Index 3: {courseId: 1, processingStatus: 1}"

2. **MCQs Collection (Green Box):**
   - Fields listed:
     - "_id (Primary Key)"
     - "videoId"
     - "timestamp"
     - "conceptTitle"
   - Indexes shown:
     - "Index 1: {videoId: 1}"
     - "Index 2: {videoId: 1, timestamp: 1}"

3. **Progress Collection (Orange Box):**
   - Fields listed:
     - "_id (Primary Key)"
     - "studentId"
     - "videoId"
     - "lastWatched"
   - Indexes shown:
     - "Index 1: {studentId: 1}"
     - "Index 2: {videoId: 1}"
     - "Index 3: {studentId: 1, videoId: 1}"

**Bottom Section - Query Examples (Gray boxes with arrows pointing to relevant indexes):**

- Query 1: "Find all videos in course X with status 'completed'"
  - Arrow to Videos Index 3
  - Performance: "2ms (with index) vs 150ms (without)"

- Query 2: "Get all MCQs for video Y ordered by timestamp"
  - Arrow to MCQs Index 2
  - Performance: "3ms (with index) vs 200ms (without)"

- Query 3: "Get student Z's progress for video Y"
  - Arrow to Progress Index 3
  - Performance: "1ms (with index) vs 180ms (without)"

**Connections:** Dotted arrows from queries to relevant indexes.

---

## 3.9 EVALUATION STRATEGY

### **Figure 12: Evaluation Framework Diagram**

**Placement Location:** After the entire paragraph (at the end of section 3.9)

**In-text Reference to Add:**
Add this sentence at the end of the section:
> "The comprehensive evaluation framework is summarized in Fig. 12."

**Figure Caption:**
```
Fig. 12. Multi-dimensional evaluation framework showing assessment metrics for transcription accuracy, question quality, timestamp alignment, and system usability.
```

**Diagram Description for Creation:**

**Components (Four quadrants):**

**Quadrant 1 - Transcription Accuracy (Top Left, Blue):**
- **Metric:** "Word Error Rate (WER)"
- **Method:** "Compare against human-annotated ground truth"
- **Formula:** "WER = (S + D + I) / N"
  - S = Substitutions
  - D = Deletions
  - I = Insertions
  - N = Total words
- **Benchmark:** "Target: WER < 10%"

**Quadrant 2 - Question Quality (Top Right, Green):**
- **Automated Metrics:**
  - "Syntactic Validity (JSON schema)"
  - "Semantic Coherence (embedding similarity)"
  - "Distractor Quality (semantic distance)"
- **Human Evaluation:**
  - "Relevance to content"
  - "Clarity of phrasing"
  - "Difficulty appropriateness"
  - "Distractor plausibility"
- **Rating Scale:** "1-5 Likert scale"

**Quadrant 3 - Timestamp Alignment (Bottom Left, Orange):**
- **Classification:**
  - "Well-aligned: During/immediately after concept"
  - "Moderately aligned: Within 30 seconds"
  - "Poorly aligned: Unrelated point"
- **Metric:** "Alignment Accuracy = Well-aligned / Total"
- **Target:** "Accuracy > 80%"
- **Additional Metric:** "Keyword Match Rate"

**Quadrant 4 - System Usability (Bottom Right, Purple):**
- **Quantitative Metrics:**
  - "Task completion rate"
  - "Time-on-task"
  - "Error rate"
- **Qualitative Metrics:**
  - "System Usability Scale (SUS)"
  - "User satisfaction surveys"
  - "Post-task questionnaires"
- **Target:** "SUS Score > 70"

**Center Circle:** "Comprehensive Evaluation Framework"

**Connections:** Arrows from center to each quadrant.

---

## SUMMARY OF ALL FIGURES

### **Complete Figure List for Section 3:**

1. **Fig. 1** - System Architecture Diagram (Section 3.1)
2. **Fig. 2** - Video Processing Flowchart (Section 3.2)
3. **Fig. 3** - Whisper Model Architecture (Section 3.3) - *Optional*
4. **Fig. 4** - LLM MCQ Generation Pipeline (Section 3.4) - *Mandatory*
5. **Fig. 5** - Timestamp Mapping Algorithm (Section 3.5)
6. **Fig. 6** - Backend-ML Integration (Section 3.6)
7. **Fig. 7** - Teacher Dashboard Screenshot (Section 3.7)
8. **Fig. 8** - Video Player with MCQ Overlay Screenshot (Section 3.7)
9. **Fig. 9** - Student Progress Dashboard Screenshot (Section 3.7)
10. **Fig. 10** - Analytics Dashboard Screenshot (Section 3.7) - *Optional*
11. **Fig. 11** - Database Indexing Strategy (Section 3.8)
12. **Fig. 12** - Evaluation Framework (Section 3.9)

### **Priority Figures (Must Include):**
- Fig. 1 (System Architecture)
- Fig. 2 (Video Processing Flowchart)
- Fig. 4 (LLM Pipeline) - **Most Important**
- Fig. 5 (Timestamp Mapping)
- Fig. 8 (Video Player Screenshot)

### **Optional Figures (Enhance Quality):**
- Fig. 3 (Whisper Architecture)
- Fig. 10 (Analytics Dashboard)

---

## IMPLEMENTATION CHECKLIST

### **For Diagrams (Fig. 1-6, 11-12):**
- [ ] Create diagrams using draw.io, Lucidchart, or similar tool
- [ ] Follow the component and connection descriptions provided
- [ ] Use consistent color scheme across all diagrams
- [ ] Export as high-resolution PNG or vector PDF
- [ ] Ensure text is readable at paper print size

### **For Screenshots (Fig. 7-10):**
- [ ] Capture screenshots at high resolution (1920×1080 minimum)
- [ ] Ensure UI elements are clearly visible
- [ ] Use sample data that looks professional
- [ ] Crop to remove unnecessary browser chrome
- [ ] Add annotations if specified
- [ ] Consider using annotation tools like Snagit or Skitch

### **For Paper Integration:**
- [ ] Number figures sequentially
- [ ] Place figures after first reference in text
- [ ] Ensure captions are descriptive and self-contained
- [ ] Reference all figures in the text
- [ ] Maintain consistent figure formatting
- [ ] Check that figure quality meets journal requirements

---

## EXAMPLE IN-TEXT INTEGRATION

Here's how a paragraph in Section 3.4 would look with figure reference:

**Original:**
> "Questions failing validation are discarded to maintain output quality."

**Enhanced with Figure Reference:**
> "Questions failing validation are discarded to maintain output quality. The complete MCQ generation pipeline is illustrated in Fig. 4, which shows the flow from transcript input through prompt engineering, model inference, and validation stages."

---

This guide provides everything needed to create and integrate figures into your methodology section. Each figure enhances understanding of the technical components and makes the paper more accessible to readers.
