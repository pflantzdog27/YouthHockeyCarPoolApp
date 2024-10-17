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
        const userId = localStorage.getItem('user_id');

        if (token && userId) {
            // Attempt to fetch user data
            fetch(`/api/users/${userId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                return response.json();
            })
            .then(data => {
                setCurrentUser(data);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                // Set a fallback user with only the ID from localStorage to avoid "undefined" issues
                setCurrentUser({ id: userId });
            });
        }
    }, []);

    const login = (user) => {
        setCurrentUser(user);
        localStorage.setItem('user_id', user.id);
        localStorage.setItem('token', user.token); // Assuming you are also passing a token with user details
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
