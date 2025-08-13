import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handlePlanTripClick = () => {
    // You can add functionality for planning trips here
    console.log('Plan Your Trip clicked');
  };

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
        
        <button className="hero-button" onClick={handlePlanTripClick}>
          Plan Your Trip
        </button>
      </div>
    </div>
  );
}

export default HomePage;
