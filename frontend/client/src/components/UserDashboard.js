import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { auth, storage } from '../firebase';
import { signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './UserDashboard.css';

function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { section } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('account');
  const [whatsappSaved, setWhatsappSaved] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    firstName: '',
    nickname: '',
    role: 'Subscriber',
    lastName: '',
    displayName: '',
    email: '',
    whatsapp: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Check if WhatsApp has been saved before for this user
        const savedWhatsappStatus = localStorage.getItem(`whatsapp_saved_${currentUser.uid}`);
        const savedWhatsappNumber = localStorage.getItem(`whatsapp_number_${currentUser.uid}`);
        
        // Check if profile has been saved before
        const savedProfileStatus = localStorage.getItem(`profile_saved_${currentUser.uid}`);
        
        if (savedWhatsappStatus === 'true') {
          setWhatsappSaved(true);
        }
        
        if (savedProfileStatus === 'true') {
          setProfileSaved(true);
          setIsEditing(false);
        }
        
        setProfileData({
          username: currentUser.displayName || '',
          firstName: currentUser.displayName?.split(' ')[0] || '',
          nickname: currentUser.displayName?.split(' ')[0] || '',
          role: 'Subscriber',
          lastName: currentUser.displayName?.split(' ')[1] || '',
          displayName: currentUser.displayName || '',
          email: currentUser.email || '',
          whatsapp: savedWhatsappNumber || ''
        });
      } else {
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (section && ['account', 'profile', 'settings', 'trips'].includes(section)) {
      setActiveSection(section);
    } else {
      setActiveSection('account');
    }
  }, [section]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    navigate(`/dashboard/${section}`);
  };

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName || profileData.firstName + ' ' + profileData.lastName
      });
      
      // If WhatsApp number is provided and not empty, save it and mark as saved
      if (profileData.whatsapp && profileData.whatsapp.trim() !== '') {
        localStorage.setItem(`whatsapp_saved_${auth.currentUser.uid}`, 'true');
        localStorage.setItem(`whatsapp_number_${auth.currentUser.uid}`, profileData.whatsapp);
        setWhatsappSaved(true);
      }
      
      // Mark profile as saved
      localStorage.setItem(`profile_saved_${auth.currentUser.uid}`, 'true');
      setProfileSaved(true);
      setIsEditing(false);
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB.');
      return;
    }

    try {
      setUploading(true);
      
      // Create a reference to the file in Firebase Storage
      const storageRef = ref(storage, `profile-photos/${auth.currentUser.uid}/${file.name}`);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update user profile with new photo URL
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL
      });
      
      // Update local user state to reflect the change immediately
      setUser({ ...auth.currentUser, photoURL: downloadURL });
      
      alert('Profile photo uploaded successfully!');
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('fileInput').click();
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return (
          <div className="content-section">
            <h2>Account Management</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={profileData.username}
                  onChange={handleInputChange}
                  placeholder="gene.rodrig"
                  readOnly={!isEditing}
                  className={!isEditing ? 'readonly-field' : ''}
                />
              </div>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  placeholder="Gene"
                  readOnly={!isEditing}
                  className={!isEditing ? 'readonly-field' : ''}
                />
              </div>
                <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  placeholder="Rodriguez"
                  readOnly={!isEditing}
                  className={!isEditing ? 'readonly-field' : ''}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  name="role" 
                  value={profileData.role} 
                  onChange={handleInputChange} 
                  placeholder="user"
                  disabled={!isEditing}
                  className={!isEditing ? 'readonly-field' : ''}
                >
                </select>
              </div>

              <div className="form-group">
                <label>Display Name Publicly as</label>
                <input
                  type="text"
                  name="displayName"
                  value={profileData.displayName}
                  onChange={handleInputChange}
                  placeholder="Gene"
                  readOnly={!isEditing}
                  className={!isEditing ? 'readonly-field' : ''}
                />
              </div>
            </div>

            <h3>Contact Info</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Email (required)</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  placeholder="gene.rodrig@gmail.com"
                  readOnly={!isEditing}
                  className={!isEditing ? 'readonly-field' : ''}
                />
              </div>
              {!whatsappSaved && (
                <div className="form-group">
                  <label>WhatsApp</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={profileData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="@gene-rod"
                  />
                </div>
              )}
              {whatsappSaved && (
                <div className="form-group">
                  <label>WhatsApp</label>
                  <div className="saved-field">
                    <span className="saved-value">{profileData.whatsapp}</span>
                    <span className="saved-badge">✓ Saved</span>
                  </div>
                </div>
              )}
            </div>

            {isEditing ? (
              <button className="save-btn" onClick={handleSaveProfile}>
                Save Changes
              </button>
            ) : (
              <button className="edit-btn" onClick={handleEditProfile}>
                Edit Profile
              </button>
            )}
          </div>
        );

      case 'profile':
        return (
          <div className="content-section">
            <h2>Profile Information</h2>
            <div className="profile-info">
              <div className="info-card">
                <h3>Personal Details</h3>
                <p><strong>Name:</strong> {user.displayName || 'Not set'}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Account Created:</strong> {user.metadata.creationTime}</p>
                <p><strong>Last Sign In:</strong> {user.metadata.lastSignInTime}</p>
              </div>
            </div>
          </div>
        );

      case 'trips':
        return (
          <div className="content-section">
            <h2>My Trips</h2>
            <div className="trips-grid">
              <div className="trip-card">
                <div className="trip-icon">✈️</div>
                <h3>Plan New Trip</h3>
                <p>Create a personalized itinerary</p>
                <button onClick={() => navigate('/travel-booking')}>Start Planning</button>
              </div>
              <div className="trip-card">
                <div className="trip-icon">📋</div>
                <h3>Saved Itineraries</h3>
                <p>View your saved travel plans</p>
                <button>View All</button>
              </div>
              <div className="trip-card">
                <div className="trip-icon">⭐</div>
                <h3>Favorites</h3>
                <p>Your favorite destinations</p>
                <button>Browse Favorites</button>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="content-section">
            <h2>Settings</h2>
            <div className="settings-groups">
              <div className="settings-group">
                <h3>Notifications</h3>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                  Email notifications
                </label>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                  Trip reminders
                </label>
              </div>
              <div className="settings-group">
                <h3>Privacy</h3>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                  Make profile public
                </label>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                  Allow trip sharing
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return renderContent();
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-brand">
          <span className="brand-icon">❄️</span>
          Dream Destiny
        </div>
        <div className="header-actions">
          <button className="header-btn" onClick={handleBackToHome}>
            Home
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-main">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="profile-section">
            <div className="profile-avatar">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {(user.displayName || user.email).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h3>{user.displayName || user.email.split('@')[0]}</h3>
              <p>{user.email}</p>
            </div>
            <button 
              className="upload-btn" 
              onClick={triggerFileInput}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeSection === 'account' ? 'active' : ''}`}
              onClick={() => handleSectionChange('account')}
            >
              <span className="nav-icon">👤</span>
              Account Management
            </button>
            <button
              className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => handleSectionChange('profile')}
            >
              <span className="nav-icon">📋</span>
              Profile Information
            </button>
            <button
              className={`nav-item ${activeSection === 'trips' ? 'active' : ''}`}
              onClick={() => handleSectionChange('trips')}
            >
              <span className="nav-icon">✈️</span>
              My Trips
            </button>
            <button
              className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => handleSectionChange('settings')}
            >
              <span className="nav-icon">⚙️</span>
              Settings
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="dashboard-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default UserDashboard;
