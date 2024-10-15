import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Container, Typography, TextField, Button, Box, Card, CardContent, CardActions, Grid, CircularProgress, Snackbar, Alert } from '@mui/material';

const Carpool = () => {
  const [carpools, setCarpools] = useState([]);
  const [formData, setFormData] = useState({
    event: '',
    date: '',
    startLocation: '',
    endLocation: '',
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const { event, date, startLocation, endLocation } = formData;

  useEffect(() => {
    fetchCarpools();
  }, []);

  const fetchCarpools = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/carpools');
      setCarpools(response.data);
    } catch (err) {
      console.error('Error fetching carpools:', err);
      setNotification({ open: true, message: 'Error fetching carpools!', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateCarpool = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/api/carpools', formData);
      setCarpools([...carpools, response.data]);
      setNotification({ open: true, message: 'Carpool created successfully!', severity: 'success' });
      setFormData({ event: '', date: '', startLocation: '', endLocation: '' });
    } catch (err) {
      console.error('Error creating carpool:', err);
      setNotification({ open: true, message: 'Error creating carpool!', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCarpool = async (carpoolId) => {
    setLoading(true);
    try {
      await api.put(`/api/carpools/join/${carpoolId}`);
      setNotification({ open: true, message: 'Successfully joined the carpool!', severity: 'success' });
      fetchCarpools();
    } catch (err) {
      console.error('Error joining carpool:', err);
      setNotification({ open: true, message: 'Error joining carpool!', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCarpool = async (carpoolId) => {
    setLoading(true);
    try {
      await api.put(`/api/carpools/leave/${carpoolId}`);
      setNotification({ open: true, message: 'Successfully left the carpool!', severity: 'success' });
      fetchCarpools();
    } catch (err) {
      console.error('Error leaving carpool:', err);
      setNotification({ open: true, message: 'Error leaving carpool!', severity: 'error' });
    } finally {
      setLoading(false);
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
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create Carpool'}
          </Button>
        </Box>
      </form>

      <Box mt={5} mb={3}>
        <Typography variant="h4" align="center">
          Available Carpools
        </Typography>
      </Box>
      {loading ? (
        <Box textAlign="center" mt={3}>
          <CircularProgress />
        </Box>
      ) : (
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
                    Driver: {carpool.driver.name}
                  </Typography>
                  <Typography variant="body2" component="p">
                    Passengers: {carpool.passengers.length > 0 ? carpool.passengers.map((p) => p.name).join(', ') : 'No passengers yet'}
                  </Typography>
                </CardContent>
                <CardActions>
                  {carpool.passengers.some((p) => p._id === localStorage.getItem('user_id')) ? (
                    <Button size="small" color="secondary" onClick={() => handleLeaveCarpool(carpool._id)} disabled={loading}>
                      Leave Carpool
                    </Button>
                  ) : (
                    <Button size="small" color="primary" onClick={() => handleJoinCarpool(carpool._id)} disabled={loading}>
                      Join Carpool
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
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

export default Carpool;