import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import monitoring components
import SocialMediaMonitoring from './SocialMediaMonitoring';

const Monitoring = () => {
  return (
    <Routes>
      <Route path="social-media" element={<SocialMediaMonitoring />} />
      <Route path="*" element={<Navigate to="social-media" replace />} />
    </Routes>
  );
};

export default Monitoring;