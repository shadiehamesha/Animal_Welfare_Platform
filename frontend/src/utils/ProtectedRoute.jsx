import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // If no token, redirect to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If roles are specified and user's role is not in the list, redirect to home
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    // Otherwise, render the child routes
    return <Outlet />;
};

export default ProtectedRoute;