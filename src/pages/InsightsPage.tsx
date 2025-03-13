import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Lightbulb as LightbulbIcon,
  Info as InfoIcon,
  ArrowUpward,
  ArrowForward,
  ArrowDownward,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import PropertySelector from '../components/dashboard/PropertySelector';
import DateRangePicker from '../components/dashboard/DateRangePicker';
import { gscService, DateRange, GSCProperty } from '../services/gscService';
import { insightsService, InsightResponse } from '../services/insightsService';
import { creditsService } from '../services/creditsService';

const InsightsPage: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const [selectedProperty, setSelectedProperty] = useState<GSCProperty | null>(null);
  const [dateRanges, setDateRanges] = useState<DateRange[]>([]);
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    startDate: '',
    endDate: '',
    label: 'Last 30 days'
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<InsightResponse | null>(null);
  const [credits, setCredits] = useState(0);
  const [targetPageUrl, setTargetPageUrl] = useState<string | null>(null);

  // Initialize date ranges and check for URL parameters
  useEffect(() => {
    const ranges = gscService.getDateRanges();
    setDateRanges(ranges);
    setSelectedRange(ranges[1]); // Default to 30 days
    
    // Check if URL has a page parameter
    const queryParams = new URLSearchParams(location.search);
    const pageUrl = queryParams.get('url');
    if (pageUrl) {
      setTargetPageUrl(pageUrl);
    }
    
    fetchUserCredits();
  }, [location]);

  // Fetch data when property or date range changes
  useEffect(() => {
    if (selectedProperty && selectedRange.startDate && selectedRange.endDate) {
      // Don't auto-generate insights to save credits, just show the form
      setLoading(true);
      // Simulate loading existing data
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [selectedProperty, selectedRange]);

  const fetchUserCredits = async () => {
    try {
      const userCredits = await creditsService.getCredits();
      setCredits(userCredits);
    } catch (error) {
      console.error('Failed to fetch user credits:', error);
    }
  };

  const handlePropertyChange = (property: GSCProperty) => {
    setSelectedProperty(property);
    // Reset insights when property changes
    setInsights(null);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setSelectedRange(range);
    // Reset insights when date range changes
    setInsights(null);
  };

  const handleGenerateInsights = async () => {
    if (credits <= 0) {
      setError('You need at least 1 credit to generate insights. Please visit your account settings to add more credits.');
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      if (!selectedProperty) {
        setError('Please select a property first.');
        setGenerating(false);
        return;
      }

      console.log('Generating insights for property:', selectedProperty.siteUrl);
      
      try {
        const response = await insightsService.generateInsights({
          siteUrl: selectedProperty.siteUrl,
          period: `${selectedRange.startDate} to ${selectedRange.endDate}`,
          data: {
            // Include basic data to help OpenAI generate insights
            property: selectedProperty.siteUrl, // GSCProperty only has siteUrl, not name
            targetPageUrl: targetPageUrl || null,
            dateRange: {
              start: selectedRange.startDate,
              end: selectedRange.endDate,
              label: selectedRange.label
            }
          }
        });
        
        setInsights(response);
        setCredits(prev => Math.max(0, prev - 1));
      } catch (apiError: any) {
        console.error('API Error generating insights:', apiError);
        
        // Provide specific error messages based on error type
        if (apiError.message && apiError.message.includes('500')) {
          setError('Our AI service is temporarily unavailable. Please try again later.');
        } else if (apiError.message && apiError.message.includes('timeout')) {
          setError('The request timed out. Try again with a shorter date range.');
        } else if (apiError.response && apiError.response.status === 401) {
          setError('Your session has expired. Please refresh the page and log in again.');
        } else {
          setError('Failed to generate insights. Please try again later.');
        }
        
        // Create a fallback insights object so the UI doesn't break
        setInsights({
          summary: "Unable to generate insights at this time",
          performance: {
            trend: "stable",
            details: "We encountered an error while generating your insights."
          },
          topFindings: [{
            title: "Service temporarily unavailable",
            description: "We're experiencing technical difficulties with our AI service. Please try again later."
          }],
          recommendations: [{
            title: "Check back soon",
            description: "Our team has been notified of this issue and is working to resolve it.",
            priority: "medium"
          }]
        });
      }
    } catch (err) {
      console.error('Failed to generate insights:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRefresh = () => {
    setInsights(null);
    handleGenerateInsights();
  };

  const renderTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp sx={{ color: theme.palette.success.main }} />;
      case 'down':
        return <TrendingDown sx={{ color: theme.palette.error.main }} />;
      default:
        return <TrendingFlat sx={{ color: theme.palette.text.secondary }} />;
    }
  };

  const renderPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <ArrowUpward sx={{ color: theme.palette.error.main }} />;
      case 'medium':
        return <ArrowForward sx={{ color: theme.palette.warning.main }} />;
      case 'low':
        return <ArrowDownward sx={{ color: theme.palette.success.main }} />;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {targetPageUrl ? 'Page Insights' : 'Site Insights'}
        </Typography>
        
        {targetPageUrl && (
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            Analyzing: {targetPageUrl}
          </Typography>
        )}
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => setError(null)}>
                Dismiss
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3
        }}>
          <PropertySelector 
            selectedProperty={selectedProperty} 
            onPropertyChange={handlePropertyChange} 
          />
          
          {selectedProperty && (
            <DateRangePicker
              selectedRange={selectedRange}
              predefinedRanges={dateRanges}
              onRangeChange={handleDateRangeChange}
            />
          )}
        </Box>
      </Box>
      
      {!selectedProperty ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Select a property to generate insights
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Choose a Google Search Console property from the dropdown above to analyze and generate AI-powered insights.
          </Typography>
        </Paper>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : !insights ? (
        <Paper sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LightbulbIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Generate AI-Powered Insights
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Our AI will analyze your {targetPageUrl ? 'page' : 'site'} performance data and provide actionable recommendations.
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                Cost: 1 credit
              </Typography>
              <Tooltip title="You have 10 free credits per month. Premium plans offer more.">
                <InfoIcon fontSize="small" color="disabled" />
              </Tooltip>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You have {credits} credit{credits !== 1 ? 's' : ''} remaining
            </Typography>
            
            <Button 
              variant="contained" 
              size="large"
              onClick={handleGenerateInsights}
              disabled={generating || credits < 1}
              startIcon={generating ? <CircularProgress size={20} /> : <LightbulbIcon />}
            >
              {generating ? 'Generating...' : 'Generate Insights'}
            </Button>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            What's included in the analysis:
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Performance Assessment" 
                    secondary="Analysis of clicks, impressions, CTR, and position" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Trend Detection" 
                    secondary="Identify significant changes and patterns" 
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} sm={6}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Key Findings" 
                    secondary="Notable observations about your performance" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Actionable Recommendations" 
                    secondary="Prioritized steps to improve your performance" 
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        // Display insights
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={credits < 1}
            >
              Refresh Insights (1 credit)
            </Button>
          </Box>
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2">
                Summary
              </Typography>
              {insights.performance && (
                <Chip 
                  icon={renderTrendIcon(insights.performance.trend)} 
                  label={`Trend: ${insights.performance.trend.charAt(0).toUpperCase() + insights.performance.trend.slice(1)}`} 
                  color={insights.performance.trend === 'up' ? 'success' : insights.performance.trend === 'down' ? 'error' : 'default'}
                  variant="outlined"
                  size="small"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
            <Typography variant="body1" paragraph>
              {insights.summary}
            </Typography>
            {insights.performance && (
              <Typography variant="body2" color="text.secondary">
                {insights.performance.details}
              </Typography>
            )}
          </Paper>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  Key Findings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {insights.topFindings.map((finding, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <Card variant="outlined" sx={{ width: '100%', mb: 1 }}>
                        <CardContent sx={{ pb: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <InfoIcon color="primary" sx={{ mr: 1.5, mt: 0.3 }} />
                            <Box>
                              <Typography variant="subtitle1" component="div">
                                {finding.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {finding.description}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  Recommendations
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {insights.recommendations.map((recommendation, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <Card variant="outlined" sx={{ width: '100%', mb: 1 }}>
                        <CardContent sx={{ pb: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Box sx={{ mr: 1.5, mt: 0.3 }}>
                              {renderPriorityIcon(recommendation.priority)}
                            </Box>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="subtitle1" component="div">
                                  {recommendation.title}
                                </Typography>
                                <Chip 
                                  label={recommendation.priority} 
                                  size="small" 
                                  color={
                                    recommendation.priority === 'high' 
                                      ? 'error' 
                                      : recommendation.priority === 'medium' 
                                        ? 'warning' 
                                        : 'success'
                                  }
                                  sx={{ ml: 1, height: 20 }}
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {recommendation.description}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default InsightsPage;