const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NoteSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const RideRequestSchema = new Schema({
    event: String,
    date: Date,
    startLocation: String,
    endLocation: String,
    requester: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    acceptedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Declined'],
        default: 'Pending',
    },
    notes: [NoteSchema],
});

module.exports = mongoose.model('RideRequest', RideRequestSchema);
