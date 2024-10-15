import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './Theme';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Carpool from './pages/Carpool';
import RideRequest from './pages/RideRequest'; // Import the RideRequest page
import RideRequests from './pages/RideRequests';
import Navbar from './components/Navbar'; // Import the Navbar
import { NotificationProvider } from './utils/NotificationContext';


function App() {
  return (
    <ThemeProvider theme={theme}>
      <NotificationProvider>
        <Router>
          {/* Add Navbar here so it appears on all pages */}
          <Navbar />

          {/* Application Routes */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/carpool" element={<Carpool />} />
            <Route path="/ride-request" element={<RideRequest />} /> {/* New Route for Ride Request page */}
            <Route path="/ride-requests" element={<RideRequests />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;