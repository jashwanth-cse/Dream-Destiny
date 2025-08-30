import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, storage } from '../firebase';  // ✅ Import firebase auth and storage
import { signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  const [showDropdown, setShowDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-profile') && !event.target.closest('.profile-dropdown')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
  const handlemultitrip = () => {
    navigate('/multi-destination');
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

  // ✅ Handle profile image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Show loading state
      const tempUser = { ...user, photoURL: null };
      setUser(tempUser);

      // Create a reference to the storage location
      const storageRef = ref(storage, `profile-images/${user.uid}/${file.name}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user profile
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL
      });
      
      // Force a re-render by updating user state
      setUser({ ...auth.currentUser });
      
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
      // Restore previous user state
      setUser({ ...auth.currentUser });
    }
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
          <span onClick={handlemultitrip}  className="navbar-link">Multi-Lap Journey</span>
          <span className="navbar-link">Accessibility & Inclusion</span>
          <span className="navbar-link">Features</span>
          
          {/* ✅ Conditionally show user info */}
          {user ? (
            <div className="user-controls">
              <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)}>
                <div className="profile-image-container">
                  <img 
                    src="/profile-default.png"
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23808080'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
                    }}
                    alt="Profile" 
                    className="profile-image" 
                  />
                  <label className="image-upload-label" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    <span className="upload-icon">📷</span>
                  </label>
                </div>
                <span className="user-name">
                  {user.displayName || user.email}
                </span>
                <span className="dropdown-arrow">▼</span>
              </div>
              {showDropdown && (
                <div className="profile-dropdown">
                  <div className="dropdown-item">
                    <LoadingButton
                      className="dropdown-button"
                      onClick={handleDashboardClick}
                      isLoading={isButtonLoading('dashboard')}
                      loadingText="Opening dashboard..."
                      variant="text"
                      size="medium"
                    >
                      Dashboard
                    </LoadingButton>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item">
                    <LoadingButton
                      className="dropdown-button"
                      onClick={handleLogoutClick}
                      isLoading={isButtonLoading('logout')}
                      loadingText="Logging out..."
                      variant="text"
                      size="medium"
                    >
                      Logout
                    </LoadingButton>
                  </div>
                </div>
              )}
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
              <button className="journey-modal-close" onClick={closeJourneyModal}>×</button>
            </div>
            <p className="journey-modal-question">What type of trip are you planning?</p>
            <div className="journey-options">
              <div 
                className="journey-option"
                onClick={() => !isButtonLoading('journey-single') && handleJourneyTypeSelect('single')}
              >
                <div className="journey-icon">🎯</div>
                <div className="journey-details">
                  <h4>Single Destination</h4>
                  <p>Plan a trip to one amazing destination</p>
                  <div className="journey-example">
                    Example: Delhi → Paris
                  </div>
                </div>
                {isButtonLoading('journey-single') && 
                  <div className="journey-loading-overlay">
                    <div className="loading-spinner"></div>
                  </div>
                }
              </div>

              <div 
                className="journey-option"
                onClick={() => !isButtonLoading('journey-multi') && handleJourneyTypeSelect('multi')}
              >
                <div className="journey-icon">🗺️</div>
                <div className="journey-details">
                  <h4>Multi-Destination Journey</h4>
                  <p>Explore multiple cities in one trip</p>
                  <div className="journey-example">
                    Example: Delhi → Paris → Rome → Barcelona
                  </div>
                </div>
                {isButtonLoading('journey-multi') && 
                  <div className="journey-loading-overlay">
                    <div className="loading-spinner"></div>
                  </div>
                }
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
