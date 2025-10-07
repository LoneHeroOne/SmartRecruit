import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/" state={{ message: "Please log in to access this page." }} />;
  }

  if (adminOnly) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.is_admin) {
        return <Navigate to="/" state={{ message: "Admin privileges required." }} />;
      }
    } catch (error) {
      return <Navigate to="/" state={{ message: "Invalid token. Please log in again." }} />;
    }
  }

  return <>{children}</>;
}
