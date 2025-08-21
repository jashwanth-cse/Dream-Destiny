import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";   // ✅ make sure path is correct
import "./TravelBooking.css";

function TravelBooking() {
  // Load form data from sessionStorage or use defaults
  const loadFormData = () => {
    const saved = sessionStorage.getItem('travelBookingForm');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      source: "",
      destination: "",
      numberOfPersons: "1",
      transportMode: "Flight",
      budget: "",
      days: "",
      startDate: "",
      endDate: "",
      interests: [],
      foodPreference: "",
      accessibilityNeeds: [],
    };
  };

  const [formData, setFormData] = useState(loadFormData);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error"); // "error", "success", "info"

  // Autocomplete states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [activeField, setActiveField] = useState(''); // Track which field is being autocompleted

  // Itinerary generation state
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);

  const navigate = useNavigate();

  // API base URL from environment variables
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

  // Helper function to show modal
  const showMessage = (message, type = "error") => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
  };

  // Helper function to close modal
  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get minimum end date (start date + 1 day)
  const getMinEndDate = () => {
    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      startDate.setDate(startDate.getDate() + 1);
      return startDate.toISOString().split('T')[0];
    }
    return getTodayDate();
  };

  // Debounce function for API calls
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Fetch place suggestions from backend
  const fetchPlaceSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(`${API_BASE_URL}/places/autocomplete?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.predictions) {
        setSuggestions(data.predictions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching place suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounced version of fetchPlaceSuggestions
  const debouncedFetchPlaces = debounce(fetchPlaceSuggestions, 300);

  // Handle location input change with autocomplete (works for both source and destination)
  const handleLocationChange = (e, fieldName) => {
    const value = e.target.value;
    setFormData({ ...formData, [fieldName]: value });
    setActiveField(fieldName);

    if (value.trim()) {
      debouncedFetchPlaces(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setFormData({ ...formData, [activeField]: suggestion.description });
    setShowSuggestions(false);
    setSuggestions([]);
    setActiveField('');
  };

  // Hide suggestions when clicking outside
  const handleDestinationBlur = () => {
    // Delay hiding to allow click on suggestions
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };



  // Save form data to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('travelBookingForm', JSON.stringify(formData));
  }, [formData]);

  // Clear session data function
  const clearSessionData = () => {
    sessionStorage.removeItem('travelBookingForm');
    sessionStorage.removeItem('currentItinerary');
    setFormData(loadFormData()); // Reset to defaults
  };

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
    const { name, value } = e.target;
    let updatedFormData = {
      ...formData,
      [name]: value,
    };

    // Auto-calculate days when dates change
    if (name === 'startDate' || name === 'endDate') {
      const startDate = name === 'startDate' ? value : formData.startDate;
      const endDate = name === 'endDate' ? value : formData.endDate;

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end > start) {
          const timeDiff = end.getTime() - start.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          updatedFormData.days = daysDiff.toString();
        }
      }
    }

    setFormData(updatedFormData);
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

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate required fields
  const requiredFields = [
    { field: 'source', label: 'Source Location' },
    { field: 'destination', label: 'Travel Destination' },
    { field: 'numberOfPersons', label: 'Number of Persons' },
    { field: 'budget', label: 'Budget' },
    { field: 'startDate', label: 'Start Date' },
    { field: 'endDate', label: 'End Date' },
    { field: 'foodPreference', label: 'Food Preference' }
  ];

  const missingFields = requiredFields.filter(({ field }) => !formData[field] || formData[field].trim() === '');

  if (missingFields.length > 0) {
    const missingFieldNames = missingFields.map(({ label }) => label).join(', ');
    showMessage(`Please fill in all required fields: ${missingFieldNames}`, "error");
    return;
  }

  // Additional validation
  if (parseInt(formData.numberOfPersons) <= 0 || parseInt(formData.numberOfPersons) > 20) {
    showMessage("Please enter a valid number of persons (1-20)", "error");
    return;
  }

  if (parseInt(formData.budget) <= 0) {
    showMessage("Please enter a valid budget amount greater than 0", "error");
    return;
  }

  // Check if dates are valid and end date is after start date
  const startDate = new Date(formData.startDate);
  const endDate = new Date(formData.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to compare only dates

  if (startDate < today) {
    showMessage("Start date cannot be in the past", "error");
    return;
  }

  if (endDate <= startDate) {
    showMessage("End date must be after start date", "error");
    return;
  }

  // Check if days were calculated (should be auto-calculated)
  if (!formData.days || parseInt(formData.days) <= 0) {
    showMessage("Please select valid start and end dates", "error");
    return;
  }

  try {
    setIsGeneratingItinerary(true);

    // Choose between regular and enhanced Amadeus-powered itinerary
    const useAmadeusData = true; // Set to true to use real-time travel data
    const endpoint = useAmadeusData
      ? `${API_BASE_URL}/api/generate-itinerary-with-amadeus`
      : `${API_BASE_URL}/routers/generate-itinerary`;

    console.log(`🚀 Using ${useAmadeusData ? 'Amadeus-enhanced' : 'standard'} itinerary generation`);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (data.itinerary) {
      const tripDetails = {
        source: formData.source,
        destination: formData.destination,
        numberOfPersons: formData.numberOfPersons,
        days: formData.days,
        budget: formData.budget,
        transportMode: formData.transportMode,
        foodPreference: formData.foodPreference,
        startDate: formData.startDate,
        endDate: formData.endDate,
        journeyType: 'single'
      };

      // Save to sessionStorage for session persistence
      const itineraryData = {
        currentItinerary: data.itinerary,
        originalItinerary: data.itinerary,
        tripDetails: tripDetails,
        timestamp: new Date().toISOString()
      };
      sessionStorage.setItem('currentItinerary', JSON.stringify(itineraryData));

      // Navigate to itinerary display page with data
      navigate("/itinerary", {
        state: {
          itinerary: data.itinerary,
          tripDetails: tripDetails
        }
      });
    } else {
      showMessage("No itinerary was generated. Please try again.", "error");
    }
  } catch (error) {
    console.error("Error generating itinerary:", error);
    showMessage("Failed to generate itinerary. Please check your connection and try again.", "error");
  } finally {
    setIsGeneratingItinerary(false);
  }
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
            {["Flight", "Train", "Car Rental", "Bus", "Own Vehicle", "Mixed"].map(
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
                    {mode === "Mixed" && "🚁"}
                  </div>
                  <span>{mode}</span>
                </button>
              )
            )}
          </div>

          {/* Source Location */}
          <div className="form-section">
            <label>Source Location</label>
            <div className="autocomplete-container">
              <input
                type="text"
                name="source"
                placeholder="Start typing your starting location..."
                value={formData.source}
                onChange={(e) => handleLocationChange(e, 'source')}
                onBlur={handleDestinationBlur}
                onFocus={() => {
                  setActiveField('source');
                  formData.source && debouncedFetchPlaces(formData.source);
                }}
                className="destination-input"
                autoComplete="off"
              />

              {/* Autocomplete Suggestions for Source */}
              {showSuggestions && (
                <div className="suggestions-dropdown">
                  {isLoadingSuggestions ? (
                    <div className="suggestion-item loading">
                      <span>🔍 Searching places...</span>
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.place_id || index}
                        className="suggestion-item"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <div className="suggestion-main">{suggestion.main_text}</div>
                        <div className="suggestion-secondary">{suggestion.secondary_text}</div>
                      </div>
                    ))
                  ) : (
                    <div className="suggestion-item no-results">
                      <span>No places found</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Travel Destination */}
          <div className="form-section">
            <label>Travel Destination</label>
            <div className="autocomplete-container">
              <input
                type="text"
                name="destination"
                placeholder="Start typing a destination..."
                value={formData.destination}
                onChange={(e) => handleLocationChange(e, 'destination')}
                onBlur={handleDestinationBlur}
                onFocus={() => {
                  setActiveField('destination');
                  formData.destination && debouncedFetchPlaces(formData.destination);
                }}
                className="destination-input"
                autoComplete="off"
              />

              {/* Autocomplete Suggestions */}
              {showSuggestions && (
                <div className="suggestions-dropdown">
                  {isLoadingSuggestions ? (
                    <div className="suggestion-item loading">
                      <span>🔍 Searching places...</span>
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.place_id || index}
                        className="suggestion-item"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <div className="suggestion-main">{suggestion.main_text}</div>
                        <div className="suggestion-secondary">{suggestion.secondary_text}</div>
                      </div>
                    ))
                  ) : (
                    <div className="suggestion-item no-results">
                      <span>No places found</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Number of Persons */}
          <div className="form-section">
            <label>Number of Persons *</label>
            <input
              type="number"
              name="numberOfPersons"
              placeholder="How many people are traveling?"
              value={formData.numberOfPersons}
              onChange={handleInputChange}
              className="persons-input"
              min="1"
              max="20"
              required
            />
            <div className="input-hint">
              Enter the total number of travelers (including yourself)
            </div>
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
                <option value="Mixed">Mixed Transport</option>
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
                placeholder="Select date from calendar"
                value={formData.days}
                readOnly
                className="days-input readonly"
                title="This field is automatically calculated based on your selected dates"
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
                min={getTodayDate()}
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
                min={getMinEndDate()}
              />
            </div>
          </div>

          {/* Interests */}
          <div className="form-section">
            <label>Interests (Optional)</label>
            <div className="checkbox-group">
              {["Adventure", "Culture", "Food", "History", "Nature", "Shopping", "Nightlife", "Art", "Photography", "Architecture", "Museums", "Beaches", "Mountains", "Wildlife", "Spiritual", "Sports", "Music", "Festivals", "Relaxation"].map((interest) => (
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
            <label>Accessibility Needs (Optional)</label>
            <div className="checkbox-group">
              {[
                "Wheelchair Access",
                "Visual Assistance",
                "Hearing Assistance",
                "Mobility Support",
                "Differently-abled accommodation",
                "Senior citizens",
                "Children below 3 years",
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

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="clear-btn"
              onClick={clearSessionData}
              title="Clear all form data"
            >
              🗑️ Clear Form
            </button>

            <button type="submit" className="submit-btn" disabled={isGeneratingItinerary}>
              {isGeneratingItinerary ? (
                <>
                  <span className="loading-spinner"></span>
                  Generating Itinerary...
                </>
              ) : (
                "Destine My Trip"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Custom Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-header ${modalType}`}>
              <h3>
                {modalType === "success" && "✅ Success"}
                {modalType === "error" && "❌ Error"}
                {modalType === "info" && "ℹ️ Information"}
              </h3>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>{modalMessage}</p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn" onClick={closeModal}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default TravelBooking;
