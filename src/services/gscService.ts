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
      const response = await api.get<{success: boolean, siteEntry?: GSCProperty[], error?: string, needsConnection?: boolean}>('/gsc/properties');
      
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
      
      return response.data.siteEntry || [];
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
      console.log('Fetching GSC metrics:', request); // Debug log
      const response = await api.post<GSCResponse>('/gsc/data', {
        ...request,
        dimensions: ['date'], // Add date dimension for time series
        rowLimit: 100 // Ensure we get enough data points
      });
      
      console.log('GSC metrics response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching GSC metrics:', error);
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