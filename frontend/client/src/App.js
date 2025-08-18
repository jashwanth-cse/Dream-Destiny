import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import TravelBooking from "./components/TravelBooking";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protect travel-booking */}
        <Route
          path="/travel-booking"
          element={
            <ProtectedRoute>
              <TravelBooking />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
