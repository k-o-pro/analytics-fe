import React, { createContext, useContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface LoginResponse {
  token: string;
}

interface RefreshResponse {
  token: string;
}

type User = {
  user_id: number;
  email: string;
  exp: number;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  checkAuthState: () => boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  refreshToken: async () => false,
  checkAuthState: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Function to check authentication state from token in localStorage
  const checkAuthState = () => {
    const token = localStorage.getItem('token');
    console.log('Checking auth state, token present:', !!token);
    
    if (token) {
      try {
        const decoded = jwtDecode<User>(token);
        const currentTime = Date.now() / 1000;
        
        console.log('Token expiration:', new Date(decoded.exp * 1000).toLocaleString());
        console.log('Current time:', new Date(currentTime * 1000).toLocaleString());
        console.log('Token valid:', decoded.exp > currentTime ? 'Yes' : 'No');
        
        if (decoded.exp > currentTime) {
          setUser(decoded);
          api.setAuthToken(token);
          console.log('Auth state set to authenticated for user:', decoded.email);
          return true;
        } else {
          // Token expired
          console.log('Token expired, removing from localStorage');
          localStorage.removeItem('token');
        }
      } catch (error) {
        // Invalid token
        console.error('Invalid token in localStorage:', error);
        localStorage.removeItem('token');
      }
    }
    console.log('Auth state set to unauthenticated');
    return false;
  };

  // Check if token exists and is valid on initial load
  useEffect(() => {
    const initAuth = async () => {
      checkAuthState();
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      const { token } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', email);
      api.setAuthToken(token);
      
      const decoded = jwtDecode<User>(token);
      setUser(decoded);
      
      console.log('Login successful for:', email);
    } catch (error: any) {
      console.error('Login failed:', {
        message: error.message,
        status: error.status,
        details: error.originalError
      });
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    api.setAuthToken('');
    setUser(null);
    navigate('/login');
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await api.post<RefreshResponse>('/auth/refresh');
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      api.setAuthToken(token);
      
      const decoded = jwtDecode<User>(token);
      setUser(decoded);
      
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout,
      refreshToken,
      checkAuthState
    }}>
      {children}
    </AuthContext.Provider>
  );
};