import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';  // ✅ Import firebase auth
import { signOut, onAuthStateChanged } from 'firebase/auth';
import LoadingSpinner from './LoadingSpinner';
import PageTransition from './PageTransition';
import LoadingButton from './LoadingButton';
import useButtonLoading from '../hooks/useButtonLoading';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Button loading states
  const {
    isButtonLoading,
    executeWithLoading
  } = useButtonLoading();

  // ✅ Track login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      // If user becomes null (logged out) and we're in loading state, redirect
      if (!currentUser && isLoading && loadingMessage.includes("Logging out")) {
        setTimeout(() => {
          setIsLoading(false);
          navigate('/');
        }, 1000);
      }
    });
    return () => unsubscribe();
  }, [isLoading, loadingMessage, navigate]);

  // ✅ Handle login
  const handleLoginClick = () => {
    navigate('/login');
  };

  // ✅ Handle logout
  const handleLogoutClick = async () => {
    await executeWithLoading('logout', async () => {
      setIsLoading(true);
      setLoadingMessage("Logging out... Redirecting to home...");

      // Clear all session data before logout
      sessionStorage.removeItem('travelBookingForm');
      sessionStorage.removeItem('multiDestinationForm');
      sessionStorage.removeItem('currentItinerary');
      console.log("Session data cleared");

      await signOut(auth);
      console.log("User logged out");

      // Force redirect after logout
      setTimeout(() => {
        setIsLoading(false);
        window.location.href = '/'; // Force page reload to ensure clean state
      }, 2000);
    }, 'Logging out...');
  };

  const handlePlanTripClick = async () => {
    await executeWithLoading('planTrip', async () => {
      if (user) {
        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        setShowJourneyModal(true);
      } else {
        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate("/login");
      }
    }, user ? 'Opening journey options...' : 'Redirecting to login...');
  };

  const handleJourneyTypeSelect = async (journeyType) => {
    await executeWithLoading(`journey-${journeyType}`, async () => {
      setShowJourneyModal(false);
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (journeyType === 'single') {
        navigate("/travel-booking");
      } else if (journeyType === 'multi') {
        navigate("/multi-destination");
      }
    }, journeyType === 'single' ? 'Loading single destination...' : 'Loading multi-destination...');
  };

  const closeJourneyModal = () => {
    setShowJourneyModal(false);
  };

  // ✅ Handle dashboard navigation
  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  return (
    <PageTransition isLoading={isLoading} loadingMessage={loadingMessage}>
      <div className="homepage-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="navbar-brand-icon">❄️</span>
          Dream Destiny
        </div>
        
        <div className="navbar-menu">
          <span className="navbar-link">Trip Route Visualization</span>
          <span onClick={handlePlanTripClick}  className="navbar-link">Multi-Lap Journey</span>
          <span className="navbar-link">Accessibility & Inclusion</span>
          <span className="navbar-link">Features</span>
          
          {/* ✅ Conditionally show user info */}
          {user ? (
            <div className="user-controls">
<<<<<<< HEAD
              <span className="welcome-text">
                Welcome, {user.displayName || user.email} 👋
              </span>
              <LoadingButton
                className="logout-btn"
                onClick={handleLogoutClick}
                isLoading={isButtonLoading('logout')}
                loadingText="Logging out..."
                variant="danger"
                size="medium"
              >
=======
              <button className="dashboard-btn" onClick={handleDashboardClick}>
               {user.displayName || user.email} 👋
              </button>
              <button className="logout-btn" onClick={handleLogoutClick}>
>>>>>>> f1d9a8c45cf4fa2b4d2d8765323971b2cb1d0d47
                Logout
              </LoadingButton>
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
        
        <LoadingButton
          className="hero-button"
          onClick={handlePlanTripClick}
          isLoading={isButtonLoading('planTrip')}
          loadingText={user ? 'Opening journey options...' : 'Redirecting to login...'}
          variant="primary"
          size="large"
        >
          Plan Your Trip
        </LoadingButton>
      </div>

      {/* Journey Type Selection Modal */}
      {showJourneyModal && (
        <div className="journey-modal-overlay" onClick={closeJourneyModal}>
          <div className="journey-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="journey-modal-header">
              <h3>🌍 Choose Your Journey Type</h3>
              <button className="journey-modal-close" onClick={closeJourneyModal}>
                ×
              </button>
            </div>
            <div className="journey-modal-body">
              <p>What type of trip are you planning?</p>

              <div className="journey-options">
                <LoadingButton
                  className="journey-option"
                  onClick={() => handleJourneyTypeSelect('single')}
                  isLoading={isButtonLoading('journey-single')}
                  loadingText="Loading single destination..."
                  variant="ghost"
                  size="large"
                >
                  <div className="journey-content">
                    <div className="journey-icon">🎯</div>
                    <h4>Single Destination</h4>
                    <p>Plan a trip to one amazing destination</p>
                    <div className="journey-example">
                      Example: Delhi → Paris
                    </div>
                  </div>
                </LoadingButton>

                <LoadingButton
                  className="journey-option"
                  onClick={() => handleJourneyTypeSelect('multi')}
                  isLoading={isButtonLoading('journey-multi')}
                  loadingText="Loading multi-destination..."
                  variant="ghost"
                  size="large"
                >
                  <div className="journey-content">
                    <div className="journey-icon">🗺️</div>
                    <h4>Multi-Destination Journey</h4>
                    <p>Explore multiple cities in one trip</p>
                    <div className="journey-example">
                      Example: Delhi → Paris → Rome → Barcelona
                    </div>
                  </div>
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </PageTransition>
  );
}

export default HomePage;
