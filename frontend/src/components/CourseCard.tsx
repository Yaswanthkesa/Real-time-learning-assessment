import React from 'react';
import './CourseCard.css';

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
}

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="course-card" onClick={onClick}>
      <div className="course-thumbnail">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.name} />
        ) : (
          <div className="thumbnail-placeholder">
            <span className="placeholder-icon">📚</span>
          </div>
        )}
      </div>
      
      <div className="course-content">
        <div className="course-header">
          <h3 className="course-title">{truncateText(course.name, 50)}</h3>
          <span 
            className="difficulty-badge"
            style={{ backgroundColor: getDifficultyColor(course.difficulty) }}
          >
            {course.difficulty}
          </span>
        </div>
        
        <p className="course-description">
          {truncateText(course.description, 100)}
        </p>
        
        <div className="course-footer">
          <div className="course-meta">
            <span className="course-category">📂 {course.category}</span>
            <span className="course-teacher">👤 {course.teacherId.name}</span>
          </div>
          <div className="course-id">
            <small>ID: {course.courseId}</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
