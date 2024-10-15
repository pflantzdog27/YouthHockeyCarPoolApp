// RideRequestForm Component (to be added in frontend)
import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Grid, Snackbar, Alert } from '@mui/material';
import api from '../utils/api';

const RideRequestForm = () => {
  const [formData, setFormData] = useState({
    event: '',
    date: '',
    startLocation: '',
    endLocation: '',
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const { event, date, startLocation, endLocation } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRequestRide = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/carpool/ride-requests', formData);
      setNotification({ open: true, message: 'Ride request created successfully!', severity: 'success' });
      setFormData({ event: '', date: '', startLocation: '', endLocation: '' });
    } catch (err) {
      console.error('Error creating ride request:', err);
      setNotification({ open: true, message: 'Error creating ride request!', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="md">
      <Box mt={5} mb={3}>
        <Typography variant="h4" align="center">
          Request a Ride
        </Typography>
      </Box>
      <form onSubmit={handleRequestRide}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Event"
              name="event"
              value={event}
              onChange={onChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Date"
              name="date"
              type="date"
              value={date}
              onChange={onChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Start Location"
              name="startLocation"
              value={startLocation}
              onChange={onChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="End Location"
              name="endLocation"
              value={endLocation}
              onChange={onChange}
              fullWidth
              required
            />
          </Grid>
        </Grid>
        <Box mt={3} textAlign="center">
          <Button type="submit" variant="contained" color="primary">
            Request Ride
          </Button>
        </Box>
      </form>
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RideRequestForm;