// client/app/create-post/page.tsx
'use client';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth, axiosInstance } from '@/components/AuthProvider';

export default function CreatePostPage() {
  const router = useRouter();
  const { isLoggedIn, accessToken } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');

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
    if (!title.trim() || !content.trim() || !category.trim()) {
      toast.error("All fields (Title, Category, Content) are required.");
      return;
    }

    try {
      // ส่ง request สร้างโพสต์ใหม่
      const response = await axiosInstance.post('/posts', {
        title,
        content,
        category,
      }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast.success("Post created successfully!", {
        className: "bg-custom-success text-custom-white",
      });
      
      // *** เปลี่ยนบรรทัดนี้ ***
      router.push('/'); // ไปยังหน้าแรก
      // ถ้าอยากล้างฟอร์มหลังจากสร้างเสร็จ ก็สามารถเพิ่มบรรทัดนี้ได้
      // setTitle('');
      // setContent('');
      // setCategory('');

    } catch (err: any) {
      toast.error(`Failed to create post: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-custom-grey-100">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-custom-white border border-custom-grey-100 rounded-lg shadow-sm p-6 my-8">
          <h2 className="text-2xl font-bold font-sans text-custom-text mb-6">Create New Post</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-custom-text font-semibold font-sans mb-2">Title</label>
              <Input
                id="title"
                type="text"
                placeholder="Enter post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-custom-grey-100 text-custom-text placeholder-custom-grey-300 focus:ring-custom-green-300 focus:border-custom-green-300 rounded-md p-2 font-sans"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="category" className="block text-custom-text font-semibold font-sans mb-2">Category</label>
              <Input
                id="category"
                type="text"
                placeholder="e.g., History, Pets, Exercise"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-custom-grey-100 text-custom-text placeholder-custom-grey-300 focus:ring-custom-green-300 focus:border-custom-green-300 rounded-md p-2 font-sans"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="content" className="block text-custom-text font-semibold font-sans mb-2">Content</label>
              <Textarea
                id="content"
                placeholder="Write your post here..."
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border border-custom-grey-100 text-custom-text placeholder-custom-grey-300 focus:ring-custom-green-300 focus:border-custom-green-300 rounded-md p-2 font-sans"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button type="button" onClick={handleCancel} className="border border-custom-grey-100 text-custom-text px-4 py-2 rounded-md hover:bg-custom-grey-100 font-sans">
                Cancel
              </Button>
              <Button type="submit" className="bg-custom-green-300 text-custom-white px-4 py-2 rounded-md hover:opacity-90 font-sans">
                Post
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}