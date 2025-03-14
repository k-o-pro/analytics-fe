import React from 'react';
import { Box, Typography, Button, alpha, useTheme, SxProps, Theme } from '@mui/material';
import { 
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  Insights as InsightsIcon,
  Settings as SettingsIcon,
  ErrorOutline as ErrorIcon,
  Add as AddIcon,
  Link as LinkIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';

export type EmptyStateType = 
  | 'data' 
  | 'search' 
  | 'filter' 
  | 'connection' 
  | 'insights' 
  | 'error' 
  | 'settings' 
  | 'custom';

interface EmptyStateProps {
  /**
   * Type of empty state to display
   */
  type: EmptyStateType;
  /**
   * Primary title text
   */
  title: string;
  /**
   * Secondary description text
   */
  description?: string;
  /**
   * URL for illustration image (optional)
   */
  illustration?: string;
  /**
   * Primary action button text (optional)
   */
  actionText?: string;
  /**
   * Primary action button handler (optional)
   */
  onAction?: () => void;
  /**
   * Secondary action button text (optional)
   */
  secondaryActionText?: string;
  /**
   * Secondary action button handler (optional)
   */
  onSecondaryAction?: () => void;
  /**
   * Custom icon to use instead of default icon for the type
   */
  customIcon?: React.ReactNode;
  /**
   * Additional styles
   */
  sx?: SxProps<Theme>;
}

/**
 * EmptyState component for displaying visually appealing empty states across the application
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  illustration,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  customIcon,
  sx
}) => {
  const theme = useTheme();
  
  // Get appropriate icon for the empty state type
  const getIcon = () => {
    if (customIcon) {
      return customIcon;
    }
    
    switch (type) {
      case 'data':
        return <BarChartIcon sx={{ fontSize: 48 }} />;
      case 'search':
        return <SearchIcon sx={{ fontSize: 48 }} />;
      case 'filter':
        return <TrendingUpIcon sx={{ fontSize: 48 }} />;
      case 'connection':
        return <LinkIcon sx={{ fontSize: 48 }} />;
      case 'insights':
        return <InsightsIcon sx={{ fontSize: 48 }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 48 }} />;
      case 'settings':
        return <SettingsIcon sx={{ fontSize: 48 }} />;
      case 'custom':
      default:
        return <InfoIcon sx={{ fontSize: 48 }} />;
    }
  };
  
  // Get appropriate color for the empty state type
  const getColor = () => {
    switch (type) {
      case 'data':
        return theme.palette.primary.main;
      case 'search':
        return theme.palette.info.main;
      case 'filter':
        return theme.palette.primary.main;
      case 'connection':
        return theme.palette.success.main;
      case 'insights':
        return theme.palette.secondary.main;
      case 'error':
        return theme.palette.error.main;
      case 'settings':
        return theme.palette.warning.main;
      case 'custom':
      default:
        return theme.palette.info.main;
    }
  };
  
  const color = getColor();
  
  return (
    <Box
      sx={{
        p: { xs: 3, md: 4 },
        textAlign: 'center',
        borderRadius: 2,
        border: `1px dashed ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.background.paper, 0.6),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: 250,
        ...sx
      }}
    >
      {illustration ? (
        <Box
          component="img" 
          src={illustration}
          alt={title}
          sx={{ 
            maxWidth: '100%',
            height: 120,
            mb: 2
          }}
        />
      ) : (
        <Box
          sx={{
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: alpha(color, 0.1),
            color: color,
            mb: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              bgcolor: alpha(color, 0.15),
            }
          }}
        >
          {getIcon()}
        </Box>
      )}
      
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      
      {description && (
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            maxWidth: 500,
            mx: 'auto',
            mb: actionText ? 3 : 0
          }}
        >
          {description}
        </Typography>
      )}
      
      {actionText && (
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color={type === 'error' ? 'error' : 'primary'}
            startIcon={type === 'connection' ? <AddIcon /> : undefined}
            onClick={onAction}
            sx={{ minWidth: 140 }}
          >
            {actionText}
          </Button>
          
          {secondaryActionText && (
            <Button
              variant="outlined"
              color="inherit"
              onClick={onSecondaryAction}
            >
              {secondaryActionText}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default EmptyState; 