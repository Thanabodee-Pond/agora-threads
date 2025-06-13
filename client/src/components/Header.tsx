// client/components/Header.tsx
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { isLoggedIn, username, userAvatarUrl, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/sign-in');
  };

  return (
    <header className="bg-[#243831] border-b border-custom-grey-100 py-4 px-4 md:px-8 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo - เปลี่ยน font-display เป็น font-castoro */}
        {/* ลบ text-custom-text ออก เพราะมี text-white แล้ว */}
        <Link href="/" className="text-2xl font-italic font font-castoro text-white">
          a Board
        </Link>

        {/* User Actions */}
        <nav className="flex items-center space-x-4">
          {!isLoggedIn ? (
            <Link href="/sign-in">
              <Button className="bg-[#49A569] text-custom-white px-4 py-2 rounded-md hover:bg-green-900 font-sans">
                Sign In
              </Button>
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
              {userAvatarUrl && (
                <img
                  src={userAvatarUrl}
                  alt={username || '/pond_avatar.png'}
                  className="w-8 h-8 rounded-full border border-custom-grey-100 object-cover"
                />
              )}
              {/* เปลี่ยนสี text-custom-text เป็น text-white บน navbar ที่เป็นสีเข้ม */}
              <span className="text-white font-semibold font-sans hidden md:inline">
                {username}
              </span>
              {/* เปลี่ยนสี text-custom-grey-300 เป็น text-white และ hover:text-gray-300 เพื่อให้อ่านออก */}
              <Button variant="ghost" onClick={handleLogout} className="text-white hover:text-gray-300 font-sans">
                Logout
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}