import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, TextField, Box, Card, CardContent, CardActions } from '@mui/material';
import { useNotification } from '../utils/NotificationContext';
import api from '../utils/api';
import { useAuth } from '../utils/AuthContext';

const RideRequests = () => {
    const [rideRequests, setRideRequests] = useState([]);
    const [newNote, setNewNote] = useState('');
    const showNotification = useNotification();
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchRideRequests = async () => {
            try {
                const res = await api.get('/api/carpools/ride-requests');
                setRideRequests(res.data);
            } catch (err) {
                console.error('Error fetching ride requests:', err);
            }
        };
        fetchRideRequests();
    }, []);

    const handleAccept = async (id) => {
        try {
            const res = await api.put(`/api/carpools/ride-requests/${id}/accept`);
            setRideRequests(rideRequests.map(request => request._id === id ? { ...request, status: 'Accepted', acceptedBy: res.data.acceptedBy } : request));
            showNotification('Ride request accepted', 'success');
        } catch (err) {
            console.error('Error accepting ride request:', err);
            showNotification('Error accepting ride request', 'error');
        }
    };

    const handleCancel = async (id) => {
        try {
            await api.put(`/api/carpools/ride-requests/${id}/cancel`);
            setRideRequests(rideRequests.map(request => request._id === id ? { ...request, status: 'Cancelled', acceptedBy: null } : request));
            showNotification('Ride request cancelled', 'success');
        } catch (err) {
            console.error('Error cancelling ride request:', err);
            showNotification('Error cancelling ride request', 'error');
        }
    };

    const addNote = async (rideRequestId) => {
        if (!newNote.trim()) return;
        try {
            const res = await api.post(`/api/carpools/ride-requests/${rideRequestId}/notes`, {
                content: newNote,
            });
            setRideRequests((prevRequests) =>
                prevRequests.map((request) =>
                    request._id === rideRequestId ? { ...request, notes: res.data.notes } : request
                )
            );
            setNewNote('');
            showNotification('Note added successfully', 'success');
        } catch (err) {
            console.error('Error adding note:', err);
            showNotification('Error adding note', 'error');
        }
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" align="center" gutterBottom>
                Ride Requests
            </Typography>
            {rideRequests.map(request => (
                <Card key={request._id} variant="outlined" style={{ marginBottom: '16px' }}>
                    <CardContent>
                        <Typography variant="h6">{request.event}</Typography>
                        <Typography>Date: {new Date(request.date).toLocaleDateString()}</Typography>
                        <Typography>From: {request.startLocation} To: {request.endLocation}</Typography>
                        <Typography>Status: {request.status}</Typography>
                        {request.acceptedBy && (
                            <Typography>Accepted by: {request.acceptedBy.name ? request.acceptedBy.name : 'Unknown User'}</Typography>
                        )}
                        {request.notes && request.notes.map((note, index) => (
                            <Typography key={index}>
                                {note.user && note.user.name ? `${note.user.name}:` : 'Unknown User:'} {note.content}
                            </Typography>
                        ))}
                    </CardContent>
                    <CardActions>
                        {request.status === 'Pending' && currentUserId !== request.requester && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleStatusChange(request._id, 'Accepted')}
                            >
                                Accept
                            </Button>
                        )}
                        {(currentUserId === request.requester || currentUserId === request.acceptedBy?._id) && (
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => handleCancel(request._id)}
                            >
                                Cancel
                            </Button>
                        )}
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Add a note"
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => addNote(request._id, noteContent)}
                        >
                            Add Note
                        </Button>
                    </CardActions>
                </Card>
            ))}

            <Box mt={4} textAlign="center">
                <Button variant="contained" color="primary" href="/ride-request">
                    Add New Request
                </Button>
            </Box>
        </Container>
    );
};

export default RideRequests;
