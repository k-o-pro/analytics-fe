import { api } from './api';

export type CreditResponse = {
  credits: number;
};

export type UseCreditsRequest = {
  amount: number;
  purpose: string;
};

export type UseCreditsResponse = {
  success: boolean;
  credits: number;
  error?: string;
};

export const creditsService = {
  // Get user's current credit balance
  getCredits: async (): Promise<number> => {
    const response = await api.get<CreditResponse>('/credits');
    return response.data.credits;
  },

  // Use credits for premium features
  useCredits: async (request: UseCreditsRequest): Promise<UseCreditsResponse> => {
    try {
      const response = await api.post<UseCreditsResponse>('/credits/use', request);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 402) {
        return {
          success: false,
          credits: 0,
          error: 'Insufficient credits'
        };
      }
      throw error;
    }
  },

  // Check if user has enough credits for an operation
  checkCredits: async (requiredAmount: number): Promise<boolean> => {
    const credits = await creditsService.getCredits();
    return credits >= requiredAmount;
  }
};