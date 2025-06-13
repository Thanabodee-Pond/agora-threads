// File: client/src/app/create-post/page.tsx
'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const createPost = async ({ title, content, token }: { title: string; content: string; token: string }) => {
  const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/posts`, { title, content }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export default function CreatePostPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      // เมื่อสร้างโพสต์สำเร็จ ให้ล้าง cache ของหน้าแรกเพื่อให้ข้อมูลอัปเดต
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // จากนั้นไปที่หน้ารายละเอียดของโพสต์นั้น
      router.push(`/posts/${data.id}`);
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      alert("Failed to create post.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (session?.accessToken) {
      mutation.mutate({ title, content, token: session.accessToken as string });
    }
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  // ถ้ายังไม่ล็อกอิน ให้ redirect ไปหน้า sign-in
  if (status === 'unauthenticated') {
    router.push('/sign-in');
    return null; // ไม่ต้อง render อะไรระหว่างรอ redirect
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Create a New Post</CardTitle>
          <CardDescription>Share your thoughts with the community.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your post title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your amazing post here..."
                rows={10}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Post
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}