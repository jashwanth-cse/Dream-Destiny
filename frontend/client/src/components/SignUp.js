import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import "./Auth.css";

function Signup() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();

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
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      console.log("Signup successful ✅");
      navigate("/travel-booking");
    } catch (err) {
      console.error("Signup error:", err);
      showErrorModal(err.code);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      console.log("Google signup successful ✅");
      navigate("/travel-booking");
    } catch (err) {
      console.error("Google signup error:", err);
      showErrorModal(err.code);
    }
  };

  return (
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
            <button type="submit" className="login-btn">
              Sign Up
            </button>
          </form>

          <button className="google-btn" onClick={handleGoogleSignup}>
            Sign up with Google
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
  );
}

export default Signup;
