// app/sign-in/page.tsx

'use client'; 

import { useState } from 'react';
import Image from 'next/image'; 
import Link from 'next/link'; 
import { Input } from '@/components/ui/input'; 
import { Button } from '@/components/ui/button';

export default function SignInPage() {
  const [username, setUsername] = useState(''); // เปลี่ยนจาก email เป็น username

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign In Attempt:', { username });

    // เปลี่ยนจาก '/auth/login' เป็น '/auth/register'
    // เพื่อให้ทำงานแบบ "ถ้ามี user ก็ login, ถ้าไม่มีก็สร้างแล้ว login"
    fetch('http://localhost:3001/auth/register', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }), 
    })
    .then(async response => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong during sign in/registration.');
      }
      return response.json();
    })
    .then(data => {
      console.log('Login/Register Response:', data);
      // สมมติว่า Backend ส่ง access_token กลับมา
      if (data.access_token) {
        localStorage.setItem('accessToken', data.access_token); // เก็บ token ไว้ใน localStorage
          // คุณอาจจะเปลี่ยนเส้นทางไปหน้าอื่น เช่น router.push('/dashboard');
      } else {
        alert('เกิดข้อผิดพลาด: ไม่ได้รับ Access Token');
      }
    })
    .catch(error => {
      console.error('Login/Register Error:', error);
      alert(`เข้าสู่ระบบไม่สำเร็จ: ${error.message}`);
    });
  };

  return (
    // นี่คือ div หลักสำหรับ Layout: จะเป็น flex-col บนมือถือ และ flex-row บนเดสก์ท็อป
    <div className="flex flex-col md:flex-row min-h-screen bg-[#243831]">
      {/* ======== ส่วนสำหรับ MOBILE เท่านั้น: HEADER (โลโก้ "Aboard" + ข้อความ) ======== */}
      <div className="flex flex-col items-center justify-center p-8 bg-[#2B5F44] 
                      h-[45vh] rounded-bl-[40px] rounded-br-[40px] md:hidden">
        <Image
          src="/aboard-logo.png" 
          alt="a Board Logo"
          width={150} 
          height={120} 
          className="object-contain mb-4" 
        />
        <h1 className="text-white text-2xl italic font-castoro">a Board</h1> 
      </div>

      {/* ======== ส่วนสำหรับ MOBILE เท่านั้น: แบบฟอร์มเข้าสู่ระบบ ======== */}
      <div className="flex flex-col items-center justify-center px-6 bg-[#243831] 
                      h-[55vh] flex-grow md:hidden">
        <div className="bg-none rounded-xl w-full"> 
          <h2 className="text-4xl font-bold text-left text-white mb-8">Sign in</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* กล่อง Input Username สำหรับ Mobile */}
            <div className='bg-white rounded-[10px] mb-3'> 
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 sr-only"> {/* เปลี่ยน htmlFor เป็น username */}
                Username
              </label>
              <Input
                id="username" // เปลี่ยน id เป็น username
                type="text"
                placeholder="Username" 
                value={username} // ใช้ state username
                onChange={(e) => setUsername(e.target.value)} // set state username
                className="w-full px-4 py-4 rounded-lg focus:ring-custom-green-300 focus:border-custom-green-300 text-lg placeholder-custom-grey-300 font-sans" 
              />
            </div>
            {/* ปุ่ม Sign In สำหรับ Mobile */}
            <Button
              type="submit"
              className="w-full bg-[#36A258] text-white py-4 rounded-[10px] hover:bg-green-900 transition-opacity font-sans text-xl mt-4" 
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>

      {/* ======== ส่วนสำหรับ DESKTOP เท่านั้น: ซ้ายมือ (การ์ดเข้าสู่ระบบ) ======== */}
      <div className="hidden md:flex w-[60%] bg-[#243831] items-center justify-center p-4 rounded-tl-[50px] rounded-bl-[50px]">
        <div className="bg-none p-8 rounded-xl w-full max-w-md">
          <h2 className="text-4xl font-bold text-left text-white mb-8">Sign in</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* กล่อง Input Username สำหรับ Desktop */}
            <div className='bg-white rounded-[10px] mb-1'> 
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 sr-only"> {/* เปลี่ยน htmlFor เป็น username */}
                Username
              </label>
              <Input
                id="username" // เปลี่ยน id เป็น username
                type="text"
                placeholder="Username" 
                value={username} // ใช้ state username
                onChange={(e) => setUsername(e.target.value)} // set state username
                className="w-full px-4 py-3 rounded-lg focus:ring-custom-green-300 focus:border-custom-green-300 text-custom-text placeholder-custom-grey-300 font-sans"
              />
            </div>
            {/* ปุ่ม Sign In สำหรับ Desktop */}
            <Button
              type="submit"
              className="w-full bg-[#36A258] text-white py-3 rounded-[10px] hover:bg-green-900 transition-opacity font-sans text-lg mt-6"
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>

      {/* ======== ส่วนสำหรับ DESKTOP เท่านั้น: ขวามือ (โลโก้ "Aboard" + ข้อความ) ======== */}
      <div className="hidden md:flex w-[40%] bg-[#2B5F44] items-center justify-center p-4 rounded-tl-[50px] rounded-bl-[50px] flex-col">
        <Image
          src="/aboard-logo.png" 
          alt="Aboard Logo"
          width={400} 
          height={315} 
          className="object-contain" 
        />
        <div className='text-white text-3xl mt-10 italic font-castoro'>
          a Board
        </div>
      </div>
    </div>
  );
}