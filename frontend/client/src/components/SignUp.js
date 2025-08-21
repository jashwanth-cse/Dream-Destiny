import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import LoadingSpinner from "./LoadingSpinner";
import PageTransition from "./PageTransition";
import "./Auth.css";

function Signup() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoading(true);
        setLoadingMessage("You're already logged in! Redirecting to home...");
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
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please try logging in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled. Please contact support.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many requests. Please try again later.';
      default:
        return 'Sign up failed. Please try again.';
    }
  };

  // Show message function
  const showMessage = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  // Show error modal
  const showErrorModal = (errorCode) => {
    setModalMessage(getErrorMessage(errorCode));
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setError("");
  };

  // ✅ Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/"); // redirect to home
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsEmailLoading(true);
    setError("");

    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      console.log("Signup successful ✅");

      setIsLoading(true);
      setLoadingMessage("Account created successfully! Redirecting to home...");

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Signup error:", err);
      showErrorModal(err.code);
      setIsEmailLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Debug logging
      console.log("Google signup result:", result);
      console.log("Token response:", result._tokenResponse);
      console.log("Is new user:", result._tokenResponse?.isNewUser);

      // Check if this user already exists (should login instead)
      // For existing users, isNewUser will be false or undefined
      const isNewUser = result._tokenResponse?.isNewUser;

      if (isNewUser === false) {
        // Sign out the user since they should login instead
        await auth.signOut();
        console.log("Existing user detected, signed out and showing message");

        // Add a small delay to ensure signOut completes
        setTimeout(() => {
          showMessage("✅ Account already exists with this Google account. Please login instead.");
          setIsGoogleLoading(false);

          // Optionally redirect to login after showing message
          setTimeout(() => {
            if (window.confirm("Would you like to go to the login page now?")) {
              navigate("/login");
            }
          }, 3000);
        }, 500);
        return;
      }

      console.log("Google signup successful ✅");

      setIsLoading(true);
      setLoadingMessage("Google account created successfully! Redirecting to home...");

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Google signup error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        showMessage("Signup cancelled. Please try again.");
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        showMessage("Account already exists with this email. Please login instead.");
      } else {
        showErrorModal(err.code);
      }
      setIsGoogleLoading(false);
    }
  };

  return (
    <PageTransition isLoading={isLoading} loadingMessage={loadingMessage}>
      <div className="login-page">
        <div className="login-container">
          <div className="login-form">
            <h1>Sign Up</h1>

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
              placeholder="Password (min 6 chars)"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              className={`login-btn ${isEmailLoading ? 'btn-loading' : ''}`}
              disabled={isEmailLoading || isLoading}
            >
              {isEmailLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <button
            className={`google-btn ${isGoogleLoading ? 'btn-loading' : ''}`}
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? 'Creating account...' : (
              <>
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
                Sign up with Google
              </>
            )}
          </button>

          <p className="signup-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </div>
      </div>

      {/* Custom Error Modal */}
      {showModal && (
        <div className="auth-modal-overlay" onClick={closeModal}>
          <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-header error">
              <h3>❌ Sign Up Error</h3>
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

export default Signup;
