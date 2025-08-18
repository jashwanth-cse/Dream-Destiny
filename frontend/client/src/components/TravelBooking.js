import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";   // ✅ make sure path is correct
import "./TravelBooking.css";

function TravelBooking() {
  const [formData, setFormData] = useState({
    destination: "",
    transportMode: "Flight",
    budget: "",
    days: "",
    startDate: "",
    endDate: "",
    interests: [],
    foodPreference: "",
    accessibilityNeeds: [],
  });

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ✅ Check if user is signed in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login"); // redirect if not logged in
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleInterestChange = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleAccessibilityChange = (need) => {
    setFormData((prev) => ({
      ...prev,
      accessibilityNeeds: prev.accessibilityNeeds.includes(need)
        ? prev.accessibilityNeeds.filter((n) => n !== need)
        : [...prev.accessibilityNeeds, need],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Travel booking data:", formData);
  };

  // ✅ Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error.message);
    }
  };

  // 🚀 Show loading until auth state is checked
  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="travel-booking">
      <div className="booking-container">

        {/* 🔹 Logout button on top */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>

        {/* 🔹 Keep your form EXACTLY as it was */}
        <form onSubmit={handleSubmit} className="booking-form">
          {/* Transport Mode Selection */}
          <div className="transport-tabs">
            {["Flight", "Train", "Car Rental", "Bus", "Own Vehicle"].map(
              (mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`transport-tab ${
                    formData.transportMode === mode ? "active" : ""
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, transportMode: mode }))
                  }
                >
                  <div className="tab-icon">
                    {mode === "Flight" && "✈️"}
                    {mode === "Train" && "🚂"}
                    {mode === "Car Rental" && "🚗"}
                    {mode === "Bus" && "🚌"}
                    {mode === "Own Vehicle" && "🚙"}
                  </div>
                  <span>{mode}</span>
                </button>
              )
            )}
          </div>

          {/* Travel Destination */}
          <div className="form-section">
            <label>Travel Destination(s)</label>
            <input
              type="text"
              name="destination"
              placeholder="e.g., Paris, Rome, Tokyo"
              value={formData.destination}
              onChange={handleInputChange}
              className="destination-input"
            />
          </div>

          {/* Travel Details Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Mode of Transport</label>
              <select
                name="transportMode"
                value={formData.transportMode}
                onChange={handleInputChange}
                className="transport-select"
              >
                <option value="Flight">Flight</option>
                <option value="Train">Train</option>
                <option value="Car Rental">Car Rental</option>
                <option value="Bus">Bus</option>
                <option value="Own Vehicle">Own Vehicle</option>
              </select>
            </div>

            <div className="form-group">
              <label>Budget</label>
              <input
                type="number"
                name="budget"
                placeholder="$ 2000"
                value={formData.budget}
                onChange={handleInputChange}
                className="budget-input"
              />
            </div>

            <div className="form-group">
              <label>Number of Days</label>
              <input
                type="number"
                name="days"
                placeholder="7"
                value={formData.days}
                onChange={handleInputChange}
                className="days-input"
              />
            </div>
          </div>

          {/* Travel Dates */}
          <div className="form-row">
            <div className="form-group">
              <label>Travel Dates</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="date-input"
              />
            </div>
            <div className="form-group">
              <label>&nbsp;</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="date-input"
              />
            </div>
          </div>

          {/* Interests */}
          <div className="form-section">
            <label>Interests</label>
            <div className="checkbox-group">
              {["Adventure", "Culture", "Relaxation"].map((interest) => (
                <label key={interest} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest)}
                    onChange={() => handleInterestChange(interest)}
                  />
                  <span className="checkmark"></span>
                  {interest}
                </label>
              ))}
            </div>
          </div>

          {/* Food Preference */}
          <div className="form-section">
            <label>Food Preference</label>
            <div className="radio-group">
              {["Veg", "Non-Veg"].map((preference) => (
                <label key={preference} className="radio-label">
                  <input
                    type="radio"
                    name="foodPreference"
                    value={preference}
                    checked={formData.foodPreference === preference}
                    onChange={handleInputChange}
                  />
                  <span className="radio-checkmark"></span>
                  {preference}
                </label>
              ))}
            </div>
          </div>

          {/* Accessibility Needs */}
          <div className="form-section">
            <label>Accessibility Needs</label>
            <div className="checkbox-group">
              {[
                "Differently-abled accommodation",
                "Senior citizens",
                "Children under 3 years",
              ].map((need) => (
                <label key={need} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.accessibilityNeeds.includes(need)}
                    onChange={() => handleAccessibilityChange(need)}
                  />
                  <span className="checkmark"></span>
                  {need}
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn">
            Destine My Trip
          </button>
        </form>
      </div>
    </div>
  );
}

export default TravelBooking;
