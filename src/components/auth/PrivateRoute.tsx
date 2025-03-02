import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // You could render a loading spinner here
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }

  // If authenticated, render the child routes wrapped in the dashboard layout
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default PrivateRoute;