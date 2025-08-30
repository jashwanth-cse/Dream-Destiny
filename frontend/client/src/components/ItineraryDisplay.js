import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import "./ItineraryDisplay.css";

function ItineraryDisplay() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  
  // Load itinerary data from sessionStorage or navigation state
  const loadItineraryData = () => {
    const savedData = sessionStorage.getItem('currentItinerary');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return {
        currentItinerary: parsed.currentItinerary,
        originalItinerary: parsed.originalItinerary,
        tripDetails: parsed.tripDetails
      };
    }
    // Fallback to navigation state
    return {
      currentItinerary: location.state?.itinerary || "",
      originalItinerary: location.state?.itinerary || "",
      tripDetails: location.state?.tripDetails || {}
    };
  };

  const itineraryData = loadItineraryData();
  const [currentItinerary, setCurrentItinerary] = useState(itineraryData.currentItinerary);
  const [originalItinerary] = useState(itineraryData.originalItinerary);
  const [tripDetails] = useState(itineraryData.tripDetails);

  // Comparison functionality
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonItinerary, setComparisonItinerary] = useState("");
  
  // Chat functionality
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Modal states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success");



  // Save itinerary data to sessionStorage whenever it changes
  useEffect(() => {
    if (currentItinerary && originalItinerary) {
      const dataToSave = {
        currentItinerary,
        originalItinerary,
        tripDetails,
        timestamp: new Date().toISOString()
      };
      sessionStorage.setItem('currentItinerary', JSON.stringify(dataToSave));
    }
  }, [currentItinerary, originalItinerary, tripDetails]);

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Redirect if no itinerary data
  useEffect(() => {
    if (!loading && !currentItinerary) {
      // Clear any stale data and redirect
      sessionStorage.removeItem('currentItinerary');
      navigate("/travel-booking");
    }
  }, [loading, currentItinerary, navigate]);

  // Helper function to show modal
  const showMessage = (message, type = "success") => {
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
      // Clear saved itinerary data on logout
      sessionStorage.removeItem('currentItinerary');
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error.message);
    }
  };

  // Handle back to booking (clear saved data for new trip)
  const handleBackToBooking = () => {
    sessionStorage.removeItem('currentItinerary');
    navigate("/travel-booking");
  };

  // Parse structured itinerary into days
  const parseItinerary = (itinerary) => {
    const lines = itinerary.split('\n').filter(line => line.trim());
    const days = [];
    let currentDay = null;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.match(/^Day \d+/i)) {
        if (currentDay) {
          days.push(currentDay);
        }
        currentDay = {
          title: trimmedLine,
          morning: "",
          afternoon: "",
          evening: "",
          meals: "",
          accommodation: "",
          activities: []
        };
      } else if (currentDay && trimmedLine) {
        if (trimmedLine.startsWith('Morning:')) {
          currentDay.morning = trimmedLine.replace('Morning:', '').trim();
        } else if (trimmedLine.startsWith('Afternoon:')) {
          currentDay.afternoon = trimmedLine.replace('Afternoon:', '').trim();
        } else if (trimmedLine.startsWith('Evening:')) {
          currentDay.evening = trimmedLine.replace('Evening:', '').trim();
        } else if (trimmedLine.startsWith('Meals:')) {
          currentDay.meals = trimmedLine.replace('Meals:', '').trim();
        } else if (trimmedLine.startsWith('Accommodation:')) {
          currentDay.accommodation = trimmedLine.replace('Accommodation:', '').trim();
        } else {
          // Fallback for any other activities
          currentDay.activities.push(trimmedLine);
        }
      }
    });

    if (currentDay) {
      days.push(currentDay);
    }

    return days;
  };

  const parsedDays = parseItinerary(currentItinerary);
  const parsedComparisonDays = comparisonItinerary ? parseItinerary(comparisonItinerary) : [];

  // Save itinerary functionality
  const handleSaveItinerary = () => {
    const itineraryText = `Trip to ${tripDetails.destination}\nBudget: ₹${tripDetails.budget} INR\nDuration: ${tripDetails.days} days\n\n${currentItinerary}`;
    const blob = new Blob([itineraryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tripDetails.destination || 'Trip'}_Itinerary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showMessage("Itinerary saved successfully!", "success");
    setShowSaveModal(false);
  };

  // Send follow-up message to modify itinerary
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      type: 'user',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsSendingMessage(true);
    setNewMessage("");

    try {
      const response = await fetch(`/chat/followup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMessage,
          originalItinerary: currentItinerary
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Chat response data:", data); // Debug log

      if (data.type === 'itinerary_update' && data.modified_itinerary) {
        // Store current itinerary for comparison
        setComparisonItinerary(currentItinerary);
        // Update current itinerary
        setCurrentItinerary(data.modified_itinerary);

        const aiMessage = {
          type: 'ai',
          content: data.chat_response || "I've updated your itinerary based on your request.",
          timestamp: new Date().toLocaleTimeString(),
          hasItineraryUpdate: true
        };

        setChatMessages(prev => [...prev, aiMessage]);

        // Show comparison option
        setShowComparison(true);
        showMessage("Itinerary updated! You can now compare versions.", "success");
      } else {
        const aiMessage = {
          type: 'ai',
          content: data.response || "I'm sorry, I couldn't process your request. Please try again.",
          timestamp: new Date().toLocaleTimeString()
        };

        setChatMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        type: 'ai',
        content: "Sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Comparison functions
  const selectOriginalItinerary = () => {
    setCurrentItinerary(originalItinerary);
    setShowComparison(false);
    setComparisonItinerary("");
    showMessage("Reverted to original itinerary", "info");
  };

  const selectModifiedItinerary = () => {
    setShowComparison(false);
    setComparisonItinerary("");
    showMessage("Keeping modified itinerary", "success");
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="itinerary-page">
      <div className="main-content">
        {/* Header */}
        <header className="itinerary-header">
          <div className="header-content">
            <button className="back-btn" onClick={handleBackToBooking}>
              ← Back to Booking
            </button>
            <h1>Your Dream Itinerary</h1>
            <div className="header-actions">
              <button className="save-btn" onClick={() => setShowSaveModal(true)}>
                💾 Save Itinerary
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </header>

        {/* Trip Summary */}
        <section className="trip-summary">
          <div className="summary-content">
            <h2>🎯 {tripDetails.destination || 'Your Destination'}</h2>
            <div className="trip-details">
              <span>📅 {tripDetails.days || 'N/A'} Days</span>
              <span>💰 ₹{tripDetails.budget || 'N/A'} INR</span>
              <span>🚗 {tripDetails.transportMode || 'N/A'}</span>
              <span>🍽️ {tripDetails.foodPreference || 'N/A'}</span>
            </div>
          </div>
        </section>

        {/* Itinerary Display */}
        <section className="itinerary-content">
          <div className="days-container">
            {parsedDays.map((day, index) => (
              <div key={index} className="day-card" data-day={index + 1}>
                <div className="day-header">
                  <h3>{day.title}</h3>
                  <span className="day-number">{index + 1}</span>
                </div>
                <div className="day-activities">
                  {day.morning && (
                    <div className="activity-section">
                      <h4 className="activity-time">🌅 Morning</h4>
                      <p className="activity-text">{day.morning}</p>
                    </div>
                  )}
                  {day.afternoon && (
                    <div className="activity-section">
                      <h4 className="activity-time">☀️ Afternoon</h4>
                      <p className="activity-text">{day.afternoon}</p>
                    </div>
                  )}
                  {day.evening && (
                    <div className="activity-section">
                      <h4 className="activity-time">🌆 Evening</h4>
                      <p className="activity-text">{day.evening}</p>
                    </div>
                  )}
                  {day.meals && (
                    <div className="activity-section">
                      <h4 className="activity-time">🍽️ Meals</h4>
                      <p className="activity-text">{day.meals}</p>
                    </div>
                  )}
                  {day.accommodation && (
                    <div className="activity-section">
                      <h4 className="activity-time">🏨 Accommodation</h4>
                      <p className="activity-text">{day.accommodation}</p>
                    </div>
                  )}
                  {day.activities.map((activity, actIndex) => (
                    <div key={actIndex} className="activity-item">
                      <span className="activity-bullet">•</span>
                      <span className="activity-text">{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Chat Section */}
      <section className="chat-section">
        <div className="chat-header">
          <h3>💬 Modify Your Itinerary</h3>
          <p>Ask questions or request changes to your itinerary</p>
        </div>
        
        <div className="chat-messages">
          {chatMessages.length === 0 ? (
            <div className="chat-placeholder">
              <p>👋 Hi! I'm here to help you modify your itinerary.</p>
              <p>You can ask me to:</p>
              <ul>
                <li>Add more activities to a specific day</li>
                <li>Change restaurant recommendations</li>
                <li>Suggest alternative attractions</li>
                <li>Adjust timing or budget</li>
              </ul>
            </div>
          ) : (
            chatMessages.map((message, index) => (
              <div key={index} className={`chat-message ${message.type}`}>
                <div className="message-content">
                  <p>{message.content}</p>
                  <span className="message-time">{message.timestamp}</span>
                </div>
              </div>
            ))
          )}
          {isSendingMessage && (
            <div className="chat-message ai">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask me to modify your itinerary..."
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isSendingMessage}
          />
          <button 
            onClick={handleSendMessage} 
            disabled={isSendingMessage || !newMessage.trim()}
            className="send-btn"
          >
            {isSendingMessage ? '⏳' : '📤'}
          </button>
        </div>
      </section>

      {/* Save Confirmation Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header success">
              <h3>💾 Save Itinerary</h3>
              <button className="modal-close" onClick={() => setShowSaveModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Download your itinerary as a text file?</p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowSaveModal(false)}>
                Cancel
              </button>
              <button className="modal-btn primary" onClick={handleSaveItinerary}>
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General Modal */}
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
              <button className="modal-btn primary" onClick={closeModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showComparison && (
        <div className="modal-overlay" onClick={() => setShowComparison(false)}>
          <div className="comparison-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header info">
              <h3>🔄 Compare Itineraries</h3>
              <button className="modal-close" onClick={() => setShowComparison(false)}>×</button>
            </div>
            <div className="comparison-body">
              <p className="comparison-instruction">Your itinerary has been updated. Compare both versions and choose which one to keep:</p>

              <div className="comparison-container">
                {/* Original Itinerary */}
                <div className="comparison-column">
                  <h4 className="comparison-title original">📋 Original Itinerary</h4>
                  <div className="comparison-content">
                    {parsedComparisonDays.map((day, index) => (
                      <div key={index} className="comparison-day-card">
                        <div className="comparison-day-header">
                          <h5>{day.title}</h5>
                        </div>
                        <div className="comparison-day-activities">
                          {day.morning && (
                            <div className="comparison-activity">
                              <span className="comparison-time">🌅 Morning:</span>
                              <span className="comparison-text">{day.morning}</span>
                            </div>
                          )}
                          {day.afternoon && (
                            <div className="comparison-activity">
                              <span className="comparison-time">☀️ Afternoon:</span>
                              <span className="comparison-text">{day.afternoon}</span>
                            </div>
                          )}
                          {day.evening && (
                            <div className="comparison-activity">
                              <span className="comparison-time">🌆 Evening:</span>
                              <span className="comparison-text">{day.evening}</span>
                            </div>
                          )}
                          {day.meals && (
                            <div className="comparison-activity">
                              <span className="comparison-time">🍽️ Meals:</span>
                              <span className="comparison-text">{day.meals}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="comparison-select-btn original" onClick={selectOriginalItinerary}>
                    Select Original
                  </button>
                </div>

                {/* Modified Itinerary */}
                <div className="comparison-column">
                  <h4 className="comparison-title modified">✨ Modified Itinerary</h4>
                  <div className="comparison-content">
                    {parsedDays.map((day, index) => (
                      <div key={index} className="comparison-day-card">
                        <div className="comparison-day-header">
                          <h5>{day.title}</h5>
                        </div>
                        <div className="comparison-day-activities">
                          {day.morning && (
                            <div className="comparison-activity">
                              <span className="comparison-time">🌅 Morning:</span>
                              <span className="comparison-text">{day.morning}</span>
                            </div>
                          )}
                          {day.afternoon && (
                            <div className="comparison-activity">
                              <span className="comparison-time">☀️ Afternoon:</span>
                              <span className="comparison-text">{day.afternoon}</span>
                            </div>
                          )}
                          {day.evening && (
                            <div className="comparison-activity">
                              <span className="comparison-time">🌆 Evening:</span>
                              <span className="comparison-text">{day.evening}</span>
                            </div>
                          )}
                          {day.meals && (
                            <div className="comparison-activity">
                              <span className="comparison-time">🍽️ Meals:</span>
                              <span className="comparison-text">{day.meals}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="comparison-select-btn modified" onClick={selectModifiedItinerary}>
                    Select Modified
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItineraryDisplay;