import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

interface ThemeContextType {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Try to get the theme mode from localStorage or system preference
  const [mode, setMode] = useState<PaletteMode>(() => {
    // First try localStorage
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode === 'dark' || savedMode === 'light') {
      return savedMode;
    }
    
    // Then try system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Default to light
    return 'light';
  });

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      if (!localStorage.getItem('themeMode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    
    // Add event listener for system theme changes
    mediaQuery.addEventListener('change', handleChange);
    
    // Clean up
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update localStorage when mode changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const colorMode = {
    mode,
    toggleColorMode: () => {
      setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    },
  };

  // Define common palette values
  const primaryMain = '#1976d2';
  const secondaryMain = '#9c27b0';

  // Create a theme instance
  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: primaryMain,
        light: mode === 'dark' ? '#5393ff' : '#42a5f5',
        dark: mode === 'dark' ? '#0059b2' : '#1565c0',
        contrastText: '#ffffff',
      },
      secondary: {
        main: secondaryMain,
        light: mode === 'dark' ? '#c158dc' : '#ba68c8',
        dark: mode === 'dark' ? '#7b019a' : '#7b1fa2',
        contrastText: '#ffffff',
      },
      error: {
        main: mode === 'dark' ? '#f44336' : '#d32f2f',
        light: mode === 'dark' ? '#f88078' : '#ef5350',
        dark: mode === 'dark' ? '#e31b0c' : '#c62828',
      },
      warning: {
        main: mode === 'dark' ? '#ffa726' : '#ed6c02',
        light: mode === 'dark' ? '#ffb74d' : '#ff9800',
        dark: mode === 'dark' ? '#f57c00' : '#e65100',
      },
      info: {
        main: mode === 'dark' ? '#29b6f6' : '#0288d1',
        light: mode === 'dark' ? '#4fc3f7' : '#03a9f4',
        dark: mode === 'dark' ? '#0288d1' : '#01579b',
      },
      success: {
        main: mode === 'dark' ? '#66bb6a' : '#2e7d32',
        light: mode === 'dark' ? '#81c784' : '#4caf50',
        dark: mode === 'dark' ? '#388e3c' : '#1b5e20',
      },
      ...(mode === 'dark' ? {
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
        text: {
          primary: 'rgba(20, 20, 20, 0.95)',
          secondary: 'rgba(120, 120, 120, 0.7)',
          disabled: 'rgba(255, 255, 255, 0.5)',
        },
        divider: 'rgba(255, 255, 255, 0.12)',
      } : {
        background: {
          default: '#f8f9fa',
          paper: '#ffffff',
        },
        text: {
          primary: 'rgba(0, 0, 0, 0.87)',
          secondary: 'rgba(0, 0, 0, 0.6)',
          disabled: 'rgba(0, 0, 0, 0.38)',
        },
        divider: 'rgba(0, 0, 0, 0.12)',
      }),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: '-0.01562em',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.35,
        letterSpacing: '-0.00833em',
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: '0em',
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: '0.00735em',
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.5,
        letterSpacing: '0em',
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.6,
        letterSpacing: '0.0075em',
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.6,
        letterSpacing: '0.00938em',
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.6,
        letterSpacing: '0.00714em',
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.6,
        letterSpacing: '0.00938em',
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.6,
        letterSpacing: '0.01071em',
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 600,
        lineHeight: 1.75,
        letterSpacing: '0.02857em',
        textTransform: 'none',
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.66,
        letterSpacing: '0.03333em',
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 600,
        lineHeight: 2.66,
        letterSpacing: '0.08333em',
        textTransform: 'uppercase',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'dark' 
              ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
              : '0 2px 10px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'dark' 
              ? '0 6px 24px rgba(0, 0, 0, 0.5)' 
              : '0 4px 15px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: mode === 'dark' 
                ? '0 8px 30px rgba(0, 0, 0, 0.6)' 
                : '0 6px 24px rgba(0, 0, 0, 0.15)',
            },
            overflow: 'visible',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 600,
            padding: '8px 16px',
            boxShadow: 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(1px)',
            },
          },
          contained: {
            boxShadow: mode === 'dark' 
              ? '0 2px 6px rgba(0, 0, 0, 0.5)' 
              : '0 2px 6px rgba(0, 0, 0, 0.1)',
          },
          sizeSmall: {
            padding: '6px 12px',
          },
          sizeLarge: {
            padding: '12px 24px',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: mode === 'dark' 
              ? '0 2px 8px rgba(0, 0, 0, 0.4)' 
              : '0 2px 8px rgba(0, 0, 0, 0.06)',
          },
          elevation2: {
            boxShadow: mode === 'dark' 
              ? '0 4px 12px rgba(0, 0, 0, 0.45)' 
              : '0 4px 12px rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            padding: '16px',
          },
          head: {
            fontWeight: 600,
            backgroundColor: mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.05)' 
              : 'rgba(0, 0, 0, 0.02)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
          sizeSmall: {
            height: 24,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '0.75rem',
            padding: '8px 12px',
            backgroundColor: mode === 'dark' 
              ? 'rgba(64, 64, 64, 0.95)' 
              : 'rgba(32, 32, 32, 0.9)',
            boxShadow: mode === 'dark' 
              ? '0 4px 12px rgba(0, 0, 0, 0.5)' 
              : '0 4px 12px rgba(0, 0, 0, 0.2)',
          },
          arrow: {
            color: mode === 'dark' 
              ? 'rgba(64, 64, 64, 0.95)' 
              : 'rgba(32, 32, 32, 0.9)',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          size: 'small',
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiSelect: {
        defaultProps: {
          variant: 'outlined',
          size: 'small',
        },
        styleOverrides: {
          outlined: {
            borderRadius: 8,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            minHeight: 42,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'all 0.2s ease',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 