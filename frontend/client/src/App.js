
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import Login from './components/Login';
import SignUp from './components/SignUp';
import TravelBooking from './components/TravelBooking';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/travel-booking" element={<TravelBooking />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
