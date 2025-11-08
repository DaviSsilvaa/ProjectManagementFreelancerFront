import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login.jsx';
import Dashboard from '../pages/Dashboard.jsx'; // clientes
import ClientDetail from '../pages/ClientDetail.jsx';
import RegisterClient from '../pages/RegisterClient.jsx';
import DashboardCharts from '../pages/DashboardCharts.jsx';
import Projects from '../pages/Projects.jsx';

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? <Navigate to="/dashboard" replace /> : children;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />

      {/* Dashboard de gráficos */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardCharts />
          </PrivateRoute>
        }
      />

      {/* Clientes */}
      <Route
        path="/dashboard/clients"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/client/:id"
        element={
          <PrivateRoute>
            <ClientDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/register-client"
        element={
          <PrivateRoute>
            <RegisterClient />
          </PrivateRoute>
        }
      />

      {/* Projetos */}
      <Route
        path="/dashboard/projects"
        element={
          <PrivateRoute>
            <Projects />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
