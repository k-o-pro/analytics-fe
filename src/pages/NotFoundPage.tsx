import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { SentimentVeryDissatisfied as SadIcon } from '@mui/icons-material';

const NotFoundPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          py: 4
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <SadIcon color="primary" sx={{ fontSize: 80, mb: 2 }} />
          
          <Typography variant="h4" component="h1" gutterBottom>
            404 - Page Not Found
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            The page you're looking for doesn't exist or has been moved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component={Link}
              to="/#/"
              variant="contained"
              color="primary"
            >
              Go to Dashboard
            </Button>
            
            <Button
              component="a"
              href="mailto:mail@k-o.pro"
              variant="outlined"
            >
              Contact Support
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFoundPage;