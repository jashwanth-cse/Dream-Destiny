import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';  // ✅ Import firebase auth
import { signOut, onAuthStateChanged } from 'firebase/auth';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // ✅ Track login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Handle login
  const handleLoginClick = () => {
    navigate('/login');
  };

  // ✅ Handle logout
  const handleLogoutClick = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
      navigate('/'); // redirect to home
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  const handlePlanTripClick = () => {
    console.log('Plan Your Trip clicked');
    navigate("/travel-booking");
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
          
          {/* ✅ Conditionally show user info */}
          {user ? (
            <div className="user-controls">
              <span className="welcome-text">
                Welcome, {user.displayName || user.email} 👋
              </span>
              <button className="logout-btn" onClick={handleLogoutClick}>
                Logout
              </button>
            </div>
          ) : (
            <button className="navbar-button" onClick={handleLoginClick}>
              Login / Sign Up
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
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
