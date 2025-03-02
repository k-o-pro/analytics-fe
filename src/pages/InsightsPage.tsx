import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Info as InfoIcon,
  Error as AlertIcon,
  Lightbulb as LightbulbIcon,
  CheckCircle as CheckCircleIcon,
  ArrowUpward,
  ArrowDownward,
  ArrowForward
} from '@mui/icons-material';

import PropertySelector from '../components/dashboard/PropertySelector';
import DateRangePicker from '../components/dashboard/DateRangePicker';
import { gscService, DateRange } from '../services/gscService';
import { insightsService, InsightResponse, Finding, Recommendation } from '../services/insightsService';
import { creditsService } from '../services/creditsService';

// Mock function to generate insights
const generateMockInsights = (): InsightResponse => {
  return {
    summary: "Your site's overall performance has improved by 12% this period with significant gains in organic traffic. Key pages like the homepage and blog content are performing well, but there are opportunities to optimize underperforming pages and improve CTR on high-impression keywords.",
    performance: {
      trend: Math.random() > 0.3 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
      details: "Overall clicks increased by 12.4% and impressions by 8.2% compared to the previous period. Average position improved from 18.3 to 16.7, while CTR increased from 2.1% to 2.3%."
    },
    topFindings: [
      {
        title: "Homepage search visibility improved",
        description: "Your homepage has seen a 23% increase in impressions and has moved up 3 positions in search results for key terms."
      },
      {
        title: "Blog content drives significant traffic",
        description: "Blog posts account for 47% of your organic search traffic, with the most recent posts performing particularly well."
      },
      {
        title: "Mobile CTR underperforms desktop",
        description: "Your click-through rate on mobile devices (1.8%) is lower than desktop (2.7%), suggesting potential mobile usability issues."
      },
      {
        title: "New keyword opportunities detected",
        description: "We've identified 15 keywords where you're ranking on page 2 with potential to move to page 1 with optimization."
      }
    ],
    recommendations: [
      {
        title: "Optimize meta titles for higher CTR",
        description: "Your top 10 pages have an average CTR of 2.3%, which is below industry average. Review and update meta titles to be more compelling and include target keywords near the beginning.",
        priority: "high"
      },
      {
        title: "Improve mobile page experience",
        description: "Address mobile usability issues flagged in Google Search Console to improve mobile rankings and CTR. Focus on text size, tap targets, and viewport configuration.",
        priority: "high"
      },
      {
        title: "Create content for keyword gaps",
        description: "Your competitors are ranking for keywords related to [specific topic] that your site doesn't currently address. Consider creating content targeting these terms.",
        priority: "medium"
      },
      {
        title: "Consolidate similar content",
        description: "Several blog posts cover similar topics and may be competing with each other. Consider consolidating these posts into comprehensive guides.",
        priority: "low"
      }
    ]
  };
};

const InsightsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [selectedProperty, setSelectedProperty] = useState('');
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

  const handlePropertyChange = (property: string) => {
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

      // In a real app, this would call the API
      // For MVP, use mock data with a delay
      setTimeout(() => {
        const mockInsights = generateMockInsights();
        setInsights(mockInsights);
        setCredits(prev => Math.max(0, prev - 1));
        setGenerating(false);
      }, 2000);

    } catch (err) {
      console.error('Failed to generate insights:', err);
      setError('Failed to generate insights. Please try again.');
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