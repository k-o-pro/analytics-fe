import React from 'react';
import { Box, Paper, Typography, Tooltip, Skeleton } from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  TrendingFlat,
  Info as InfoIcon
} from '@mui/icons-material';

export type MetricType = 'clicks' | 'impressions' | 'ctr' | 'position';

type MetricCardProps = {
  title: string;
  value: number | string;
  previousValue?: number;
  format?: 'number' | 'percent' | 'position';
  tooltipText?: string;
  isLoading?: boolean;
  metricType?: MetricType;
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  previousValue,
  format = 'number',
  tooltipText,
  isLoading = false,
  metricType = 'clicks'
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

  const renderValue = () => {
    if (isLoading) {
      return (
        <Skeleton
          variant="text"
          width="70%"
          height={48}
          animation="wave"
          sx={{ my: 0.5 }}
        />
      );
    }
    
    if (value === 0) {
      return '—';
    }
    
    return formatValue(value);
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

  // Get metric color based on type
  const getMetricColor = (type: MetricType) => {
    switch(type) {
      case 'clicks':
        return '#3f51b5'; // indigo
      case 'impressions':
        return '#2196f3'; // blue
      case 'ctr':
        return '#4caf50'; // green
      case 'position':
        return '#ff9800'; // orange
      default:
        return '#1976d2'; // primary blue
    }
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderLeft: `4px solid ${getMetricColor(metricType)}`,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[4],
        }
      }}
      aria-label={`${title} metric: ${!isLoading && typeof value !== 'string' ? formatValue(value) : 'Loading'}`}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography 
          variant="subtitle2" 
          color="text.secondary"
          component="h3"
          sx={{ fontWeight: 500 }}
        >
          {title}
        </Typography>
        
        {tooltipText && (
          <Tooltip 
            title={tooltipText} 
            arrow 
            placement="top"
            enterTouchDelay={50}
            leaveTouchDelay={1500}
          >
            <InfoIcon 
              fontSize="small" 
              color="disabled" 
              aria-label={`Information about ${title}`}
              sx={{ cursor: 'help' }}
            />
          </Tooltip>
        )}
      </Box>
      
      <Typography 
        variant="h4" 
        component="div" 
        sx={{ 
          mt: 1, 
          fontWeight: 600,
          fontSize: { xs: '1.5rem', sm: '2rem' },
          animation: !isLoading ? 'fadeIn 0.5s ease-in-out' : 'none',
          '@keyframes fadeIn': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 }
          }
        }}
      >
        {renderValue()}
      </Typography>
      
      {previousValue !== undefined && (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mt: 'auto',
            pt: 1
          }}
        >
          {isLoading ? (
            <Skeleton variant="text" width="50%" height={24} animation="wave" />
          ) : (
            <>
              {renderDeltaIcon()}
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 0.5, 
                  color: getDeltaColor(),
                  fontWeight: 500
                }}
              >
                {isNeutral 
                  ? 'No change' 
                  : `${isPositive ? '+' : ''}${delta.toFixed(1)}%`
                }
              </Typography>
            </>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default MetricCard;