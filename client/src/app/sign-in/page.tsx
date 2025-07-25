'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth, axiosInstance } from '@/components/AuthProvider';
import axios from 'axios';

export default function SignInPage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Please enter a username.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/auth/register', { username });
      const data = response.data; 

      console.log('Login/Register Response:', data);

      if (data.accessToken && data.user) {
        login(data.accessToken, data.user); 
        toast.success('เข้าสู่ระบบสำเร็จ!');
        router.push('/');
      } else {
        throw new Error('ไม่ได้รับ Access Token หรือ User Data'); 
      }
    } catch (error) {
        console.error('Login/Register Error:', error);
        let errorMessage = 'เกิดข้อผิดพลาดบางอย่าง';
        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast.error(`เข้าสู่ระบบไม่สำเร็จ: ${errorMessage}`);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#243831]">
      {/* ส่วน Layout สำหรับ Mobile */}
      <div className="flex flex-col md:hidden w-full min-h-screen">
        <div className="flex items-center justify-center bg-[#2B5F44] h-[46vh] p-4 rounded-bl-[50px] rounded-br-[50px]">
          <div className="flex flex-col items-center">
            <Image
              src="/aboard-logo.png"
              alt="Aboard Logo"
              width={150}
              height={150}
              className="object-contain"
            />
            <div className='text-white text-3xl font-bold mt-4'>
              a Board
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center px-6 bg-[#243831] h-[50vh] flex-grow">
          <div className="bg-none rounded-xl w-full max-w-sm">
            <h2 className="text-4xl font-bold text-left text-white mb-8">Sign in</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className='bg-white rounded-[10px] mb-3'>
                <Input
                  id="username-mobile"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-4 rounded-lg focus:ring-custom-green-300 focus:border-custom-green-300 text-lg placeholder-custom-grey-300 font-sans"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#36A258] text-white py-4 rounded-[10px] hover:bg-green-900 transition-opacity font-sans text-xl mt-4 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* ส่วน Layout สำหรับ Desktop */}
      <div className="hidden md:flex w-[60%] bg-[#243831] items-center justify-center p-4">
        <div className="bg-none p-8 rounded-xl w-full max-w-md">
          <h2 className="text-4xl font-bold text-left text-white mb-8">Sign in</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className='bg-white rounded-[10px] mb-1'>
              <Input
                id="username-desktop"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg focus:ring-custom-green-300 focus:border-custom-green-300 text-custom-text placeholder-custom-grey-300 font-sans"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#36A258] text-white py-3 rounded-[10px] hover:bg-green-900 transition-opacity font-sans text-lg mt-6 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>

      {/* ส่วนขวาของ Desktop */}
      <div className="hidden md:flex w-[40%] bg-[#2B5F44] items-center justify-center p-4 rounded-tl-[50px] rounded-bl-[50px] flex-col">
        <div className="flex flex-col items-center">
          <div>
            <Image
              src="/aboard-logo.png"
              alt="Aboard Logo"
              width={300}
              height={300}
              className="object-contain"
            />
          </div>
          <div className='text-white text-3xl font-bold mt-4'>
            a Board
          </div>
        </div>
      </div>
    </div>
  );
}