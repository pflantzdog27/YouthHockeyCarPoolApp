import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <Container maxWidth="md">
      <Box mt={5} textAlign="center">
        <Typography variant="h3" gutterBottom>
          Welcome to Youth Hockey Team Carpool
        </Typography>
        {token ? (
          <>
            <Typography variant="h5">You are logged in!</Typography>
            <Button variant="contained" color="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Typography variant="body1">Welcome to the Youth Hockey API!</Typography>
            <Box mt={2}>
              <Button variant="contained" color="primary" component={Link} to="/register">
                Register Here
              </Button>
            </Box>
            <Box mt={2}>
              <Button variant="outlined" color="primary" component={Link} to="/login">
                Login Here
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Home;
