import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Box, Typography, Paper, Alert, Button, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

import PropertySelector from '../components/dashboard/PropertySelector';
import DateRangePicker from '../components/dashboard/DateRangePicker';
import MetricCard from '../components/visualizations/MetricCard';
import PerformanceChart from '../components/visualizations/PerformanceChart';
import { gscService, DateRange } from '../services/gscService';

// Generate mock data for demo purposes
const generateMockData = (startDate: string, endDate: string, property: string) => {
  const result = [];
  let current = new Date(startDate);
  const end = new Date(endDate);
  
  // Use property URL to generate unique but consistent seed
  const seed = property.split('.').length;
  
  // Base values that will be unique per property
  let clicks = 100 * seed;
  let impressions = 1000 * seed;
  let position = 20 - seed;
  
  
  // Add a data point for each day
  while (current <= end) {
    // Random factors
    const dayFactor = 0.9 + Math.random() * 0.2;
    const dateFactor = 1 + (current.getDay() % 3) * 0.1; // Weekend boost
    
    // Calculate metrics with some randomness and trends
    const dayClicks = Math.round(clicks * dayFactor * dateFactor);
    const dayImpressions = Math.round(impressions * dayFactor * dateFactor);
    const dayCtr = dayClicks / dayImpressions;
    const dayPosition = Math.max(1, position * (0.95 + Math.random() * 0.1));
    
    result.push({
      date: format(current, 'yyyy-MM-dd'),
      clicks: dayClicks,
      impressions: dayImpressions,
      ctr: dayCtr,
      position: dayPosition
    });
    
    // Update for next day with slight upward trend
    current.setDate(current.getDate() + 1);
    clicks = Math.round(clicks * 1.01);
    impressions = Math.round(impressions * 1.01);
    position = Math.max(1, position * 0.995);
  }
  
  return result;
};

// Calculate summary metrics
const calculateSummaryMetrics = (data: any[]) => {
  if (!data.length) return { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  
  const totals = data.reduce((acc, day) => {
    acc.clicks += day.clicks;
    acc.impressions += day.impressions;
    acc.positions.push(day.position);
    return acc;
  }, { clicks: 0, impressions: 0, positions: [] as number[] });
  
  // Add type annotation for the sum parameter
  const avgPosition = totals.positions.reduce((sum: number, pos: number) => sum + pos, 0) / totals.positions.length;
  const ctr = totals.clicks / totals.impressions;
  
  return {
    clicks: totals.clicks,
    impressions: totals.impressions,
    ctr,
    position: avgPosition
  };
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState('');
  const [dateRanges, setDateRanges] = useState<DateRange[]>([]);
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    startDate: '',
    endDate: '',
    label: 'Last 30 days'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [summaryMetrics, setSummaryMetrics] = useState({
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0
  });
  const [previousSummaryMetrics, setPreviousSummaryMetrics] = useState({
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0
  });

  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { startDate: prevStartDate, endDate: prevEndDate } = 
        gscService.getPreviousPeriod(selectedRange.startDate, selectedRange.endDate);
      
      const currentMetrics = calculateSummaryMetrics(currentData);
      const previousMetrics = calculateSummaryMetrics(previousData);
      const response = await fetch('/gsc/data', {
        method: 'POST',
        body: JSON.stringify({
          siteUrl: selectedProperty,
          startDate: selectedRange.startDate,
          endDate: selectedRange.endDate
        })
      });
      
      const data = await response.json();
      setPerformanceData(data);
      
    } catch (err) {
      setError('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  }, [selectedProperty, selectedRange]);

  // Initialize date ranges
  useEffect(() => {
    const ranges = gscService.getDateRanges();
    setDateRanges(ranges);
    setSelectedRange(ranges[1]); // Default to 30 days
  }, []);

  // Fetch data when property or date range changes
  useEffect(() => {
    if (selectedProperty && selectedRange.startDate && selectedRange.endDate) {
      fetchPerformanceData();
    }
  }, [selectedProperty, selectedRange, fetchPerformanceData]); // Add fetchPerformanceData
  

  const handlePropertyChange = (property: string) => {
    setSelectedProperty(property);
    setSummaryMetrics({
      clicks: 0,
      impressions: 0, 
      ctr: 0,
      position: 0
    });
    setPreviousSummaryMetrics({
      clicks: 0,
      impressions: 0,
      ctr: 0, 
      position: 0
    });
    setPerformanceData([]);
    setError(null);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setSelectedRange(range);
  };

  const handleConnectGSC = () => {
    navigate('/connect-gsc');
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Search Performance Dashboard
        </Typography>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={fetchPerformanceData}>
                Retry
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
            Connect Google Search Console to see your search performance
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            To get started, connect your Google Search Console account to analyze your website's search performance.
          </Typography>
          <Button 
            variant="contained"
            onClick={handleConnectGSC}
            sx={{ mt: 2 }}
          >
            Connect Google Search Console
          </Button>
        </Paper>
      ) : (
        <>
          {/* Summary Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Clicks"
                value={summaryMetrics.clicks}
                previousValue={previousSummaryMetrics.clicks}
                isLoading={loading}
                tooltipText="Total number of clicks from Google Search results"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Impressions"
                value={summaryMetrics.impressions}
                previousValue={previousSummaryMetrics.impressions}
                isLoading={loading}
                tooltipText="Number of times your site appeared in search results"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="CTR"
                value={summaryMetrics.ctr}
                previousValue={previousSummaryMetrics.ctr}
                format="percent"
                isLoading={loading}
                tooltipText="Click-through rate (clicks divided by impressions)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Position"
                value={summaryMetrics.position}
                previousValue={previousSummaryMetrics.position}
                format="position"
                isLoading={loading}
                tooltipText="Average position in search results (lower is better)"
              />
            </Grid>
          </Grid>
          
          {/* Performance Charts */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <PerformanceChart
                title="Clicks & Impressions Over Time"
                data={performanceData}
                metrics={['clicks', 'impressions']}
                isLoading={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PerformanceChart
                title="Click-Through Rate (CTR)"
                data={performanceData}
                metrics={['ctr']}
                isLoading={loading}
                height={300}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PerformanceChart
                title="Average Position"
                data={performanceData}
                metrics={['position']}
                isLoading={loading}
                height={300}
              />
            </Grid>
          </Grid>
          
          {/* Quick Actions */}
          <Paper sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  onClick={() => navigate('/top-pages')}
                >
                  View Top Pages
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  fullWidth 
                  variant="outlined"
                  onClick={() => navigate('/insights')}
                >
                  Generate Insights
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  fullWidth 
                  variant="outlined"
                  onClick={() => navigate('/settings')}
                >
                  Manage Properties
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default DashboardPage;