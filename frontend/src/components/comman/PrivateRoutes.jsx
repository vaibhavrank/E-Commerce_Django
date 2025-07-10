// src/components/routes/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux'; // assuming you're storing auth in Redux

const PrivateRoutes = () => {
  const {accessToken} = useSelector((state) => state.auth);

  return accessToken ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default PrivateRoutes;
