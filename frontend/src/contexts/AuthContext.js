import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      // Check for OAuth session_id in URL fragment first
      const fragment = window.location.hash.substring(1);
      const params = new URLSearchParams(fragment);
      const sessionId = params.get('session_id');
      
      if (sessionId) {
        setLoading(true);
        try {
          // Process OAuth session
          const response = await fetch(`${API_URL}/api/auth/oauth/session-data`, {
            headers: {
              'X-Session-ID': sessionId
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            // Don't set JWT token for OAuth users - they use session cookies
            setToken('oauth_session');
            
            // Clean up URL fragment
            window.history.replaceState({}, document.title, window.location.pathname);
            
            return;
          } else {
            console.error('OAuth session processing failed');
          }
        } catch (error) {
          console.error('OAuth session error:', error);
        }
        
        // Clean up URL fragment even on error
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // Check for existing JWT token
      const savedToken = localStorage.getItem('auth_token');
      if (savedToken) {
        try {
          const response = await fetch(`${API_URL}/api/user/profile`, {
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setToken(savedToken);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('auth_token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('auth_token');
          setToken(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, [API_URL]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      const { access_token, user: userData } = data;
      
      localStorage.setItem('auth_token', access_token);
      setToken(access_token);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (full_name, email, password, confirm_password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          full_name, 
          email, 
          password, 
          confirm_password 
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Signup failed');
      }

      const data = await response.json();
      const { access_token, user: userData } = data;
      
      localStorage.setItem('auth_token', access_token);
      setToken(access_token);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        if (token === 'oauth_session') {
          // OAuth session logout
          await fetch(`${API_URL}/api/auth/oauth/logout`, {
            method: 'POST',
            credentials: 'include' // Include cookies
          });
        } else {
          // JWT token logout
          await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = React.useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return userData;
      }
    } catch (error) {
      console.error('User refresh error:', error);
    }
  }, [token, API_URL]);

  const checkPages = React.useCallback(async (pageCount) => {
    if (!token) return null;
    
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Only add Authorization header for JWT tokens, not OAuth sessions
      if (token !== 'oauth_session') {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/api/user/pages/check`, {
        method: 'POST',
        headers,
        credentials: 'include', // Include cookies for OAuth sessions
        body: JSON.stringify({ page_count: pageCount })
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Pages check error:', error);
    }
    return null;
  }, [token, API_URL]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    signup,
    logout,
    refreshUser,
    checkPages
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};