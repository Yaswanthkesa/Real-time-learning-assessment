# Database and Uploads Cleanup Guide

This guide explains how to clear data from your IntelliSense Learning Platform.

## ⚠️ WARNING

**These scripts will permanently delete data. This action CANNOT be undone!**

Always make sure you have backups before running these scripts.

---

## Available Cleanup Scripts

### 1. Clear Database Only
Deletes all records from MongoDB collections:
- Users
- Courses
- Videos
- Transcripts
- MCQs
- Progress records

**Command:**
```bash
npm run clear:db
```

**Or directly:**
```bash
node clear-database.js
```

---

### 2. Clear Uploads Only
Deletes all uploaded files from the filesystem:
- Video files (`uploads/videos/`)
- Audio files (`uploads/audio/`)
- Thumbnail images (`uploads/thumbnails/`)

**Command:**
```bash
npm run clear:uploads
```

**Or directly:**
```bash
node clear-uploads.js
```

---

### 3. Clear Everything (Database + Uploads)
Performs a complete cleanup of both database and uploaded files.

**Command:**
```bash
npm run clear:all
```

**Or directly:**
```bash
node clear-all.js
```

This script:
1. Clears all database records
2. Deletes all uploaded files
3. Gives you a 3-second window to cancel (Ctrl+C)

---

## Usage Examples

### Scenario 1: Fresh Start for Development
You want to start with a clean slate:

```bash
cd backend
npm run clear:all
```

### Scenario 2: Clear Old Videos but Keep Users
You want to remove videos but keep user accounts:

```bash
cd backend
npm run clear:uploads
```

Then manually delete video records from MongoDB Compass or use:
```javascript
// In MongoDB shell or Compass
db.videos.deleteMany({})
db.transcripts.deleteMany({})
db.mcqs.deleteMany({})
db.progress.deleteMany({})
```

### Scenario 3: Reset Database but Keep Files
You want to reset the database but keep uploaded files:

```bash
cd backend
npm run clear:db
```

---

## What Gets Deleted

### Database Collections

| Collection | Description | Example Count |
|------------|-------------|---------------|
| Users | All user accounts (teachers & students) | 10 users |
| Courses | All courses created by teachers | 5 courses |
| Videos | All video metadata and processing status | 20 videos |
| Transcripts | All video transcripts with timestamps | 15 transcripts |
| MCQs | All generated multiple-choice questions | 75 MCQs |
| Progress | All student progress and watch history | 100 records |

### File System

| Directory | Description | Example Size |
|-----------|-------------|--------------|
| `uploads/videos/` | Original uploaded video files | 2.5 GB |
| `uploads/audio/` | Extracted audio files (WAV) | 500 MB |
| `uploads/thumbnails/` | Video thumbnail images | 50 MB |

---

## Safety Features

### 1. Confirmation Delay
The `clear-all.js` script includes a 3-second delay before execution:
```
Starting in 3 seconds... Press Ctrl+C to cancel
```

### 2. Detailed Output
All scripts provide detailed output showing:
- What is being deleted
- How many items were deleted
- Summary of total deletions

### 3. Error Handling
Scripts include error handling and will:
- Show clear error messages
- Exit gracefully on failure
- Close database connections properly

---

## After Cleanup

After running cleanup scripts, you'll need to:

1. **Create new user accounts** (no users will exist)
2. **Re-upload videos** (all videos will be gone)
3. **Recreate courses** (all courses will be deleted)

### Quick Setup After Cleanup

1. Start the backend server:
```bash
npm run dev
```

2. Register a new teacher account:
- Go to `http://localhost:3000/register`
- Create account with role "Teacher"

3. Register a new student account:
- Create another account with role "Student"

4. Create courses and upload videos as needed

---

## Troubleshooting

### Error: "Cannot connect to MongoDB"
**Solution:** Make sure MongoDB is running and the connection string in `.env` is correct.

```bash
# Check if MongoDB is running
mongosh

# Or start MongoDB service
# Windows:
net start MongoDB

# Linux/Mac:
sudo systemctl start mongod
```

### Error: "Directory does not exist"
**Solution:** The uploads directory might not exist yet. This is normal if you haven't uploaded any videos.

### Error: "Permission denied"
**Solution:** Make sure you have write permissions for the uploads directory.

```bash
# Linux/Mac - fix permissions
chmod -R 755 uploads/
```

---

## Best Practices

### 1. Backup Before Cleanup
Always backup important data before running cleanup scripts:

```bash
# Backup MongoDB
mongodump --db intellisense --out ./backup

# Backup uploads
cp -r uploads/ uploads_backup/
```

### 2. Use in Development Only
These scripts are intended for development environments. **Never run them in production!**

### 3. Test with Sample Data
After cleanup, test with sample data before using real content.

### 4. Document Your Cleanup
Keep a log of when and why you performed cleanups:

```bash
# Create a cleanup log
echo "$(date): Cleared database and uploads - Reason: Fresh start for testing" >> cleanup.log
```

---

## Script Details

### clear-database.js
- Connects to MongoDB using `.env` configuration
- Deletes all documents from each collection
- Shows count of deleted items
- Closes connection gracefully

### clear-uploads.js
- Recursively scans upload directories
- Deletes all files (keeps directory structure)
- Shows count of deleted files
- Handles missing directories gracefully

### clear-all.js
- Runs both cleanup scripts in sequence
- Provides 3-second cancellation window
- Shows combined summary
- Exits with appropriate status codes

---

## Need Help?

If you encounter issues:

1. Check the error message carefully
2. Verify MongoDB is running
3. Check file permissions
4. Review the `.env` configuration
5. Check the console output for details

---

## Summary Commands

```bash
# Clear only database
npm run clear:db

# Clear only uploads
npm run clear:uploads

# Clear everything (database + uploads)
npm run clear:all
```

**Remember: These actions cannot be undone. Use with caution!**
