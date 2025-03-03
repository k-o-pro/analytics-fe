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
      // Check if user is authenticated
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      try {
        // Get code from URL parameters
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');

        if (!code) {
          throw new Error('No authorization code found in the URL');
        }

        // Process the OAuth callback
        const success = await gscService.handleCallback(code);

        if (!success) {
          throw new Error('Failed to authenticate with Google');
        }

        // Wait a bit to ensure the server has processed everything
        setTimeout(() => {
          setLoading(false);
          // Navigate to the dashboard or settings page
          navigate('/settings', { 
            state: { 
              message: 'Google Search Console connected successfully!' 
            } 
          });
        }, 1500);
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