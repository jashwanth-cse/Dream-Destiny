import React from 'react';
import './TravelPreferences.css';
import { FaCalendarAlt, FaWallet, FaTrain, FaUtensils } from 'react-icons/fa';

const TravelPreferences = ({ preferences = {} }) => {
  const {
    dates = "Dec 15 - Dec 20",
    budget = "₹50,000 - ₹75,000",
    transport = "Train, Bus",
    food = "Vegetarian"
  } = preferences;

  return (
    <div className="travel-preferences">
      <div className="preferences-header">
        <h2>Travel Preferences</h2>
      </div>
      
      <div className="preferences-tags">
        <div className="preference-tag calendar-tag">
          <FaCalendarAlt className="tag-icon" />
          <span>{dates}</span>
        </div>
        
        <div className="preference-tag budget-tag">
          <FaWallet className="tag-icon" />
          <span>{budget}</span>
        </div>
        
        <div className="preference-tag transport-tag">
          <FaTrain className="tag-icon" />
          <span>{transport}</span>
        </div>
        
        <div className="preference-tag food-tag">
          <FaUtensils className="tag-icon" />
          <span>{food}</span>
        </div>
      </div>
    </div>
  );
};

export default TravelPreferences;
