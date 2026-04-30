import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          📚 IntelliSense
        </Link>

        <div className="navbar-menu">
          {user?.role === 'teacher' && (
            <>
              <Link to="/teacher/dashboard" className="navbar-link">
                My Courses
              </Link>
              <Link to="/teacher/analytics" className="navbar-link">
                Analytics
              </Link>
            </>
          )}

          {user?.role === 'student' && (
            <>
              <Link to="/student/dashboard" className="navbar-link">
                Browse Courses
              </Link>
              <Link to="/student/progress" className="navbar-link">
                My Progress
              </Link>
            </>
          )}

          <Link to="/profile" className="navbar-link">
            Profile
          </Link>

          <div className="navbar-user">
            <span className="navbar-username">{user?.name}</span>
            <button onClick={handleLogout} className="navbar-logout">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
