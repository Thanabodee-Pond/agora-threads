// client/components/LeftSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
// นำเข้า Icon ทั้งหมดที่จำเป็นสำหรับทั้ง Mobile และ Desktop
import { Home as HomeIcon, BookOpen, ArrowRight } from 'lucide-react';

interface LeftSidebarProps {
  onClose?: () => void; // onClose จะถูกใช้เฉพาะใน Mobile Sidebar
}

// ====================================================================================
// Component สำหรับ Mobile Sidebar Content (จะถูก render เมื่อ md:hidden)
// ====================================================================================
function MobileLeftSidebarContent({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Icon ลูกศรหันขวาสำหรับปิด Sidebar (เฉพาะ Mobile) */}
      <div className="px-4 py-4 flex items-center">
        {onClose && (
          <button
            onClick={onClose} // เมื่อคลิกปุ่มนี้จะปิด Sidebar
            className="text-custom-text hover:bg-custom-grey-100 p-2 rounded-full"
          >
            <ArrowRight className="h-6 w-6 text-white" /> {/* Icon ลูกศรชี้ขวา */}
          </button>
        )}
      </div>

      {/* ส่วน nav หลักของ Mobile Sidebar */}
      <nav className="space-y-2 mt-2 px-4 pt-0">
        {/* Home Link */}
        <Link
          href="/"
          className={`flex items-center space-x-3 py-2 rounded-md transition-colors ${
            pathname === '/' ? 'bg-custom-green-100 text-custom-green-300 font-semibold' : 'text-custom-text hover:bg-custom-grey-100'
          }`}
          onClick={onClose} // เรียก onClose เมื่อคลิกลิงก์
        >
          <HomeIcon className="w-5 h-5 text-white" />
          <span className="font-sans text-white">Home</span>
        </Link>

        {/* Our Blog Link */}
        <Link
          href="/blog"
          className={`flex items-center space-x-3 py-2 rounded-md transition-colors ${
            pathname === '/blog' ? 'bg-custom-green-100 text-custom-green-300 font-semibold' : 'text-custom-text hover:bg-custom-grey-100'
          }`}
          onClick={onClose} // เรียก onClose เมื่อคลิกลิงก์
        >
          <BookOpen className="w-5 h-5 text-white" />
          <span className="font-sans text-white">Our Blog</span>
        </Link>
      </nav>
    </>
  );
}

// ====================================================================================
// Component สำหรับ Desktop Sidebar Content (จะถูก render เมื่อ md:block)
// ปรับแก้ตาม HTML ที่คุณให้มา
// ====================================================================================
function DesktopLeftSidebarContent() {
  const pathname = usePathname();

  return (
    // nav สำหรับ Desktop ตาม HTML ที่คุณให้มา
    // w-full md:w-64 bg-custom-white py-4 h-full คือของ <aside> หลัก
    // ดังนั้น nav ด้านในไม่ต้องมี w-full หรือ h-full อีก
    <nav className="space-y-2 mt-2 px-4 pt-4 md:px-0 md:mt-2 md:py-0"> {/* ปรับคลาสตาม HTML ที่ให้มา */}
      {/* Home Link */}
      <Link
        href="/"
        // คลาสตรงนี้จะตรงกับ HTML ที่คุณให้มาสำหรับ Desktop
        className={`flex items-center space-x-3 py-2 rounded-md transition-colors ${
          pathname === '/' ? 'bg-custom-green-100 text-custom-green-300 font-semibold' : 'text-custom-text hover:bg-custom-grey-100'
        } px-4 md:px-0`} // เพิ่ม px-4 และ md:px-0 ให้คงความสอดคล้องกับโครงสร้างใหม่
      >
        <HomeIcon className="w-5 h-5" />
        <span className="font-sans text-[#243831] font-bold">Home</span>
      </Link>

      {/* Our Blog Link */}
      <Link
        href="/blog"
        // คลาสตรงนี้จะตรงกับ HTML ที่คุณให้มาสำหรับ Desktop
        className={`flex items-center space-x-3 py-2 rounded-md transition-colors ${
          pathname === '/blog' ? 'bg-custom-green-100 text-custom-green-300 font-semibold' : 'text-custom-text hover:bg-custom-grey-100'
        } px-4 md:px-0`} // เพิ่ม px-4 และ md:px-0 ให้คงความสอดคล้องกับโครงสร้างใหม่
      >
        <BookOpen className="w-5 h-5" />
        <span className="font-sans">Our Blog</span>
      </Link>
    </nav>
  );
}

// ====================================================================================
// LeftSidebar หลักที่เลือก render ตามขนาดหน้าจอ
// ====================================================================================
export default function LeftSidebar({ onClose }: LeftSidebarProps) {
  return (
    <aside className="w-full md:w-64 bg-custom-white py-4 h-full"> {/* py-4 ของ aside ยังคงอยู่ */}
      {/* Mobile Version: ซ่อนบน Desktop */}
      <div className="md:hidden">
        <MobileLeftSidebarContent onClose={onClose!} /> {/* onClose ต้องมีใน Mobile */}
      </div>

      {/* Desktop Version: ซ่อนบน Mobile */}
      <div className="hidden md:block">
        <DesktopLeftSidebarContent />
      </div>
    </aside>
  );
}