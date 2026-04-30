import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import CourseCard from '../components/CourseCard';
import './TeacherDashboard.css';

interface Course {
  _id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  courseId: string;
  thumbnail?: string;
  teacherId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/courses`);
      
      // Filter courses by current teacher
      const teacherCourses = response.data.courses.filter(
        (course: Course) => course.teacherId._id === user?.id
      );
      
      setCourses(teacherCourses);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCreateCourse = () => {
    navigate('/courses/create');
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${courseName}"? This will also delete all videos, transcripts, MCQs, and student progress for this course. This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove course from state
      setCourses(courses.filter(course => course._id !== courseId));
      alert('Course deleted successfully');
    } catch (err: any) {
      console.error('Error deleting course:', err);
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>My Courses</h1>
          <p className="subtitle">Create and manage your courses</p>
        </div>
        <button className="btn-primary" onClick={handleCreateCourse}>
          + Create Course
        </button>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading courses...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchCourses}>Retry</button>
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h2>No courses yet</h2>
          <p>Create your first course to get started</p>
          <button className="btn-primary" onClick={handleCreateCourse}>
            Create Your First Course
          </button>
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course._id} className="course-card-wrapper">
              <CourseCard
                course={course}
                onClick={() => handleCourseClick(course._id)}
              />
              <button
                className="btn-delete-course"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCourse(course._id, course.name);
                }}
                title="Delete course"
              >
                🗑️ Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
