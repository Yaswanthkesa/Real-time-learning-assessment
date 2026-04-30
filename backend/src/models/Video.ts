import mongoose, { Document, Schema } from 'mongoose';

export interface IVideo extends Document {
  courseId: mongoose.Types.ObjectId;
  filename: string;
  filepath: string;
  duration: number; // in seconds
  thumbnail?: string;
  order: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;
  uploadedAt: Date;
  processedAt?: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    filename: {
      type: String,
      required: [true, 'Filename is required'],
      trim: true,
    },
    filepath: {
      type: String,
      required: [true, 'Filepath is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [0, 'Duration must be positive'],
    },
    thumbnail: {
      type: String,
    },
    order: {
      type: Number,
      required: [true, 'Order is required'],
      min: [1, 'Order must be at least 1'],
    },
    processingStatus: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'completed', 'failed'],
        message: 'Processing status must be pending, processing, completed, or failed',
      },
      default: 'pending',
    },
    processingError: {
      type: String,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
videoSchema.index({ courseId: 1 });
videoSchema.index({ courseId: 1, order: 1 }, { unique: true });

const Video = mongoose.model<IVideo>('Video', videoSchema);

export default Video;
