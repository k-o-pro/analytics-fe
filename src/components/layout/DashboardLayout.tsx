import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Container,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme as useMuiTheme,
  Tooltip,
  Badge,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Breadcrumbs,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Article as ArticleIcon,
  Insights as InsightsIcon,
  Settings as SettingsIcon,
  Login as LoginIcon,
  AccountCircle,
  Logout,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import CreditBadge from '../dashboard/CreditBadge';
import GlobalSearchBar from './GlobalSearchBar';
import ErrorBoundary from './ErrorBoundary';

const drawerWidth = 240;

const DashboardLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [helpAnchorEl, setHelpAnchorEl] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navHistory, setNavHistory] = useState<string[]>([]);

  // Track navigation history for breadcrumbs
  useEffect(() => {
    // Update navigation history
    if (!navHistory.includes(location.pathname)) {
      setNavHistory(prev => [...prev, location.pathname].slice(-3));
    }
  }, [location.pathname, navHistory]);

  // Close drawer when navigating on mobile
  useEffect(() => {
    if (isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile, mobileOpen]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleHelpOpen = (event: React.MouseEvent<HTMLElement>) => {
    setHelpAnchorEl(event.currentTarget);
  };

  const handleHelpClose = () => {
    setHelpAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const getHashPath = (path: string) => {
    // If path already starts with a hash, return it as is
    if (path.startsWith('#')) return path;
    
    // If path starts with a slash, add the hash before it
    if (path.startsWith('/')) return `#${path}`;
    
    // Otherwise, add hash and slash
    return `#/${path}`;
  };

  const handleBack = () => {
    navigate(-1);
  };

  const menuItems = [
    { path: '/app/dashboard', icon: <DashboardIcon />, text: 'Dashboard', label: 'View your analytics dashboard' },
    { path: '/app/top-pages', icon: <ArticleIcon />, text: 'Top Pages', label: 'View your top performing pages' },
    { path: '/app/insights', icon: <InsightsIcon />, text: 'Insights', label: 'Get AI-powered recommendations' },
    { path: '/app/settings', icon: <SettingsIcon />, text: 'Settings', label: 'Manage your account settings' },
  ];

  // Get the current page's title and icon
  const currentPage = menuItems.find(item => item.path === location.pathname);
  
  // Create breadcrumbs from navigation history
  const renderBreadcrumbs = () => {
    if (navHistory.length <= 1) return null;
    
    return (
      <Breadcrumbs 
        aria-label="breadcrumb" 
        sx={{ 
          display: { xs: 'none', md: 'flex' }, 
          ml: 2,
          '& .MuiBreadcrumbs-ol': {
            flexWrap: 'nowrap'
          }
        }}
      >
        <Link 
          to="/app/dashboard" 
          style={{ 
            color: theme.palette.text.secondary,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
          Home
        </Link>
        {navHistory.slice(0, -1).map((path, index) => {
          const page = menuItems.find(item => item.path === path);
          if (!page) return null;
          return (
            <Link 
              key={index}
              to={path}
              style={{ 
                color: theme.palette.text.secondary,
                textDecoration: 'none'
              }}
            >
              {page.text}
            </Link>
          );
        })}
        <Typography color="text.primary" sx={{ fontWeight: 500 }}>
          {currentPage?.text || 'Page'}
        </Typography>
      </Breadcrumbs>
    );
  };

  const drawer = (
    <div>
      <Toolbar 
        sx={{ 
          justifyContent: 'center',
          py: 1.5,
          px: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
        }}
      >
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #1976d2 30%, #2196F3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <DashboardIcon sx={{ mr: 1 }} />
          Search Analytics
        </Typography>
      </Toolbar>
      <Divider />
      <List component="nav" aria-label="main navigation">
        {menuItems.map((item) => (
          <Tooltip
            key={item.path}
            title={item.label}
            placement="right"
            arrow
            enterDelay={700}
          >
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={isMobile ? handleDrawerToggle : undefined}
              sx={{
                borderRadius: '0 24px 24px 0',
                mr: 1,
                mb: 0.5,
                pl: 2,
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.18),
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '25%',
                    height: '50%',
                    width: 4,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '0 4px 4px 0'
                  }
                },
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                }
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                  minWidth: 40
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 600 : 400
                }}
              />
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
      <Divider sx={{ mt: 'auto' }} />
      <Box sx={{ p: 2 }}>
        <CreditBadge />
      </Box>
    </div>
  );

  // Mobile bottom navigation
  const renderMobileBottomNav = () => {
    if (!isMobile || !user) return null;
    
    return (
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          zIndex: theme.zIndex.appBar,
          borderRadius: 0,
          boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)'
        }} 
        elevation={3}
      >
        <BottomNavigation
          value={location.pathname}
          onChange={(_, newValue) => {
            // Make sure newValue is a string
            if (typeof newValue === 'string') {
              navigate(getHashPath(newValue));
            }
          }}
          showLabels
        >
          {menuItems.map((item) => (
            <BottomNavigationAction 
              key={item.path}
              label={item.text}
              icon={item.icon}
              value={item.path}
            />
          ))}
        </BottomNavigation>
      </Paper>
    );
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          transition: 'box-shadow 0.3s ease-in-out',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        }}
        color="default"
      >
        <Toolbar sx={{ 
          justifyContent: 'space-between',
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(8px)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            {navHistory.length > 1 && (
              <IconButton 
                color="inherit"
                aria-label="go back"
                onClick={handleBack}
                sx={{ mr: 1, display: { xs: 'flex', md: 'none' } }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 500,
                display: { xs: navHistory.length > 1 ? 'none' : 'block', md: 'block' }
              }}
            >
              {currentPage?.text || 'Dashboard'}
            </Typography>
            {renderBreadcrumbs()}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GlobalSearchBar 
              mode={isMobile ? 'modal' : 'inline'} 
              open={searchOpen}
              onClose={() => setSearchOpen(false)}
            />
            
            <Tooltip title="Help">
              <IconButton 
                color="inherit" 
                onClick={handleHelpOpen}
                aria-haspopup="true"
                aria-controls={Boolean(helpAnchorEl) ? 'help-menu' : undefined}
                size="large"
              >
                <HelpIcon />
              </IconButton>
            </Tooltip>
            
            <Menu
              id="help-menu"
              anchorEl={helpAnchorEl}
              open={Boolean(helpAnchorEl)}
              onClose={handleHelpClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleHelpClose}>Documentation</MenuItem>
              <MenuItem onClick={handleHelpClose}>Tutorial</MenuItem>
              <MenuItem onClick={handleHelpClose}>Contact Support</MenuItem>
            </Menu>
            
            <Tooltip title="Notifications">
              <IconButton color="inherit" size="large">
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {user ? (
              <>
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleMenuOpen}
                    color="inherit"
                    size="large"
                    edge="end"
                    aria-label="account of current user"
                    aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
                    aria-haspopup="true"
                  >
                    <AccountCircle />
                  </IconButton>
                </Tooltip>
                <Menu
                  id="account-menu"
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ px: 2, pt: 1, pb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {user.email.split('@')[0]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={() => { 
                    handleMenuClose(); 
                    navigate(getHashPath('/app/settings')); 
                  }}>
                    <ListItemIcon>
                      <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Settings</ListItemText>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Tooltip title="Login">
                <IconButton
                  component={Link}
                  to="/login"
                  color="inherit"
                  size="large"
                  edge="end"
                  aria-label="login"
                >
                  <LoginIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation menu"
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 }, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // AppBar height
          mb: isMobile && user ? '56px' : 0 // bottom nav height
        }}
      >
        <Container maxWidth="lg">
          <ErrorBoundary>
            {children || <Outlet />}
          </ErrorBoundary>
        </Container>
      </Box>
      {renderMobileBottomNav()}
    </Box>
  );
};

export default DashboardLayout;