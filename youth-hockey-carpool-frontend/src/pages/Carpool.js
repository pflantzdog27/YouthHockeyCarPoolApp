import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Container, Typography, TextField, Button, Box, Card, CardContent, CardActions, Grid } from '@mui/material';

const Carpool = () => {
  const [carpools, setCarpools] = useState([]);
  const [formData, setFormData] = useState({
    event: '',
    date: '',
    startLocation: '',
    endLocation: '',
  });
  const { event, date, startLocation, endLocation } = formData;
  const userId = localStorage.getItem('user_id'); // Get the logged-in user's ID

  useEffect(() => {
    fetchCarpools();
  }, []);

  const fetchCarpools = async () => {
    try {
      const response = await api.get('/api/carpools');
      setCarpools(response.data);
    } catch (err) {
      console.error('Error fetching carpools:', err);
    }
  };

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateCarpool = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/carpools', formData);
      setCarpools([...carpools, response.data]);
      setFormData({ event: '', date: '', startLocation: '', endLocation: '' });
    } catch (err) {
      console.error('Error creating carpool:', err);
    }
  };

  const handleJoinCarpool = async (carpoolId) => {
    try {
      await api.put(`/api/carpools/join/${carpoolId}`);
      fetchCarpools();
    } catch (err) {
      console.error('Error joining carpool:', err);
    }
  };

  const handleLeaveCarpool = async (carpoolId) => {
    try {
      await api.put(`/api/carpools/leave/${carpoolId}`);
      fetchCarpools();
    } catch (err) {
      console.error('Error leaving carpool:', err);
    }
  };

  return (
    <Container maxWidth="md">
      <Box mt={5} mb={3}>
        <Typography variant="h4" align="center">
          Create a Carpool
        </Typography>
      </Box>
      <form onSubmit={handleCreateCarpool}>
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
            Create Carpool
          </Button>
        </Box>
      </form>

      <Box mt={5} mb={3}>
        <Typography variant="h4" align="center">
          Available Carpools
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {carpools.map((carpool) => (
          <Grid item xs={12} key={carpool._id}>
            <Card>
              <CardContent>
                <Typography variant="h5">{carpool.event}</Typography>
                <Typography color="textSecondary">
                  on {new Date(carpool.date).toLocaleDateString()} from {carpool.startLocation} to {carpool.endLocation}
                </Typography>
                <Typography variant="body2" component="p">
                  Driver: {carpool.driver?.name || 'N/A'}
                </Typography>
                <Typography variant="body2" component="p">
                  Passengers: {carpool.passengers.length > 0 ? carpool.passengers.map((p) => p.name).join(', ') : 'No passengers yet'}
                </Typography>
              </CardContent>
              <CardActions>
                {carpool.passengers.some((p) => p._id === userId) ? (
                  <Button size="small" color="secondary" onClick={() => handleLeaveCarpool(carpool._id)}>
                    Leave Carpool
                  </Button>
                ) : (
                  <Button size="small" color="primary" onClick={() => handleJoinCarpool(carpool._id)}>
                    Join Carpool
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Carpool;
