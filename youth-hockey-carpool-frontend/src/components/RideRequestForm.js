import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, TextField, Button, Box, Grid, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import '../App.css'; 

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const RideRequestForm = () => {
    const [formData, setFormData] = useState({
        event: '',
        date: '',
        startLocation: '',
        endLocation: '',
    });
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const navigate = useNavigate();
    const geocoderContainerRef = useRef(null);
    const geocoderRef = useRef(null);  // Reference to store geocoder instance
    const { event, date, endLocation } = formData;

    useEffect(() => {
        if (geocoderContainerRef.current) {
            // Clear existing content in geocoder container before adding the geocoder
            geocoderContainerRef.current.innerHTML = '';

            // Initialize geocoder only if it hasn't been initialized yet
            if (!geocoderRef.current) {
                const geocoder = new MapboxGeocoder({
                    accessToken: mapboxgl.accessToken,
                    placeholder: 'Enter pickup location',
                    mapboxgl: mapboxgl,
                    marker: false,
                });

                geocoder.addTo(geocoderContainerRef.current);
                geocoderRef.current = geocoder;  // Save the geocoder instance to prevent reinitialization

                geocoder.on('result', (e) => {
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        startLocation: e.result.place_name,
                    }));
                });

                geocoder.on('error', (e) => {
                    console.error('Geocoder error:', e);
                });
            }
        }

        // Cleanup function to remove geocoder when the component unmounts
        return () => {
            if (geocoderRef.current) {
                geocoderRef.current.clear();  // Explicitly clear the geocoder instance
                geocoderRef.current = null;  // Set the reference to null for future checks
            }
        };
    }, []);

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRequestRide = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/carpools/ride-requests', {
                event,
                date,
                startLocation: formData.startLocation,
                endLocation,
            });
            setNotification({ open: true, message: 'Ride request created successfully!', severity: 'success' });
            setTimeout(() => navigate('/ride-requests'), 1000);
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
                        <Box ref={geocoderContainerRef} mb={3} />
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
