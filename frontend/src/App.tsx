import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AuthSuccessPage from './pages/AuthSuccessPage';
import SelectRolePage from './pages/SelectRolePage';
import TeacherDashboard from './pages/TeacherDashboard';
import CourseCreator from './components/CourseCreator';
import CourseDetailPage from './pages/CourseDetailPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentCourseView from './pages/StudentCourseView';
import VideoWatchPage from './pages/VideoWatchPage';
import MyProgressPage from './pages/MyProgressPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth-success" element={<AuthSuccessPage />} />
            <Route path="/select-role" element={<SelectRolePage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher/dashboard" 
              element={
                <ProtectedRoute>
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/create" 
              element={
                <ProtectedRoute>
                  <CourseCreator />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/:courseId" 
              element={
                <ProtectedRoute>
                  <CourseDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/dashboard" 
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/courses/:courseId" 
              element={
                <ProtectedRoute>
                  <StudentCourseView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/courses/:courseId/videos/:videoId" 
              element={
                <ProtectedRoute>
                  <VideoWatchPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/progress" 
              element={
                <ProtectedRoute>
                  <MyProgressPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher/analytics" 
              element={
                <ProtectedRoute>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
