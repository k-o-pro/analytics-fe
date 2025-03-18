import { API_URL } from '../config';
import { getToken } from '../utils/auth';
import { api } from './api';
import { ApiResponse, DateRange, GSCProperty, GSCRow, TopPagesResponse, Insights } from '../types/api';

interface SearchAnalyticsParams {
  startDate: string;
  endDate: string;
  siteUrl: string;
}

export type GSCMetricsRequest = {
  siteUrl: string;
  startDate: string;
  endDate: string;
  dimensions?: string[];
  filters?: any[];
};

export type GSCResponse = {
  rows: GSCRow[];
  suggestions?: string[];
  message?: string;
  notFound?: boolean;
  retried?: boolean;
  permissionDenied?: boolean;
};

export type TopPagesRequest = {
  siteUrl: string;
  startDate: string;
  endDate: string;
  limit?: number;
};

export type { DateRange };

// Define type for OAuth callback response
type OAuthCallbackResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export const gscService = {
  // Get GSC properties connected to user account
  getProperties: async (): Promise<GSCProperty[]> => {
    try {
      console.log('Fetching GSC properties from API');
      const response = await api.get<{success: boolean, data?: any, siteEntry?: GSCProperty[], error?: string, needsConnection?: boolean}>('/gsc/properties');
      
      console.log('GSC properties response:', response.data);
      
      if (!response.data.success) {
        console.warn('Failed to fetch GSC properties:', response.data.error);
        if (response.data.needsConnection) {
          console.log('GSC connection required');
          // Return empty array to indicate no properties (will trigger connection UI)
          return [];
        }
        throw new Error(response.data.error || 'Failed to fetch GSC properties');
      }
      
      // Check if data structure contains siteEntry directly or is nested in data
      if (response.data.siteEntry) {
        return response.data.siteEntry;
      } else if (response.data.data && response.data.data.siteEntry) {
        // The actual property data is in response.data.data.siteEntry
        console.log('Found properties in nested data structure:', response.data.data.siteEntry);
        return response.data.data.siteEntry;
      } else {
        // Log the structure to help debug
        console.warn('Unexpected data structure in GSC properties response:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching GSC properties:', error);
      return [];
    }
  },

  // Connect to GSC
  getAuthUrl: (): string => {
    const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    
    // Get client ID from environment - hardcoded for now as a fallback if env var fails
    const fallbackClientId = '724601444957-h1sofo90i307cjln4ds6jbdo601t314m.apps.googleusercontent.com';
    const clientId = process.env['REACT_APP_GOOGLE_CLIENT_ID'] || fallbackClientId;
    
    // Handle GitHub Pages URL structure
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const isGitHubPages = pathname.includes('/analytics/'); // Adjust this based on your GitHub Pages path
    
    // Construct the redirect URI based on the environment
    let redirectUri;
    if (isGitHubPages) {
      // For GitHub Pages, use the full path including the repository name
      redirectUri = `${origin}${pathname.split('/').slice(0, -1).join('/')}/oauth-callback`;
    } else {
      // For local development or other environments
      redirectUri = `${origin}/oauth-callback`;
    }
    
    // For debugging
    console.log('OAuth Debug Info:');
    console.log('- Origin:', origin);
    console.log('- Pathname:', pathname);
    console.log('- Is GitHub Pages:', isGitHubPages);
    console.log('- Redirect URI:', redirectUri);
    console.log('- Client ID:', clientId);
    console.log('- Environment variable present:', process.env['REACT_APP_GOOGLE_CLIENT_ID'] ? 'Yes' : 'No');
    console.log('- User authentication status:', localStorage.getItem('token') ? 'Logged in' : 'Not logged in');
    
    // Force token check - if user is not logged in, redirect to login first
    if (!localStorage.getItem('token')) {
      console.warn('User not logged in before GSC connection attempt - redirecting to login first');
      window.location.href = '/login?redirect=connect-gsc';
      return '';
    }
    
    // Build the OAuth URL parameters
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('redirect_uri', redirectUri);
    params.append('response_type', 'code');
    params.append('scope', 'https://www.googleapis.com/auth/webmasters.readonly');
    params.append('access_type', 'offline');
    params.append('prompt', 'consent'); // Always show consent screen to ensure refresh token
    
    // Add a state parameter with timestamp and random value to prevent CSRF
    const stateObj = {
      t: Date.now(),
      r: Math.random().toString(36).substring(2, 15)
    };
    params.append('state', JSON.stringify(stateObj));
    
    const authUrl = `${baseUrl}?${params.toString()}`;
    console.log('- Generated Auth URL:', authUrl);
    
    // Save auth state in sessionStorage for verification
    sessionStorage.setItem('oauth_state', JSON.stringify(stateObj));
    
    return authUrl;
  },

  // Handle OAuth callback
  handleCallback: async (code: string): Promise<boolean> => {
    try {
      console.log('Processing OAuth callback with code:', code.substring(0, 5) + '...');
      
      // Verify that the auth token is attached to requests
      const token = localStorage.getItem('token');
      console.log('Authorization token present:', !!token);
      
      // Make sure token is set in api
      if (token) {
        api.setAuthToken(token);
        console.log('Auth token set in API service');
      } else {
        console.error('NO AUTH TOKEN AVAILABLE! OAuth will fail');
        return false;
      }
      
      // Add retry logic for potential network issues
      let retries = 0;
      const maxRetries = 2;
      
      while (retries <= maxRetries) {
        try {
          console.log(`Attempt ${retries + 1} to send OAuth code to backend`);
          
          // Send the code to the backend for token exchange
          const response = await api.post<OAuthCallbackResponse>('/auth/callback', { 
            code,
            state: 'callback' // Include state parameter for validation
          });
          
          console.log('OAuth callback response:', response.status, response.data);
          
          if (response.data && response.data.success) {
            console.log('OAuth callback successful');
            return true;
          } else {
            console.error('OAuth callback returned success=false:', response.data);
            return false;
          }
        } catch (attemptError) {
          retries++;
          console.error(`Attempt ${retries} failed:`, attemptError);
          
          // Check if it's an auth error
          if ((attemptError as any).response?.status === 401) {
            console.log('Authentication error detected, checking token');
            // Short delay before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else if (retries >= maxRetries) {
            // If we've exhausted retries, re-throw the error
            throw attemptError;
          } else {
            // Wait longer between other types of errors
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      // If we get here, all retries failed
      return false;
    } catch (error) {
      console.error('OAuth callback error:', error);
      
      // Check if it's an axios error with response data
      if (error && (error as any).response) {
        const responseData = (error as any).response.data;
        console.error('Error response data:', responseData);
        const statusCode = (error as any).response.status;
        console.error('Error status code:', statusCode);
        
        // If authentication required error, we need to redirect to login
        if (responseData?.authRequired || statusCode === 401) {
          console.log('Authentication required, will redirect to login');
          throw new Error('Authentication required');
        }
      }
      
      return false;
    }
  },

  fetchSearchAnalytics: async ({ startDate, endDate, siteUrl }: SearchAnalyticsParams) => {
    try {
      const response = await fetch(`${API_URL}/gsc/search-analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          startDate,
          endDate,
          siteUrl
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch search analytics');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching search analytics:', error);
      throw error;
    }
  },

  // Fetch GSC metrics data
  fetchMetrics: async (request: GSCMetricsRequest): Promise<GSCResponse> => {
    try {
      // Comprehensive request validation
      if (!request.siteUrl?.trim()) {
        throw new Error('siteUrl is required and cannot be empty');
      }
      
      if (!request.startDate || !request.endDate) {
        throw new Error('startDate and endDate are required');
      }

      // Validate date format and range
      const formatDate = (date: string): string => {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
          throw new Error(`Invalid date format: ${date}`);
        }
        return d.toISOString().split('T')[0];
      };

      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      const today = new Date();

      if (end > today) {
        console.warn('End date is in the future, adjusting to yesterday');
        end.setDate(today.getDate() - 1);
      }

      if (start > end) {
        throw new Error('Start date must be before end date');
      }

      // Normalize site URL for GSC
      // GSC URLs can be in different formats: sc-domain:example.com, https://example.com, etc.
      const normalizeSiteUrl = (url: string): string => {
        const trimmed = url.trim();
        
        // If it's already in sc-domain format, just return it
        if (trimmed.startsWith('sc-domain:')) {
          return trimmed;
        }
        
        // Remove http:// or https:// and trailing slashes for domain-only format
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          // Extract domain by removing protocol and trailing slashes
          const domainMatch = trimmed.match(/^https?:\/\/([^\/]+)/);
          if (domainMatch && domainMatch[1]) {
            console.log(`Converting URL format from ${trimmed} to sc-domain:${domainMatch[1]}`);
            return `sc-domain:${domainMatch[1]}`;
          }
        }
        
        // If it's a plain domain without protocol, try sc-domain format
        if (!trimmed.includes('://') && !trimmed.startsWith('sc-domain:')) {
          console.log(`Converting URL format from ${trimmed} to sc-domain:${trimmed}`);
          return `sc-domain:${trimmed}`;
        }
        
        // Default to returning the URL with https:// if no other formats match
        return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
      };

      // Try to identify GSC property format issues
      let siteUrl = request.siteUrl.trim();
      const normalizedUrl = normalizeSiteUrl(siteUrl);
      
      if (normalizedUrl !== siteUrl) {
        console.log(`Normalized URL from "${siteUrl}" to "${normalizedUrl}"`);
        // Use the normalized URL instead of the original one, as it's more likely to work with GSC API
        siteUrl = normalizedUrl;
      }

      // Format request with validated data
      const formattedRequest = {
        siteUrl: siteUrl,
        startDate: formatDate(start.toISOString()),
        endDate: formatDate(end.toISOString()),
        dimensions: Array.isArray(request.dimensions) ? request.dimensions : ['date'],
        rowLimit: 100
      };

      console.log('Sending formatted GSC metrics request:', formattedRequest);

      // Implement retries for network failures
      const MAX_RETRIES = 3;
      let retryCount = 0;
      let lastError: any = null;

      while (retryCount <= MAX_RETRIES) {
        try {
          const response = await api.post<GSCResponse>('/gsc/data', formattedRequest);
          
          // Validate response structure
          if (!response.data) {
            throw new Error('Empty response received from GSC API');
          }

          if (!Array.isArray(response.data.rows)) {
            console.warn('Invalid response format, expected rows array:', response.data);
            
            // Check for permission denied response
            if (response.data.permissionDenied) {
              console.error('Permission denied for GSC property:', formattedRequest.siteUrl);
              throw new Error(`You don't have permission to access search data for ${formattedRequest.siteUrl} in Google Search Console. Make sure you've been granted access to this property in GSC.`);
            }
            
            // Check if there's a suggestion to try a different URL format
            if (response.data.suggestions && Array.isArray(response.data.suggestions) && response.data.suggestions.length > 0) {
              console.log('Server suggested trying different URL formats:', response.data.suggestions);
              
              // Try the first suggestion automatically if this was our first attempt
              if (retryCount === 0 && response.data.suggestions[0]) {
                console.log(`Automatically trying suggested URL format: ${response.data.suggestions[0]}`);
                formattedRequest.siteUrl = response.data.suggestions[0];
                retryCount++;
                continue; // Retry with the suggested format
              }
            }
            
            // Return empty rows as fallback
            return { rows: [] };
          }

          // Log successful response for debugging
          console.log('Successfully received GSC data:', {
            rowCount: response.data.rows.length,
            sample: response.data.rows.slice(0, 2),
            hasPermissionDenied: response.data.permissionDenied === true
          });

          return response.data;
        } catch (apiError: any) {
          lastError = apiError;
          retryCount++;
          
          // Check if there's a suggestion in the error response to try a different URL format
          const errorData = apiError.response?.data;
          if (errorData?.suggestions && Array.isArray(errorData.suggestions) && errorData.suggestions.length > 0) {
            console.log('Server suggested URL formats in error:', errorData.suggestions);
            
            // Try the first suggestion
            if (errorData.suggestions[0]) {
              console.log(`Trying suggested URL format from error: ${errorData.suggestions[0]}`);
              formattedRequest.siteUrl = errorData.suggestions[0];
              continue; // Retry with the suggested format
            }
          }
          
          // Only retry on network errors or 500s, not on 400s (which indicate invalid requests)
          const isRetriable = !apiError.response || apiError.response.status >= 500;
          if (!isRetriable || retryCount > MAX_RETRIES) {
            break;
          }
          
          console.log(`Retry attempt ${retryCount} for GSC metrics after error:`, apiError);
          
          // Exponential backoff: 1s, 2s, 4s, etc.
          const delay = Math.pow(2, retryCount - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      // If we get here, all retries failed - provide detailed error information
      
      // Check if we should suggest trying a different URL format
      let errorMessage = '';
      let suggestions = [];
      
      if (siteUrl.startsWith('https://') || siteUrl.startsWith('http://')) {
        const domainOnly = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
        suggestions.push(`sc-domain:${domainOnly}`);
      } else if (!siteUrl.startsWith('sc-domain:')) {
        suggestions.push(`sc-domain:${siteUrl}`);
      }
      
      if (lastError?.response?.status === 500) {
        console.error('Server error in GSC metrics:', lastError);
        errorMessage = 'Server error while fetching GSC metrics. Please try again later.';
        
        if (suggestions.length > 0) {
          errorMessage += ` You might also try using one of these formats: ${suggestions.join(', ')}`;
        }
        
        throw new Error(errorMessage);
      } else if (lastError?.response?.status === 401) {
        console.error('Authentication error in GSC metrics:', lastError);
        throw new Error('Your session has expired. Please log in again.');
      } else if (lastError?.response?.status === 404) {
        console.warn('Property not found or no data available:', formattedRequest.siteUrl);
        
        if (suggestions.length > 0) {
          errorMessage = `No data found for ${siteUrl}. Try using one of these formats: ${suggestions.join(', ')}`;
          throw new Error(errorMessage);
        }
        
        return { rows: [] }; // Return empty data instead of throwing
      } else if (lastError?.response?.status === 403) {
        console.error('Permission denied for GSC property:', formattedRequest.siteUrl);
        
        // Check if the response contains a specific error message
        const errorData = lastError?.response?.data;
        if (errorData?.error) {
          throw new Error(`Permission denied: ${errorData.error}`);
        }
        
        throw new Error(`You don't have permission to access search data for ${siteUrl} in Google Search Console. Make sure you've been granted access to this property in GSC.`);
      }
      
      // For other errors
      errorMessage = lastError?.message || 'Failed to fetch GSC metrics after multiple attempts';
      if (suggestions.length > 0) {
        errorMessage += ` You might try using one of these formats: ${suggestions.join(', ')}`;
      }
      
      throw new Error(errorMessage);
    } catch (error) {
      console.error('Error fetching GSC metrics:', {
        error,
        request,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },

  // Get top pages with performance data
  getTopPages: async (
    siteUrl: string,
    startDate: string,
    endDate: string,
    limit: number = 10
  ): Promise<TopPagesResponse> => {
    const params = new URLSearchParams({
      siteUrl,
      startDate,
      endDate,
      limit: limit.toString()
    });

    const response = await api.get<TopPagesResponse>(`/gsc/top-pages?${params}`);
    return response.data;
  },

  // Helper function to generate date ranges
  getDateRanges: (): DateRange[] => {
    const today = new Date();
    
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };
    
    const daysAgo = (days: number): Date => {
      const date = new Date(today);
      date.setDate(date.getDate() - days);
      return date;
    };
    
    return [
      {
        startDate: formatDate(daysAgo(7)),
        endDate: formatDate(daysAgo(1)),
        label: 'Last 7 days'
      },
      {
        startDate: formatDate(daysAgo(30)),
        endDate: formatDate(daysAgo(1)),
        label: 'Last 30 days'
      },
      {
        startDate: formatDate(daysAgo(90)),
        endDate: formatDate(daysAgo(1)),
        label: 'Last 90 days'
      }
    ];
  },

  // Calculate previous period for comparison
  getPreviousPeriod: (startDate: string, endDate: string): { startDate: string, endDate: string } => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - daysDiff);
    
    return {
      startDate: prevStart.toISOString().split('T')[0],
      endDate: prevEnd.toISOString().split('T')[0]
    };
  },

  /**
   * Get AI-powered insights and recommendations
   * @param siteUrl - The site URL to analyze
   * @param dateRange - The date range for analysis
   * @returns Promise with insights data
   */
  getInsights: async (siteUrl: string, dateRange: DateRange): Promise<ApiResponse<Insights>> => {
    const response = await api.post<ApiResponse<Insights>>('/insights', {
      siteUrl,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });
    return response.data;
  }
};