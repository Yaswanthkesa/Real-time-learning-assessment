import mongoose, { Document, Schema } from 'mongoose';

export interface MCQAttempt {
  mcqId: mongoose.Types.ObjectId;
  attempts: number;
  lastAnswer: 'A' | 'B' | 'C' | 'D';
  correct: boolean;
}

export interface IProgress extends Document {
  studentId: mongoose.Types.ObjectId;
  videoId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  watched: boolean;
  mcqAttempts: MCQAttempt[];
  timeSpent: number; // in seconds
  lastWatchedAt: Date;
  completedAt?: Date;
}

const mcqAttemptSchema = new Schema<MCQAttempt>(
  {
    mcqId: {
      type: Schema.Types.ObjectId,
      ref: 'MCQ',
      required: true,
    },
    attempts: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lastAnswer: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      required: true,
    },
    correct: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { _id: false }
);

const progressSchema = new Schema<IProgress>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: [true, 'Video ID is required'],
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    watched: {
      type: Boolean,
      default: false,
    },
    mcqAttempts: {
      type: [mcqAttemptSchema],
      default: [],
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
progressSchema.index({ studentId: 1, videoId: 1 }, { unique: true });
progressSchema.index({ studentId: 1, courseId: 1 });
progressSchema.index({ courseId: 1 });

const Progress = mongoose.model<IProgress>('Progress', progressSchema);

export default Progress;
