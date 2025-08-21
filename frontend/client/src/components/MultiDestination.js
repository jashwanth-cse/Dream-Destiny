import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import "./MultiDestination.css";

function MultiDestination() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load form data from sessionStorage or use defaults
  const loadFormData = () => {
    const saved = sessionStorage.getItem('multiDestinationForm');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      source: "",
      destinations: [""], // Array of destinations
      numberOfPersons: "1",
      transportMode: "Flight",
      budget: "",
      totalDays: "",
      startDate: "",
      endDate: "",
      interests: [],
      foodPreference: "",
      accessibilityNeeds: [],
    };
  };

  // Form data for multi-destination trip
  const [formData, setFormData] = useState(loadFormData);

  // Autocomplete states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [activeField, setActiveField] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error");

  // Generation state
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);

  // API base URL
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

  // Save form data to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('multiDestinationForm', JSON.stringify(formData));
  }, [formData]);

  // Clear session data function
  const clearSessionData = () => {
    sessionStorage.removeItem('multiDestinationForm');
    sessionStorage.removeItem('currentItinerary');
    setFormData(loadFormData()); // Reset to defaults
  };

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Helper function to show modal
  const showMessage = (message, type = "error") => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error.message);
    }
  };

  // Add new destination field
  const addDestination = () => {
    setFormData({
      ...formData,
      destinations: [...formData.destinations, ""]
    });
  };

  // Remove destination field
  const removeDestination = (index) => {
    if (formData.destinations.length > 1) {
      const newDestinations = formData.destinations.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        destinations: newDestinations
      });
    }
  };

  // Handle destination change
  const handleDestinationChange = (index, value) => {
    const newDestinations = [...formData.destinations];
    newDestinations[index] = value;
    setFormData({
      ...formData,
      destinations: newDestinations
    });
  };

  // Handle regular input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = {
      ...formData,
      [name]: value,
    };

    // Auto-calculate total days when dates change
    if (name === 'startDate' || name === 'endDate') {
      const startDate = name === 'startDate' ? value : formData.startDate;
      const endDate = name === 'endDate' ? value : formData.endDate;

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end > start) {
          const timeDiff = end.getTime() - start.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          updatedFormData.totalDays = daysDiff.toString();
        }
      }
    }

    setFormData(updatedFormData);
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e, category) => {
    const { value, checked } = e.target;
    setFormData({
      ...formData,
      [category]: checked
        ? [...formData[category], value]
        : formData[category].filter((item) => item !== value),
    });
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

  // Fetch place suggestions
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

  const debouncedFetchPlaces = debounce(fetchPlaceSuggestions, 300);

  // Handle location input change with autocomplete
  const handleLocationChange = (e, fieldName, index = -1) => {
    const value = e.target.value;
    
    if (fieldName === 'source') {
      setFormData({ ...formData, source: value });
    } else if (fieldName === 'destination') {
      handleDestinationChange(index, value);
    }
    
    setActiveField(fieldName);
    setActiveIndex(index);
    
    if (value.trim()) {
      debouncedFetchPlaces(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    if (activeField === 'source') {
      setFormData({ ...formData, source: suggestion.description });
    } else if (activeField === 'destination' && activeIndex >= 0) {
      handleDestinationChange(activeIndex, suggestion.description);
    }
    
    setShowSuggestions(false);
    setSuggestions([]);
    setActiveField('');
    setActiveIndex(-1);
  };

  // Hide suggestions when clicking outside
  const handleLocationBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.source.trim()) {
      showMessage("Please enter a source location", "error");
      return;
    }

    const validDestinations = formData.destinations.filter(dest => dest.trim());
    if (validDestinations.length === 0) {
      showMessage("Please enter at least one destination", "error");
      return;
    }

    if (!formData.budget || !formData.startDate || !formData.endDate || !formData.foodPreference || !formData.numberOfPersons) {
      showMessage("Please fill in all required fields", "error");
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

    // Check if days were calculated (should be auto-calculated)
    if (!formData.totalDays || parseInt(formData.totalDays) <= 0) {
      showMessage("Please select valid start and end dates", "error");
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      showMessage("Start date cannot be in the past", "error");
      return;
    }

    if (endDate <= startDate) {
      showMessage("End date must be after start date", "error");
      return;
    }

    try {
      setIsGeneratingItinerary(true);
      
      const tripData = {
        ...formData,
        destinations: validDestinations,
        journeyType: 'multi'
      };

      const response = await fetch(`${API_BASE_URL}/routers/generate-multi-itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripData),
      });

      const data = await response.json();
      if (data.itinerary) {
        const tripDetails = {
          source: formData.source,
          destinations: validDestinations,
          numberOfPersons: formData.numberOfPersons,
          totalDays: formData.totalDays,
          budget: formData.budget,
          transportMode: formData.transportMode,
          foodPreference: formData.foodPreference,
          startDate: formData.startDate,
          endDate: formData.endDate,
          journeyType: 'multi'
        };

        // Save to sessionStorage for session persistence
        const itineraryData = {
          currentItinerary: data.itinerary,
          originalItinerary: data.itinerary,
          tripDetails: tripDetails,
          timestamp: new Date().toISOString()
        };
        sessionStorage.setItem('currentItinerary', JSON.stringify(itineraryData));

        // Navigate to itinerary display page
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

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="multi-destination-container">
      {/* Header */}
      <header className="multi-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
          <h1>🗺️ Multi-Destination Journey</h1>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Main Form */}
      <div className="multi-form-container">
        <form onSubmit={handleSubmit} className="multi-form">
          <div className="form-header">
            <h2>Plan Your Multi-City Adventure</h2>
            <p>Create an itinerary that takes you through multiple amazing destinations</p>
          </div>

          {/* Source Location */}
          <div className="form-section">
            <label>Starting Location *</label>
            <div className="autocomplete-container">
              <input
                type="text"
                name="source"
                placeholder="Where will you start your journey?"
                value={formData.source}
                onChange={(e) => handleLocationChange(e, 'source')}
                onBlur={handleLocationBlur}
                onFocus={() => {
                  setActiveField('source');
                  formData.source && debouncedFetchPlaces(formData.source);
                }}
                className="location-input"
                autoComplete="off"
                required
              />
              
              {/* Autocomplete Suggestions */}
              {showSuggestions && activeField === 'source' && (
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

          {/* Destinations */}
          <div className="form-section">
            <div className="destinations-header">
              <label>Destinations *</label>
              <button type="button" className="add-destination-btn" onClick={addDestination}>
                + Add Destination
              </button>
            </div>
            
            <div className="destinations-list">
              {formData.destinations.map((destination, index) => (
                <div key={index} className="destination-item">
                  <div className="destination-number">{index + 1}</div>
                  <div className="autocomplete-container">
                    <input
                      type="text"
                      placeholder={`Destination ${index + 1}`}
                      value={destination}
                      onChange={(e) => handleLocationChange(e, 'destination', index)}
                      onBlur={handleLocationBlur}
                      onFocus={() => {
                        setActiveField('destination');
                        setActiveIndex(index);
                        destination && debouncedFetchPlaces(destination);
                      }}
                      className="location-input"
                      autoComplete="off"
                    />
                    
                    {/* Autocomplete for this destination */}
                    {showSuggestions && activeField === 'destination' && activeIndex === index && (
                      <div className="suggestions-dropdown">
                        {isLoadingSuggestions ? (
                          <div className="suggestion-item loading">
                            <span>🔍 Searching places...</span>
                          </div>
                        ) : suggestions.length > 0 ? (
                          suggestions.map((suggestion, suggestionIndex) => (
                            <div
                              key={suggestion.place_id || suggestionIndex}
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
                  
                  {formData.destinations.length > 1 && (
                    <button
                      type="button"
                      className="remove-destination-btn"
                      onClick={() => removeDestination(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
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

          {/* Trip Details */}
          <div className="form-row">
            <div className="form-group">
              <label>Total Trip Duration (Auto-calculated)</label>
              <input
                type="number"
                name="totalDays"
                placeholder="Select dates to auto-calculate"
                value={formData.totalDays}
                readOnly
                className="days-input readonly"
                title="This field is automatically calculated based on your selected dates"
              />
            </div>

            <div className="form-group">
              <label>Budget (INR) *</label>
              <input
                type="number"
                name="budget"
                placeholder="Total budget in INR"
                value={formData.budget}
                onChange={handleInputChange}
                className="budget-input"
                min="1"
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="date-input"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="date-input"
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          {/* Transport and Food */}
          <div className="form-row">
            <div className="form-group">
              <label>Primary Transport Mode</label>
              <select
                name="transportMode"
                value={formData.transportMode}
                onChange={handleInputChange}
                className="transport-select"
              >
                <option value="Flight">Flight</option>
                <option value="Train">Train</option>
                <option value="Bus">Bus</option>
                <option value="Car">Car</option>
                <option value="Own Vehicle">Own Vehicle</option>
                <option value="Mixed">Mixed Transport</option>
              </select>
            </div>

            <div className="form-group">
              <label>Food Preference *</label>
              <select
                name="foodPreference"
                value={formData.foodPreference}
                onChange={handleInputChange}
                className="food-select"
                required
              >
                <option value="">Select preference</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="No Preference">No Preference</option>
              </select>
            </div>
          </div>

          {/* Interests */}
          <div className="form-section">
            <label>Interests (Optional)</label>
            <div className="checkbox-grid">
              {["Adventure", "Culture", "Food", "History", "Nature", "Shopping", "Nightlife", "Art", "Photography", "Architecture"].map((interest) => (
                <label key={interest} className="checkbox-item">
                  <input
                    type="checkbox"
                    value={interest}
                    checked={formData.interests.includes(interest)}
                    onChange={(e) => handleCheckboxChange(e, "interests")}
                  />
                  <span className="checkmark"></span>
                  {interest}
                </label>
              ))}
            </div>
          </div>

          {/* Accessibility */}
          <div className="form-section">
            <label>Accessibility Needs (Optional)</label>
            <div className="checkbox-grid">
              {["Wheelchair Access", "Visual Assistance", "Hearing Assistance", "Mobility Support", "Differently-abled accommodation", "Senior citizens", "Children below 3 years"].map((need) => (
                <label key={need} className="checkbox-item">
                  <input
                    type="checkbox"
                    value={need}
                    checked={formData.accessibilityNeeds.includes(need)}
                    onChange={(e) => handleCheckboxChange(e, "accessibilityNeeds")}
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
                  Generating Multi-City Itinerary...
                </>
              ) : (
                "🗺️ Create Multi-Destination Journey"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-header ${modalType}`}>
              <h3>
                {modalType === "success" && "✅ Success"}
                {modalType === "error" && "❌ Error"}
                {modalType === "info" && "ℹ️ Information"}
              </h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p>{modalMessage}</p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn" onClick={closeModal}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiDestination;
