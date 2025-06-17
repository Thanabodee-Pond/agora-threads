'use client';

import Header from '@/components/Header';
import PostCard from '@/components/PostCard';
import FloatingCreateButton from '@/components/FloatingCreateButton';
import LeftSidebar from '@/components/LeftSidebar';
import { useAuth } from '@/components/AuthProvider'; 
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { axiosInstance } from '@/components/AuthProvider';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

interface Author {
  id: number;
  username: string;
  avatarUrl?: string;
}

interface Comment {
  id: number;
  content: string;
  postId: number;
  authorId: number;
  createdAt: string;
  author: {
    username: string;
  };
}

interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
  author: Author;
  category?: string;
  comments: Comment[];
}

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false); 

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); 
    window.addEventListener('resize', handleResize); 

    return () => window.removeEventListener('resize', handleResize); 
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<Post[]>('/posts');
        setPosts(response.data);
      } catch (err: any) {
        setError(err.message);
        toast.error(`Error fetching posts: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const toggleCommunityDropdown = () => {
    setIsCommunityDropdownOpen(prevState => !prevState);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdownContainer = document.getElementById('community-dropdown-container');
      if (dropdownContainer && !dropdownContainer.contains(event.target as Node)) {
        setIsCommunityDropdownOpen(false);
      }
    };

    if (isCommunityDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCommunityDropdownOpen]);

  if (loading) return <div className="text-center p-8 text-custom-text">กำลังโหลดโพสต์...</div>;
  if (error) return <div className="text-center p-8 text-red-500">เกิดข้อผิดพลาด: ${error}</div>;

  return (
    <div className="min-h-screen bg-[#BBC2C0] flex flex-col">
      <Header />

      <div className="flex-grow flex flex-col md:flex-row px-4 md:px-8">
        <div className="hidden md:block md:w-1/5 flex-shrink-0 bg-custom-white">
          <LeftSidebar />
        </div>

        <main className="flex-grow flex flex-col w-full md:w-3/5 md:ml-10 mt-3">
          <div className=""> 
            <div className="flex flex-row items-center justify-between gap-4 py-4 md:gap-10">
              <div className={`relative ${isMobile && isSearchFocused ? 'flex-grow' : 'flex-1 md:w-auto'}`}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-grey-300" />
                <Input
                  type="text"
                  placeholder={isMobile ? (isSearchFocused ? "Search" : "") : "Search"}
                  className="pl-9 pr-4 py-2 border border-white rounded-md focus:ring-custom-green-300 focus:border-custom-green-300 text-custom-text placeholder-custom-grey-300 font-sans w-full"
                  onFocus={() => { if (isMobile) setIsSearchFocused(true); }}
                  onBlur={() => { if (isMobile) setIsSearchFocused(false); }}
                />
              </div>
              <div
                className={`relative w-auto md:w-auto ${isMobile && isSearchFocused ? 'hidden' : ''}`}
                id="community-dropdown-container"
              >
                <div className="flex items-center justify-between md:justify-start">
                  <Button variant="ghost" className="text-custom-grey-300 hover:text-custom-text font-sans">
                    Community
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-custom-grey-300 hover:text-custom-text font-sans p-2 -ml-2"
                    onClick={toggleCommunityDropdown}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>

                <div className={`absolute right-0 mt-2 w-full md:w-48 bg-white border border-custom-grey-100 rounded-md shadow-lg z-50
                                ${isCommunityDropdownOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}
                                transition-all duration-200 ease-in-out transform origin-top-right`}>
                  <Link href="/community/history" className="block px-4 py-2 text-sm text-text-custom hover:bg-[#D8E9E4] font-sans" onClick={() => setIsCommunityDropdownOpen(false)}>History</Link>
                  <Link href="/community/food" className="block px-4 py-2 text-sm text-text-custom hover:bg-[#D8E9E4] font-sans" onClick={() => setIsCommunityDropdownOpen(false)}>Food</Link>
                  <Link href="/community/pets" className="block px-4 py-2 text-sm text-text-custom hover:bg-[#D8E9E4] font-sans" onClick={() => setIsCommunityDropdownOpen(false)}>Pets</Link>
                  <Link href="/community/health" className="block px-4 py-2 text-sm text-text-custom hover:bg-[#D8E9E4] font-sans" onClick={() => setIsCommunityDropdownOpen(false)}>Health</Link>
                  <Link href="/community/fashion" className="block px-4 py-2 text-sm text-text-custom hover:bg-[#D8E9E4] font-sans" onClick={() => setIsCommunityDropdownOpen(false)}>Fashion</Link>
                  <Link href="/community/exercise" className="block px-4 py-2 text-sm text-text-custom hover:bg-[#D8E9E4] font-sans" onClick={() => setIsCommunityDropdownOpen(false)}>Exercise</Link>
                  <Link href="/community/others" className="block px-4 py-2 text-sm text-text-custom hover:bg-[#D8E9E4] font-sans" onClick={() => setIsCommunityDropdownOpen(false)}>Others</Link>
                </div>
              </div>

              <div className={`w-auto md:w-auto flex justify-end md:justify-start ${isMobile && isSearchFocused ? 'hidden' : ''}`}>
                {isLoggedIn ? (
                  <Link href="/create-post" className="w-auto md:w-auto">
                    <Button className="bg-[#49A569] text-white px-4 py-2 rounded-md hover:bg-green-900 font-sans w-full">
                      Create +
                    </Button>
                  </Link>
                ) : (
                  <Link href="/sign-in" className="w-auto md:w-auto">
                    <Button className="bg-[#49A569] text-custom-white px-4 py-2 rounded-md hover:bg-green-900 font-sans w-full">
                      Create +
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Post Cards Section */}
          <div className="w-full flex-grow mt-4 md:mt-0">
            {posts.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden my-0">
                <div className="divide-y divide-custom-grey-100">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-custom-text">ไม่พบโพสต์</p>
            )}
          </div>
        </main>

        {/* Right Sidebar (hidden on mobile) */}
        <div className="hidden md:block md:w-1/5 flex-shrink-0 bg-custom-white">
        </div>
      </div>

      {isLoggedIn && <FloatingCreateButton />}
    </div>
  );
}