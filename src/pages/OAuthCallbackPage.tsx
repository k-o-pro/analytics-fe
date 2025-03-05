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
  const [debugInfo, setDebugInfo] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, checkAuthState, login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setLoading(true);
        let debugLog = '';
        const addDebug = (msg: string) => {
          console.log(msg);
          debugLog += msg + '\n';
          setDebugInfo(debugLog);
        };
        
        addDebug('🔍 Starting OAuth callback handling...');
        
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
        addDebug(`🔗 URL: ${window.location.href}`);
        addDebug(`🔍 Search params: ${location.search}`);
        addDebug(`🔗 Hash: ${location.hash}`);
        addDebug(`🔑 Code present: ${code ? 'Yes' : 'No'}`);
        addDebug(`🔐 Auth state: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
        addDebug(`🪙 Token present: ${localStorage.getItem('token') ? 'Yes' : 'No'}`);
        
        // If there's an error parameter, display it
        const errorMsg = queryParams.get('error');
        if (errorMsg) {
          addDebug(`❌ Error returned from Google: ${errorMsg}`);
          setError(`Google returned an error: ${errorMsg}`);
          setLoading(false);
          return;
        }
        
        if (!code) {
          // Check if we have a stored code from a previous attempt
          const storedCode = sessionStorage.getItem('pending_oauth_code');
          if (storedCode) {
            addDebug('🔄 Retrieved stored authorization code from session storage');
            code = storedCode;
            if (!isRetrying) {
              setIsRetrying(true);
            }
          } else {
            addDebug('❌ No authorization code found in URL parameters or session storage');
            setError('No authorization code was returned from Google. Please try again.');
            setLoading(false);
            return;
          }
        } else {
          // Store code in case we need it after a redirect
          addDebug('💾 Storing authorization code in session storage');
          sessionStorage.setItem('pending_oauth_code', code);
        }
        
        // Check auth state
        const token = localStorage.getItem('token');
        let isUserAuthenticated = !!token;
        
        // Double check with auth context
        if (!isUserAuthenticated) {
          addDebug('🔄 Token not found in localStorage, checking auth context...');
          isUserAuthenticated = checkAuthState();
          addDebug(`🔐 Auth context check result: ${isUserAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
        }
        
        // Ensure the token is set in the API
        if (token) {
          addDebug('🔑 Setting auth token in API service');
          api.setAuthToken(token);
        } else {
          addDebug('⚠️ No token available to set in API');
        }
        
        // Check auth status - might need to redirect if not logged in
        if (!isUserAuthenticated) {
          addDebug('🔄 User not authenticated, redirecting to login');
          navigate('/login', { 
            state: { 
              redirectAfterLogin: '/oauth-callback',
              message: 'Please log in to connect your Google Search Console account' 
            } 
          });
          return;
        }
        
        addDebug('✅ User authenticated, proceeding with OAuth callback');
        addDebug(`🔑 Auth code for exchange: ${code?.substring(0, 5)}...`);
        
        // Process the OAuth callback
        addDebug('🔄 Sending authorization code to backend...');
        const success = await gscService.handleCallback(code);
        
        if (!success) {
          addDebug('❌ Failed to authenticate with Google Search Console API');
          setError('Failed to authenticate with Google. This could be due to an expired authorization code or server configuration issue. Please try again.');
          setLoading(false);
          return;
        }
        
        // Clear stored code on success
        addDebug('✅ OAuth callback successful, clearing stored code');
        sessionStorage.removeItem('pending_oauth_code');
        
        // Clear loading and navigate after successful connection
        addDebug('➡️ Redirecting to settings page');
        setLoading(false);
        navigate('/settings', { 
          state: { 
            message: 'Google Search Console connected successfully!' 
          } 
        });
        
      } catch (err) {
        console.error('OAuth callback error:', err);
        setDebugInfo(prev => prev + `\n❌ ERROR: ${err instanceof Error ? err.message : String(err)}`);
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
              
              {/* Debug info panel */}
              <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'left' }}>
                <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-line' }}>
                  {debugInfo}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <Alert severity="success" sx={{ mt: 2 }}>
                Successfully connected to Google Search Console!
              </Alert>
              
              {/* Debug info panel */}
              <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'left' }}>
                <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-line' }}>
                  {debugInfo}
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default OAuthCallbackPage;