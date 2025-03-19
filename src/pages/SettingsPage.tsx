import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Divider,
  Alert,
  IconButton,
  TextField,
  Grid,
  Skeleton,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarOutline as StarOutlineIcon
} from '@mui/icons-material';
import { gscService } from '../services/gscService';
import { useAuth } from '../contexts/AuthContext';

type LocationState = {
  message?: string;
};

type PropertyWithStatus = {
  siteUrl: string;
  permissionLevel: string;
  isDefault?: boolean;
  isConnected?: boolean;
};

const SettingsPage: React.FC = () => {
  const [properties, setProperties] = useState<PropertyWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const gscProperties = await gscService.getProperties();
      
      console.log('Raw GSC properties from API:', gscProperties);
      
      if (!gscProperties || gscProperties.length === 0) {
        console.log('No GSC properties found');
        setProperties([]);
        return;
      }
      
      const connectedProperties = gscProperties.map(property => ({
        ...property,
        isConnected: true, // If we received properties, they are connected
        isDefault: property.siteUrl.includes('example.com') || gscProperties.length === 1 // Default to first if only one exists
      }));
      
      console.log('Setting properties in state:', connectedProperties);
      setProperties(connectedProperties);
    } catch (error) {
      console.error('Failed to fetch GSC properties:', error);
      setMessage({ 
        text: 'Failed to fetch Google Search Console properties. Please reconnect your account.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check for messages from navigation state
    const state = location.state as LocationState;
    if (state?.message) {
      setMessage({ text: state.message, type: 'success' });
      // Clear the location state
      navigate(location.pathname, { replace: true });
    }

    fetchProperties();
  }, [location, navigate, fetchProperties]);

  // Add getHashPath helper
  const getHashPath = (path: string) => {
    // If path already starts with a hash, return it as is
    if (path.startsWith('#')) return path;
    
    // If path starts with a slash, add the hash before it
    if (path.startsWith('/')) return `#${path}`;
    
    // Otherwise, add hash and slash
    return `#/${path}`;
  };

  // Update navigate('/connect-gsc') to use hash path
  const handleConnectGSC = () => {
    navigate(getHashPath('/connect-gsc'));
  };

  const handleRefresh = async () => {
    await fetchProperties();
    setMessage({ text: 'Properties refreshed successfully!', type: 'success' });
  };

  const handleToggleDefault = (siteUrl: string) => {
    setProperties(prevProperties => 
      prevProperties.map(property => ({
        ...property,
        isDefault: property.siteUrl === siteUrl
      }))
    );
    setMessage({ text: `${siteUrl} set as default property`, type: 'success' });
  };

  const handleToggleConnection = (siteUrl: string) => {
    setProperties(prevProperties => 
      prevProperties.map(property => 
        property.siteUrl === siteUrl 
          ? { ...property, isConnected: !property.isConnected }
          : property
      )
    );
  };

  const handleDeleteAccount = () => {
    // Implementation of handleDeleteAccount function
  };

  // Add a function to handle manual GSC debugging
  const handleDebugGSC = async () => {
    try {
      setMessage({ text: "Debugging GSC connection...", type: 'info' });
      await fetchProperties();
      
      // Get the current token
      const token = localStorage.getItem('token');
      setMessage({ 
        text: `Debug completed. Token exists: ${!!token}. Check console for details.`, 
        type: 'info' 
      });
    } catch (error) {
      console.error("Debug failed:", error);
      setMessage({ text: "Debug failed. See console.", type: 'error' });
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      {message && (
        <Alert 
          severity={message.type} 
          onClose={() => setMessage(null)}
          sx={{ mb: 3 }}
        >
          {message.text}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Google Search Console Properties
          </Typography>
          <Box>
            <IconButton onClick={handleRefresh} disabled={loading} title="Refresh properties">
              <RefreshIcon />
            </IconButton>
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />}
              onClick={handleConnectGSC}
              sx={{ ml: 1 }}
            >
              Connect
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          // Skeleton loader
          [...Array(3)].map((_, i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Skeleton animation="wave" height={50} />
            </Box>
          ))
        ) : properties.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" gutterBottom>
              No properties connected yet
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleConnectGSC}
              sx={{ mt: 2 }}
            >
              Connect Google Search Console
            </Button>
          </Box>
        ) : (
          <List>
            {properties.map((property) => (
              <ListItem
                key={property.siteUrl}
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {property.isConnected && (
                      <IconButton 
                        edge="end" 
                        disabled={property.isDefault || false}
                        onClick={() => handleToggleDefault(property.siteUrl)}
                        title={property.isDefault ? 'Default property' : 'Set as default'}
                      >
                        {property.isDefault ? <StarIcon /> : <StarOutlineIcon />}
                      </IconButton>
                    )}
                    <Switch
                      edge="end"
                      checked={property.isConnected || false}
                      onChange={() => handleToggleConnection(property.siteUrl)}
                    />
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1">
                        {property.siteUrl}
                      </Typography>
                      {property.isDefault && (
                        <Chip 
                          label="Default" 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 1 }} 
                        />
                      )}
                    </Box>
                  }
                  secondary={`Permission: ${property.permissionLevel}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Account Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              value={user?.email || ''}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="User ID"
              variant="outlined"
              value={user?.user_id || ''}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="outlined" color="primary">
                Change Password
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Data Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <List>
          <ListItem>
            <ListItemText 
              primary="Data Retention" 
              secondary="Store historical analytics data for up to 12 months" 
            />
            <ListItemSecondaryAction>
              <Switch edge="end" defaultChecked />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Automatic Insights" 
              secondary="Generate AI insights automatically on new data" 
            />
            <ListItemSecondaryAction>
              <Switch edge="end" defaultChecked />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Email Reports" 
              secondary="Receive weekly performance reports via email" 
            />
            <ListItemSecondaryAction>
              <Switch edge="end" />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Account Management
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <List>
          <ListItem>
            <ListItemText 
              primary="Delete Account" 
              secondary="Permanently delete your account" 
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                disabled={false}
                onClick={handleDeleteAccount}
                title="Delete Account"
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      {/* Add this at the bottom of your return JSX, before the closing </Container> */}
      {process.env['NODE_ENV'] !== 'production' && (
        <Paper elevation={3} sx={{ p: 3, mt: 4, bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Debug Information
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleDebugGSC}
              sx={{ mr: 1 }}
            >
              Debug GSC Connection
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={() => console.log('Current properties:', properties)}
            >
              Log Properties
            </Button>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Properties State:
          </Typography>
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: '#e0e0e0', 
              borderRadius: 1,
              maxHeight: 200,
              overflow: 'auto',
              '& pre': {
                margin: 0,
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }
            }}
          >
            <pre>{JSON.stringify(properties, null, 2)}</pre>
          </Box>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Auth Status:
          </Typography>
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: '#e0e0e0', 
              borderRadius: 1,
              '& pre': {
                margin: 0,
                fontFamily: 'monospace',
                fontSize: '0.8rem'
              }
            }}
          >
            <pre>Token exists: {localStorage.getItem('token') ? 'Yes' : 'No'}</pre>
            <pre>User: {user ? JSON.stringify(user, null, 2) : 'Not logged in'}</pre>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default SettingsPage;