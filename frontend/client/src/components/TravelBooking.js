import React, { useState, useEffect } from 'react';
import './TravelBooking.css';

function TravelBooking() {
  const [formData, setFormData] = useState({
    destination: '',
    transportMode: 'Flight',
    budget: '',
    days: '',
    startDate: '',
    endDate: '',
    interests: [],
    foodPreference: '',
    accessibilityNeeds: [],
    travelers: 1,
    accommodation: '',
    travelClass: 'Economy'
  });

  const [popularDestinations] = useState([
    'Paris, France', 'Tokyo, Japan', 'New York, USA', 'London, UK', 
    'Dubai, UAE', 'Sydney, Australia', 'Rome, Italy', 'Barcelona, Spain'
  ]);

  const [estimatedCost, setEstimatedCost] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Calculate estimated cost based on form data
  useEffect(() => {
    let cost = 0;
    const budget = parseInt(formData.budget) || 0;
    const days = parseInt(formData.days) || 1;
    const travelers = parseInt(formData.travelers) || 1;

    // Base cost calculation
    if (budget > 0 && days > 0) {
      cost = (budget / days) * travelers;
      
      // Adjust based on transport mode
      switch (formData.transportMode) {
        case 'Flight':
          cost *= 1.2;
          break;
        case 'Train':
          cost *= 0.8;
          break;
        case 'Bus':
          cost *= 0.6;
          break;
        case 'Car Rental':
          cost *= 0.9;
          break;
        default:
          cost *= 0.7;
      }

      // Adjust based on travel class
      if (formData.travelClass === 'Business') cost *= 1.5;
      if (formData.travelClass === 'First') cost *= 2.0;
    }

    setEstimatedCost(Math.round(cost));
  }, [formData.budget, formData.days, formData.travelers, formData.transportMode, formData.travelClass]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleInterestChange = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAccessibilityChange = (need) => {
    setFormData(prev => ({
      ...prev,
      accessibilityNeeds: prev.accessibilityNeeds.includes(need)
        ? prev.accessibilityNeeds.filter(n => n !== need)
        : [...prev.accessibilityNeeds, need]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.destination || !formData.budget || !formData.days || !formData.startDate) {
      alert('Please fill in all required fields');
      return;
    }

    // Create trip summary
    const tripSummary = {
      ...formData,
      estimatedCost,
      bookingId: 'DD' + Date.now().toString().slice(-6),
      bookingDate: new Date().toLocaleDateString()
    };

    console.log('Travel booking data:', tripSummary);
    
    // Show success message
    alert(`🎉 Trip booked successfully!\n\nBooking ID: ${tripSummary.bookingId}\nDestination: ${formData.destination}\nEstimated Cost: $${estimatedCost}\n\nCheck your email for confirmation details!`);
  };

  const handleDestinationSuggestion = (destination) => {
    setFormData(prev => ({ ...prev, destination }));
    setShowSuggestions(false);
  };

  return (
    <div className="travel-booking">
      <div className="booking-container">
        <form onSubmit={handleSubmit} className="booking-form">
          {/* Transport Mode Selection */}
          <div className="transport-tabs">
            {['Flight', 'Train', 'Car Rental', 'Bus', 'Own Vehicle'].map((mode) => (
              <button
                key={mode}
                type="button"
                className={`transport-tab ${formData.transportMode === mode ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, transportMode: mode }))}
              >
                <div className="tab-icon">
                  {mode === 'Flight' && '✈️'}
                  {mode === 'Train' && '🚂'}
                  {mode === 'Car Rental' && '🚗'}
                  {mode === 'Bus' && '🚌'}
                  {mode === 'Own Vehicle' && '🚙'}
                </div>
                <span>{mode}</span>
              </button>
            ))}
          </div>

          {/* Travel Destination with Suggestions */}
          <div className="form-section">
            <label>Travel Destination(s) *</label>
            <div className="destination-wrapper">
              <input
                type="text"
                name="destination"
                placeholder="e.g., Paris, Rome, Tokyo"
                value={formData.destination}
                onChange={handleInputChange}
                onFocus={() => setShowSuggestions(true)}
                className="destination-input"
                required
              />
              {showSuggestions && (
                <div className="suggestions-dropdown">
                  <div className="suggestions-header">Popular Destinations</div>
                  {popularDestinations.map((dest, index) => (
                    <div 
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleDestinationSuggestion(dest)}
                    >
                      🌍 {dest}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Travel Details Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Mode of Transport *</label>
              <select
                name="transportMode"
                value={formData.transportMode}
                onChange={handleInputChange}
                className="transport-select"
                required
              >
                <option value="Flight">Flight</option>
                <option value="Train">Train</option>
                <option value="Car Rental">Car Rental</option>
                <option value="Bus">Bus</option>
                <option value="Own Vehicle">Own Vehicle</option>
              </select>
            </div>

            <div className="form-group">
              <label>Budget * ($)</label>
              <input
                type="number"
                name="budget"
                placeholder="2000"
                value={formData.budget}
                onChange={handleInputChange}
                className="budget-input"
                min="100"
                required
              />
            </div>

            <div className="form-group">
              <label>Number of Days *</label>
              <input
                type="number"
                name="days"
                placeholder="7"
                value={formData.days}
                onChange={handleInputChange}
                className="days-input"
                min="1"
                max="365"
                required
              />
            </div>
          </div>

          {/* Additional Travel Details */}
          <div className="form-row">
            <div className="form-group">
              <label>Number of Travelers</label>
              <select
                name="travelers"
                value={formData.travelers}
                onChange={handleInputChange}
                className="travelers-select"
              >
                {[1,2,3,4,5,6,7,8].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Traveler' : 'Travelers'}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Travel Class</label>
              <select
                name="travelClass"
                value={formData.travelClass}
                onChange={handleInputChange}
                className="class-select"
              >
                <option value="Economy">Economy</option>
                <option value="Business">Business</option>
                <option value="First">First Class</option>
              </select>
            </div>

            <div className="form-group">
              <label>Accommodation</label>
              <select
                name="accommodation"
                value={formData.accommodation}
                onChange={handleInputChange}
                className="accommodation-select"
              >
                <option value="">Select accommodation</option>
                <option value="Budget Hotel">Budget Hotel</option>
                <option value="3-Star Hotel">3-Star Hotel</option>
                <option value="4-Star Hotel">4-Star Hotel</option>
                <option value="5-Star Hotel">5-Star Hotel</option>
                <option value="Resort">Resort</option>
                <option value="Hostel">Hostel</option>
                <option value="Airbnb">Airbnb</option>
              </select>
            </div>
          </div>

          {/* Travel Dates */}
          <div className="form-row">
            <div className="form-group">
              <label>Departure Date *</label>
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
              <label>Return Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="date-input"
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>Estimated Cost</label>
              <div className="cost-display">
                <span className="cost-amount">${estimatedCost.toLocaleString()}</span>
                <small>For {formData.travelers} traveler(s)</small>
              </div>
            </div>
          </div>

          {/* Enhanced Interests */}
          <div className="form-section">
            <label>Travel Interests</label>
            <div className="checkbox-grid">
              {['Adventure', 'Culture', 'Relaxation', 'Photography', 'Food & Cuisine', 'Shopping', 'Nightlife', 'Nature & Wildlife', 'Historical Sites', 'Beach & Water Sports'].map((interest) => (
                <label key={interest} className="checkbox-label enhanced">
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest)}
                    onChange={() => handleInterestChange(interest)}
                  />
                  <span className="checkmark"></span>
                  <span className="interest-text">{interest}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Food Preference */}
          <div className="form-section">
            <label>Food Preference</label>
            <div className="radio-group">
              {['Veg', 'Non-Veg'].map((preference) => (
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
              {['Differently-abled accommodation', 'Senior citizens', 'Children under 3 years'].map((need) => (
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
