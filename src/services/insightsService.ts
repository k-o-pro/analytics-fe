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
      const response = await api.post<InsightResponse>('/insights/generate', request);
      
      // Check if the response has the expected structure
      if (!response.data || 
          !response.data.summary || 
          !response.data.performance ||
          !response.data.topFindings ||
          !response.data.recommendations) {
        console.error('Invalid insights response format:', response.data);
        throw new Error('Invalid response format from insights service');
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to generate insights:', error);
      throw error;
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