'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'; // เพิ่ม useMemo
import axios from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  username: string;
  avatarUrl?: string | null; 
  sub: number; 
  iat: number;
  exp: number;
}

interface AuthUser {
  id: number;
  username: string;
  createdAt: string;
  avatarUrl?: string | null; 
}

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  userAvatarUrl: string | null;
  accessToken: string | null;
  login: (token: string, userFromServer: AuthUser) => void; 
  logout: () => void;
  isLoading: boolean;
  user: AuthUser | null; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:3001';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null); 

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUsername(null);
    setUserAvatarUrl(null);
    setAccessToken(null);
    setUser(null); 
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user'); // 

    delete axiosInstance.defaults.headers.common['Authorization']; 
    router.push('/'); 
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUserJson = localStorage.getItem('user'); 

    if (token && storedUserJson) {
      try {
        const decodedToken: JwtPayload = jwtDecode(token);
        const storedUser: AuthUser = JSON.parse(storedUserJson);

        if (decodedToken.exp * 1000 < Date.now()) {
          console.log('AuthProvider: Stored token expired during initial check. Logging out.');
          logout();
        } else {
          setIsLoggedIn(true);
          setAccessToken(token);
          setUser(storedUser);
          setUsername(storedUser.username);
          setUserAvatarUrl(storedUser.avatarUrl || null);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log("AuthProvider: Loaded from localStorage. Username:", storedUser.username, "Avatar:", storedUser.avatarUrl);
        }
      } catch (error) {
        console.error("AuthProvider: Failed to decode token or parse user from localStorage:", error);
        logout();
      }
    } else {
      logout();
    }
    setIsLoading(false); 
  }, [logout]);

  useEffect(() => {
    if (isLoading) return; 

    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const token = accessToken; 
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.error("AuthProvider: Authentication Error (401): Token might be expired or invalid.");
          toast.error("Session expired. Please sign in again.");
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [logout, accessToken, isLoading]); 

  const login = useCallback((token: string, userFromServer: AuthUser) => { 
    try {
      const decodedToken: JwtPayload = jwtDecode(token);

      if (decodedToken.exp * 1000 < Date.now()) {
        toast.error("This session has already expired. Please sign in again.");
        logout();
        return;
      }

      setIsLoggedIn(true);
      setAccessToken(token);
      setUsername(userFromServer.username);
      setUserAvatarUrl(userFromServer.avatarUrl || null);
      setUser(userFromServer); 

      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(userFromServer)); 

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      toast.success('Logged in successfully!');
      console.log("AuthProvider: User logged in. Username:", userFromServer.username, "Avatar:", userFromServer.avatarUrl);
    } catch (error) {
      console.error("AuthProvider: Failed to decode token or token is invalid:", error);
      toast.error("An invalid token was provided. Could not sign in.");
      logout();
    }
  }, [logout]);

  const contextValue = useMemo(() => ({ 
    isLoggedIn,
    username,
    userAvatarUrl,
    accessToken,
    login,
    logout,
    isLoading,
    user, 
  }), [isLoggedIn, username, userAvatarUrl, accessToken, login, logout, isLoading, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#BBC2C0]">
        <p className="text-custom-text">Loading user session...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}