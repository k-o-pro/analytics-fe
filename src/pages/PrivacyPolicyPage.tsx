import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Divider,
  Button,
  Link
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();
  const lastUpdated = "June 1, 2024";
  
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>
      
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Privacy Policy
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Last updated: {lastUpdated}
        </Typography>
        
        <Box sx={{ my: 3 }}>
          <Typography variant="body1" paragraph>
            This Privacy Policy describes how Analytics by k-o.pro ("we", "us", or "our") collects, uses, and shares your information when you use our service (the "Service").
          </Typography>
          
          <Typography variant="body1" paragraph>
            By using the Service, you agree to the collection and use of information in accordance with this policy.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <section>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            Information We Collect
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Personal Information:</strong> When you create an account, we collect your email address and name.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Google Search Console Data:</strong> When you connect your Google Search Console account, we access the analytics data from your properties that you explicitly authorize. This includes search performance metrics like clicks, impressions, CTR, and position data.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Usage Data:</strong> We collect information on how you interact with our Service, including pages visited, time spent on pages, and other usage patterns.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Technical Data:</strong> We collect information about your device, browser, IP address, and operating system to ensure proper functioning of our Service.
          </Typography>
        </section>
        
        <Divider sx={{ my: 3 }} />
        
        <section>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            How We Use Your Information
          </Typography>
          
          <Typography variant="body1" paragraph>
            We use the information we collect to:
          </Typography>
          
          <ul>
            <Typography component="li" variant="body1" paragraph>
              Provide, maintain, and improve the Service
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Process and complete transactions
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Send you technical notices, updates, and support messages
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Respond to your comments, questions, and requests
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Analyze usage patterns to improve user experience
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Detect, prevent, and address technical issues
            </Typography>
          </ul>
        </section>
        
        <Divider sx={{ my: 3 }} />
        
        <section>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            Google API Services User Data Policy
          </Typography>
          
          <Typography variant="body1" paragraph>
            Our application's use and transfer of information received from Google APIs to any other app will adhere to <Link href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</Link>, including the Limited Use requirements.
          </Typography>
          
          <Typography variant="body1" paragraph>
            We access Google Search Console data only with your explicit consent and only for the purpose of providing analytics insights through our Service. We do not sell this data or use it for targeting advertisements.
          </Typography>
        </section>
        
        <Divider sx={{ my: 3 }} />
        
        <section>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            Data Sharing and Disclosure
          </Typography>
          
          <Typography variant="body1" paragraph>
            We do not share your personal information or Google Search Console data with third parties except in the following cases:
          </Typography>
          
          <ul>
            <Typography component="li" variant="body1" paragraph>
              With your consent
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              To comply with laws or legal requests
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              To protect our rights, property, or safety
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              In connection with a business transfer (like a merger or acquisition)
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              With service providers who help us operate our Service (under confidentiality agreements)
            </Typography>
          </ul>
        </section>
        
        <Divider sx={{ my: 3 }} />
        
        <section>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            Data Security
          </Typography>
          
          <Typography variant="body1" paragraph>
            We implement appropriate security measures to protect your personal information, including your Google Search Console data. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </Typography>
        </section>
        
        <Divider sx={{ my: 3 }} />
        
        <section>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            Your Data Rights
          </Typography>
          
          <Typography variant="body1" paragraph>
            You have the right to:
          </Typography>
          
          <ul>
            <Typography component="li" variant="body1" paragraph>
              Access the personal information we hold about you
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Correct inaccurate or incomplete data
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Delete your account and personal information
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Withdraw your consent for us to access your Google Search Console data at any time
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Export your data in a structured, commonly used format
            </Typography>
          </ul>
          
          <Typography variant="body1" paragraph>
            To exercise these rights, please contact us at mail@k-o.pro.
          </Typography>
        </section>
        
        <Divider sx={{ my: 3 }} />
        
        <section>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            Cookies and Tracking Technologies
          </Typography>
          
          <Typography variant="body1" paragraph>
            We use cookies and similar tracking technologies to track activity on our Service and to hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </Typography>
        </section>
        
        <Divider sx={{ my: 3 }} />
        
        <section>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            Children's Privacy
          </Typography>
          
          <Typography variant="body1" paragraph>
            Our Service is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13.
          </Typography>
        </section>
        
        <Divider sx={{ my: 3 }} />
        
        <section>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            Changes to This Privacy Policy
          </Typography>
          
          <Typography variant="body1" paragraph>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date.
          </Typography>
          
          <Typography variant="body1" paragraph>
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </Typography>
        </section>
        
        <Divider sx={{ my: 3 }} />
        
        <section>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            Contact Us
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you have any questions about this Privacy Policy, please contact us at mail@k-o.pro.
          </Typography>
        </section>
      </Paper>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          component={RouterLink}
          to="/#/app/dashboard"
          variant="contained"
          color="primary"
        >
          Return to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default PrivacyPolicyPage; 