import React from 'react';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { LandingPage } from './components/LandingPage';
import { AuthForm } from './components/AuthPages';
import { Dashboard } from './components/Dashboard';
import { PropertyWizard } from './components/PropertyWizard';
import { AdminPanel } from './components/AdminPanel';
import { PropertiesPage } from './components/PropertiesPage';
import { SettingsPage } from './components/SettingsPage';
import { Layout } from './components/Layout';
import { authService } from './utils/auth';

const AppContent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      await authService.waitForInitialization();
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthForm type="login" />} />
        <Route path="/register" element={<AuthForm type="register" />} />
        
        {/* Protected User Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/properties/new" element={
          <ProtectedRoute>
            <Layout>
              <PropertyWizard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/properties/:id/edit" element={
          <ProtectedRoute>
            <Layout>
              <PropertyWizard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/properties" element={
          <ProtectedRoute>
            <Layout>
              <PropertiesPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <Layout>
              <AdminPanel />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/users" element={
          <ProtectedRoute adminOnly>
            <Layout>
              <AdminPanel />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/properties" element={
          <ProtectedRoute adminOnly>
            <Layout>
              <AdminPanel />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/local-info" element={
          <ProtectedRoute adminOnly>
            <Layout>
              <AdminPanel />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/settings" element={
          <ProtectedRoute adminOnly>
            <Layout>
              <AdminPanel />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Redirect fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ 
  children, 
  adminOnly = false 
}) => {
  const user = authService.getCurrentUser();
  
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;