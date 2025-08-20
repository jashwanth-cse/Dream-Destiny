import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import "./Auth.css";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();

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
        navigate("/"); // or "/home"
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
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      console.log("Login successful ✅");
      navigate("/travel-booking");
    } catch (err) {
      console.error("Login error:", err);
      showErrorModal(err.code);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      console.log("Google login successful ✅");
      navigate("/travel-booking");
    } catch (err) {
      console.error("Google login error:", err);
      showErrorModal(err.code);
    }
  };

  return (
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
            <button type="submit" className="login-btn">
              Login
            </button>
          </form>

          <button className="google-btn" onClick={handleGoogleLogin}>
            Sign in with Google
          </button>

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
  );
}

export default Login;
