import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import PWAInstallPrompt from './components/PWAInstallPrompt';
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
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-wider">Loading DoSJE Portal...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar setMobileOpen={setMobileOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppRoutes />
        <PWAInstallPrompt />
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
