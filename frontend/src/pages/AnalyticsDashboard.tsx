import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AnalyticsDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Course {
  _id: string;
  name: string;
}

interface QuestionAccuracy {
  mcqId: string;
  conceptTitle: string;
  question: string;
  correctCount: number;
  totalCount: number;
  accuracy: number;
}

interface StudentScore {
  studentId: string;
  studentName: string;
  studentEmail: string;
  mcqScore: number;
  correctAnswers: number;
  totalQuestions: number;
  completionPercentage: number;
  completedVideos: number;
  totalVideos: number;
}

interface AnalyticsData {
  courseId: string;
  courseName: string;
  enrollmentCount: number;
  avgMcqScore: number;
  totalVideos: number;
  totalMCQs: number;
  questionAccuracy: QuestionAccuracy[];
  studentScores: StudentScore[];
}

const AnalyticsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchAnalytics(selectedCourseId);
    }
  }, [selectedCourseId]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter to only teacher's courses
      const teacherCourses = response.data.courses;
      setCourses(teacherCourses);

      // Auto-select first course
      if (teacherCourses.length > 0) {
        setSelectedCourseId(teacherCourses[0]._id);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.message || 'Failed to load courses');
      setLoading(false);
    }
  };

  const fetchAnalytics = async (courseId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/analytics/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAnalytics(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourseId(e.target.value);
  };

  if (loading && courses.length === 0) {
    return (
      <div className="analytics-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="analytics-dashboard">
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h2>No Courses Yet</h2>
          <p>Create a course to view analytics</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/courses/create')}
          >
            Create Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h1>Course Analytics</h1>
        <div className="course-selector">
          <label htmlFor="course-select">Select Course:</label>
          <select
            id="course-select"
            value={selectedCourseId}
            onChange={handleCourseChange}
            className="course-select"
          >
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => fetchAnalytics(selectedCourseId)}>Retry</button>
        </div>
      )}

      {!loading && !error && analytics && (
        <>
          <div className="analytics-summary">
            <div className="summary-card">
              <div className="summary-icon">👥</div>
              <div className="summary-content">
                <div className="summary-label">Total Students</div>
                <div className="summary-value">{analytics.enrollmentCount}</div>
                <div className="summary-detail">Enrolled students</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">📊</div>
              <div className="summary-content">
                <div className="summary-label">Avg MCQ Score</div>
                <div className="summary-value">{analytics.avgMcqScore}%</div>
                <div className="summary-detail">Overall performance</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">🎬</div>
              <div className="summary-content">
                <div className="summary-label">Total Videos</div>
                <div className="summary-value">{analytics.totalVideos}</div>
                <div className="summary-detail">{analytics.totalMCQs} MCQs</div>
              </div>
            </div>
          </div>

          {analytics.enrollmentCount === 0 ? (
            <div className="no-data-message">
              <p>📊 No student data available yet. Students will appear here once they start watching videos.</p>
            </div>
          ) : (
            <>
              <div className="analytics-section">
                <h2>Question-Level Accuracy</h2>
                <div className="table-container">
                  <table className="analytics-table">
                    <thead>
                      <tr>
                        <th>Concept</th>
                        <th>Question</th>
                        <th>Correct</th>
                        <th>Total</th>
                        <th>Accuracy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.questionAccuracy.map((qa) => (
                        <tr key={qa.mcqId}>
                          <td className="concept-cell">{qa.conceptTitle}</td>
                          <td className="question-cell">{qa.question}</td>
                          <td>{qa.correctCount}</td>
                          <td>{qa.totalCount}</td>
                          <td>
                            <div className="accuracy-cell">
                              <div className="accuracy-bar">
                                <div
                                  className="accuracy-fill"
                                  style={{ width: `${qa.accuracy}%` }}
                                />
                              </div>
                              <span className="accuracy-text">{qa.accuracy}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="analytics-section">
                <h2>Student Performance</h2>
                <div className="table-container">
                  <table className="analytics-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Email</th>
                        <th>MCQ Score</th>
                        <th>Correct/Total</th>
                        <th>Completion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.studentScores.map((student) => (
                        <tr key={student.studentId}>
                          <td className="student-name">{student.studentName}</td>
                          <td className="student-email">{student.studentEmail}</td>
                          <td>
                            <span
                              className={`score-badge ${
                                student.mcqScore >= 80
                                  ? 'excellent'
                                  : student.mcqScore >= 60
                                  ? 'good'
                                  : 'needs-improvement'
                              }`}
                            >
                              {student.mcqScore}%
                            </span>
                          </td>
                          <td>
                            {student.correctAnswers}/{student.totalQuestions}
                          </td>
                          <td>
                            <div className="completion-cell">
                              <div className="completion-bar">
                                <div
                                  className="completion-fill"
                                  style={{ width: `${student.completionPercentage}%` }}
                                />
                              </div>
                              <span className="completion-text">
                                {student.completionPercentage}% ({student.completedVideos}/
                                {student.totalVideos})
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
