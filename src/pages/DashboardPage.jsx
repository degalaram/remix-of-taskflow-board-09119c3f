// Dashboard Page Component
// Main authenticated page containing the Kanban board
// Note: Header and Sidebar are rendered in AuthenticatedLayout (App.jsx)

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { refreshTokenRequest } from '../store/slices/authSlice';
import KanbanBoard from '../components/KanbanBoard';

const DashboardPage = () => {
  // Get auth state from Redux store
  const { isAuthenticated, session, isRefreshing } = useSelector((state) => state.auth);

  // Get dispatch and navigate functions
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Check token expiration and refresh if needed
  useEffect(() => {
    if (!session) return;

    // Function to check if token needs refresh
    const checkTokenExpiration = () => {
      const now = Date.now();
      const expiresIn = session.accessTokenExpiry - now;

      // If token is expired or about to expire (within 5 seconds), refresh it
      if (expiresIn <= 5000 && !isRefreshing) {
        dispatch(refreshTokenRequest());
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Set up interval to check every 5 seconds
    const intervalId = setInterval(checkTokenExpiration, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [session, isRefreshing, dispatch]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Redirecting to login…</p>
      </div>
    );
  }

  // Only render the Kanban board - Header and Sidebar are in AuthenticatedLayout
  return <KanbanBoard />;
};

export default DashboardPage;
