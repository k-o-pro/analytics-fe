import React from 'react';
import { Box, Paper, Typography, Tooltip } from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  TrendingFlat,
  Info as InfoIcon
} from '@mui/icons-material';

type MetricCardProps = {
  title: string;
  value: number | string;
  previousValue?: number;
  format?: 'number' | 'percent' | 'position';
  tooltipText?: string;
  isLoading?: boolean;
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  previousValue,
  format = 'number',
  tooltipText,
  isLoading = false
}) => {
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'percent':
        return `${(val * 100).toFixed(2)}%`;
      case 'position':
        return val.toFixed(1);
      default:
        return val >= 1000 
          ? val.toLocaleString('en-US', { maximumFractionDigits: 0 }) 
          : val.toLocaleString('en-US', { maximumFractionDigits: 1 });
    }
  };

  const calculateDelta = (): number => {
    if (previousValue === undefined || typeof value === 'string') return 0;
    
    // For position metrics, lower is better
    if (format === 'position') {
      return ((previousValue - value) / previousValue) * 100;
    }
    
    return ((value - previousValue) / previousValue) * 100;
  };

  const delta = calculateDelta();
  const isPositive = delta > 0;
  const isNeutral = delta === 0 || (delta > -0.5 && delta < 0.5);

  const renderDeltaIcon = () => {
    if (isNeutral) return <TrendingFlat color="disabled" />;
    if (isPositive) return <TrendingUp color="success" />;
    return <TrendingDown color="error" />;
  };

  // Delta color: green for positive change, red for negative, grey for neutral
  // Note: For position metrics, lower is better, so colors are reversed
  const getDeltaColor = () => {
    if (isNeutral) return 'text.secondary';
    if ((isPositive && format !== 'position') || (!isPositive && format === 'position')) {
      return 'success.main';
    }
    return 'error.main';
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        
        {tooltipText && (
          <Tooltip title={tooltipText} arrow>
            <InfoIcon fontSize="small" color="disabled" />
          </Tooltip>
        )}
      </Box>
      
      <Typography variant="h4" component="div" sx={{ mt: 1, fontWeight: 500 }}>
        {isLoading ? '—' : formatValue(value)}
      </Typography>
      
      {previousValue !== undefined && !isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          {renderDeltaIcon()}
          <Typography 
            variant="body2" 
            sx={{ ml: 0.5, color: getDeltaColor() }}
          >
            {isNeutral 
              ? 'No change' 
              : `${isPositive ? '+' : ''}${delta.toFixed(1)}%`
            }
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default MetricCard;