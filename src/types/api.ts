// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// GSC API types
export interface GSCProperty {
    siteUrl: string;
    permissionLevel: string;
    verified: boolean;
    selected?: boolean;
}

export interface GSCData {
    rows: GSCRow[];
    dimensions?: string[];
    dateRange?: DateRange;
}

export interface GSCRow {
    keys: string[];
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

export interface TopPage {
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    url?: string;
    keys?: string[];
    deltaClicks?: number;
    deltaImpressions?: number;
    deltaCtr?: number;
    deltaPosition?: number;
}

// User types
export interface User {
    id: string;
    email: string;
    name?: string;
    picture?: string;
    credits: number;
    settings?: UserSettings;
}

// Date range types
export interface DateRange {
    startDate: string;
    endDate: string;
    label?: string;
}

// Error types
export interface ApiError {
    message: string;
    code: string;
    details?: any;
}

// Rate limit types
export interface RateLimitInfo {
    remaining: number;
    reset: number;
}

export interface Insight {
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: 'performance' | 'seo' | 'content' | 'technical';
    date: string;
}

export interface InsightPerformance {
    type: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
    metrics?: {
        current: number;
        target: number;
    };
}

export interface InsightOpportunity {
    type: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    potentialImprovement?: string;
    data?: Array<{
        query: string;
        impressions: number;
        ctr: number;
        position: number;
    }>;
}

export interface InsightIssue {
    type: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
    title: string;
    description: string;
    impact?: string;
    data?: Array<{
        query: string;
        impressions: number;
        ctr: number;
        position: number;
    }>;
}

export interface InsightSuggestion {
    type: string;
    priority: 'high' | 'medium' | 'low';
    message: string;
    action: string;
    title: string;
    description: string;
    implementation?: string;
}

export interface Insights {
    performance: InsightPerformance[];
    opportunities: InsightOpportunity[];
    issues: InsightIssue[];
    suggestions: InsightSuggestion[];
}

export interface UserSettings {
    darkMode: boolean;
    emailNotifications: boolean;
    weeklyReports: boolean;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface TopPagesResponse {
    pages: TopPage[];
    limit: number;
    creditsRemaining: number;
}

export interface InsightsResponse {
    success: boolean;
    data: Insights;
} 