import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import MainLayout from './components/Layout/MainLayout';
import AuthLayout from './components/Layout/AuthLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DreamChat from './pages/DreamChat';
import DreamHistory from './pages/DreamHistory';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import DreamJournal from './pages/DreamJournal';
import DreamPatterns from './pages/DreamPatterns';

// Components
import PrivateRoute from './components/Auth/PrivateRoute';
import LoadingScreen from './components/UI/LoadingScreen';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900">
            <Toaster 
              position="top-right"
              toastOptions={{
                className: 'backdrop-blur-md bg-white/90',
                duration: 4000,
              }}
            />
            
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/interpret" element={<DreamChat />} />
                  <Route path="/history" element={<DreamHistory />} />
                  <Route path="/journal" element={<DreamJournal />} />
                  <Route path="/patterns" element={<DreamPatterns />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
            </Routes>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;