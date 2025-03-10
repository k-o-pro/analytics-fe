import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Skeleton,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Lightbulb as InsightIcon, 
  OpenInNew as ExternalLinkIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import PropertySelector from '../components/dashboard/PropertySelector';
import DateRangePicker from '../components/dashboard/DateRangePicker';
import { gscService, DateRange, TopPage, GSCProperty } from '../services/gscService';
import { creditsService } from '../services/creditsService';

const TopPagesPage: React.FC = () => {
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
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [credits, setCredits] = useState(0);
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);

  const fetchData = useCallback(async () => {
    if (!selectedProperty) return;
    
    try {
      setLoading(true);
      setError(null);
      setShowPremiumAlert(false);

      const response = await gscService.getTopPages(
        selectedProperty.siteUrl,
        selectedRange.startDate,
        selectedRange.endDate,
        (page + 1) * rowsPerPage // requested limit
      );

      setTopPages(response.pages);
      setTotalPages(response.pages.length);
      
      if (page * rowsPerPage + rowsPerPage > 10 && response.creditsRemaining === 0) {
        setShowPremiumAlert(true);
      }
      
    } catch (err) {
      console.error('Failed to fetch top pages:', err);
      setError('Failed to load top pages data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedProperty, selectedRange, page, rowsPerPage]);

  // Initialize date ranges and fetch user credits
  useEffect(() => {
    const ranges = gscService.getDateRanges();
    setDateRanges(ranges);
    setSelectedRange(ranges[1]); // Default to 30 days
    
    fetchUserCredits();
  }, []);

  // Fetch data when property or date range changes
  useEffect(() => {
    if (selectedProperty && selectedRange.startDate && selectedRange.endDate) {
      fetchData();
    }
  }, [selectedProperty, selectedRange, page, rowsPerPage, fetchData]);

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
    setPage(0); // Reset to first page when changing property
  };

  const handleDateRangeChange = (range: DateRange) => {
    setSelectedRange(range);
    setPage(0); // Reset to first page when changing date range
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    // Check if need to use credits for pages beyond 10
    if (newPage * rowsPerPage >= 10 && credits <= 0) {
      setShowPremiumAlert(true);
      return;
    }
    
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    
    // Check if need to use credits for rows beyond 10
    if (newRowsPerPage > 10 && credits <= 0) {
      setShowPremiumAlert(true);
      return;
    }
    
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleUseCredit = async () => {
    // Use a credit to unlock more pages
    const result = await creditsService.useCredits({
      amount: 1,
      purpose: 'Unlock additional top pages analysis'
    });
    
    if (result.success) {
      setCredits(result.credits);
      setShowPremiumAlert(false);
      fetchData();
    } else {
      // Handle failure
      setError('Failed to use credit. Please try again.');
    }
  };

  const handleViewInsights = (url: string) => {
    // Navigate to insights page for specific URL
    navigate(`/insights?url=${encodeURIComponent(url)}`);
  };

  // Helper function to render delta change indicators
  const renderDelta = (value: number | undefined, reverse = false) => {
    if (!value || Math.abs(value) < 0.01) {
      return <TrendingFlat color="disabled" fontSize="small" />;
    }
    
    const isPositive = value > 0;
    
    // For position, lower is better so we reverse the logic
    const isImprovement = reverse ? !isPositive : isPositive;
    
    return isPositive ? 
      <TrendingUp color={isImprovement ? "success" : "error"} fontSize="small" /> : 
      <TrendingDown color={isImprovement ? "success" : "error"} fontSize="small" />;
  };

  // Helper function to format percentage
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  // Helper function to calculate percentage change
  const calculatePercentChange = (current: number, delta: number | undefined) => {
    if (!delta) return '0%';
    
    const percentChange = (delta / (current - delta)) * 100;
    const sign = percentChange > 0 ? '+' : '';
    return `${sign}${percentChange.toFixed(1)}%`;
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Top Pages
        </Typography>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={fetchData}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        
        {showPremiumAlert && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleUseCredit}
                disabled={credits <= 0}
              >
                Use 1 Credit
              </Button>
            }
          >
            Viewing more than 10 pages requires premium access. 
            {credits > 0 
              ? `You have ${credits} credits remaining.` 
              : 'You have no credits remaining.'}
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
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Page URL</TableCell>
                <TableCell align="right">Clicks</TableCell>
                <TableCell align="right">Impressions</TableCell>
                <TableCell align="right">CTR</TableCell>
                <TableCell align="right">Position</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(rowsPerPage)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton variant="text" width={250} /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" width={120} /></TableCell>
                  </TableRow>
                ))
              ) : topPages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      No data available for the selected date range.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                topPages.map((page) => (
                  <TableRow key={page.url} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                          {page.url}
                        </Typography>
                        {(() => {
                          // Construct the URL outside of the component props
                          let finalUrl = '#';
                          
                          if (selectedProperty?.siteUrl && page.url) {
                            try {
                              // If page.url is already a full URL, use it as is
                              if (page.url.startsWith('http')) {
                                finalUrl = page.url;
                              } else {
                                // Normalize the base URL
                                let baseUrl = selectedProperty.siteUrl;
                                if (!baseUrl.endsWith('/')) {
                                  baseUrl = baseUrl + '/';
                                }

                                // Normalize the page path
                                let pagePath = page.url;
                                if (pagePath.startsWith('/')) {
                                  pagePath = pagePath.slice(1);
                                }

                                // Combine base URL and page path
                                finalUrl = `${baseUrl}${pagePath}`;
                              }
                              
                              // Debug log final URL
                              console.log('Page URL:', page.url, 'Final URL:', finalUrl);
                            } catch (err) {
                              console.error('Error constructing URL:', err);
                            }
                          }
                          
                          return (
                            <Tooltip title={`Open ${finalUrl} in new tab`}>
                              <IconButton 
                                size="small"
                                href={finalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ ml: 1 }}
                                onClick={(e) => {
                                  // Add a click handler to ensure URL is used correctly
                                  if (finalUrl === '#') {
                                    e.preventDefault();
                                    console.error('Invalid URL construction');
                                  }
                                }}
                              >
                                <ExternalLinkIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          );
                        })()}
                      </Box>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {renderDelta(page.deltaClicks)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {page.clicks.toLocaleString()}
                          {page.deltaClicks && (
                            <Typography 
                              component="span" 
                              variant="caption" 
                              color={page.deltaClicks > 0 ? 'success.main' : page.deltaClicks < 0 ? 'error.main' : 'text.secondary'}
                              sx={{ ml: 0.5 }}
                            >
                              ({calculatePercentChange(page.clicks, page.deltaClicks)})
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {renderDelta(page.deltaImpressions)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {page.impressions.toLocaleString()}
                          {page.deltaImpressions && (
                            <Typography 
                              component="span" 
                              variant="caption" 
                              color={page.deltaImpressions > 0 ? 'success.main' : page.deltaImpressions < 0 ? 'error.main' : 'text.secondary'}
                              sx={{ ml: 0.5 }}
                            >
                              ({calculatePercentChange(page.impressions, page.deltaImpressions)})
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {renderDelta(page.deltaCtr)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {formatPercent(page.ctr)}
                          {page.deltaCtr && (
                            <Typography 
                              component="span" 
                              variant="caption" 
                              color={page.deltaCtr > 0 ? 'success.main' : page.deltaCtr < 0 ? 'error.main' : 'text.secondary'}
                              sx={{ ml: 0.5 }}
                            >
                              ({calculatePercentChange(page.ctr, page.deltaCtr)})
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {renderDelta(page.deltaPosition, true)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {page.position.toFixed(1)}
                          {page.deltaPosition && (
                            <Typography 
                              component="span" 
                              variant="caption" 
                              color={page.deltaPosition < 0 ? 'success.main' : page.deltaPosition > 0 ? 'error.main' : 'text.secondary'}
                              sx={{ ml: 0.5 }}
                            >
                              ({page.deltaPosition < 0 ? '+' : ''}{(-page.deltaPosition).toFixed(1)})
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Tooltip title="Generate insights">
                        <IconButton
                          size="small"
                          onClick={() => handleViewInsights(page.url)}
                          color="primary"
                        >
                          <InsightIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalPages}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          About Top Pages
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" paragraph>
          This report shows the pages on your site with the most impressions in Google Search results.
          Use it to identify your best performing content and opportunities for improvement.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Metrics explained:</strong>
        </Typography>
        <ul>
          <li>
            <Typography variant="body2" color="text.secondary">
              <strong>Clicks:</strong> Number of times users clicked through to your site from search results
            </Typography>
          </li>
          <li>
            <Typography variant="body2" color="text.secondary">
              <strong>Impressions:</strong> How many times your pages appeared in search results
            </Typography>
          </li>
          <li>
            <Typography variant="body2" color="text.secondary">
              <strong>CTR:</strong> Click-through rate (clicks ÷ impressions)
            </Typography>
          </li>
          <li>
            <Typography variant="body2" color="text.secondary">
              <strong>Position:</strong> Average position in search results (lower numbers are better)
            </Typography>
          </li>
        </ul>
      </Paper>
    </Box>
  );
};

export default TopPagesPage;