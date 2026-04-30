import mongoose, { Document, Schema } from 'mongoose';

export interface IMCQ extends Document {
  videoId: mongoose.Types.ObjectId;
  conceptTitle: string;
  question: string;
  options: string[]; // Array of 4 options
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  timestamp: number; // Time in seconds when MCQ should appear
  createdAt: Date;
}

const mcqSchema = new Schema<IMCQ>(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: [true, 'Video ID is required'],
    },
    conceptTitle: {
      type: String,
      required: [true, 'Concept title is required'],
      trim: true,
      minlength: [3, 'Concept title must be at least 3 characters'],
      maxlength: [200, 'Concept title cannot exceed 200 characters'],
    },
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
      minlength: [10, 'Question must be at least 10 characters'],
      maxlength: [500, 'Question cannot exceed 500 characters'],
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: {
        validator: function (options: string[]) {
          return options.length === 4 && options.every((opt) => opt.trim().length > 0);
        },
        message: 'Exactly 4 non-empty options are required',
      },
    },
    correctAnswer: {
      type: String,
      enum: {
        values: ['A', 'B', 'C', 'D'],
        message: 'Correct answer must be A, B, C, or D',
      },
      required: [true, 'Correct answer is required'],
    },
    timestamp: {
      type: Number,
      required: [true, 'Timestamp is required'],
      min: [0, 'Timestamp must be non-negative'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
mcqSchema.index({ videoId: 1, timestamp: 1 });

const MCQ = mongoose.model<IMCQ>('MCQ', mcqSchema);

export default MCQ;
