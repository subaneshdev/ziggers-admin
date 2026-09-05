import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authClient } from '../lib/authClient';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  if (!authClient.isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
