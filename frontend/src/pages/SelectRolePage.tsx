import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './AuthPages.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SelectRolePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Update user role
      await axios.put(
        `${API_URL}/auth/role`,
        { role: selectedRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Store token and user data
      localStorage.setItem('token', token!);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update role');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome! 👋</h1>
        <p className="auth-subtitle">Please select your role to continue</p>

        {error && <div className="error-message">{error}</div>}

        <div style={{ marginTop: '30px' }}>
          <div
            className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('student')}
          >
            <div className="role-icon">🎓</div>
            <h3>Student</h3>
            <p>I want to learn from courses and watch educational videos</p>
          </div>

          <div
            className={`role-card ${selectedRole === 'teacher' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('teacher')}
          >
            <div className="role-icon">👨‍🏫</div>
            <h3>Teacher</h3>
            <p>I want to create courses and upload educational content</p>
          </div>
        </div>

        <button
          onClick={handleRoleSelection}
          className="btn-primary"
          disabled={!selectedRole || loading}
          style={{ marginTop: '30px' }}
        >
          {loading ? 'Setting up your account...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default SelectRolePage;
