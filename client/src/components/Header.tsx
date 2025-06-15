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

import { UserIcon as HeroUserIcon } from '@heroicons/react/24/outline';
import { User as LucideUserIcon } from 'lucide-react';

export default function Header() {
  const { isLoggedIn, username, userAvatarUrl, logout } = useAuth();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/sign-in');
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(prevState => !prevState);
  };

  const getAvatarContent = () => {
    const defaultAvatarPath = '/pond_avatar.png';
    const specificUsers = ['pond', 'Jessica', 'Zach'];

    if (username && specificUsers.includes(username)) {
      return (
        <Image
          src={defaultAvatarPath}
          alt={`${username}'s avatar`}
          width={36}
          height={36}
          className="rounded-full object-cover border-2 border-white"
        />
      );
    } else {
      return (
        <LucideUserIcon className="h-9 w-9 text-white border-2 border-white rounded-full" />
      );
    }
  };

  return (
    <>
      <header className="bg-[#243831] border-b border-custom-grey-100 py-4 px-4 md:px-8 shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center w-full">
          {/* Logo/Site Title - Always visible and aligned left */}
          <Link href="/" className="text-2xl font-italic font-castoro text-white">
            a Board
          </Link>

          {/* Desktop Navigation (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                {getAvatarContent()}
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

          {/* Mobile Hamburger Menu (visible on mobile, hidden on desktop) */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileSidebar} className="text-white hover:bg-transparent">
              {isMobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <div className={cn(
        "fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden",
        isMobileSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )} onClick={toggleMobileSidebar} />

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-4/5 shadow-lg z-50 bg-[#243831] transform transition-transform duration-300 ease-in-out md:hidden", // <-- เพิ่ม bg-[#243831] และลบ bg-custom-white
        isMobileSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <LeftSidebar onClose={toggleMobileSidebar} /> {/* ส่ง onClose prop ไปยัง LeftSidebar */}
      </div>
    </>
  );
}