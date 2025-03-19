import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CssBaseline from '@mui/material/CssBaseline';

import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/layout/ErrorBoundary';
import PrivateRoute from './components/auth/PrivateRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TopPagesPage from './pages/TopPagesPage';
import InsightsPage from './pages/InsightsPage';
import SettingsPage from './pages/SettingsPage';
import ConnectGSCPage from './pages/ConnectGSCPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            {/* Special route for OAuth callback - outside PrivateRoute to avoid redirect loops */}
            <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
            
            {/* Protected routes */}
            <Route path="/app" element={<PrivateRoute />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={
                <ErrorBoundary>
                  <DashboardPage />
                </ErrorBoundary>
              } />
              <Route path="top-pages" element={
                <ErrorBoundary>
                  <TopPagesPage />
                </ErrorBoundary>
              } />
              <Route path="insights" element={
                <ErrorBoundary>
                  <InsightsPage />
                </ErrorBoundary>
              } />
              <Route path="settings" element={
                <ErrorBoundary>
                  <SettingsPage />
                </ErrorBoundary>
              } />
              <Route path="connect-gsc" element={
                <ErrorBoundary>
                  <ConnectGSCPage />
                </ErrorBoundary>
              } />
            </Route>
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </LocalizationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;