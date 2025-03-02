import React, { useState, useEffect } from 'react';
import { Chip, Box, Typography, Tooltip } from '@mui/material';
import { CreditCard as CreditIcon } from '@mui/icons-material';
import { creditsService } from '../../services/creditsService';

const CreditBadge: React.FC = () => {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const userCredits = await creditsService.getCredits();
        setCredits(userCredits);
      } catch (error) {
        console.error('Failed to fetch credits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', p: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Loading credits...
        </Typography>
      </Box>
    );
  }

  if (credits === null) {
    return null;
  }

  const getColor = () => {
    if (credits > 5) return 'success';
    if (credits > 0) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Your Credits
      </Typography>
      <Tooltip title="Credits are used for premium features like in-depth page analysis, historical data access, and AI insights">
        <Chip
          icon={<CreditIcon />}
          label={`${credits} credit${credits !== 1 ? 's' : ''}`}
          color={getColor()}
          variant="outlined"
          sx={{ fontWeight: 'medium' }}
        />
      </Tooltip>
    </Box>
  );
};

export default CreditBadge;