// Backend Routes for Ride Requests (to be added in routes/rideRequests.js)
const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');
const RideRequest = require('../models/RideRequest');
const Carpool = require('../models/Carpool');

// Create a new ride request
router.post('/', authMiddleware, async (req, res) => {
  const { event, date, startLocation, endLocation } = req.body;

  try {
    const newRideRequest = new RideRequest({
      event,
      date,
      startLocation,
      endLocation,
      user: req.user.id,
    });

    const rideRequest = await newRideRequest.save();
    res.json(rideRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all open ride requests
router.get('/', authMiddleware, async (req, res) => {
  try {
    const rideRequests = await RideRequest.find({ status: 'open' }).populate('user', 'name email');
    res.json(rideRequests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Fulfill a ride request by creating a new carpool
router.post('/fulfill/:requestId', authMiddleware, async (req, res) => {
  try {
    const rideRequest = await RideRequest.findById(req.params.requestId);

    if (!rideRequest) {
      return res.status(404).json({ message: 'Ride request not found' });
    }

    // Create a new carpool from the ride request
    const newCarpool = new Carpool({
      event: rideRequest.event,
      driver: req.user.id,
      date: rideRequest.date,
      startLocation: rideRequest.startLocation,
      endLocation: rideRequest.endLocation,
    });

    const carpool = await newCarpool.save();

    // Update ride request status to fulfilled
    rideRequest.status = 'fulfilled';
    await rideRequest.save();

    res.json({ message: 'Ride request fulfilled and carpool created', carpool });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;