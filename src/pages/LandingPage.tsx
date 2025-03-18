import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
  Toolbar,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              component="img" 
              src="/logo.svg" 
              alt="Logo" 
              sx={{ 
                height: 32, 
                width: 32, 
                mr: 1.5 
              }} 
            />
            <Typography variant="h6" component="div" color="text.primary" sx={{ fontWeight: 500 }}>
              analytics.k-o.pro
            </Typography>
          </Box>
          <Box>
            <Button 
              component={RouterLink} 
              to="/login" 
              color="inherit"
              sx={{ 
                mr: 2, 
                fontWeight: 500, 
                color: 'text.primary',
                '&:hover': { color: theme.palette.primary.main }
              }}
            >
              Login
            </Button>
            <Button 
              component={RouterLink} 
              to="/register" 
              variant="contained" 
              color="primary"
              sx={{ 
                fontWeight: 500,
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' }
              }}
            >
              Register
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box 
        sx={{ 
          pt: isMobile ? 8 : 16, 
          pb: isMobile ? 8 : 16,
          backgroundImage: 'linear-gradient(180deg, rgba(245,245,245,1) 0%, rgba(255,255,255,1) 100%)'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h1" 
                sx={{ 
                  fontWeight: 700, 
                  fontSize: isMobile ? '2.5rem' : '3.5rem',
                  lineHeight: 1.2,
                  mb: 2,
                  background: 'linear-gradient(90deg, #3f51b5 0%, #002984 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Insights from your search data
              </Typography>
              <Typography 
                variant="h4" 
                color="text.secondary" 
                sx={{ 
                  mb: 4, 
                  fontWeight: 400,
                  fontSize: isMobile ? '1.25rem' : '1.5rem'
                }}
              >
                Find growth opportunities and improve your SEO performance with actionable analytics
              </Typography>
              <Button 
                component={RouterLink} 
                to="/register" 
                variant="contained" 
                color="primary" 
                size="large"
                sx={{ 
                  px: 4, 
                  py: 1.5, 
                  fontWeight: 500, 
                  fontSize: '1.1rem',
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 'none', backgroundColor: theme.palette.primary.dark }
                }}
              >
                Get Started
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img" 
                src="/dashboard-preview.svg" 
                alt="Analytics Dashboard Preview"
                sx={{ 
                  width: '100%', 
                  borderRadius: 4, 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                  display: { xs: 'none', md: 'block' }
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, backgroundColor: '#fff' }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            align="center" 
            sx={{ 
              mb: 8, 
              fontWeight: 600,
              fontSize: isMobile ? '2rem' : '2.5rem'
            }}
          >
            Unlock the full potential of your search data
          </Typography>
          
          <Grid container spacing={4}>
            {/* Feature 1 */}
            <Grid item xs={12} md={4}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%', 
                  borderRadius: 4,
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <BarChartIcon 
                    sx={{ 
                      fontSize: 48, 
                      mb: 2, 
                      color: theme.palette.primary.main 
                    }} 
                  />
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    Comprehensive Analytics
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Get detailed insights on your search performance, including impressions, clicks, CTR, and rankings across your entire site.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Feature 2 */}
            <Grid item xs={12} md={4}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%', 
                  borderRadius: 4,
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <TrendingUpIcon 
                    sx={{ 
                      fontSize: 48, 
                      mb: 2, 
                      color: theme.palette.primary.main 
                    }} 
                  />
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    Smart Recommendations
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Receive AI-powered recommendations to optimize your content, improve rankings, and find untapped growth opportunities.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Feature 3 */}
            <Grid item xs={12} md={4}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%', 
                  borderRadius: 4,
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <SearchIcon 
                    sx={{ 
                      fontSize: 48, 
                      mb: 2, 
                      color: theme.palette.primary.main 
                    }} 
                  />
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    Keyword Intelligence
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Discover valuable keywords driving traffic to your site and identify new opportunities to expand your search visibility.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          py: 12, 
          backgroundColor: theme.palette.primary.main,
          background: 'linear-gradient(135deg, #3f51b5 0%, #002984 100%)'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h3" 
            align="center" 
            color="white"
            sx={{ 
              fontWeight: 600,
              mb: 3,
              fontSize: isMobile ? '1.75rem' : '2.25rem'
            }}
          >
            Ready to transform your SEO strategy?
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            color="rgba(255,255,255,0.8)"
            sx={{ 
              mb: 5,
              fontWeight: 400,
              maxWidth: 700,
              mx: 'auto'
            }}
          >
            Join thousands of websites using our analytics platform to make data-driven decisions and grow their organic traffic.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              component={RouterLink} 
              to="/register" 
              variant="contained" 
              size="large"
              sx={{ 
                px: 5, 
                py: 1.5, 
                fontWeight: 500, 
                fontSize: '1.1rem',
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.9)'
                }
              }}
            >
              Start Free Trial
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 10, backgroundColor: '#fff' }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            align="center" 
            sx={{ 
              mb: 2, 
              fontWeight: 600,
              fontSize: isMobile ? '2rem' : '2.5rem'
            }}
          >
            Trusted by professionals
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            color="text.secondary"
            sx={{ 
              mb: 8,
              fontWeight: 400,
              maxWidth: 700,
              mx: 'auto'
            }}
          >
            See what our users are saying about our analytics platform
          </Typography>

          <Grid container spacing={4}>
            {/* Testimonial 1 */}
            <Grid item xs={12} md={4}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%', 
                  borderRadius: 4,
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  p: 3
                }}
              >
                <CardContent>
                  <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                    "This analytics platform has completely transformed how we approach SEO. The insights are actionable and have helped us increase our organic traffic by 40% in just three months."
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Sarah Johnson
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Marketing Director, TechSolutions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Testimonial 2 */}
            <Grid item xs={12} md={4}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%', 
                  borderRadius: 4,
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  p: 3
                }}
              >
                <CardContent>
                  <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                    "The keyword intelligence feature is a game-changer. We've discovered new opportunities we were completely unaware of, and it's helped us refine our content strategy for better results."
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Michael Chen
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    SEO Specialist, Growth Agency
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Testimonial 3 */}
            <Grid item xs={12} md={4}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%', 
                  borderRadius: 4,
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  p: 3
                }}
              >
                <CardContent>
                  <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                    "I've tried many analytics tools, but this one stands out for its clean interface and actionable insights. The AI recommendations have been spot-on and saved us countless hours of analysis."
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Emma Rodriguez
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Founder, ContentFirst
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box sx={{ py: 10, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            align="center" 
            sx={{ 
              mb: 2, 
              fontWeight: 600,
              fontSize: isMobile ? '2rem' : '2.5rem'
            }}
          >
            Simple, transparent pricing
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            color="text.secondary"
            sx={{ 
              mb: 8,
              fontWeight: 400,
              maxWidth: 700,
              mx: 'auto'
            }}
          >
            Choose the plan that fits your needs
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {/* Basic Plan */}
            <Grid item xs={12} md={4}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%', 
                  borderRadius: 4,
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    Starter
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Perfect for personal websites and blogs
                  </Typography>
                  <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
                    $9<Typography component="span" variant="h6">/month</Typography>
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>✓ Basic analytics dashboard</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>✓ Up to 5,000 page views/month</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>✓ Search performance tracking</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>✓ 30 days data history</Typography>
                    <Typography variant="body1" sx={{ mb: 1, color: 'text.disabled' }}>✗ AI recommendations</Typography>
                    <Typography variant="body1" sx={{ mb: 1, color: 'text.disabled' }}>✗ Custom reports</Typography>
                  </Box>
                  
                  <Button 
                    component={RouterLink} 
                    to="/register" 
                    variant="outlined" 
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{ fontWeight: 500 }}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Pro Plan */}
            <Grid item xs={12} md={4}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%', 
                  borderRadius: 4,
                  border: '2px solid ' + theme.palette.primary.main,
                  position: 'relative',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                  }
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: -14, 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    px: 3,
                    py: 0.5,
                    borderRadius: 4,
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Most Popular
                </Box>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    Professional
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Ideal for growing businesses
                  </Typography>
                  <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
                    $29<Typography component="span" variant="h6">/month</Typography>
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>✓ Advanced analytics dashboard</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>✓ Up to 50,000 page views/month</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>✓ Search performance tracking</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>✓ 1 year data history</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>✓ AI recommendations</Typography>
                    <Typography variant="body1" sx={{ mb: 1, color: 'text.disabled' }}>✗ Custom reports</Typography>
                  </Box>
                  
                  <Button 
                    component={RouterLink} 
                    to="/register" 
                    variant="contained" 
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{ fontWeight: 500 }}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Enterprise Plan */}
            <Grid item xs={12} md={4}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%', 
                  borderRadius: 4,
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    Enterprise
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    For large websites and agencies
                  </Typography>
                  <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
                    $99<Typography component="span" variant="h6">/month</Typography>
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>✓ Comprehensive analytics suite</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>✓ Unlimited page views</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>✓ Enhanced search performance tracking</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>✓ Unlimited data history</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>✓ Advanced AI recommendations</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>✓ Custom reports</Typography>
                  </Box>
                  
                  <Button 
                    component={RouterLink} 
                    to="/register" 
                    variant="outlined" 
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{ fontWeight: 500 }}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: 10, backgroundColor: '#fff' }}>
        <Container maxWidth="md">
          <Typography 
            variant="h2" 
            align="center" 
            sx={{ 
              mb: 8, 
              fontWeight: 600,
              fontSize: isMobile ? '2rem' : '2.5rem'
            }}
          >
            Frequently asked questions
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                How does the platform work?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Our platform connects to your Google Search Console account to analyze and visualize your search performance data. We then provide insights and recommendations to help you improve your SEO strategy.
              </Typography>

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Is my data secure?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Absolutely. We use industry-standard encryption and security practices to protect your data. We never share your information with third parties without your explicit consent.
              </Typography>

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Can I cancel my subscription anytime?
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Yes, you can cancel your subscription at any time with no questions asked. You'll continue to have access until the end of your current billing period.
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Do I need technical skills to use the platform?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                No technical skills required! Our platform is designed to be user-friendly with intuitive dashboards and clear explanations of all metrics and recommendations.
              </Typography>

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Can I track multiple websites?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Yes, our Professional and Enterprise plans allow you to track multiple websites from a single dashboard, making it perfect for agencies and businesses with multiple properties.
              </Typography>

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                How often is the data updated?
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Our platform updates data daily, ensuring you always have access to the most recent information about your website's search performance.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 5, 
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid rgba(0, 0, 0, 0.05)'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="space-between">
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  component="img" 
                  src="/logo.svg" 
                  alt="Logo" 
                  sx={{ 
                    height: 32, 
                    width: 32, 
                    mr: 1.5 
                  }} 
                />
                <Typography variant="h6" component="div" color="text.primary" sx={{ fontWeight: 500 }}>
                  analytics.k-o.pro
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Powerful analytics and insights to improve your search performance.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} k-o.pro. All rights reserved.
              </Typography>
            </Grid>

            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Product
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Features
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Pricing
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                FAQ
              </Typography>
            </Grid>

            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Company
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                About
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Blog
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Contact
              </Typography>
            </Grid>

            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Legal
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Privacy Policy
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Terms of Service
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Cookie Policy
              </Typography>
            </Grid>

            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Connect
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Twitter
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                LinkedIn
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                GitHub
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;