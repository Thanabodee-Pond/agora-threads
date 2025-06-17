'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home as HomeIcon, BookOpen, ArrowRight } from 'lucide-react';

interface LeftSidebarProps {
  onClose?: () => void; 
}

function MobileLeftSidebarContent({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="px-4 py-4 flex items-center">
        {onClose && (
          <button
            onClick={onClose} 
            className="text-custom-text hover:bg-custom-grey-100 p-2 rounded-full"
          >
            <ArrowRight className="h-6 w-6 text-white" /> 
          </button>
        )}
      </div>

      <nav className="space-y-2 mt-2 px-4 pt-0">
        {/* Home Link */}
        <Link
          href="/"
          className={`flex items-center space-x-3 py-2 rounded-md transition-colors ${
            pathname === '/' ? 'bg-custom-green-100 text-custom-green-300 font-semibold' : 'text-custom-text hover:bg-custom-grey-100'
          }`}
          onClick={onClose} 
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
          onClick={onClose} 
        >
          <BookOpen className="w-5 h-5 text-white" />
          <span className="font-sans text-white">Our Blog</span>
        </Link>
      </nav>
    </>
  );
}

function DesktopLeftSidebarContent() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2 mt-2 px-4 pt-4 md:px-0 md:mt-2 md:py-0"> 
      {/* Home Link */}
      <Link
        href="/"
        className={`flex items-center space-x-3 py-2 rounded-md transition-colors ${
          pathname === '/' ? 'bg-custom-green-100 text-custom-green-300 font-semibold' : 'text-custom-text hover:bg-custom-grey-100'
        } px-4 md:px-0`} 
      >
        <HomeIcon className="w-5 h-5" />
        <span className="font-sans text-[#243831] font-bold">Home</span>
      </Link>

      <Link
        href="/blog"
        className={`flex items-center space-x-3 py-2 rounded-md transition-colors ${
          pathname === '/blog' ? 'bg-custom-green-100 text-custom-green-300 font-semibold' : 'text-custom-text hover:bg-custom-grey-100'
        } px-4 md:px-0`} 
      >
        <BookOpen className="w-5 h-5" />
        <span className="font-sans">Our Blog</span>
      </Link>
    </nav>
  );
}

export default function LeftSidebar({ onClose }: LeftSidebarProps) {
  return (
    <aside className="w-full md:w-64 bg-custom-white py-4 h-full"> 
      <div className="md:hidden">
        <MobileLeftSidebarContent onClose={onClose!} /> 
      </div>
      <div className="hidden md:block">
        <DesktopLeftSidebarContent />
      </div>
    </aside>
  );
}