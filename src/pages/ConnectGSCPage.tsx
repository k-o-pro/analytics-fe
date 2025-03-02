import React from 'react';
import { Box, Typography, Button, Paper, Container, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { SsidChart, Visibility, QueryStats, AutoGraph, Check } from '@mui/icons-material';
import { gscService } from '../services/gscService';

const ConnectGSCPage: React.FC = () => {
  const handleConnect = () => {
    window.location.href = gscService.getAuthUrl();
  };

  const benefits = [
    {
      title: 'Performance Analytics',
      description: 'Track clicks, impressions, CTR, and position metrics for your site',
      icon: <SsidChart color="primary" />
    },
    {
      title: 'Top Pages Insights',
      description: 'See which pages drive the most traffic and need optimization',
      icon: <Visibility color="primary" />
    },
    {
      title: 'Keyword Analysis',
      description: 'Discover which keywords bring visitors to your site',
      icon: <QueryStats color="primary" />
    },
    {
      title: 'AI-Powered Recommendations',
      description: 'Get actionable SEO insights tailored to your website',
      icon: <AutoGraph color="primary" />
    }
  ];

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Connect Google Search Console
          </Typography>
          
          <Typography variant="body1" align="center" color="text.secondary" paragraph>
            Connect your Google Search Console account to unlock powerful search performance analytics and insights.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 4 }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={handleConnect}
              startIcon={<Check />}
            >
              Connect Search Console
            </Button>
          </Box>
          
          <Divider sx={{ mt: 3, mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              BENEFITS
            </Typography>
          </Divider>
          
          <List>
            {benefits.map((benefit, index) => (
              <ListItem key={index} alignItems="flex-start" sx={{ mb: 2 }}>
                <ListItemIcon>{benefit.icon}</ListItemIcon>
                <ListItemText
                  primary={<Typography variant="h6">{benefit.title}</Typography>}
                  secondary={benefit.description}
                />
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ mt: 4, bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Your data is secure and private. We only access your Search Console data with your explicit permission.
              You can disconnect at any time from the Settings page.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ConnectGSCPage;