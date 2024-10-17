import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, TextField, Box, Card, CardContent, CardActions, Collapse, IconButton, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import { useNotification } from '../utils/NotificationContext';
import api from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FlagIcon from '@mui/icons-material/Flag';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';

const RideRequests = () => {
    const [rideRequests, setRideRequests] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [expandedNotes, setExpandedNotes] = useState({});
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortOption, setSortOption] = useState('newest');
    const showNotification = useNotification();
    const { currentUser } = useAuth(); // Access currentUser from the context

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
            console.log('Attempting to cancel ride request with ID:', id);
            await api.put(`/api/carpools/ride-requests/${id}/cancel`);
            console.log('Successfully called cancel API');
            setRideRequests(rideRequests.map(request => request._id === id ? { ...request, status: 'cancelled', acceptedBy: null } : request));
            showNotification('Ride request cancelled', 'success');
        } catch (err) {
            console.error('Error cancelling ride request:', err);
            showNotification('Error cancelling ride request', 'error');
        }
    };

    const handleUnaccept = async (id) => {
        try {
            const res = await api.put(`/api/carpools/ride-requests/${id}/unaccept`);
            setRideRequests(rideRequests.map(request =>
                request._id === id
                    ? { ...request, status: 'Pending', acceptedBy: null }
                    : request
            ));
            showNotification('Acceptance cancelled successfully', 'success');
        } catch (err) {
            console.error('Error cancelling acceptance:', err);
            showNotification('Error cancelling acceptance', 'error');
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

    const toggleNotes = (id) => {
        setExpandedNotes((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleFilterChange = (event) => {
        setFilterStatus(event.target.value);
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    const filteredAndSortedRequests = rideRequests
        .filter((request) => filterStatus === 'all' || request.status === filterStatus)
        .sort((a, b) => {
            if (sortOption === 'newest') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sortOption === 'oldest') {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
            return 0;
        });

    const getStatusChip = (status, acceptedBy) => {
        switch (status) {
            case 'Accepted':
                return <Chip label={`Accepted by ${acceptedBy?.name || 'Unknown User'}`} style={{ borderColor: '#4caf50', color: '#4caf50', borderWidth: 0, borderStyle: 'solid' }} variant="outlined" />;
            case 'Pending':
                return <Chip label="Pending" style={{ borderColor: '#ff9800', color: '#ff9800', borderWidth: 0, borderStyle: 'solid' }} variant="outlined" />;
            case 'cancelled':
                return <Chip label="Cancelled" style={{ borderColor: '#f44336', color: '#f44336', borderWidth: 0, borderStyle: 'solid' }} variant="outlined" />;
            default:
                return <Chip label={status} />;
        }
    };

    return (
        <Container maxWidth="md">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" align="left">Ride Requests</Typography>
                <Button variant="outlined" color="primary" href="/ride-request">Create New Request</Button>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={4}>
                <FormControl variant="outlined" size="small">
                    <InputLabel>Filter by Status</InputLabel>
                    <Select value={filterStatus} onChange={handleFilterChange} label="Filter by Status">
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Accepted">Accepted</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                </FormControl>
                <FormControl variant="outlined" size="small">
                    <InputLabel>Sort by Date</InputLabel>
                    <Select value={sortOption} onChange={handleSortChange} label="Sort by Date">
                        <MenuItem value="newest">Newest</MenuItem>
                        <MenuItem value="oldest">Oldest</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            {filteredAndSortedRequests.map(request => (
                <Card key={request._id} variant="outlined" style={{ marginBottom: '16px', padding: '16px' }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">{`${request.event} on ${new Date(request.date).toLocaleDateString()}`}</Typography>
                            {getStatusChip(request.status, request.acceptedBy)}
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                            <Typography variant="body2" color="textSecondary">Created by: {request.requester?.name || 'Unknown User'} on {new Date(request.createdAt).toLocaleDateString()}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                            <EventIcon style={{ marginRight: '8px' }} />
                            <Typography variant="body2" color="textSecondary">Pickup Date: {new Date(request.date).toLocaleDateString()}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                            <AccessTimeIcon style={{ marginRight: '8px' }} />
                            <Typography variant="body2" color="textSecondary">Pickup Time: {request.pickupTime || 'Not specified'}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                            <LocationOnIcon style={{ marginRight: '8px' }} />
                            <Typography variant="body2" color="textSecondary">Pickup Location: {request.startLocation}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                            <FlagIcon style={{ marginRight: '8px' }} />
                            <Typography variant="body2" color="textSecondary">Destination: {request.endLocation}</Typography>
                        </Box>
                        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => toggleNotes(request._id)}
                                startIcon={expandedNotes[request._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            >
                                {expandedNotes[request._id] ? 'Hide Notes' : 'Show Notes'}
                            </Button>

                            {request.status === 'Pending' && currentUser?.id !== request.requester?._id?.toString() && (
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => handleAccept(request._id)}
                                >
                                    Accept
                                </Button>
                            )}

                            {/* Show "Cancel Acceptance" if the current user accepted the ride */}
                            {request.status === 'Accepted' && request.acceptedBy?._id === currentUser?.id && (
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => handleUnaccept(request._id)}
                                >
                                    Cancel Acceptance
                                </Button>
                            )}

                            {/* Show "Cancel" if the current user is the requester and the status is not "cancelled" */}
                            {request.status !== 'cancelled' && currentUser?.id === request.requester?._id?.toString() && (
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => handleCancel(request._id)}
                                >
                                    Cancel
                                </Button>
                            )}
                        </Box>
                    </CardContent>
                    <Collapse in={expandedNotes[request._id]} timeout="auto" unmountOnExit>
                        <CardContent>
                            {request.notes && request.notes.length > 0 ? (
                                request.notes.map((note, index) => (
                                    <Typography key={index} variant="body2" style={{ marginTop: '8px' }}>
                                        {note.user && note.user.name ? `${note.user.name}:` : 'Unknown User:'} {note.content}
                                    </Typography>
                                ))
                            ) : (
                                <Typography variant="body2" color="textSecondary">No notes available</Typography>
                            )}
                            <Box mt={2}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    placeholder="Add a note"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                />
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => addNote(request._id)}
                                    style={{ marginTop: '8px' }}
                                >
                                    Add Note
                                </Button>
                            </Box>
                        </CardContent>
                    </Collapse>
                </Card>
            ))}
        </Container>
    );
};

export default RideRequests;
