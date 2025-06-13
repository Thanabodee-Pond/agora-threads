// client/components/LeftSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home as HomeIcon, BookOpen } from 'lucide-react';

export default function LeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 bg-custom-white p-4 h-full"> {/* p-4 ยังคงอยู่สำหรับ padding โดยรวมของ sidebar */}
      <nav className="space-y-2 mt-2">
        {/* Home Link */}
        {/* เปลี่ยน p-2 เป็น pl-2 py-2 เพื่อควบคุม padding ด้านซ้ายแยกต่างหาก */}
        <Link href="/" className={`flex items-center space-x-3 pl-2 py-2 rounded-md transition-colors ${
          pathname === '/' ? 'bg-custom-green-100 text-custom-green-300 font-semibold' : 'text-custom-text hover:bg-custom-grey-100'
        }`}>
          <HomeIcon className="w-5 h-5" />
          <span className="font-sans">Home</span>
        </Link>

        {/* Our Blog Link */}
        {/* เปลี่ยน p-2 เป็น pl-2 py-2 เช่นกัน */}
        <Link href="/blog" className={`flex items-center space-x-3 pl-2 py-2 rounded-md transition-colors ${
          pathname === '/blog' ? 'bg-custom-green-100 text-custom-green-300 font-semibold' : 'text-custom-text hover:bg-custom-grey-100'
        }`}>
          <BookOpen className="w-5 h-5" />
          <span className="font-sans">Our Blog</span>
        </Link>
      </nav>
    </aside>
  );
}