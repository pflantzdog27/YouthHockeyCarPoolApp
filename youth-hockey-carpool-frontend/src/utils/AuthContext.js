import React, { createContext, useContext, useEffect, useState } from 'react';

// Create AuthContext
const AuthContext = createContext();

// Custom hook for consuming the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // In a real app, verify the token and get user data
            // For now, assume the token indicates an authenticated user
            const user = { id: '123', name: 'Test User' }; // Replace with actual user data from your server
            setCurrentUser(user);
        }
    }, [localStorage.getItem('token')]); // This dependency will ensure reactivity on token change

    const login = (user) => {
        setCurrentUser(user);
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
