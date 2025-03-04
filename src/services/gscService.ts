import { api } from './api';

export type GSCProperty = {
  siteUrl: string;
  permissionLevel: string;
};

export type GSCMetricsRequest = {
  siteUrl: string;
  startDate: string;
  endDate: string;
  dimensions?: string[];
  filters?: any[];
};

export type GSCRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
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

export type TopPage = {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  deltaClicks?: number;
  deltaImpressions?: number;
  deltaCtr?: number;
  deltaPosition?: number;
};

export type TopPagesResponse = {
  pages: TopPage[];
  limit: number;
  creditsRemaining: number;
};

export type DateRange = {
  startDate: string;
  endDate: string;
  label: string;
};

export const gscService = {
  // Get GSC properties connected to user account
  getProperties: async (): Promise<GSCProperty[]> => {
    const response = await api.get<{siteEntry: GSCProperty[]}>('/gsc/properties');
    return response.data.siteEntry || [];
  },

  // Connect to GSC
  getAuthUrl: (): string => {
    const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    // Use "/oauth-callback" as the redirect URI without the hash
    const redirectUri = `${window.location.origin}/oauth-callback`;
    
    // For debugging
    console.log('OAuth Redirect URI:', redirectUri);
    
    const params = new URLSearchParams({
      client_id: clientId || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      access_type: 'offline',
      prompt: 'consent',
      // Add a random state parameter to prevent CSRF
      state: Math.random().toString(36).substring(2, 15)
    });
    
    return `${baseUrl}?${params.toString()}`;
  },

  // Handle OAuth callback
  handleCallback: async (code: string): Promise<boolean> => {
    try {
      await api.post('/auth/callback', { code });
      return true;
    } catch (error) {
      return false;
    }
  },

  // Fetch GSC metrics data
  fetchMetrics: async (request: GSCMetricsRequest): Promise<GSCResponse> => {
    const response = await api.post<GSCResponse>('/gsc/data', request);
    return response.data;
  },

  // Get top pages with performance data
  getTopPages: async (request: TopPagesRequest): Promise<TopPagesResponse> => {
    const response = await api.get<TopPagesResponse>('/gsc/top-pages', { 
      params: request 
    });
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
  }
};