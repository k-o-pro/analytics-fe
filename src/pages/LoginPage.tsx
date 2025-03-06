import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      console.log('Attempting login with email:', email);
      
      // Check if we're coming from the OAuth flow
      const queryParams = new URLSearchParams(location.search);
      const redirectParam = queryParams.get('redirect');
      const locationState = location.state as { redirectAfterLogin?: string } | null;
      const isOAuthRedirect = redirectParam === 'connect-gsc' || 
                              locationState?.redirectAfterLogin === '/oauth-callback';
      
      // If this is part of the OAuth flow, temporarily store the password in sessionStorage
      // This is used for potential silent login during the OAuth callback
      if (isOAuthRedirect) {
        console.log('Login is part of OAuth flow, storing temporary credentials');
        // This is cleared once used or when the session ends
        sessionStorage.setItem('tempAuthPass', password);
      }
      
      await login(email, password);
      
      console.log('Login successful, redirecting...');
      
      // If there's a redirect parameter, go there
      if (redirectParam) {
        navigate(`/${redirectParam}`);
      } else if (locationState?.redirectAfterLogin) {
        navigate(locationState.redirectAfterLogin);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error details:', err);
      
      // Display more specific error message if available
      if (err.message.includes('Network Error')) {
        setError('Cannot connect to the server. Please check your internet connection and try again.');
      } else if (err.message.includes('401')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
      
      // Clean up any stored temporary credentials on failure
      sessionStorage.removeItem('tempAuthPass');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
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
            mt: 3
          }}
        >
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Search Analytics Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Log In'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;