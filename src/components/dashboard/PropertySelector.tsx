import React, { useState, useEffect, useCallback } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Box,
  CircularProgress,
  Typography,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { gscService } from '../../services/gscService';
import { GSCProperty } from '../../types/api';

interface PropertySelectorProps {
  selectedProperty: GSCProperty | null;
  onPropertyChange: (property: GSCProperty) => void;
}

const PropertySelector: React.FC<PropertySelectorProps> = ({
  selectedProperty,
  onPropertyChange,
}) => {
  const [properties, setProperties] = useState<GSCProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching GSC properties...');
      const gscProperties = await gscService.getProperties();
      
      console.log('Fetched properties:', gscProperties);
      
      // Format check for debugging
      if (gscProperties.length > 0) {
        const firstProperty = gscProperties[0];
        console.log('First property format check:', {
          siteUrl: firstProperty.siteUrl,
          permissionLevel: firstProperty.permissionLevel || 'Not specified',
          startsWithScDomain: firstProperty.siteUrl.startsWith('sc-domain:'),
          startsWithHttp: firstProperty.siteUrl.startsWith('http')
        });
      }
      
      if (!selectedProperty && gscProperties.length > 0) {
        onPropertyChange(gscProperties[0]);
      }
      
      setProperties(gscProperties);
    } catch (error) {
      console.error('Failed to fetch GSC properties:', error);
      
      // More descriptive error message based on the error
      if (error instanceof Error) {
        if (error.message.includes('auth') || error.message.includes('token') || error.message.includes('login')) {
          setError('Authentication error. Please log in again.');
        } else if (error.message.includes('permission')) {
          setError('Permission issue with Google Search Console. Please reconnect your account.');
        } else {
          setError(`Failed to load properties: ${error.message}`);
        }
      } else {
        setError('Failed to load properties');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedProperty, onPropertyChange]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]); // Add fetchProperties to dependency array

  const handlePropertyChange = (event: SelectChangeEvent<string>) => {
    const property = properties.find(p => p.siteUrl === event.target.value);
    if (property) {
      onPropertyChange(property);
    }
  };

  const handleAddProperty = () => {
    navigate('/connect-gsc');
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center">
        <CircularProgress size={20} sx={{ mr: 1 }} />
        <Typography variant="body2">Loading properties...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={fetchProperties}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (properties.length === 0) {
    return (
      <Box>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddProperty}
          size="small"
        >
          Connect Google Search Console
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
      <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
        <InputLabel id="property-select-label">Property</InputLabel>
        <Select
          labelId="property-select-label"
          id="property-select"
          value={selectedProperty?.siteUrl || ''}
          onChange={handlePropertyChange}
          label="Property"
        >
          {properties.map((property) => (
            <MenuItem key={property.siteUrl} value={property.siteUrl}>
              {property.siteUrl}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Button
        variant="text"
        startIcon={<AddIcon />}
        onClick={handleAddProperty}
        sx={{ ml: 1 }}
        size="small"
      >
        Add
      </Button>
    </Box>
  );
};

export default PropertySelector;