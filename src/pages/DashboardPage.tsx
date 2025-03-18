import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Box, Typography, Paper, Alert, Button, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import PropertySelector from '../components/dashboard/PropertySelector';
import DateRangePicker from '../components/dashboard/DateRangePicker';
import MetricCard from '../components/visualizations/MetricCard';
import PerformanceChart from '../components/visualizations/PerformanceChart';
import { gscService } from '../services/gscService';
import { DateRange, GSCProperty } from '../types/api';

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
    position: acc.position + (row.position || 0)
  }), {
    clicks: 0,
    impressions: 0,
    position: 0
  });

  // Calculate CTR correctly
  const calculatedCtr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;

  return {
    clicks: totals.clicks,
    impressions: totals.impressions,
    ctr: calculatedCtr,
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
      
      // Log the property and date range we're using
      console.log('Fetching performance data for:', {
        property: selectedProperty.siteUrl,
        dateRange: selectedRange
      });
      
      // Make the API request to fetch GSC metrics
      try {
        // Try with original URL format
        console.log(`Attempting to fetch metrics with site URL: ${selectedProperty.siteUrl}`);
        
        const response = await gscService.fetchMetrics({
          siteUrl: selectedProperty.siteUrl,
          startDate: selectedRange.startDate,
          endDate: selectedRange.endDate
        });
        
        // Calculate summary metrics
        const metrics = calculateSummaryMetrics(response.rows || []);
        setSummaryMetrics(metrics);
        
        // Get performance data for chart
        setPerformanceData(response.rows || []);
        
        // If we successfully got data, clear any previous error
        setError(null);
        
        // Calculate previous period metrics for comparison
        const prevPeriod = gscService.getPreviousPeriod(
          selectedRange.startDate,
          selectedRange.endDate
        );
        
        try {
          const prevResponse = await gscService.fetchMetrics({
            siteUrl: selectedProperty.siteUrl,
            startDate: prevPeriod.startDate,
            endDate: prevPeriod.endDate
          });
          
          const prevMetrics = calculateSummaryMetrics(prevResponse.rows || []);
          setPreviousSummaryMetrics(prevMetrics);
        } catch (prevPeriodError) {
          console.warn('Failed to load previous period data:', prevPeriodError);
          // Not setting an error here as the main data loaded successfully
          setPreviousSummaryMetrics({
            clicks: 0,
            impressions: 0,
            ctr: 0,
            position: 0
          });
        }
      } catch (apiError: any) {
        console.error('Failed to load performance data:', apiError);
        
        // Try to extract useful information from the error
        const errorMessage = apiError.message || 'Unknown error occurred';
        
        // Check for URL format suggestions
        if (errorMessage.includes('Try using one of these formats') || 
            errorMessage.includes('You might try using one of these formats')) {
          
          // Extract the suggested format with a regex
          const match = errorMessage.match(/sc-domain:[^\s,]+/);
          if (match && match[0]) {
            setError(`Site URL format may be incorrect. Would you like to try using "${match[0]}" instead?`);
            
            // Add a button to the error Alert that will retry with the suggested format
            // We'll implement this directly in the Alert component in the render method
            return;
          }
        }
        
        // Handle different error types
        if (errorMessage.includes('Server error')) {
          setError('The analytics server encountered an error. This is often temporary - please try again in a few minutes.');
        } else if (errorMessage.includes('session has expired')) {
          setError('Your session has expired. Please refresh the page to log in again.');
        } else if (errorMessage.includes('rate limit')) {
          setError('You have exceeded the rate limit for API requests. Please wait a moment and try again.');
        } else if (errorMessage.includes('Permission denied') || errorMessage.includes('permission to access')) {
          setError(
            `You don't have permission to access data for this property in Google Search Console. 
            Please verify that you have access to this property in GSC or try using a different property.`
          );
        } else if (!selectedProperty.siteUrl.startsWith('sc-domain:') && !selectedProperty.siteUrl.startsWith('http')) {
          setError(`The property URL format may be incorrect. Try using "sc-domain:${selectedProperty.siteUrl}" instead.`);
        } else {
          setError('Failed to load performance data. ' + errorMessage);
        }
        
        // Reset data on error
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
      }
    } catch (err) {
      console.error('Failed to load performance data:', err);
      setError('An unexpected error occurred while loading performance data. Please check the console for details.');
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
    console.log('Selected property:', property);
    
    // Verify URL format
    if (!property.siteUrl.startsWith('sc-domain:') && !property.siteUrl.startsWith('http://') && !property.siteUrl.startsWith('https://')) {
      console.warn('Property URL may not be in the correct format:', property.siteUrl);
    }
    
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
              error.includes('Would you like to try using "sc-domain:') ? (
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={() => {
                    // Extract the suggested format
                    const match = error.match(/\"(sc-domain:[^\"]+)\"/);
                    if (match && match[1] && selectedProperty) {
                      // Create a modified property with the suggested URL format
                      const modifiedProperty = {
                        ...selectedProperty,
                        siteUrl: match[1]
                      };
                      // Update the selected property and retry
                      setSelectedProperty(modifiedProperty);
                      // The useEffect hook will automatically trigger fetchPerformanceData
                    } else {
                      // Fallback to regular retry
                      fetchPerformanceData();
                    }
                  }}
                >
                  Try Suggested Format
                </Button>
              ) : (
                <Button color="inherit" size="small" onClick={fetchPerformanceData}>
                  Retry
                </Button>
              )
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