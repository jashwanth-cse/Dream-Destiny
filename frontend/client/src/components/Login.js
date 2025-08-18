import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import "./Auth.css";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      console.log("Google login successful ✅");
      navigate("/travel-booking");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form">
          <h1>Login</h1>
          {error && <p style={{ color: "red" }}>{error}</p>}

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
    </div>
  );
}

export default Login;
