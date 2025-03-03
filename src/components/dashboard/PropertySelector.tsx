import React, { useState, useEffect } from 'react';
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
import { gscService, GSCProperty } from '../../services/gscService';

interface PropertySelectorProps {
  selectedProperty: string;
  onPropertyChange: (property: string) => void;
}

const PropertySelector: React.FC<PropertySelectorProps> = ({
  selectedProperty,
  onPropertyChange,
}) => {
  const [properties, setProperties] = useState<GSCProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]); // Add fetchProperties to dependencies

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const gscProperties = await gscService.getProperties();
      setProperties(gscProperties);
      
      // If no property is selected and we got properties, select the first one
      if (!selectedProperty && gscProperties.length > 0) {
        onPropertyChange(gscProperties[0].siteUrl);
      }
    } catch (err) {
      console.error('Failed to fetch GSC properties:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyChange = (event: SelectChangeEvent) => {
    onPropertyChange(event.target.value);
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
          value={selectedProperty}
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