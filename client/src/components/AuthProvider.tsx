// client/components/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useSession } from 'next-auth/react'; 

// 1. กำหนด Interface สำหรับข้อมูลที่ถอดรหัสได้จาก JWT (Payload)
interface JwtPayload {
  username: string;
  avatarUrl?: string; // ตั้งเป็น optional เผื่อบาง user ไม่มีรูป
  sub: string;
  iat: number;
  exp: number;
}

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  userAvatarUrl: string | null;
  accessToken: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean; // *** เพิ่ม: สถานะการโหลด/ตรวจสอบ Auth เสร็จสิ้น ***
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
  const { data: session, status: sessionStatus } = useSession(); // ยังคงมี useSession แต่ไม่ได้ใช้โดยตรงใน logic นี้มากนัก
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // *** ตั้งค่าเริ่มต้นเป็น true เพื่อให้รู้ว่ากำลังตรวจสอบ Auth ***

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUsername(null);
    setUserAvatarUrl(null);
    setAccessToken(null);
    // เข้าถึง localStorage โดยตรงไม่จำเป็นต้องเช็ค isMounted ใน useCallback
    // เพราะ useCallback จะถูกเรียกหลังจาก component mount และมีการ hydration แล้ว
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userAvatarUrl');
    // Note: If you're using Next.js Auth, you might also want to call signOut() here
    // signOut({ redirect: false }).then(() => router.push('/sign-in'));
  }, []); // ไม่มี dependency isMounted เพราะมันถูกใช้ใน useEffect ที่ isMounted แล้ว

  // Initial check for token in localStorage (Runs only on client-side after mount)
  useEffect(() => {
    // โค้ดใน useEffect นี้จะรันเฉพาะบน Client
    const token = localStorage.getItem('accessToken');
    const storedUsername = localStorage.getItem('username');
    const storedAvatarUrl = localStorage.getItem('userAvatarUrl');

    if (token) {
      try {
        const decodedToken: JwtPayload = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          console.log('Stored token expired during initial check. Logging out.');
          logout();
        } else {
          setIsLoggedIn(true);
          setUsername(storedUsername);
          setUserAvatarUrl(storedAvatarUrl);
          setAccessToken(token);
        }
      } catch (error) {
        console.error("Failed to decode token from localStorage:", error);
        logout();
      }
    } else {
      // ไม่มี token ใน localStorage, ต้องแน่ใจว่า state เป็น logged out
      logout(); // เรียก logout เพื่อล้าง state ทั้งหมด (ถ้าไม่มี token แต่ state ก่อนหน้านี้เป็น true)
    }
    setIsLoading(false); // *** ตั้งค่าเป็น false เมื่อตรวจสอบ Auth เสร็จสิ้นแล้ว ***
  }, [logout]); // logout เป็น dependency เพื่อให้ useCallback ไม่เก่าเกินไป

  // Axios Interceptors (ตั้งค่าหลังจาก Initial Auth check เสร็จสิ้น)
  useEffect(() => {
    // Interceptor ควรจะทำงานหลังจากโหลด token จาก localStorage ใน useEffect ด้านบนเสร็จสิ้น
    // เพื่อให้มั่นใจว่า accessToken ใน closure ของ interceptor ถูกต้อง
    if (isLoading) return; // ไม่ทำงานถ้ายังตรวจสอบ Auth ไม่เสร็จ

    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        // ใช้ accessToken จาก state ที่ได้มาจากการ initial check หรือ login
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
          console.error("Authentication Error (401): Token might be expired or invalid.");
          toast.error("Session expired. Please sign in again.");
          logout();
          router.push('/sign-in'); // Redirect ไปหน้า Sign In หลังจาก Logout เนื่องจาก 401
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [logout, accessToken, isLoading, router]); // เพิ่ม isLoading, router ใน dependency

  // ปรับปรุงฟังก์ชัน login ให้จัดการ state และ localStorage อย่างครบถ้วน
  const login = useCallback((token: string) => {
    try {
      const decodedToken: JwtPayload = jwtDecode(token);

      if (decodedToken.exp * 1000 < Date.now()) {
        toast.error("This session has already expired. Please sign in again.");
        logout();
        return;
      }

      setIsLoggedIn(true);
      setUsername(decodedToken.username);
      setUserAvatarUrl(decodedToken.avatarUrl || null);
      setAccessToken(token);

      localStorage.setItem('accessToken', token);
      localStorage.setItem('username', decodedToken.username);
      if (decodedToken.avatarUrl) {
        localStorage.setItem('userAvatarUrl', decodedToken.avatarUrl || ''); // Store empty string if null
      } else {
        localStorage.removeItem('userAvatarUrl');
      }

      toast.success('Logged in successfully!');
    } catch (error) {
      console.error("Failed to decode token or token is invalid:", error);
      toast.error("An invalid token was provided. Could not sign in.");
      logout();
    }
  }, [logout]);

  const contextValue = {
    isLoggedIn,
    username,
    userAvatarUrl,
    accessToken,
    login,
    logout,
    isLoading, // *** ส่ง isLoading ไปใน context ด้วย ***
  };

  // *** สำคัญ: ตรวจสอบ isLoading ก่อน Render children ***
  // ถ้า isLoading เป็น true หมายถึง AuthProvider ยังไม่เสร็จสิ้นการตรวจสอบ localStorage
  // ในระหว่างนี้ เราจะไม่ Render children เพื่อป้องกัน Hydration mismatch
  // คุณสามารถแสดง Spinner หรือ Loading Indicator แทนได้
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