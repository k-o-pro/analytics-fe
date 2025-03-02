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
    const response = await api.post<InsightResponse>('/insights/generate', request);
    return response.data;
  },

  // Generate page-specific insights
  generatePageInsights: async (request: PageInsightRequest): Promise<InsightResponse> => {
    const response = await api.post<InsightResponse>(`/insights/page/${encodeURIComponent(request.pageUrl)}`, request);
    return response.data;
  },

  // Force refresh insights (bypass cache)
  forceRefreshInsights: async (request: InsightRequest): Promise<InsightResponse> => {
    const response = await api.post<InsightResponse>('/insights/generate?force=true', request);
    return response.data;
  }
};