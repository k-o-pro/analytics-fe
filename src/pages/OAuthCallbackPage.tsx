import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Paper, Container, Button } from '@mui/material';
import { gscService } from '../services/gscService';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const OAuthCallbackPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, checkAuthState, login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setLoading(true);
        
        // Get code from URL parameters - handle both search and hash params
        let code = null;
        
        // First try from query parameters
        const queryParams = new URLSearchParams(location.search);
        code = queryParams.get('code');
        
        // If not found, try from hash parameters (for hash router)
        if (!code && location.hash) {
          const hashParams = new URLSearchParams(location.hash.substring(1));
          code = hashParams.get('code');
        }
        
        // Detailed debug information
        console.log('OAuth callback received:');
        console.log('- URL:', window.location.href);
        console.log('- Search params:', location.search);
        console.log('- Hash:', location.hash);
        console.log('- Code present:', code ? 'Yes' : 'No');
        console.log('- Auth state:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
        console.log('- Token present:', localStorage.getItem('token') ? 'Yes' : 'No');
        
        // If there's an error parameter, display it
        const errorMsg = queryParams.get('error');
        if (errorMsg) {
          console.error('Error returned from Google:', errorMsg);
          setError(`Google returned an error: ${errorMsg}`);
          setLoading(false);
          return;
        }
        
        if (!code) {
          // Check if we have a stored code from a previous attempt
          const storedCode = sessionStorage.getItem('pending_oauth_code');
          if (storedCode) {
            console.log('Retrieved stored authorization code from session storage');
            code = storedCode;
            if (!isRetrying) {
              setIsRetrying(true);
            }
          } else {
            console.error('No authorization code found in URL parameters or session storage');
            setError('No authorization code was returned from Google. Please try again.');
            setLoading(false);
            return;
          }
        } else {
          // Store code in case we need it after a redirect
          sessionStorage.setItem('pending_oauth_code', code);
        }
        
        // Check auth state
        const token = localStorage.getItem('token');
        let isUserAuthenticated = !!token;
        
        // Double check with auth context
        if (!isUserAuthenticated) {
          isUserAuthenticated = checkAuthState();
        }
        
        // Ensure the token is set in the API
        if (token) {
          console.log('Setting auth token in API');
          api.setAuthToken(token);
        }
        
        // Check auth status - might need to redirect if not logged in
        if (!isUserAuthenticated) {
          console.log('User not authenticated, redirecting to login');
          navigate('/login', { 
            state: { 
              redirectAfterLogin: '/oauth-callback',
              message: 'Please log in to connect your Google Search Console account' 
            } 
          });
          return;
        }
        
        console.log('User authenticated, proceeding with OAuth callback');
        console.log('Sending code to backend for processing...');
        
        // Process the OAuth callback
        const success = await gscService.handleCallback(code);
        
        if (!success) {
          console.error('Failed to authenticate with Google Search Console API');
          setError('Failed to authenticate with Google. This could be due to an expired authorization code or server configuration issue. Please try again.');
          setLoading(false);
          return;
        }
        
        // Clear stored code on success
        sessionStorage.removeItem('pending_oauth_code');
        
        // Clear loading and navigate after successful connection
        setLoading(false);
        navigate('/settings', { 
          state: { 
            message: 'Google Search Console connected successfully!' 
          } 
        });
        
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed due to an unknown error');
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, location, isAuthenticated, checkAuthState, isRetrying]);

  const handleRetry = () => {
    window.location.href = gscService.getAuthUrl();
  };

  const handleCancel = () => {
    navigate('/settings');
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            Connecting Google Search Console
          </Typography>

          {loading ? (
            <Box sx={{ mt: 4, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Connecting to your Google Search Console account...
              </Typography>
            </Box>
          ) : error ? (
            <>
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {error}
              </Alert>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button variant="contained" onClick={handleRetry}>
                  Try Again
                </Button>
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
              </Box>
            </>
          ) : (
            <Alert severity="success" sx={{ mt: 2 }}>
              Successfully connected to Google Search Console!
            </Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default OAuthCallbackPage;