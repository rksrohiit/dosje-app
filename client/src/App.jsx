import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CCTVViewer from './pages/CCTVViewer';
import VideoConference from './pages/VideoConference';
import InspectionModule from './pages/InspectionModule';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import NGOPortal from './pages/NGOPortal';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout><Dashboard /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/cctv"
        element={
          <PrivateRoute>
            <Layout><CCTVViewer /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/video-conference"
        element={
          <PrivateRoute>
            <Layout><VideoConference /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/inspections"
        element={
          <PrivateRoute>
            <Layout><InspectionModule /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <Layout><Reports /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <Layout><Analytics /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/ngo-portal"
        element={
          <PrivateRoute>
            <Layout><NGOPortal /></Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
