// client/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Noto_Sans_Thai, Castoro } from 'next/font/google';

import './globals.css';
import { Providers } from '@/components/Providers';

// *** เพิ่ม: นำเข้า cn utility ***
import { cn } from '@/lib/utils'; 

// Define your fonts here
const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  variable: '--font-heading',
});
const castoro = Castoro({
  weight: '400', 
  subsets: ['latin'],
  variable: '--font-castoro',
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
      <body 
        className={cn(
          inter.variable, 
          notoSansThai.variable, 
          castoro.variable
        )}
        suppressHydrationWarning={true} // *** เพิ่มบรรทัดนี้ ***
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}