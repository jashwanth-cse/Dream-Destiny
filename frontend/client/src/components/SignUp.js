import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function SignUp({ onSwitchToLogin, onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('SignUp data:', formData);
    // Simulate successful signup and redirect to travel booking
    navigate('/travel-booking');
  };

  const handleGoogleSignUp = () => {
    console.log('Sign up with Google');
    // Simulate successful Google signup and redirect
    navigate('/travel-booking');
  };

  const handleLoginClick = () => {
    if (onSwitchToLogin) {
      onSwitchToLogin();
    } else {
      navigate('/login');
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-form">
          {/* Add back button when we have onBack prop or when routing directly */}
          {(onBack || !onSwitchToLogin) && (
            <button 
              className="back-button" 
              onClick={handleBackClick}
              style={{ 
                position: 'absolute', 
                top: '15px', 
                left: '15px', 
                background: 'none', 
                border: 'none', 
                fontSize: '18px', 
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ← Back
            </button>
          )}
          
          <h1>Sign Up Form</h1>
          
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            
            <button type="submit" className="signup-btn">
              Sign Up
            </button>
          </form>
          
          <button className="google-btn" onClick={handleGoogleSignUp}>
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>
          
          <p className="login-link">
            Already have an account? 
            <span onClick={handleLoginClick}> Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
