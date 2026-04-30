import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTokenAndFetchUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!token) {
        setError('No authentication token received.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // Store token and fetch user profile
        await setTokenAndFetchUser(token);
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to complete authentication.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, setTokenAndFetchUser]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        {error ? (
          <>
            <h1>❌ Authentication Failed</h1>
            <p className="error-message">{error}</p>
            <p>Redirecting to login...</p>
          </>
        ) : (
          <>
            <h1>✅ Authentication Successful</h1>
            <p>Redirecting to dashboard...</p>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <div className="spinner"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthSuccessPage;
