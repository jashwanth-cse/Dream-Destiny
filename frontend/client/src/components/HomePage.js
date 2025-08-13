import React, { useState } from 'react';
import './HomePage.css';
import Login from './Login';
import SignUp from './SignUp';

function HomePage() {
  const [currentView, setCurrentView] = useState('home');

  const handleLoginClick = () => {
    setCurrentView('login');
  };

  const handleSwitchToSignUp = () => {
    setCurrentView('signup');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleBack = () => {
    setCurrentView('home');
  };

  if (currentView === 'login') {
    return <Login onSwitchToSignUp={handleSwitchToSignUp} onBack={handleBack} />;
  }

  if (currentView === 'signup') {
    return <SignUp onSwitchToLogin={handleSwitchToLogin} onBack={handleBack} />;
  }

  return (
    <div className="homepage-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="navbar-brand-icon">❄️</span>
          Dream Destiny
        </div>
        
        <div className="navbar-menu">
          <span className="navbar-link">Trip Route Visualization</span>
          <span className="navbar-link">Multi-Lap Journey</span>
          <span className="navbar-link">Accessibility & Inclusion</span>
          <span className="navbar-link">Features</span>
          
          <button className="navbar-button" onClick={handleLoginClick}>
           Login / Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        {/* Main Content */}
        <h1 className="hero-title">
          Your Dream Trip Destined for You
        </h1>
        
        <p className="hero-subtitle">
          Personalized itineraries with accessibility in mind
        </p>
        
        <button className="hero-button">
          Plan Your Trip
        </button>
      </div>
    </div>
  );
}

export default HomePage;
