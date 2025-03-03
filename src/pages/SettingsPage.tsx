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
  Check as CheckIcon,
  StarOutline as DefaultIcon
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
      
      const connectedProperties = gscProperties.map(property => ({
        ...property,
        isConnected: Math.random() > 0.3,
        isDefault: property.siteUrl.includes('example.com')
      }));
      
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

  const handleConnectGSC = () => {
    navigate('/connect-gsc');
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
                        disabled={property.isDefault}
                        onClick={() => handleToggleDefault(property.siteUrl)}
                        title={property.isDefault ? 'Default property' : 'Set as default'}
                      >
                        <DefaultIcon color={property.isDefault ? 'primary' : 'disabled'} />
                      </IconButton>
                    )}
                    <Switch
                      edge="end"
                      checked={property.isConnected}
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
    </Container>
  );
};

export default SettingsPage;