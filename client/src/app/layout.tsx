// client/app/layout.tsx (โค้ดปัจจุบันของคุณที่มีปัญหา Hydration Error)
import type { Metadata } from 'next';
import { Inter, Noto_Sans_Thai, Castoro } from 'next/font/google';

import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { Toaster } from '@/components/ui/sonner';

// Define your fonts here
const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  variable: '--font-heading',
});
const castoro = Castoro({
  weight: '400', // Castoro มีแค่ weight 400
  subsets: ['latin'],
  variable: '--font-castoro', // กำหนด CSS variable สำหรับ Castoro
});

export const metadata: Metadata = {
  title: 'a Board',
  description: 'A simple task management board.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* เพิ่ม class ของ Castoro เข้าไปใน body ด้วย */}
      <body className={`${inter.variable} ${notoSansThai.variable} ${castoro.variable}`}> {/* <-- สาเหตุของปัญหา */}
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}