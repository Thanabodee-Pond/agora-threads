'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Loader2, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isLoading = status === 'loading';

  const renderNavLinks = () => (
    <>
      {/* --- แสดงเมื่อล็อกอินแล้ว --- */}
      {status === 'authenticated' && session.user && (
        <>
          {/* ลิงก์ไปยังหน้า My Posts และ Create Post */}
          <Link href="/my-posts" className="font-medium text-sm hover:underline" onClick={() => setIsMenuOpen(false)}>
          <Button className="w-full">My Posts</Button>
          </Link>
          <Link href="/create-post" className="w-full md:w-auto" onClick={() => setIsMenuOpen(false)}>
            <Button className="w-full">Create Post</Button>
          </Link>

          {/* แสดงข้อมูล User และ Avatar */}
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{session.user.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{session.user.name}</span>
          </div>

          {/* ปุ่ม Sign Out */}
          <Button variant="outline" onClick={() => signOut()} className="w-full md:w-auto">
            Sign Out
          </Button>
        </>
      )}

      {/* --- แสดงเมื่อยังไม่ได้ล็อกอิน --- */}
      {status === 'unauthenticated' && (
        <Link href="/sign-in" className="w-full md:w-auto" onClick={() => setIsMenuOpen(false)}>
          <Button className="w-full">Sign In</Button>
        </Link>
      )}
    </>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          Web-Board-App
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : renderNavLinks()}
        </nav>

        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="flex flex-col items-center gap-4 p-4">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : renderNavLinks()}
          </nav>
        </div>
      )}
    </header>
  );
}