import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import LoadingSpinner from "./LoadingSpinner";
import PageTransition from "./PageTransition";
import LoadingButton from "./LoadingButton";
import useButtonLoading from "../hooks/useButtonLoading";
import "./Auth.css";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const navigate = useNavigate();

  // Button loading states
  const {
    isButtonLoading,
    executeWithLoading
  } = useButtonLoading();

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Clear any existing session data when switching accounts
        sessionStorage.removeItem('travelBookingForm');
        sessionStorage.removeItem('multiDestinationForm');
        sessionStorage.removeItem('currentItinerary');

        setIsLoading(true);
        setLoadingMessage("Welcome back! Redirecting to home...");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Convert Firebase error codes to user-friendly messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address. Please check your email or sign up for a new account.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again or reset your password.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials and try again.';
      default:
        return 'Login failed. Please try again.';
    }
  };

  // Show error modal
  const showErrorModal = (errorCode) => {
    setModalMessage(getErrorMessage(errorCode));
    setShowModal(true);
  };

  // Show message function
  const showMessage = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setError("");
  };

  // Remove duplicate useEffect - already handled above

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await executeWithLoading('emailLogin', async () => {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      console.log("Login successful ✅");

      setIsLoading(true);
      setLoadingMessage("Login successful! Redirecting to home...");

      setTimeout(() => {
        navigate("/");
      }, 2000);
    }, 'Signing in...');
  };

  const handleGoogleLogin = async () => {
    await executeWithLoading('googleLogin', async () => {
      console.log("🔍 Starting Google login process...");
      const result = await signInWithPopup(auth, googleProvider);

      // Debug logging
      console.log("📊 Google login result:", result);
      console.log("🎫 Token response:", result._tokenResponse);
      console.log("👤 User info:", result.user);
      console.log("🆕 Is new user:", result._tokenResponse?.isNewUser);
      console.log("📧 User email:", result.user?.email);
      console.log("✅ User verified:", result.user?.emailVerified);

      // Check if this is a new user (should redirect to signup instead)
      const isNewUser = result._tokenResponse?.isNewUser;

      if (isNewUser === true) {
        console.log("🚫 New user detected during login - this should redirect to signup");

        // Sign out the user since they should signup first
        console.log("🔄 Signing out new user...");
        await auth.signOut();
        console.log("✅ User signed out successfully");

        // Add a small delay to ensure signOut completes
        setTimeout(() => {
          console.log("📢 Showing message to user");
          showMessage("🚫 This Google account is not registered. Please sign up first to create an account, then come back to login.");

          // Optionally redirect to signup after showing message
          setTimeout(() => {
            if (window.confirm("Would you like to go to the signup page now?")) {
              console.log("🔄 Redirecting to signup page");
              navigate("/signup");
            }
          }, 3000);
        }, 500);
        return;
      }

      console.log("✅ Google login successful for existing user!");
      console.log("🏠 Proceeding with login and redirect to home");

      setIsLoading(true);
      setLoadingMessage("Google login successful! Redirecting to home...");

      setTimeout(() => {
        console.log("🔄 Navigating to home page");
        navigate("/");
      }, 2000);
    }, 'Signing in with Google...');
  };

  return (
    <PageTransition isLoading={isLoading} loadingMessage={loadingMessage}>
      <div className="login-page">
        <div className="login-container">
          <div className="login-form">
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
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
            <LoadingButton
              type="submit"
              className="login-btn"
              isLoading={isButtonLoading('emailLogin')}
              loadingText="Signing in..."
              variant="primary"
              size="medium"
            >
              Login
            </LoadingButton>
          </form>

          <LoadingButton
            className="google-btn"
            onClick={handleGoogleLogin}
            isLoading={isButtonLoading('googleLogin')}
            loadingText="Signing in with Google..."
            variant="outline"
            size="medium"
          >
            <span style={{
              fontSize: '18px',
              marginRight: '8px',
              fontWeight: 'bold',
              color: '#4285f4',
              background: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #dadce0'
            }}>G</span>
            Sign in with Google
          </LoadingButton>

          <p className="signup-link">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/signup")}>Sign up</span>
          </p>
        </div>
      </div>

      {/* Custom Error Modal */}
      {showModal && (
        <div className="auth-modal-overlay" onClick={closeModal}>
          <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-header error">
              <h3>❌ Login Error</h3>
              <button className="auth-modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="auth-modal-body">
              <p>{modalMessage}</p>
            </div>
            <div className="auth-modal-footer">
              <button className="auth-modal-btn" onClick={closeModal}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </PageTransition>
  );
}

export default Login;
