import { api } from './api';

export type InsightRequest = {
  siteUrl: string;
  period: string;
  data: any;
};

export type Recommendation = {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
};

export type Finding = {
  title: string;
  description: string;
};

export type Performance = {
  trend: 'up' | 'down' | 'stable';
  details: string;
};

export type InsightResponse = {
  summary: string;
  performance: Performance;
  topFindings: Finding[];
  recommendations: Recommendation[];
};

export type PageInsightRequest = {
  siteUrl: string;
  pageUrl: string;
  period: string;
  data: any;
};

export const insightsService = {
  // Generate overall site insights
  generateInsights: async (request: InsightRequest): Promise<InsightResponse> => {
    try {
      console.log('Generating insights with request:', {
        siteUrl: request.siteUrl,
        period: request.period,
        hasData: !!request.data
      });
      
      // First try to get real insights
      try {
        const response = await api.post<InsightResponse>('/insights/generate', request);
        
        console.log('Raw response from insights API:', response.status, response.statusText);
        
        // Handle non-200 responses - explicitly check for 500 errors
        if (response.status >= 400) {
          console.error('Error response from insights API:', response.status, response.data);
          throw new Error(`Server error: ${response.status} - ${response.statusText}`);
        }
        
        // Check if the response has the expected structure
        if (!response.data || 
            !response.data.summary || 
            !response.data.performance ||
            !response.data.topFindings ||
            !response.data.recommendations) {
          console.error('Invalid insights response format:', response.data);
          throw new Error('Invalid response format');
        }
        
        return response.data;
      } catch (apiError) {
        console.error('Failed to get insights from API, trying mock data:', apiError);
        
        // If real API fails, try to get mock data
        try {
          const mockResponse = await api.post<InsightResponse>('/insights/generate?mock=true', request);
          
          if (mockResponse.status >= 400 || !mockResponse.data) {
            throw new Error('Mock data also failed');
          }
          
          console.log('Successfully retrieved mock insights');
          return mockResponse.data;
        } catch (mockError) {
          console.error('Mock data also failed:', mockError);
          // If even mock data fails, throw the original error to be handled by the fallback
          throw apiError;
        }
      }
    } catch (error) {
      console.error('Failed to generate insights:', error);
      
      // Return a simplified error response
      return {
        summary: "Unable to generate insights at this time",
        performance: {
          trend: "stable" as const,
          details: "Performance data unavailable due to a service error."
        },
        topFindings: [{
          title: "Service temporarily unavailable",
          description: "We're experiencing issues connecting to our AI service. Please try again later."
        }],
        recommendations: [{
          title: "Check connectivity",
          description: "Ensure you have a stable internet connection and try again.",
          priority: "high" as const
        }]
      };
    }
  },

  // Generate page-specific insights
  generatePageInsights: async (request: PageInsightRequest): Promise<InsightResponse> => {
    try {
      const response = await api.post<InsightResponse>(`/insights/page/${encodeURIComponent(request.pageUrl)}`, request);
      
      // Check if the response has the expected structure
      if (!response.data || 
          !response.data.summary || 
          !response.data.performance ||
          !response.data.topFindings ||
          !response.data.recommendations) {
        console.error('Invalid page insights response format:', response.data);
        throw new Error('Invalid response format from insights service');
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to generate page insights:', error);
      throw error;
    }
  },

  // Force refresh insights (bypass cache)
  forceRefreshInsights: async (request: InsightRequest): Promise<InsightResponse> => {
    try {
      const response = await api.post<InsightResponse>('/insights/generate?force=true', request);
      
      // Check if the response has the expected structure
      if (!response.data || 
          !response.data.summary || 
          !response.data.performance ||
          !response.data.topFindings ||
          !response.data.recommendations) {
        console.error('Invalid refreshed insights response format:', response.data);
        throw new Error('Invalid response format from insights service');
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to refresh insights:', error);
      throw error;
    }
  }
};