import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Box, Typography, Paper, Alert, Button, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import PropertySelector from '../components/dashboard/PropertySelector';
import DateRangePicker from '../components/dashboard/DateRangePicker';
import MetricCard from '../components/visualizations/MetricCard';
import PerformanceChart from '../components/visualizations/PerformanceChart';
import { gscService, DateRange, GSCProperty } from '../services/gscService';

// Helper function to calculate summary metrics from GSC data
const calculateSummaryMetrics = (rows: any[]) => {
  if (!rows.length) {
    return {
      clicks: 0,
      impressions: 0,
      ctr: 0,
      position: 0
    };
  }

  const totals = rows.reduce((acc, row) => ({
    clicks: acc.clicks + (row.clicks || 0),
    impressions: acc.impressions + (row.impressions || 0),
    ctr: acc.ctr + (row.ctr || 0),
    position: acc.position + (row.position || 0)
  }), {
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0
  });

  return {
    clicks: totals.clicks,
    impressions: totals.impressions,
    ctr: totals.ctr / rows.length,
    position: totals.position / rows.length
  };
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<GSCProperty | null>(null);
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
    if (!selectedProperty) return;
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching performance data for:', {
        property: selectedProperty.siteUrl,
        dateRange: selectedRange
      });

      // Get previous period date range
      const { startDate: prevStartDate, endDate: prevEndDate } = 
        gscService.getPreviousPeriod(selectedRange.startDate, selectedRange.endDate);

      // Fetch current period data
      const currentResponse = await gscService.fetchMetrics({
        siteUrl: selectedProperty.siteUrl,
        startDate: selectedRange.startDate,
        endDate: selectedRange.endDate
      });

      // Fetch previous period data
      const previousResponse = await gscService.fetchMetrics({
        siteUrl: selectedProperty.siteUrl,
        startDate: prevStartDate,
        endDate: prevEndDate
      });

      if (!currentResponse.rows?.length) {
        console.warn('No data received for current period');
        setError('No data available for the selected date range');
        return;
      }

      // Calculate metrics for both periods
      const currentMetrics = calculateSummaryMetrics(currentResponse.rows);
      const previousMetrics = calculateSummaryMetrics(previousResponse.rows || []);
      
      console.log('Calculated metrics:', { currentMetrics, previousMetrics });

      setSummaryMetrics(currentMetrics);
      setPreviousSummaryMetrics(previousMetrics);
      setPerformanceData(currentResponse.rows);

    } catch (err) {
      console.error('Failed to load performance data:', err);
      setError('Failed to load performance data. Please check the console for details.');
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
  

  const handlePropertyChange = (property: GSCProperty) => {
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