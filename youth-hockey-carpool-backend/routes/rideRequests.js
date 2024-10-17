// Backend Routes for Ride Requests (updated)
const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');
const RideRequest = require('../models/RideRequest');
const Carpool = require('../models/Carpool');
const mongoose = require('mongoose');

// Create a new ride request
router.post('/', authMiddleware, async (req, res) => {
  const { event, date, startLocation, endLocation } = req.body; 

  console.log('Received ride request data:', req.body);
  
  try {
      const newRideRequest = new RideRequest({
          event,
          date,
          startLocation,
          endLocation,
          requester: req.user.id,
      });

      const rideRequest = await newRideRequest.save();
      res.json(rideRequest);
  } catch (err) {
      console.error('Error Saving Ride Request:', err.message);
      res.status(500).send('Server error');
  }
});

// Get all ride requests
router.get('/', authMiddleware, async (req, res) => {
  try {
    const rideRequests = await RideRequest.find().populate('requester', '_id name email');
    res.json(rideRequests);
  } catch (err) {
    console.error('Error fetching ride requests:', err.message);
    res.status(500).send('Server error');
  }
});

// Accept a ride request
router.put('/ride-requests/:id/accept', authMiddleware, async (req, res) => {
  try {
    const rideRequest = await RideRequest.findById(req.params.id);
    if (!rideRequest) {
      return res.status(404).json({ message: 'Ride request not found' });
    }
    
    // Prevent the requester from accepting their own ride request
    if (rideRequest.requester.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot accept your own ride request' });
    }
    if (!rideRequest) {
      return res.status(404).json({ message: 'Ride request not found' });
    }

    // Update the status to accepted and set the acceptedBy field to the current user
    rideRequest.status = 'Accepted';
    rideRequest.acceptedBy = req.user.id;

    await rideRequest.save();
    await rideRequest.populate('acceptedBy', 'name email'); // Populate the user details for the acceptedBy field

    res.json({ acceptedBy: rideRequest.acceptedBy });
  } catch (err) {
    console.error('Error accepting ride request:', err);
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

// Add a note to a ride request
router.post('/ride-requests/:rideRequestId/notes', authMiddleware, async (req, res) => {
  try {
    const { rideRequestId } = req.params;
    const { content } = req.body;

    const rideRequest = await RideRequest.findById(rideRequestId);
    if (!rideRequest) {
      return res.status(404).json({ message: 'Ride request not found' });
    }

    const note = {
      user: req.user.id,
      content,
    };

    rideRequest.notes.push(note);
    await rideRequest.save();

    await rideRequest.populate('notes.user', 'name email');

    res.json({ notes: rideRequest.notes });
  } catch (err) {
    console.error('Error adding note:', err);
    res.status(500).send('Server error');
  }
});

// Cancel a ride request
router.put('/ride-requests/:rideRequestId/cancel', authMiddleware, async (req, res) => {
  console.log('Received cancellation request for ride request ID:', req.params.rideRequestId);
  try {
    const { rideRequestId } = req.params;

    // Check if the rideRequestId is valid
    if (!mongoose.Types.ObjectId.isValid(rideRequestId)) {
      console.log('Invalid ride request ID format:', rideRequestId);
      return res.status(400).json({ message: 'Invalid ride request ID format' });
    }

    const rideRequest = await RideRequest.findById(rideRequestId);
    if (!rideRequest) {
      console.log(`Ride request not found for ID: ${rideRequestId}`);
      return res.status(404).json({ message: 'Ride request not found' });
    }

    // Only allow the requester to cancel the ride request
    if (rideRequest.requester.toString() !== req.user.id.toString()) {
      console.log('Unauthorized cancellation attempt');
      return res.status(403).json({ message: 'You are not authorized to cancel this ride request' });
    }

    // Update the ride request status to cancelled
    rideRequest.status = 'cancelled';
    await rideRequest.save();

    console.log(`Ride request ${rideRequestId} cancelled successfully.`);
    res.json({ message: 'Ride request cancelled successfully', rideRequest });
  } catch (err) {
    console.log('Server error:', err.message);
    res.status(500).send('Server error');
  }
});

// Cancel acceptance of a ride request
router.put('/ride-requests/:id/unaccept', authMiddleware, async (req, res) => {
  try {
      const rideRequest = await RideRequest.findById(req.params.id);
      if (!rideRequest) {
          return res.status(404).json({ message: 'Ride request not found' });
      }

      // Verify that the user attempting to unaccept is the one who accepted the ride
      if (rideRequest.acceptedBy?.toString() !== req.user.id) {
          return res.status(403).json({ message: 'You are not authorized to unaccept this ride request' });
      }

      // Update the ride request status to 'Pending' and remove the acceptedBy field
      rideRequest.status = 'Pending';
      rideRequest.acceptedBy = null;

      await rideRequest.save();
      res.json({ message: 'Acceptance cancelled successfully', rideRequest });
  } catch (err) {
      console.error('Error cancelling acceptance:', err);
      res.status(500).send('Server error');
  }
});


module.exports = router;
