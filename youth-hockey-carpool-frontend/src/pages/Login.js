import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { email, password } = formData;
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/login', { email, password });

      // Save the JWT token to localStorage
      const token = response.data.token;
      console.log('Received Token:', token);
      localStorage.setItem('token', token);

      // Decode the JWT to extract the user ID
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      console.log('Decoded Token:', decodedToken);
      localStorage.setItem('user_id', decodedToken.user.id);

      // Navigate to the home page
      navigate('/');
    } catch (err) {
      console.error('Error logging in:', err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5} mb={3}>
        <Typography variant="h4" align="center">
          Login
        </Typography>
      </Box>
      <form onSubmit={handleLogin}>
        <Box mb={2}>
          <TextField
            label="Email"
            name="email"
            value={email}
            onChange={onChange}
            fullWidth
            required
          />
        </Box>
        <Box mb={2}>
          <TextField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={onChange}
            fullWidth
            required
          />
        </Box>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Login
        </Button>
      </form>
    </Container>
  );
};

export default Login;
