// client/components/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner'; // เพิ่ม toast เข้ามา
import { useRouter } from 'next/navigation'; // เพิ่ม useRouter เข้ามา

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  userAvatarUrl: string | null;
  accessToken: string | null;
  login: (username: string, avatarUrl: string, token: string) => void;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:3001';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter(); // ใช้ useRouter
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false); // เพิ่ม state เพื่อเช็คว่า component mount แล้ว

  // ตั้งค่า isMounted เป็น true เมื่อ component mount ครั้งแรกบน client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Axios Interceptor
  useEffect(() => {
    if (!isMounted) return; // ไม่ทำงานใน SSR
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
    };
  }, [isMounted]); // Dependency on isMounted

  const login = useCallback((name: string, avatar: string, token: string) => {
    setIsLoggedIn(true);
    setUsername(name);
    setUserAvatarUrl(avatar);
    setAccessToken(token);
    if (isMounted) { // บันทึกลง localStorage เมื่อ mount แล้ว
      localStorage.setItem('accessToken', token);
      localStorage.setItem('username', name);
      localStorage.setItem('userAvatarUrl', avatar);
    }
  }, [isMounted]);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUsername(null);
    setUserAvatarUrl(null);
    setAccessToken(null);
    if (isMounted) { // ลบจาก localStorage เมื่อ mount แล้ว
      localStorage.removeItem('accessToken');
      localStorage.removeItem('username');
      localStorage.removeItem('userAvatarUrl');
    }
    // router.push('/sign-in'); // Redirect after logout เข้าหน้า home ได้โดยไม่ต้อง Login 
  }, [isMounted, router]);

  const checkAuthStatus = useCallback(async () => {
    if (!isMounted) return; // ไม่ทำงานใน SSR
    const token = localStorage.getItem('accessToken');
    const storedUsername = localStorage.getItem('username');
    const storedAvatarUrl = localStorage.getItem('userAvatarUrl');

    if (token && storedUsername && storedAvatarUrl) {
      try {
        // ในโปรเจกต์จริง, ควรมีการเรียก API เพื่อยืนยัน token ว่ายังใช้ได้อยู่หรือไม่
        const response = await axiosInstance.get('/auth/profile');
        if (response.data && response.data.username) {
          login(response.data.username, response.data.avatarUrl || storedAvatarUrl, token);
        } else {
          logout();
        }
      } catch (error: any) {
        console.error("Token validation failed:", error);
        // แสดง toast error หาก token หมดอายุหรือไม่มีสิทธิ์
        toast.error(`Session expired. Please sign in again.`);
        logout();
      }
    } else {
      logout();
    }
  }, [isMounted, login, logout, toast]);

  useEffect(() => {
    if (isMounted) { // เรียก checkAuthStatus เมื่อ component mount แล้ว
      checkAuthStatus();
    }
  }, [isMounted, checkAuthStatus]); // Dependency on isMounted and checkAuthStatus

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, userAvatarUrl, accessToken, login, logout, checkAuthStatus }}>
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

export { axiosInstance };