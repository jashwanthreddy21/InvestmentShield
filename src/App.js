import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './App.css';
import { initSessionTimeout } from './utils/authUtils';

// Layout components
import MainLayout from './components/layout/MainLayout';

// Auth components
import Login from './components/auth/Login';
import ForgotPassword from './components/auth/ForgotPassword';

// Monitoring components
import Monitoring from './components/monitoring/Monitoring';

// Verification components
import Verification from './components/verification/Verification';

// Routing
import ProtectedRoute from './components/routing/ProtectedRoute';

// Import components directly without dynamic imports to avoid case sensitivity issues
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import AnnouncementVerification from './components/verification/AnnouncementVerification';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Initialize session timeout tracking when the app loads
  useEffect(() => {
    if (isAuthenticated) {
      // Start tracking user activity and session timeout
      initSessionTimeout();
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <Routes>
        {/* Auth Routes - Redirect to dashboard if already logged in */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/" replace /> : 
            <Login />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? 
            <Navigate to="/" replace /> : 
            <Register />
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            isAuthenticated ? 
            <Navigate to="/" replace /> : 
            <ForgotPassword />
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="monitoring/*" element={<Monitoring />} />
          <Route path="verification" element={<Verification />} />
          <Route path="verification/announcement" element={<AnnouncementVerification />} />
        </Route>
      </Routes>
    </Router>
  );
  }

export default App;
