import mongoose, { Document, Schema } from 'mongoose';

export interface TranscriptSegment {
  start: number; // Start time in seconds
  end: number; // End time in seconds
  text: string;
}

export interface ITranscript extends Document {
  videoId: mongoose.Types.ObjectId;
  segments: TranscriptSegment[];
  fullText: string;
  createdAt: Date;
}

const transcriptSegmentSchema = new Schema<TranscriptSegment>(
  {
    start: {
      type: Number,
      required: [true, 'Start time is required'],
      min: [0, 'Start time must be non-negative'],
    },
    end: {
      type: Number,
      required: [true, 'End time is required'],
      min: [0, 'End time must be non-negative'],
    },
    text: {
      type: String,
      required: [true, 'Text is required'],
      trim: true,
    },
  },
  { _id: false }
);

const transcriptSchema = new Schema<ITranscript>(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: [true, 'Video ID is required'],
      unique: true,
    },
    segments: {
      type: [transcriptSegmentSchema],
      required: [true, 'Segments are required'],
      validate: {
        validator: function (segments: TranscriptSegment[]) {
          return segments.length > 0;
        },
        message: 'At least one segment is required',
      },
    },
    fullText: {
      type: String,
      required: [true, 'Full text is required'],
      trim: true,
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
transcriptSchema.index({ videoId: 1 }, { unique: true });

const Transcript = mongoose.model<ITranscript>('Transcript', transcriptSchema);

export default Transcript;
