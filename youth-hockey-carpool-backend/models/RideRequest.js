// RideRequest model (to be added in a new file, e.g., models/RideRequest.js)
const mongoose = require('mongoose');

const RideRequestSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startLocation: {
    type: String,
    required: true,
  },
  endLocation: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'fulfilled'],
    default: 'open',
  },
}, { timestamps: true });

module.exports = mongoose.model('RideRequest', RideRequestSchema);