// client/components/Header.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import LeftSidebar from './LeftSidebar';
import { cn } from '@/lib/utils';

// import { UserIcon as HeroUserIcon } from '@heroicons/react/24/outline'; // ไม่ได้ใช้แล้ว
import { User as LucideUserIcon } from 'lucide-react'; // ถ้ายังต้องการใช้เป็น fallback icon สุดท้าย

export default function Header() {
  // ดึง userAvatarUrl จาก useAuth
  const { isLoggedIn, username, userAvatarUrl, logout } = useAuth(); // ตรวจสอบว่า useAuth มี userAvatarUrl
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/sign-in');
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(prevState => !prevState);
  };

  // --- [ การแก้ไขฟังก์ชัน getAvatarContent ] ---
  const getAvatarContent = () => {
    const defaultAvatarPath = '/pond_avatar.png'; // รูปภาพ fallback หลัก

    if (isLoggedIn && userAvatarUrl && userAvatarUrl.trim() !== '') {
      // ถ้า Login แล้ว และมี userAvatarUrl ที่ไม่ใช่ค่าว่าง
      return (
        <Image
          src={userAvatarUrl} // ใช้ URL Avatar ที่ได้มาจาก Backend/useAuth
          alt={`${username}'s avatar`}
          width={36}
          height={36}
          className="rounded-full object-cover border-2 border-white"
        />
      );
    } else if (isLoggedIn) {
      // ถ้า Login แล้ว แต่ไม่มี userAvatarUrl (หรือเป็นค่าว่าง) ให้ใช้รูป default
      return (
        <Image
          src={defaultAvatarPath} // ใช้รูป default ที่ระบุไว้
          alt={`${username}'s avatar`}
          width={36}
          height={36}
          className="rounded-full object-cover border-2 border-white"
        />
      );
    } else {
      // ถ้ายังไม่ได้ Login ให้แสดง Icon หรือรูป default อื่นๆ
      return (
        // Option 1: ใช้ LucideUserIcon เป็น Icon
        <LucideUserIcon className="h-9 w-9 text-white border-2 border-white rounded-full" />
        // Option 2: ใช้รูป default สำหรับผู้ใช้ที่ไม่ได้ล็อกอิน (ถ้ามี)
        // <Image
        //   src={defaultAvatarPath}
        //   alt="Guest avatar"
        //   width={36}
        //   height={36}
        //   className="rounded-full object-cover border-2 border-white"
        // />
      );
    }
  };
  // ------------------------------------------

  return (
    <>
      <header className="bg-[#243831] border-b border-custom-grey-100 py-4 px-4 md:px-8 shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center w-full">
          <Link href="/" className="text-2xl font-italic font-castoro text-white">
            a Board
          </Link>

          <nav className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                {getAvatarContent()} {/* เรียกใช้ฟังก์ชันที่แก้ไขแล้ว */}
                <span className="text-white font-semibold font-sans hidden md:inline">
                  {username || 'Guest'}
                </span>
                <Button
                  onClick={handleLogout}
                  className="text-white hover:bg-green-900 bg-[#49A569] font-sans"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button onClick={() => router.push('/sign-in')} className="bg-[#49A569] text-white hover:bg-green-900 font-sans">
                  Sign In
                </Button>
              </div>
            )}
          </nav>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileSidebar} className="text-white hover:bg-transparent">
              {isMobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </header>

      <div className={cn(
        "fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden",
        isMobileSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )} onClick={toggleMobileSidebar} />

      <div className={cn(
        "fixed top-0 right-0 h-full w-4/5 shadow-lg z-50 bg-[#243831] transform transition-transform duration-300 ease-in-out md:hidden",
        isMobileSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <LeftSidebar onClose={toggleMobileSidebar} />
      </div>
    </>
  );
}