import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import TravelBooking from "./components/TravelBooking";
import UserDashboard from "./components/UserDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* User Dashboard - Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:section"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Protect travel-booking */}
        <Route
          path="/travel-booking"
          element={
            <ProtectedRoute>
              <TravelBooking />
            </ProtectedRoute>
          }
        />

        {/* Protect multi-destination */}
        <Route
          path="/multi-destination"
          element={
            <ProtectedRoute>
              <MultiDestination />
            </ProtectedRoute>
          }
        />

        {/* Protect itinerary display */}
        <Route
          path="/itinerary"
          element={
            <ProtectedRoute>
              <ItineraryDisplay />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
