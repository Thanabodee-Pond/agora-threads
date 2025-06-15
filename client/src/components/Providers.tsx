// client/src/components/Providers.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import React from 'react';
import { AuthProvider } from '@/components/AuthProvider';
import { Toaster } from '@/components/ui/sonner'; // <--- ตรวจสอบตรงนี้

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors /> {/* <--- ตรวจสอบตรงนี้ */}
        </AuthProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}