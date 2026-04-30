# IntelliSense Learning Platform

An intelligent video-based learning platform that automatically generates interactive multiple-choice questions (MCQs) from educational videos using AI/ML.

## 🎯 Features

- **Automated Video Processing**: Upload educational videos and automatically generate transcripts and MCQs
- **AI-Powered MCQ Generation**: Uses Whisper for transcription and Mistral-7B/Groq API for intelligent question generation
- **Interactive Video Player**: MCQs appear at relevant timestamps during video playback
- **Progress Tracking**: Track student watch time, completion percentage, and MCQ performance
- **Role-Based Access**: Separate interfaces for teachers and students
- **Analytics Dashboard**: Teachers can view engagement metrics and student performance
- **Google OAuth**: Easy sign-in with Google accounts

## 🏗️ Architecture

### Frontend
- React 19.2.5 with TypeScript
- React Router for navigation
- React Player for video playback
- Context API for state management

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication
- Passport.js for Google OAuth
- FFmpeg for video processing

### Machine Learning
- OpenAI Whisper for speech recognition
- Mistral-7B-Instruct for MCQ generation
- Alternative: Groq API (cloud-based)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB
- Python 3.8+ (for local ML processing)
- FFmpeg

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/Yaswanthkesa/Real-time-learning-assessment.git
cd Real-time-learning-assessment
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
npm start
```

4. **Setup ML (Optional - for local processing)**
```bash
cd backend
pip install -r requirements.txt
python test_ml_setup.py
```

## 🌐 Deployment

### Recommended: Hybrid Deployment

**Frontend → Vercel** (Free, optimized for React)
**Backend → Railway** (Supports Node.js + Python + file storage)

See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for detailed deployment instructions.

### Quick Deploy Steps

1. **Run setup script**
```bash
# Windows
deploy-setup.bat

# Linux/Mac
chmod +x deploy-setup.sh
./deploy-setup.sh
```

2. **Push to GitHub**
```bash
git push -u origin main
```

3. **Deploy Backend to Railway**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Set root directory to `backend`
   - Add environment variables

4. **Deploy Frontend to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Set root directory to `frontend`
   - Add `REACT_APP_API_URL` environment variable

See [DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md) for complete instructions.

## 📚 Documentation

- [Quick Deployment Guide](QUICK_DEPLOY.md) - Fast deployment instructions
- [Detailed Deployment Steps](DEPLOYMENT_STEPS.md) - Step-by-step guide with troubleshooting
- [Vercel Deployment Guide](VERCEL_DEPLOYMENT_GUIDE.md) - Vercel-specific information
- [Methodology](METHODOLOGY_SECTION_CONCISE.md) - Technical implementation details
- [ML Setup Guide](backend/ML_SETUP.md) - Local ML model setup

## 🔧 Configuration

### Backend Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
USE_GROQ_API=true
GROQ_API_KEY=your-groq-api-key
```

### Frontend Environment Variables
```env
REACT_APP_API_URL=https://your-backend-url.railway.app
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, React Router, Axios |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Authentication | JWT, Passport.js, Google OAuth 2.0 |
| Video Processing | FFmpeg, Multer |
| ML/AI | Whisper, Mistral-7B, Groq API |
| Deployment | Vercel (Frontend), Railway (Backend) |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- Yaswanth Kesa - [GitHub](https://github.com/Yaswanthkesa)

## 🙏 Acknowledgments

- OpenAI Whisper for speech recognition
- Mistral AI for language models
- Groq for fast inference API
- MongoDB Atlas for database hosting
- Railway and Vercel for deployment platforms

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check [DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md) for troubleshooting

## 🗺️ Roadmap

- [ ] Add support for multiple languages
- [ ] Implement real-time collaboration
- [ ] Add video annotations
- [ ] Mobile app development
- [ ] Advanced analytics with charts
- [ ] Export progress reports
- [ ] Integration with LMS platforms

---

**Live Demo**: Coming soon after deployment!

**Repository**: https://github.com/Yaswanthkesa/Real-time-learning-assessment
