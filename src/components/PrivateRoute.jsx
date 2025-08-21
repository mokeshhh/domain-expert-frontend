import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth'; // utility to check login status

export default function PrivateRoute({ children }) {
  if (!isLoggedIn()) {
    // If user not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }
  // Otherwise, render the protected component
  return children;
}
