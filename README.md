# Search Console Analytics Frontend

A modern React TypeScript application that transforms complex Google Search Console data into actionable insights with AI-powered analysis and visualizations.

## Overview

The Search Console Analytics frontend provides a comprehensive dashboard for analyzing your website's search performance. It delivers intuitive visualizations, top page analysis, and AI-generated insights to help you understand and improve your site's visibility in search results.

## Key Features

- **Interactive Dashboard**: View key metrics (clicks, impressions, CTR, position) with performance trends
- **Top Pages Analysis**: Identify your best-performing pages and opportunities for improvement
- **AI-Powered Insights**: Generate actionable recommendations based on your search performance data
- **Multiple Properties**: Connect and manage multiple GSC properties
- **Historical Data**: Track performance over time with comparative analysis
- **Dark/Light Theme**: User-selectable theme with system preference detection
- **TypeScript Support**: Full type safety throughout the application
- **Responsive Design**: Optimized for both desktop and mobile devices

## Technology Stack

- **Framework**: React 18 with TypeScript
- **UI Components**: Material UI 6
- **Routing**: React Router 6
- **State Management**: React Context API
- **Data Fetching**: React Query
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Deployment**: GitHub Pages

## Project Structure

```
/src
  /components        - Reusable UI components
    /auth            - Authentication components
    /dashboard       - Dashboard layout and components
    /insights        - AI insights components
    /layout          - Layout components
    /visualizations  - Charts and data visualization
  /contexts
    AuthContext.tsx  - Authentication context
    ThemeContext.tsx - Theme management context
  /pages             - Main application pages
  /services          - API service modules
  /types             - TypeScript type definitions
  /utils             - Utility functions
  App.tsx            - Main application component
  index.tsx          - Entry point
  theme.ts           - Theme configuration
```

## Recent Improvements

### TypeScript Integration
- Added comprehensive type definitions for all API responses
- Enhanced component props with proper TypeScript interfaces
- Implemented type-safe state management

### Dark Mode Implementation
- Created theme context for state management
- Added theme toggle component in the application header
- Implemented system preference detection
- Persisted user preference in localStorage

### Enhanced User Experience
- Improved error handling with descriptive user feedback
- Added loading states for better visual feedback
- Implemented responsive design for mobile optimization

## Setup & Installation

### Prerequisites

- Node.js (v16+) and npm
- Google Cloud Platform account with Search Console API enabled

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/analytics-fe.git
   cd analytics-fe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env.development` and `.env.production` files:
   ```
   REACT_APP_API_URL=http://localhost:8787
   REACT_APP_FRONTEND_URL=http://localhost:3000
   ```

4. **Run development server**
   ```bash
   npm start
   ```

5. **Type checking**
   ```bash
   npm run typecheck
   ```

## Building and Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages**
   ```bash
   npm run deploy
   ```

## Integration with Backend

This frontend application works with the [Analytics Backend](https://github.com/yourusername/analytics-be) API. Ensure the backend is properly configured and running for full functionality.

## Authentication Flow

The application uses OAuth 2.0 for Google Search Console API authentication:

1. User initiates login with Google
2. After authentication, Google redirects to callback URL with authorization code
3. Backend exchanges code for access and refresh tokens
4. JWT token is issued to the frontend client for API authorization

## Theme System

The application supports both light and dark themes:

- System preference detection on initial load
- User toggle available in the application header
- Theme preference persisted in localStorage
- Consistent color scheme across all components

## Troubleshooting

### Common Issues

1. **Type Errors**
   - Run `npm run typecheck` to identify TypeScript issues
   - Ensure all required type definitions are imported

2. **API Connection Failures**
   - Check if backend server is running
   - Verify API URL in environment variables
   - Check browser console for CORS errors

3. **Build Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall dependencies

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Search Console API documentation
- React and Material UI teams
- The open-source community for TypeScript type definitions