import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect teachers to their dedicated dashboard
    if (user?.role === 'teacher') {
      navigate('/teacher/dashboard', { replace: true });
    }
    // Redirect students to their dedicated dashboard
    else if (user?.role === 'student') {
      navigate('/student/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return null;
};

export default DashboardPage;
