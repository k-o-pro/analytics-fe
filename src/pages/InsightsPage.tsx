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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab
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
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  EmojiObjects as OpportunityIcon,
  Keyboard as KeywordIcon,
  BarChart as ChartIcon,
  DataObject as RawDataIcon,
  Insights as InsightsIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

import PropertySelector from '../components/dashboard/PropertySelector';
import DateRangePicker from '../components/dashboard/DateRangePicker';
import { gscService } from '../services/gscService';
import { DateRange, GSCProperty } from '../types/api';
import { 
  insightsService, 
  InsightResponse, 
  TopItem
} from '../services/insightsService';
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
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<InsightResponse | null>(null);
  const [credits, setCredits] = useState(0);
  const [targetPageUrl, setTargetPageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [dataTabActive, setDataTabActive] = useState(0);

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

  const handleGenerateInsights = async (formData: { siteUrl: string; period: string; }) => {
    setLoading(true);
    try {
      const insights = await insightsService.getInsights(formData.siteUrl, formData.period);
      setInsights(insights);
    } catch (error) {
      console.error('Error generating insights:', error);
      setError('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!selectedProperty) return;
    
    setLoading(true);
    try {
      const insights = await insightsService.getInsights(
        selectedProperty.siteUrl,
        `${selectedRange.startDate} to ${selectedRange.endDate}`,
        targetPageUrl,
        true // refresh data
      );
      setInsights(insights);
      
      // Refresh credits
      try {
        const userCredits = await creditsService.getCredits();
        setCredits(userCredits);
      } catch (creditError) {
        console.error('Error fetching credits:', creditError);
      }
    } catch (error) {
      console.error('Error refreshing insights:', error);
      setError('Failed to refresh insights');
    } finally {
      setLoading(false);
    }
  };

  const renderTrendIcon = (trend: 'up' | 'down' | 'stable' | 'mixed') => {
    switch (trend) {
      case 'up':
        return <TrendingUp sx={{ color: theme.palette.success.main }} />;
      case 'down':
        return <TrendingDown sx={{ color: theme.palette.error.main }} />;
      case 'mixed':
        return <TrendingFlat sx={{ color: theme.palette.warning.main }} />;
      default:
        return <TrendingFlat sx={{ color: theme.palette.text.secondary }} />;
    }
  };

  const renderImpactLevelIcon = (impactLevel: 'high' | 'medium' | 'low' | undefined) => {
    if (!impactLevel) return null;
    
    switch (impactLevel) {
      case 'high':
        return <Chip 
          label="High Impact" 
          size="small" 
          color="error"
          sx={{ ml: 1, height: 20 }}
        />;
      case 'medium':
        return <Chip 
          label="Medium Impact" 
          size="small" 
          color="warning"
          sx={{ ml: 1, height: 20 }}
        />;
      case 'low':
        return <Chip 
          label="Low Impact" 
          size="small" 
          color="success"
          sx={{ ml: 1, height: 20 }}
        />;
      default:
        return null;
    }
  };

  const renderDifficultyChip = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Chip 
          label="Easy" 
          size="small" 
          color="success"
          sx={{ ml: 1, height: 20 }}
        />;
      case 'moderate':
        return <Chip 
          label="Moderate" 
          size="small" 
          color="warning"
          sx={{ ml: 1, height: 20 }}
        />;
      case 'complex':
        return <Chip 
          label="Complex" 
          size="small" 
          color="error"
          sx={{ ml: 1, height: 20 }}
        />;
      default:
        return null;
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

  // Function to handle tab changes
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDataTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setDataTabActive(newValue);
  };

  // Render raw data section with metrics
  const renderRawDataSection = () => {
    if (!insights || !insights.raw_data) return null;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Tabs 
          value={dataTabActive} 
          onChange={handleDataTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="Performance Metrics" icon={<TimelineIcon />} iconPosition="start" />
          <Tab label="Top Keywords" icon={<KeywordIcon />} iconPosition="start" />
          <Tab label="Top Pages" icon={<ChartIcon />} iconPosition="start" />
        </Tabs>
        
        {/* Performance Metrics Tab */}
        {dataTabActive === 0 && (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell>Values</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row">Clicks</TableCell>
                  <TableCell>
                    {insights.raw_data.metrics.clicks.length > 0
                      ? insights.raw_data.metrics.clicks.join(', ')
                      : 'No data available'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Impressions</TableCell>
                  <TableCell>
                    {insights.raw_data.metrics.impressions.length > 0
                      ? insights.raw_data.metrics.impressions.join(', ')
                      : 'No data available'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">CTR</TableCell>
                  <TableCell>
                    {insights.raw_data.metrics.ctr.length > 0
                      ? insights.raw_data.metrics.ctr.map((ctr: number) => `${(ctr * 100).toFixed(2)}%`).join(', ')
                      : 'No data available'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Position</TableCell>
                  <TableCell>
                    {insights.raw_data.metrics.position.length > 0
                      ? insights.raw_data.metrics.position.join(', ')
                      : 'No data available'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {/* Top Keywords Tab */}
        {dataTabActive === 1 && (
          insights.raw_data.top_keywords.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Keyword</TableCell>
                    <TableCell align="right">Clicks</TableCell>
                    <TableCell align="right">Impressions</TableCell>
                    <TableCell align="right">CTR</TableCell>
                    <TableCell align="right">Position</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {insights.raw_data.top_keywords.map((keyword: TopItem, index: number) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">{keyword.name}</TableCell>
                      <TableCell align="right">{keyword.metrics.clicks || '-'}</TableCell>
                      <TableCell align="right">{keyword.metrics.impressions || '-'}</TableCell>
                      <TableCell align="right">
                        {keyword.metrics.ctr 
                          ? `${(keyword.metrics.ctr * 100).toFixed(2)}%` 
                          : '-'}
                      </TableCell>
                      <TableCell align="right">{keyword.metrics.position?.toFixed(1) || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No keyword data available</Alert>
          )
        )}
        
        {/* Top Pages Tab */}
        {dataTabActive === 2 && (
          insights.raw_data.top_pages.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Page URL</TableCell>
                    <TableCell align="right">Clicks</TableCell>
                    <TableCell align="right">Impressions</TableCell>
                    <TableCell align="right">CTR</TableCell>
                    <TableCell align="right">Position</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {insights.raw_data.top_pages.map((page: TopItem, index: number) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row" sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Tooltip title={page.name}>
                          <span>{page.name}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">{page.metrics.clicks || '-'}</TableCell>
                      <TableCell align="right">{page.metrics.impressions || '-'}</TableCell>
                      <TableCell align="right">
                        {page.metrics.ctr 
                          ? `${(page.metrics.ctr * 100).toFixed(2)}%` 
                          : '-'}
                      </TableCell>
                      <TableCell align="right">{page.metrics.position?.toFixed(1) || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No page data available</Alert>
          )
        )}
      </Box>
    );
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
              onClick={() => {
                if (selectedProperty) {
                  handleGenerateInsights({
                    siteUrl: selectedProperty.siteUrl,
                    period: `${selectedRange.startDate} to ${selectedRange.endDate}`
                  });
                }
              }}
              disabled={loading || credits < 1}
              startIcon={loading ? <CircularProgress size={20} /> : <LightbulbIcon />}
            >
              Generate Insights (1 credit)
            </Button>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            What's included in the analysis:
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
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
            <Grid item xs={12} sm={6} md={3}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Key Findings" 
                    secondary="Notable observations with impact levels" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Opportunities" 
                    secondary="Actionable improvements with difficulty ratings" 
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Actionable Recommendations" 
                    secondary="Prioritized steps with implementation details" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Expected Outcomes" 
                    secondary="Projected results for each recommendation" 
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Keyword Insights" 
                    secondary="Rising and declining search terms" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Missed Opportunities" 
                    secondary="Keywords with potential for improvement" 
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="AI Analysis" icon={<InsightsIcon />} iconPosition="start" />
              <Tab label="Raw Data" icon={<RawDataIcon />} iconPosition="start" />
            </Tabs>
            
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={credits < 1}
            >
              Refresh Insights (1 credit)
            </Button>
          </Box>
          
          {/* AI Analysis Tab */}
          <Box hidden={activeTab !== 0}>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  Summary
                </Typography>
                {insights.ai_analysis.performance && (
                  <Chip 
                    icon={renderTrendIcon(insights.ai_analysis.performance.trend)} 
                    label={`Trend: ${insights.ai_analysis.performance.trend.charAt(0).toUpperCase() + insights.ai_analysis.performance.trend.slice(1)}`} 
                    color={
                      insights.ai_analysis.performance.trend === 'up' ? 'success' : 
                      insights.ai_analysis.performance.trend === 'down' ? 'error' : 
                      insights.ai_analysis.performance.trend === 'mixed' ? 'warning' : 'default'
                    }
                    variant="outlined"
                    size="small"
                    sx={{ ml: 2 }}
                  />
                )}
                {insights.ai_analysis.performance && insights.ai_analysis.performance.changePercent && (
                  <Chip 
                    label={`Change: ${insights.ai_analysis.performance.changePercent}`}
                    variant="outlined"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
                {insights.ai_analysis.performance && insights.ai_analysis.performance.timePeriod && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                    {insights.ai_analysis.performance.timePeriod}
                  </Typography>
                )}
              </Box>
              <Typography variant="body1" paragraph>
                {insights.ai_analysis.summary}
              </Typography>
              {insights.ai_analysis.performance && (
                <>
                  {insights.ai_analysis.performance.keyMetricChanges && insights.ai_analysis.performance.keyMetricChanges.length > 0 && (
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Metric</TableCell>
                            <TableCell align="right">Change</TableCell>
                            <TableCell>Interpretation</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {insights.ai_analysis.performance.keyMetricChanges.map((metric, i) => (
                            <TableRow key={i}>
                              <TableCell component="th" scope="row">
                                {metric.metric.charAt(0).toUpperCase() + metric.metric.slice(1)}
                              </TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                  {metric.change.startsWith('+') ? 
                                    <TrendingUp fontSize="small" color="success" sx={{ mr: 0.5 }} /> :
                                    metric.change.startsWith('-') ?
                                    <TrendingDown fontSize="small" color="error" sx={{ mr: 0.5 }} /> :
                                    <TrendingFlat fontSize="small" color="disabled" sx={{ mr: 0.5 }} />
                                  }
                                  {metric.change}
                                </Box>
                              </TableCell>
                              <TableCell>{metric.interpretation}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {insights.ai_analysis.performance.details}
                  </Typography>
                </>
              )}
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  This analysis is AI-generated based on the raw data shown in the "Raw Data" tab. All insights are derived from actual GSC data.
                </Typography>
              </Alert>
            </Paper>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Key Findings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List>
                    {insights.ai_analysis.topFindings.map((finding, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <Card variant="outlined" sx={{ width: '100%', mb: 1 }}>
                          <CardContent sx={{ pb: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <InfoIcon color="primary" sx={{ mr: 1.5, mt: 0.3 }} />
                              <Box sx={{ width: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                  <Typography variant="subtitle1" component="div">
                                    {finding.title}
                                  </Typography>
                                  {renderImpactLevelIcon(finding.impactLevel)}
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                                  {finding.description}
                                </Typography>
                                {finding.dataPoints && finding.dataPoints.length > 0 && (
                                  <Box sx={{ mt: 1, bgcolor: 'background.default', p: 1, borderRadius: 1 }}>
                                    <Typography variant="caption" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                      Supporting Data:
                                    </Typography>
                                    <List dense disablePadding>
                                      {finding.dataPoints.map((point, i) => (
                                        <ListItem key={i} sx={{ py: 0.25 }}>
                                          <ListItemIcon sx={{ minWidth: 24 }}>
                                            <ArrowForward fontSize="small" color="disabled" />
                                          </ListItemIcon>
                                          <ListItemText primary={<Typography variant="caption">{point}</Typography>} />
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Box>
                                )}
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
                    {insights.ai_analysis.recommendations.map((recommendation, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <Card variant="outlined" sx={{ width: '100%', mb: 1 }}>
                          <CardContent sx={{ pb: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <Box sx={{ mr: 1.5, mt: 0.3 }}>
                                {renderPriorityIcon(recommendation.priority)}
                              </Box>
                              <Box sx={{ width: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
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
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  {recommendation.description}
                                </Typography>
                                
                                {(recommendation.expectedOutcome || recommendation.implementationSteps) && (
                                  <Accordion 
                                    disableGutters 
                                    elevation={0} 
                                    sx={{ 
                                      mt: 1,
                                      '&:before': { display: 'none' },
                                      bgcolor: 'background.default',
                                    }}
                                  >
                                    <AccordionSummary
                                      expandIcon={<ExpandMoreIcon />}
                                      sx={{ minHeight: '36px', p: 0 }}
                                    >
                                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Implementation Details</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ px: 1, py: 0 }}>
                                      {recommendation.expectedOutcome && (
                                        <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                                          <strong>Expected Outcome:</strong> {recommendation.expectedOutcome}
                                        </Typography>
                                      )}
                                      
                                      {recommendation.implementationSteps && recommendation.implementationSteps.length > 0 && (
                                        <>
                                          <Typography variant="caption" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                            Implementation Steps:
                                          </Typography>
                                          <List dense disablePadding>
                                            {recommendation.implementationSteps.map((step, i) => (
                                              <ListItem key={i} sx={{ py: 0.25 }}>
                                                <ListItemIcon sx={{ minWidth: 24 }}>
                                                  <CheckCircleIcon fontSize="small" color="primary" />
                                                </ListItemIcon>
                                                <ListItemText primary={<Typography variant="caption">{step}</Typography>} />
                                              </ListItem>
                                            ))}
                                          </List>
                                        </>
                                      )}
                                    </AccordionDetails>
                                  </Accordion>
                                )}
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
              
              {insights.ai_analysis.opportunities && insights.ai_analysis.opportunities.length > 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      Opportunities
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      {insights.ai_analysis.opportunities.map((opportunity, index) => (
                        <Grid item xs={12} md={4} key={index}>
                          <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                <OpportunityIcon color="primary" sx={{ mr: 1.5, mt: 0.3 }} />
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                    <Typography variant="subtitle1" component="div">
                                      {opportunity.title}
                                    </Typography>
                                    {renderDifficultyChip(opportunity.difficulty)}
                                  </Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                                    {opportunity.description}
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                                    <Typography variant="caption" component="div">
                                      <strong>Estimated Impact:</strong> {opportunity.estimatedImpact}
                                    </Typography>
                                    <Typography variant="caption" component="div">
                                      <strong>Time Frame:</strong> {opportunity.timeFrame}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
              )}
              
              {insights.ai_analysis.keywordInsights && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      Keyword Insights
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Typography variant="body2" paragraph>
                      {insights.ai_analysis.keywordInsights.analysis}
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <KeywordIcon color="success" sx={{ mr: 1 }} />
                              <Typography variant="subtitle1">
                                Rising Keywords
                              </Typography>
                            </Box>
                            {insights.ai_analysis.keywordInsights.risingKeywords.length > 0 ? (
                              <List dense disablePadding>
                                {insights.ai_analysis.keywordInsights.risingKeywords.map((keyword, i) => (
                                  <ListItem key={i} sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 28 }}>
                                      <TrendingUp fontSize="small" color="success" />
                                    </ListItemIcon>
                                    <ListItemText primary={keyword} />
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No rising keywords identified.
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <KeywordIcon color="error" sx={{ mr: 1 }} />
                              <Typography variant="subtitle1">
                                Declining Keywords
                              </Typography>
                            </Box>
                            {insights.ai_analysis.keywordInsights.decliningKeywords.length > 0 ? (
                              <List dense disablePadding>
                                {insights.ai_analysis.keywordInsights.decliningKeywords.map((keyword, i) => (
                                  <ListItem key={i} sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 28 }}>
                                      <TrendingDown fontSize="small" color="error" />
                                    </ListItemIcon>
                                    <ListItemText primary={keyword} />
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No declining keywords identified.
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <KeywordIcon color="warning" sx={{ mr: 1 }} />
                              <Typography variant="subtitle1">
                                Missed Opportunities
                              </Typography>
                            </Box>
                            {insights.ai_analysis.keywordInsights.missedOpportunities.length > 0 ? (
                              <List dense disablePadding>
                                {insights.ai_analysis.keywordInsights.missedOpportunities.map((keyword, i) => (
                                  <ListItem key={i} sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 28 }}>
                                      <LightbulbIcon fontSize="small" color="warning" />
                                    </ListItemIcon>
                                    <ListItemText primary={keyword} />
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No missed opportunities identified.
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
          
          {/* Raw Data Tab */}
          <Box hidden={activeTab !== 1}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Raw GSC Data
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This is the actual data from Google Search Console that was used for analysis.
              </Typography>
              {renderRawDataSection()}
            </Paper>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default InsightsPage;