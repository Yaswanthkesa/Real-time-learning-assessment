import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CourseCreator.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface FormData {
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface FormErrors {
  name?: string;
  description?: string;
  category?: string;
  difficulty?: string;
}

const CourseCreator: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    difficulty: 'beginner',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Course name must be at least 3 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Course name cannot exceed 100 characters';
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    // Validate category
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    // Validate difficulty
    if (!['beginner', 'intermediate', 'advanced'].includes(formData.difficulty)) {
      newErrors.difficulty = 'Please select a valid difficulty level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/courses`, formData);
      
      // Redirect to course detail page on success
      navigate(`/courses/${response.data.course._id}`);
    } catch (err: any) {
      console.error('Error creating course:', err);
      setApiError(err.response?.data?.message || 'Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/teacher/dashboard');
  };

  return (
    <div className="course-creator-container">
      <div className="course-creator-card">
        <h2>Create New Course</h2>
        <p className="subtitle">Fill in the details to create your course</p>

        {apiError && (
          <div className="alert alert-error">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="course-form">
          <div className="form-group">
            <label htmlFor="name">
              Course Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Introduction to React"
              className={errors.name ? 'error' : ''}
              maxLength={100}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
            <small className="char-count">{formData.name.length}/100</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what students will learn in this course..."
              rows={5}
              className={errors.description ? 'error' : ''}
              maxLength={1000}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
            <small className="char-count">{formData.description.length}/1000</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Programming, Design, Business"
                className={errors.category ? 'error' : ''}
              />
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">
                Difficulty Level <span className="required">*</span>
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className={errors.difficulty ? 'error' : ''}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              {errors.difficulty && <span className="error-text">{errors.difficulty}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseCreator;
