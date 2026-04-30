import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../components/CourseCard';
import './StudentDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    // Filter courses based on search query
    if (searchQuery.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = courses.filter(
        (course) =>
          course.name.toLowerCase().includes(query) ||
          course.courseId.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.teacherId.name.toLowerCase().includes(query)
      );
      setFilteredCourses(filtered);
    }
  }, [searchQuery, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/courses`);
      setCourses(response.data.courses);
      setFilteredCourses(response.data.courses);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/student/courses/${courseId}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Browse Courses</h1>
          <p className="subtitle">Discover and enroll in courses to start learning</p>
        </div>
      </div>

      <div className="search-section">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by course name, ID, category, or teacher..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchQuery && (
            <button className="clear-search" onClick={clearSearch}>
              ×
            </button>
          )}
        </div>
        
        {searchQuery && (
          <div className="search-results-info">
            Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </div>
        )}
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

      {!loading && !error && filteredCourses.length === 0 && searchQuery && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h2>No courses found</h2>
          <p>Try adjusting your search terms</p>
          <button className="btn-primary" onClick={clearSearch}>
            Clear Search
          </button>
        </div>
      )}

      {!loading && !error && courses.length === 0 && !searchQuery && (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h2>No courses available</h2>
          <p>Check back later for new courses</p>
        </div>
      )}

      {!loading && !error && filteredCourses.length > 0 && (
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onClick={() => handleCourseClick(course._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
