// File: client/app/create-post/page.tsx

'use client';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth, axiosInstance } from '@/components/AuthProvider';

// เพิ่ม component Card และ Icon ที่จำเป็น
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, X as CloseIcon } from 'lucide-react'; // นำเข้า X เป็น CloseIcon

export default function CreatePostPage() {
  const router = useRouter();
  const { isLoggedIn, accessToken } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string | null>(null); // เปลี่ยนเป็น null ได้
  const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false); // State สำหรับ Dropdown

  // รายการหมวดหมู่
  const categories = [
    'History', 'Food', 'Pets', 'Health', 'Fashion', 'Exercise', 'Others'
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-custom-grey-100 flex flex-col items-center justify-center p-4">
        <p className="text-custom-text text-lg text-center mb-4">Please sign in to create a post.</p>
        <Button onClick={() => router.push('/sign-in')} className="bg-custom-green-300 text-custom-white px-6 py-3 rounded-md hover:opacity-90 font-sans text-base">
          Go to Sign In
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter content.");
      return;
    }
    if (category === null) { // category ตอนนี้เป็น null ถ้ายังไม่ได้เลือก
        toast.error("Please choose a community.");
        return;
    }

    try {
      const postData = {
        title,
        content,
        category: category, // category ตอนนี้เป็น string หรือ null อยู่แล้ว
      };

      const response = await axiosInstance.post('/posts', postData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      toast.success("Post created successfully!");
      
      router.push('/');

    } catch (err: any) {
      console.error('Failed to create post:', err);
      toast.error(`Failed to create post: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const toggleCommunityDropdown = () => {
    setIsCommunityDropdownOpen(prev => !prev);
  };

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setIsCommunityDropdownOpen(false); // ปิด dropdown หลังจากเลือก
  };

  return (
    <div className="min-h-screen bg-custom-grey-100 flex flex-col">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex items-center justify-center"> {/* จัดให้อยู่กลางจอ */}
        {/* Card ที่ครอบ Form */}
        <Card className="w-full max-w-2xl bg-white rounded-lg shadow-lg"> {/* ใช้ shadow-lg แทน shadow-sm */}
          <CardHeader className="relative border-gray-200 p-6 flex flex-row items-center justify-between -mb-15">
            <CardTitle className="text-2xl font-bold text-gray-800">Create Post</CardTitle>
            <Button
              variant="ghost text-white"
              size="icon"
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={handleCancel} // ปุ่ม X สำหรับปิด
            >
              <CloseIcon className="h-6 w-6 text-white" />
            </Button>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6"> {/* เพิ่ม space-y-6 เพื่อระยะห่าง */}
              {/* Community Dropdown */}
              <div className="relative w-full max-w-[200px] mb-4"> {/* ปรับ max-w ให้เล็กลง */}
                <Button
                  type="button" // ต้องเป็น type="button" เพื่อไม่ให้ trigger submit
                  variant="outline" // ใช้ outline ตามรูป
                  className="w-full justify-between mt-5 pr-3 py-2 text-base text-[#49A569] border border-[#49A569] rounded-md shadow-sm bg-white hover:text-green-900"
                  onClick={toggleCommunityDropdown}
                >
                  <span className="truncate">
                    {category || "Choose a community"} {/* แสดง category ที่เลือก หรือข้อความ default */}
                  </span>
                  <ChevronDown className="w-full -ml-40" />
                </Button>

                {isCommunityDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {categories.map((cat) => (
                      <div
                        key={cat}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleCategorySelect(cat)}
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div>
                <Input
                  id="post-title"
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-base placeholder-gray-500" // ปรับ padding
                />
              </div>

              {/* Content Textarea */}
              <div>
                <Textarea
                  id="post-content"
                  placeholder="What's on your mind..."
                  rows={8} // ปรับจำนวนแถว
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 border -mt-1 border-gray-300 rounded-md text-base placeholder-gray-500 min-h-[120px]" // ปรับ padding และ min-height
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-8"> {/* เพิ่ม mt-8 เพื่อระยะห่าง */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="bg-white text-[#49A569] border-[#49A569] hover:bg-gray-100 px-6 py-2 rounded-md font-medium shadow-sm" // ปรับ style ตามรูป
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#36A258] text-white hover:bg-[#2B8B4C] px-6 py-2 rounded-md font-medium shadow-sm" // ปรับ style ตามรูป
                >
                  Post
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}