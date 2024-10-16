const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');
const Carpool = require('../models/Carpool');
const RideRequest = require('../models/RideRequest');

// Create a new carpool (only for logged-in users)
router.post('/', authMiddleware, async (req, res) => {
    const { event, date, startLocation, endLocation } = req.body;

    try {
        const newCarpool = new Carpool({
            event,
            driver: req.user.id,
            date,
            startLocation,
            endLocation,
        });

        const carpool = await newCarpool.save();
        res.json(carpool);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get all carpools
router.get('/', authMiddleware, async (req, res) => {
    try {
        const carpools = await Carpool.find()
            .populate('driver', 'name email')  // Populate the driver's name and email
            .populate('passengers', 'name email');  // Populate passengers' names and emails
        res.json(carpools);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Join an existing carpool
router.put('/join/:carpoolId', authMiddleware, async (req, res) => {
    try {
        const carpool = await Carpool.findById(req.params.carpoolId);

        if (!carpool) {
            return res.status(404).json({ message: 'Carpool not found' });
        }

        // Check if the user is already the driver
        if (carpool.driver.toString() === req.user.id) {
            return res.status(400).json({ message: 'Driver cannot join their own carpool as a passenger' });
        }

        // Check if the user is already a passenger
        if (carpool.passengers.includes(req.user.id)) {
            return res.status(400).json({ message: 'You are already a passenger in this carpool' });
        }

        // Add user to the passengers list
        carpool.passengers.push(req.user.id);
        await carpool.save();

        res.json({ message: 'Successfully joined the carpool', carpool });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Leave an existing carpool
router.put('/leave/:carpoolId', authMiddleware, async (req, res) => {
    try {
        const carpool = await Carpool.findById(req.params.carpoolId);

        if (!carpool) {
            return res.status(404).json({ message: 'Carpool not found' });
        }

        // Check if the user is in the passengers list
        if (!carpool.passengers.includes(req.user.id)) {
            return res.status(400).json({ message: 'You are not a passenger in this carpool' });
        }

        // Remove user from passengers list
        carpool.passengers = carpool.passengers.filter(
            (passengerId) => passengerId.toString() !== req.user.id
        );

        await carpool.save();

        res.json({ message: 'Successfully left the carpool', carpool });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Create a new ride request (only for logged-in users)
router.post('/ride-requests', authMiddleware, async (req, res) => {
    const { event, date, startLocation, endLocation } = req.body;

    console.log("Received Ride Request Data:", req.body);

    try {
        const newRideRequest = new RideRequest({
            event,
            requester: req.user.id,
            date,
            startLocation,
            endLocation,
            status: 'Pending'
        });

        const rideRequest = await newRideRequest.save();
        console.log("Ride Request Saved:", rideRequest);
        res.json(rideRequest);
    } catch (err) {
        console.error('Error Saving Ride Request:', err.message);
        res.status(500).send('Server error');
    }
});

// Get all ride requests (only for logged-in users)
router.get('/ride-requests', authMiddleware, async (req, res) => {
    try {
        const rideRequests = await RideRequest.find()
            .populate('requester', 'name email')  // Populate requester's name and email
            .populate('acceptedBy', 'name email');  // Populate acceptedBy's name and email

        res.json(rideRequests);
    } catch (err) {
        console.error('Error fetching ride requests:', err.message);
        res.status(500).send('Server error');
    }
});

// Cancel ride request (only for logged-in users who requested or accepted the ride)
router.delete('/ride-requests/:rideRequestId', authMiddleware, async (req, res) => {
    try {
        const rideRequest = await RideRequest.findById(req.params.rideRequestId);
        
        if (!rideRequest) {
            return res.status(404).json({ message: 'Ride request not found' });
        }

        if (rideRequest.requester.toString() !== req.user.id && (!rideRequest.acceptedBy || rideRequest.acceptedBy.toString() !== req.user.id)) {
            return res.status(403).json({ message: 'Not authorized to cancel this ride request' });
        }

        await RideRequest.findByIdAndDelete(req.params.rideRequestId);
        res.json({ message: 'Ride request cancelled successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// Update ride request status and assign acceptedBy
router.put('/ride-requests/:rideRequestId/status', authMiddleware, async (req, res) => {
    const { status } = req.body;
    try {
        const rideRequest = await RideRequest.findById(req.params.rideRequestId);

        if (!rideRequest) {
            return res.status(404).json({ message: 'Ride request not found' });
        }

        rideRequest.status = status;
        if (status === 'Accepted') {
            rideRequest.acceptedBy = req.user.id;
        }
        await rideRequest.save();

        res.json({ message: 'Ride request status updated', rideRequest });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Add a note to a ride request
router.post('/ride-requests/:rideRequestId/notes', authMiddleware, async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Note content is required' });
    }

    try {
        const rideRequest = await RideRequest.findById(req.params.rideRequestId);

        if (!rideRequest) {
            return res.status(404).json({ message: 'Ride request not found' });
        }

        const newNote = {
            content,
            author: req.user.id,
            createdAt: new Date(),
        };

        rideRequest.notes.push(newNote);
        await rideRequest.save();

        res.json({ message: 'Note added successfully', notes: rideRequest.notes });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;