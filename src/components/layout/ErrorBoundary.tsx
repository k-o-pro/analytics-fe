import { Component, ErrorInfo, ReactNode } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Container,
  Stack
} from '@mui/material';
import { 
  ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon 
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in child component tree
 * and display a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error: error,
      errorInfo: null
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.light',
              backgroundColor: 'background.paper'
            }}
          >
            <Stack spacing={3} alignItems="center">
              <ErrorIcon color="error" sx={{ fontSize: 64 }} />
              
              <Typography variant="h5" color="error" gutterBottom>
                Something went wrong
              </Typography>
              
              <Typography variant="body1" align="center">
                An error occurred while rendering this section. The application is still working, but this component
                couldn't be displayed properly.
              </Typography>
              
              {process.env['NODE_ENV'] !== 'production' && this.state.error && (
                <Box 
                  sx={{ 
                    mt: 2, 
                    p: 2, 
                    bgcolor: 'grey.100', 
                    color: 'error.main',
                    borderRadius: 1,
                    width: '100%',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    overflowX: 'auto'
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    Error: {this.state.error.toString()}
                  </Typography>
                  {this.state.errorInfo && (
                    <Box component="pre" sx={{ mt: 1, fontSize: '0.75rem' }}>
                      {this.state.errorInfo.componentStack}
                    </Box>
                  )}
                </Box>
              )}
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={this.handleReset}
                startIcon={<RefreshIcon />}
              >
                Try Again
              </Button>
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 