import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Paper, Container, Button } from '@mui/material';
import { gscService } from '../services/gscService';
import { useAuth } from '../contexts/AuthContext';

const OAuthCallbackPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

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
        
        // Debug information
        console.log('OAuth callback received. URL:', window.location.href);
        console.log('Code found:', code ? 'Yes' : 'No');
        
        if (!code) {
          throw new Error('No authorization code found in the URL');
        }
        
        // Check auth status - might need to redirect if not logged in
        if (!isAuthenticated) {
          console.log('User not authenticated, redirecting to login');
          // Save the auth code in session storage before redirecting to login
          sessionStorage.setItem('pending_oauth_code', code);
          navigate('/login', { 
            state: { 
              redirectAfterLogin: '/oauth-callback',
              message: 'Please log in to connect your Google Search Console account' 
            } 
          });
          return;
        }
        
        // Retrieve stored code if we were redirected back after login
        const storedCode = sessionStorage.getItem('pending_oauth_code');
        if (storedCode && !code) {
          code = storedCode;
          // Clear stored code after using it
          sessionStorage.removeItem('pending_oauth_code');
        }
        
        // Process the OAuth callback
        const success = await gscService.handleCallback(code);
        
        if (!success) {
          throw new Error('Failed to authenticate with Google');
        }
        
        // Clear loading and navigate after successful connection
        setLoading(false);
        navigate('/settings', { 
          state: { 
            message: 'Google Search Console connected successfully!' 
          } 
        });
        
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, location, isAuthenticated]);

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