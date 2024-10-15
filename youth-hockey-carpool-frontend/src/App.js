import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './Theme';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Carpool from './pages/Carpool';
import RideRequest from './pages/RideRequest'; // Import the RideRequest page
import Navbar from './components/Navbar'; // Import the Navbar

function App() {
  return (
    <ThemeProvider theme={theme}>
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
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;