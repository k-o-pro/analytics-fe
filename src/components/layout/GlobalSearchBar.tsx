import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  InputBase, 
  IconButton, 
  Paper, 
  Popper, 
  Grow, 
  ClickAwayListener,
  Divider,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Chip,
  CircularProgress,
  useTheme,
  InputAdornment,
  Dialog,
  DialogContent
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  Article as ArticleIcon,
  ArrowForward as ArrowForwardIcon,
  Link as LinkIcon,
  QueryStats as QueryStatsIcon,
  History as HistoryIcon,
  Keyboard as KeyboardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'page' | 'query' | 'site' | 'report' | string;
  url: string;
  icon?: React.ReactNode;
  tags?: string[];
}

interface GlobalSearchBarProps {
  /**
   * Whether to show in fullscreen modal (mobile) or inline (desktop)
   */
  mode?: 'modal' | 'inline';
  /**
   * Whether the search bar is open
   */
  open?: boolean;
  /**
   * Callback when the search bar is closed
   */
  onClose?: () => void;
}

/**
 * Global search bar component for searching across the application
 */
const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({ 
  mode = 'inline',
  open = false,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(open);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const navigate = useNavigate();

  // Sync with open prop
  useEffect(() => {
    setIsOpen(open);
    if (open && inputRef.current) {
      // Focus the input when opened
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 5));
        }
      } catch (e) {
        console.error('Failed to parse recent searches', e);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Mock search function - in a real app, this would call an API
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Mock API call with timeout
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock results based on query
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: 'Dashboard',
        description: 'Main analytics dashboard',
        type: 'page',
        url: '/dashboard',
        icon: <TrendingUpIcon />,
      },
      {
        id: '2',
        title: 'Top Pages',
        description: 'View your top performing pages',
        type: 'page',
        url: '/top-pages',
        icon: <ArticleIcon />,
      },
      {
        id: '3',
        title: 'example.com',
        description: 'Your main website property',
        type: 'site',
        url: '/dashboard?site=example.com',
        icon: <LinkIcon />,
        tags: ['Property']
      },
      {
        id: '4',
        title: 'Mobile optimization',
        description: 'Search query analysis',
        type: 'query',
        url: '/top-pages?query=mobile%20optimization',
        icon: <QueryStatsIcon />,
        tags: ['Query']
      }
    ].filter(result => 
      result.title.toLowerCase().includes(query.toLowerCase()) || 
      result.description?.toLowerCase().includes(query.toLowerCase())
    );
    
    setResults(mockResults);
    setIsLoading(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
  };
  
  const handleSearchClear = () => {
    setSearchQuery('');
    setResults([]);
  };
  
  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };
  
  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(searchQuery);
    navigate(result.url);
    handleClose();
  };
  
  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const renderSearchResults = () => (
    <Box sx={{ width: '100%' }}>
      {searchQuery.trim() === '' ? (
        // Show recent searches when no query
        <Box>
          <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center' }}>
            <HistoryIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Recent Searches
            </Typography>
          </Box>
          <List dense>
            {recentSearches.length > 0 ? (
              recentSearches.map((query, index) => (
                <ListItemButton 
                  key={index}
                  onClick={() => handleRecentSearchClick(query)}
                  sx={{ px: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <HistoryIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={query} />
                  <ArrowForwardIcon fontSize="small" sx={{ opacity: 0.5 }} />
                </ListItemButton>
              ))
            ) : (
              <ListItem sx={{ px: 2 }}>
                <ListItemText 
                  secondary="No recent searches"
                  primaryTypographyProps={{ sx: { fontStyle: 'italic', fontSize: '0.875rem' } }}
                />
              </ListItem>
            )}
          </List>
        </Box>
      ) : (
        // Show search results
        <Box>
          <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" color="text.secondary">
              {isLoading ? 'Searching...' : results.length > 0 ? `Results` : 'No results found'}
            </Typography>
            {isLoading && <CircularProgress size={16} />}
          </Box>
          
          {results.length > 0 ? (
            <List>
              {results.map((result) => (
                <ListItemButton 
                  key={result.id} 
                  onClick={() => handleResultClick(result)}
                  sx={{
                    px: 2,
                    borderLeft: '3px solid transparent',
                    '&:hover': {
                      borderLeft: `3px solid ${theme.palette.primary.main}`,
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {result.icon || <SearchIcon />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={result.title}
                    secondary={result.description} 
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  {result.tags && result.tags.map((tag, i) => (
                    <Chip 
                      key={i}
                      label={tag}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  ))}
                </ListItemButton>
              ))}
            </List>
          ) : (
            !isLoading && (
              <ListItem sx={{ px: 2 }}>
                <ListItemText 
                  secondary={`No results found for "${searchQuery}"`}
                  secondaryTypographyProps={{ sx: { fontStyle: 'italic' } }}
                />
              </ListItem>
            )
          )}
        </Box>
      )}
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <KeyboardIcon fontSize="small" sx={{ opacity: 0.5, mr: 1 }} />
          <Typography variant="caption" color="text.secondary">
            Tip: Press <Box component="span" sx={{ fontWeight: 'bold' }}>/</Box> to search anywhere
          </Typography>
        </Box>
        
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            cursor: 'pointer',
            '&:hover': { color: theme.palette.primary.main }
          }}
          onClick={handleClose}
        >
          ESC to close
        </Typography>
      </Box>
    </Box>
  );

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Open search on '/' key unless in an input, textarea or contentEditable element
      if (
        e.key === '/' && 
        !isOpen &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target as HTMLElement)?.isContentEditable
      ) {
        e.preventDefault();
        setIsOpen(true);
        if (onClose) onClose(); // This is meant to notify parent that state changed
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, onClose]);

  // Render appropriate search UI based on mode (modal or inline)
  if (mode === 'modal') {
    return (
      <Dialog
        open={isOpen}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <SearchIcon sx={{ ml: 1, mr: 1, color: 'text.secondary' }} />
            <InputBase
              placeholder="Search for anything..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
              autoFocus
              fullWidth
              sx={{ 
                flex: 1,
                fontSize: '1rem',
                color: 'text.primary',
              }}
              endAdornment={
                <InputAdornment position="end">
                  {searchQuery && (
                    <IconButton
                      size="small"
                      onClick={handleSearchClear}
                      edge="end"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </InputAdornment>
              }
            />
          </Box>
          <Divider />
          {renderSearchResults()}
        </DialogContent>
      </Dialog>
    );
  }

  // Inline search bar
  return (
    <div ref={anchorRef}>
      <IconButton
        color="inherit"
        onClick={() => setIsOpen(true)}
        size="large"
        aria-label="open search"
      >
        <SearchIcon />
      </IconButton>

      <Popper
        open={isOpen}
        anchorEl={anchorRef.current}
        transition
        placement="bottom-start"
        style={{ zIndex: theme.zIndex.appBar + 1, width: 400, maxWidth: '100vw' }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: 'top left' }}>
            <Paper 
              elevation={8}
              sx={{ 
                mt: 1,
                borderRadius: 2,
                overflow: 'hidden',
                maxHeight: 'calc(100vh - 100px)'
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
                    <SearchIcon sx={{ ml: 1, mr: 1, color: 'text.secondary' }} />
                    <InputBase
                      placeholder="Search for anything..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleKeyDown}
                      inputRef={inputRef}
                      autoFocus
                      fullWidth
                      sx={{ 
                        flex: 1,
                        fontSize: '1rem',
                        color: 'text.primary',
                      }}
                      endAdornment={
                        <InputAdornment position="end">
                          {searchQuery && (
                            <IconButton
                              size="small"
                              onClick={handleSearchClear}
                              edge="end"
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          )}
                        </InputAdornment>
                      }
                    />
                  </Box>
                  <Divider />
                  {renderSearchResults()}
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
};

export default GlobalSearchBar; 