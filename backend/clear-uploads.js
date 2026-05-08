/**
 * Uploads Cleanup Script
 * WARNING: This will delete ALL uploaded files (videos, audio, thumbnails)!
 * Use with caution - this action cannot be undone.
 */

const fs = require('fs');
const path = require('path');

const clearDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    console.log(`   ⚠️  Directory does not exist: ${dirPath}`);
    return 0;
  }

  const files = fs.readdirSync(dirPath);
  let deletedCount = 0;

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively delete subdirectory contents
      deletedCount += clearDirectory(filePath);
    } else {
      // Delete file
      fs.unlinkSync(filePath);
      deletedCount++;
    }
  });

  return deletedCount;
};

const clearUploads = () => {
  try {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('         UPLOADS CLEANUP SCRIPT');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('⚠️  WARNING: This will delete ALL uploaded files!');
    console.log('');

    const uploadsDir = path.join(__dirname, 'uploads');

    if (!fs.existsSync(uploadsDir)) {
      console.log('❌ Uploads directory does not exist');
      return;
    }

    // Clear videos
    console.log('🗑️  Deleting videos...');
    const videosPath = path.join(uploadsDir, 'videos');
    const videosDeleted = clearDirectory(videosPath);
    console.log(`   ✓ Deleted ${videosDeleted} video files`);

    // Clear audio
    console.log('🗑️  Deleting audio files...');
    const audioPath = path.join(uploadsDir, 'audio');
    const audioDeleted = clearDirectory(audioPath);
    console.log(`   ✓ Deleted ${audioDeleted} audio files`);

    // Clear thumbnails
    console.log('🗑️  Deleting thumbnails...');
    const thumbnailsPath = path.join(uploadsDir, 'thumbnails');
    const thumbnailsDeleted = clearDirectory(thumbnailsPath);
    console.log(`   ✓ Deleted ${thumbnailsDeleted} thumbnail files`);

    console.log('');
    console.log('✅ Uploads cleared successfully!');
    console.log('');
    console.log('Summary:');
    console.log(`   - Videos: ${videosDeleted}`);
    console.log(`   - Audio: ${audioDeleted}`);
    console.log(`   - Thumbnails: ${thumbnailsDeleted}`);
    console.log(`   Total: ${videosDeleted + audioDeleted + thumbnailsDeleted} files deleted`);
    console.log('');

  } catch (error) {
    console.error('❌ Error clearing uploads:', error);
    process.exit(1);
  }
};

// Run the script
clearUploads();
