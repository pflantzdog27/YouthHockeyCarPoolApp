import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './Theme';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Carpool from './pages/Carpool';

// Add a new route for carpools
<Route path="/carpool" element={<Carpool />} />


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/carpool" element={<Carpool />} />  // Route for the carpool page
      </Routes>
    </Router>
  );
}

export default App;
