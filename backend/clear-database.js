/**
 * Database Cleanup Script
 * WARNING: This will delete ALL data from the database!
 * Use with caution - this action cannot be undone.
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Define schemas directly (since we can't import TypeScript models)
const userSchema = new mongoose.Schema({}, { strict: false });
const courseSchema = new mongoose.Schema({}, { strict: false });
const videoSchema = new mongoose.Schema({}, { strict: false });
const transcriptSchema = new mongoose.Schema({}, { strict: false });
const mcqSchema = new mongoose.Schema({}, { strict: false });
const progressSchema = new mongoose.Schema({}, { strict: false });

// Create models
const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const Video = mongoose.model('Video', videoSchema);
const Transcript = mongoose.model('Transcript', transcriptSchema);
const MCQ = mongoose.model('MCQ', mcqSchema);
const Progress = mongoose.model('Progress', progressSchema);

const clearDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/intellisense');

    console.log('✅ Connected to MongoDB');
    console.log('⚠️  WARNING: This will delete ALL data from the database!');
    console.log('');

    // Delete all documents from each collection
    console.log('🗑️  Deleting Users...');
    const usersDeleted = await User.deleteMany({});
    console.log(`   ✓ Deleted ${usersDeleted.deletedCount} users`);

    console.log('🗑️  Deleting Courses...');
    const coursesDeleted = await Course.deleteMany({});
    console.log(`   ✓ Deleted ${coursesDeleted.deletedCount} courses`);

    console.log('🗑️  Deleting Videos...');
    const videosDeleted = await Video.deleteMany({});
    console.log(`   ✓ Deleted ${videosDeleted.deletedCount} videos`);

    console.log('🗑️  Deleting Transcripts...');
    const transcriptsDeleted = await Transcript.deleteMany({});
    console.log(`   ✓ Deleted ${transcriptsDeleted.deletedCount} transcripts`);

    console.log('🗑️  Deleting MCQs...');
    const mcqsDeleted = await MCQ.deleteMany({});
    console.log(`   ✓ Deleted ${mcqsDeleted.deletedCount} MCQs`);

    console.log('🗑️  Deleting Progress records...');
    const progressDeleted = await Progress.deleteMany({});
    console.log(`   ✓ Deleted ${progressDeleted.deletedCount} progress records`);

    console.log('');
    console.log('✅ Database cleared successfully!');
    console.log('');
    console.log('Summary:');
    console.log(`   - Users: ${usersDeleted.deletedCount}`);
    console.log(`   - Courses: ${coursesDeleted.deletedCount}`);
    console.log(`   - Videos: ${videosDeleted.deletedCount}`);
    console.log(`   - Transcripts: ${transcriptsDeleted.deletedCount}`);
    console.log(`   - MCQs: ${mcqsDeleted.deletedCount}`);
    console.log(`   - Progress: ${progressDeleted.deletedCount}`);
    console.log(`   Total: ${usersDeleted.deletedCount + coursesDeleted.deletedCount + videosDeleted.deletedCount + transcriptsDeleted.deletedCount + mcqsDeleted.deletedCount + progressDeleted.deletedCount} records deleted`);

  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('');
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('         DATABASE CLEANUP SCRIPT');
console.log('═══════════════════════════════════════════════════════');
console.log('');

clearDatabase();
