import { api } from './api';

export type InsightRequest = {
  siteUrl: string;
  period: string;
  targetPageUrl?: string;
  refreshData?: boolean;
  useMock?: boolean;
};

export type MetricChange = {
  metric: string;
  change: string;
  interpretation: string;
};

export type DataPoint = string;

export type Finding = {
  title: string;
  description: string;
  impactLevel?: 'high' | 'medium' | 'low';
  dataPoints?: DataPoint[];
};

export type Opportunity = {
  title: string;
  description: string;
  estimatedImpact: string;
  difficulty: 'easy' | 'moderate' | 'complex';
  timeFrame: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
};

export type Recommendation = {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  expectedOutcome?: string;
  implementationSteps?: string[];
};

export type KeywordInsights = {
  risingKeywords: string[];
  decliningKeywords: string[];
  missedOpportunities: string[];
  analysis: string;
};

export interface Performance {
  trend: 'up' | 'down' | 'stable' | 'mixed';
  details: string;
  changePercent?: string;
  timePeriod?: string;
  keyMetricChanges?: MetricChange[];
}

export interface TopFinding {
  title: string;
  description: string;
  impactLevel: 'high' | 'medium' | 'low';
  dataPoints?: string[];
}

export type RawDataMetrics = {
  clicks: number[];
  impressions: number[];
  ctr: number[];
  position: number[];
};

export interface TopItem {
  name: string;
  metrics: {
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
  };
}

export interface RawData {
  metrics: RawDataMetrics;
  top_keywords: TopItem[];
  top_pages: TopItem[];
  time_period: string;
}

export type AIAnalysis = {
  summary: string;
  performance: Performance;
  topFindings: Finding[];
  opportunities?: Opportunity[];
  recommendations: Recommendation[];
  keywordInsights?: KeywordInsights;
};

export type InsightResponse = {
  success: boolean;
  raw_data: RawData;
  ai_analysis: AIAnalysis;
  error?: string;
};

export type PageInsightRequest = {
  siteUrl: string;
  pageUrl: string;
  period: string;
  data: any;
};

// Define an interface for legacy response format
interface LegacyInsightResponse {
  summary?: string;
  performance?: {
    trend: 'up' | 'down' | 'stable' | 'mixed';
    details: string;
    changePercent?: string;
    timePeriod?: string;
    keyMetricChanges?: MetricChange[];
  };
  topFindings?: TopFinding[];
  recommendations?: Recommendation[];
  opportunities?: Opportunity[];
  keywordInsights?: KeywordInsights;
}

export const insightsService = {
  // Generate overall site insights
  generateInsights: async (request: InsightRequest): Promise<InsightResponse> => {
    try {
      console.log('Generating insights with request:', {
        siteUrl: request.siteUrl,
        period: request.period,
        hasData: !!request.targetPageUrl || !!request.refreshData || !!request.useMock
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
            !response.data.raw_data || 
            !response.data.ai_analysis ||
            !response.data.ai_analysis.summary || 
            !response.data.ai_analysis.performance ||
            !response.data.ai_analysis.topFindings ||
            !response.data.ai_analysis.recommendations) {
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
        success: false,
        raw_data: {
          metrics: {
            clicks: [],
            impressions: [],
            ctr: [],
            position: []
          },
          top_keywords: [],
          top_pages: [],
          time_period: ""
        },
        ai_analysis: {
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
        }
      };
    }
  },

  // Generate page-specific insights
  generatePageInsights: async (request: PageInsightRequest): Promise<InsightResponse> => {
    try {
      const response = await api.post<InsightResponse>(`/insights/page/${encodeURIComponent(request.pageUrl)}`, request);
      
      // Check if the response has the expected structure
      if (!response.data || 
          !response.data.raw_data || 
          !response.data.ai_analysis ||
          !response.data.ai_analysis.summary || 
          !response.data.ai_analysis.performance ||
          !response.data.ai_analysis.topFindings ||
          !response.data.ai_analysis.recommendations) {
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
          !response.data.raw_data || 
          !response.data.ai_analysis ||
          !response.data.ai_analysis.summary || 
          !response.data.ai_analysis.performance ||
          !response.data.ai_analysis.topFindings ||
          !response.data.ai_analysis.recommendations) {
        console.error('Invalid refreshed insights response format:', response.data);
        throw new Error('Invalid response format from insights service');
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to refresh insights:', error);
      throw error;
    }
  },

  // Function to get insights for a site or page
  async getInsights(siteUrl: string, period: string, targetPageUrl?: string, refreshData?: boolean): Promise<InsightResponse> {
    try {
      // Determine the endpoint based on whether this is a page insight or site insight
      let endpoint;
      
      if (targetPageUrl) {
        // For page insights, try to extract the path from URL
        try {
          const urlObj = new URL(targetPageUrl);
          const pagePath = urlObj.pathname;
          
          // Use the page insights endpoint format from the backend
          endpoint = `/insights/page/${encodeURIComponent(pagePath)}`;
        } catch (urlError) {
          // If URL parsing fails, just use the target page URL as is
          console.warn('Failed to parse URL, using raw targetPageUrl instead:', urlError);
          endpoint = `/insights/page/${encodeURIComponent(targetPageUrl)}`;
        }
        
        // Add mock parameter if needed
        endpoint += '?mock=true';
      } else {
        // For site-wide insights
        endpoint = '/insights/generate?mock=true';
      }
      
      // Add force parameter if refresh is requested
      if (refreshData) {
        endpoint += endpoint.includes('?') ? '&force=true' : '?force=true';
      }
      
      const payload: InsightRequest = {
        siteUrl,
        period
      };
      
      // Add optional properties only if they're defined
      if (targetPageUrl) {
        payload.targetPageUrl = targetPageUrl;
      }
      
      if (refreshData !== undefined) {
        payload.refreshData = refreshData;
      }

      console.log(`Making insights request to ${endpoint}`, payload);
      const response = await api.post(endpoint, payload);
      
      // Log the response for debugging
      console.log('Insights API response status:', response.status);
      console.log('Insights API response headers:', response.headers);
      
      // Verify that the response has the expected structure
      if (response.data) {
        // Use a type assertion to tell TypeScript that response.data should have these properties
        const data = response.data as Partial<InsightResponse>;
        
        if (!data.raw_data || !data.ai_analysis) {
          console.warn('Response does not follow the expected format', response.data);
          
          // If the response doesn't have the expected structure, try to adapt it
          if (!data.raw_data && !data.ai_analysis) {
            console.log('Trying to adapt legacy format response');
            // This might be an old format response - cast to legacy format
            const legacyData = response.data as LegacyInsightResponse;
            
            // Adapt the legacy format to the new format
            const adaptedResponse: InsightResponse = {
              success: true,
              raw_data: {
                metrics: {
                  clicks: [],
                  impressions: [],
                  ctr: [],
                  position: []
                },
                top_keywords: [],
                top_pages: [],
                time_period: period
              },
              ai_analysis: {
                summary: legacyData.summary || 'No summary available',
                performance: legacyData.performance || {
                  trend: 'stable',
                  details: 'No details available'
                },
                topFindings: legacyData.topFindings || [],
                recommendations: legacyData.recommendations || []
              }
            };
            return adaptedResponse;
          }
        }
      }
      
      return response.data as InsightResponse;
    } catch (error) {
      console.error('Error getting insights:', error);
      // Rethrow with a clearer message
      throw new Error(`Failed to get insights: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};