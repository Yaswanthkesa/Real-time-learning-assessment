import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  teacherId: mongoose.Types.ObjectId;
  courseId: string; // Auto-generated unique Course_ID
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
      minlength: [3, 'Course name must be at least 3 characters'],
      maxlength: [100, 'Course name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: {
        values: ['beginner', 'intermediate', 'advanced'],
        message: 'Difficulty must be beginner, intermediate, or advanced',
      },
      required: [true, 'Difficulty level is required'],
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher ID is required'],
    },
    courseId: {
      type: String,
      unique: true,
      required: false, // Auto-generated in pre-save hook
    },
    thumbnail: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
courseSchema.index({ teacherId: 1 });
courseSchema.index({ name: 'text' }); // Text index for search
courseSchema.index({ courseId: 1 }, { unique: true });

// Pre-save hook to generate Course_ID
courseSchema.pre('save', async function (next) {
  if (!this.courseId) {
    // Generate unique Course_ID: COURSE-{timestamp}-{random}
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    this.courseId = `COURSE-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

const Course = mongoose.model<ICourse>('Course', courseSchema);

export default Course;
