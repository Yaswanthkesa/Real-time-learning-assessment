/**
 * Complete Cleanup Script
 * WARNING: This will delete ALL data from database AND all uploaded files!
 * Use with extreme caution - this action cannot be undone.
 */

const { execSync } = require('child_process');

console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('         COMPLETE SYSTEM CLEANUP');
console.log('═══════════════════════════════════════════════════════');
console.log('');
console.log('⚠️  WARNING: This will delete:');
console.log('   - ALL database records (users, courses, videos, etc.)');
console.log('   - ALL uploaded files (videos, audio, thumbnails)');
console.log('');
console.log('This action CANNOT be undone!');
console.log('');

// Add a 3-second delay to allow user to cancel
console.log('Starting in 3 seconds... Press Ctrl+C to cancel');
setTimeout(() => {
  console.log('');
  
  try {
    // Clear database
    console.log('Step 1/2: Clearing database...');
    console.log('─────────────────────────────────────────────────────');
    execSync('node clear-database.js', { stdio: 'inherit', cwd: __dirname });
    
    console.log('');
    
    // Clear uploads
    console.log('Step 2/2: Clearing uploaded files...');
    console.log('─────────────────────────────────────────────────────');
    execSync('node clear-uploads.js', { stdio: 'inherit', cwd: __dirname });
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ COMPLETE CLEANUP FINISHED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('Your system is now clean. You can start fresh!');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}, 3000);
