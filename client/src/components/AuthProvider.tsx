// File: client/components/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'; // เพิ่ม useMemo
import axios from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
// import { useSession } from 'next-auth/react'; // ลบถ้าไม่ได้ใช้ NextAuth

// 1. กำหนด Interface สำหรับข้อมูลที่ถอดรหัสได้จาก JWT (Payload)
interface JwtPayload {
  username: string;
  avatarUrl?: string | null; // <-- เพิ่ม | null
  sub: number; // <-- แก้ไข: เปลี่ยนเป็น number ตาม schema.id (Backend)
  iat: number;
  exp: number;
}

// 2. กำหนด Interface สำหรับ User Data ที่ส่งมาจาก Backend (ใน Response Body)
// Backend ของเราส่ง { user: { id, username, createdAt, avatarUrl }, accessToken }
// ดังนั้น user object นี้คือสิ่งที่เราจะเก็บใน AuthProvider
interface AuthUser {
  id: number;
  username: string;
  createdAt: string;
  avatarUrl?: string | null; // <-- เพิ่ม: avatarUrl
}

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  userAvatarUrl: string | null;
  accessToken: string | null;
  login: (token: string, userFromServer: AuthUser) => void; // <-- แก้ไข: รับ userFromServer ด้วย
  logout: () => void;
  isLoading: boolean;
  user: AuthUser | null; // <-- เพิ่ม user object เต็มๆ ใน context
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
  // const { data: session, status: sessionStatus } = useSession(); // ลบ/คอมเมนต์ถ้าไม่ได้ใช้

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null); // State สำหรับเก็บ user object เต็มๆ

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUsername(null);
    setUserAvatarUrl(null);
    setAccessToken(null);
    setUser(null); // <-- ลบ user object ด้วย
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user'); // <-- ลบ user object ที่เก็บไว้ใน localStorage
    // ไม่จำเป็นต้องลบ 'username' และ 'userAvatarUrl' แยกแล้วถ้าเก็บ user object เต็มๆ

    delete axiosInstance.defaults.headers.common['Authorization']; // ลบ Header
    router.push('/sign-in'); // Redirect
  }, [router]);

  // Initial check for token & user in localStorage (Runs only on client-side after mount)
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUserJson = localStorage.getItem('user'); // <-- ดึง user object ที่เก็บไว้

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
          // ใช้ข้อมูลจาก storedUser ที่ดึงมาจาก localStorage
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
      // ไม่มี token หรือ user ใน localStorage, ต้องแน่ใจว่า state เป็น logged out
      logout();
    }
    setIsLoading(false); // ตั้งค่าเป็น false เมื่อตรวจสอบ Auth เสร็จสิ้นแล้ว
  }, [logout]);

  // Axios Interceptors (ตั้งค่าหลังจาก Initial Auth check เสร็จสิ้น)
  useEffect(() => {
    if (isLoading) return; // ไม่ทำงานถ้ายังตรวจสอบ Auth ไม่เสร็จ

    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const token = accessToken; // ใช้ accessToken จาก state
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
  }, [logout, accessToken, isLoading]); // accessToken เป็น dependency

  // ปรับปรุงฟังก์ชัน login ให้รับ userFromServer และเก็บข้อมูลลง state/localStorage
  const login = useCallback((token: string, userFromServer: AuthUser) => { // <-- รับ userFromServer
    try {
      const decodedToken: JwtPayload = jwtDecode(token);

      if (decodedToken.exp * 1000 < Date.now()) {
        toast.error("This session has already expired. Please sign in again.");
        logout();
        return;
      }

      setIsLoggedIn(true);
      setAccessToken(token);
      // ใช้ข้อมูลจาก userFromServer ที่ได้รับมาโดยตรง
      setUsername(userFromServer.username);
      setUserAvatarUrl(userFromServer.avatarUrl || null);
      setUser(userFromServer); // <-- เก็บ user object เต็มๆ

      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(userFromServer)); // <-- เก็บ user object เต็มๆ

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      toast.success('Logged in successfully!');
      console.log("AuthProvider: User logged in. Username:", userFromServer.username, "Avatar:", userFromServer.avatarUrl);
    } catch (error) {
      console.error("AuthProvider: Failed to decode token or token is invalid:", error);
      toast.error("An invalid token was provided. Could not sign in.");
      logout();
    }
  }, [logout]);

  const contextValue = useMemo(() => ({ // ใช้ useMemo เพื่อป้องกันการ re-render ไม่จำเป็น
    isLoggedIn,
    username,
    userAvatarUrl,
    accessToken,
    login,
    logout,
    isLoading,
    user, // ส่ง user object เต็มๆ ออกไป
  }), [isLoggedIn, username, userAvatarUrl, accessToken, login, logout, isLoading, user]);


  // ตรวจสอบ isLoading ก่อน Render children
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