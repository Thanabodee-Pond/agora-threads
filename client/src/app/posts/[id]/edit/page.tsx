// File: client/src/app/posts/[id]/edit/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react'; // นำเข้า useState
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { EditPostFormSkeleton } from '@/components/ui/edit-post-form-skeleton';

// 1. Schema สำหรับตรวจสอบข้อมูลในฟอร์ม
const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  content: z.string().min(10, { message: 'Content must be at least 10 characters.' }),
  category: z.string().min(3, { message: 'Category must be at least 3 characters.' }).or(z.literal('')), // ทำให้ category เป็น optional string หรือ string ว่าง
});

// 2. Type Definitions
interface Author {
  id: string;
  username: string;
}
interface Post {
  id: string;
  title: string;
  content: string;
  category: string | null; // <-- สำคัญ: กำหนดให้ category เป็น string หรือ null
  author: Author;
  createdAt: string;
}

// 3. Axios Instance และฟังก์ชัน API (อยู่นอก Component)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const fetchPostById = async (id: string): Promise<Post> => {
  if (!id) throw new Error("Post ID is required for fetching.");
  const url = `/posts/${id}`;
  console.log('API Call: Fetching post from URL:', url);
  try {
    const { data } = await axiosInstance.get(url);
    console.log('API Call: Post fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('API Call Error: Failed to fetch post from URL:', url, error);
    throw error;
  }
};

const updatePost = async ({ postId, values, token }: { postId: string; values: z.infer<typeof formSchema>; token: string }) => {
  const url = `/posts/${postId}`;
  console.log('API Call: Updating post to URL:', url);
  try {
    const { data } = await axiosInstance.put(url, values, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('API Call: Post updated successfully:', data);
    return data;
  } catch (error) {
    console.error('API Call Error: Failed to update post to URL:', url, error);
    throw error;
  }
};

interface EditPostPageProps {
  params: { id: string };
}

// 4. Main Component
export default function EditPostPage({ params }: EditPostPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status: sessionStatus } = useSession();

  const [resolvedPostId, setResolvedPostId] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      setResolvedPostId(params.id);
    }
  }, [params.id]);

  // ดึงข้อมูลโพสต์เดิมด้วย useQuery
  const {
    data: postData,
    isLoading: isPostLoading,
    error: postError,
  } = useQuery<Post, Error>({
    queryKey: ['post', resolvedPostId],
    queryFn: () => fetchPostById(resolvedPostId as string),
    enabled: !!resolvedPostId && sessionStatus === 'authenticated',
  });

  // ตั้งค่า React Hook Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      category: '',
    },
  });

  // จัดการ Side Effects: Redirect, Toast, Set Form Values
  useEffect(() => {
    if (!resolvedPostId) return;

    if (sessionStatus === 'unauthenticated') {
      console.log('useEffect: Redirecting unauthenticated user.');
      toast.error("Please sign in to edit posts.");
      router.push('/sign-in');
      return;
    }

    if (postError && !isPostLoading) {
      console.error('useEffect: Post data error, redirecting to home.', postError);
      if (axios.isAxiosError(postError) && (postError.response?.status === 404 || postError.response?.status === 403)) {
          toast.error("Post not found or you don't have permission to view it.");
          router.push('/');
      } else {
          toast.error("Error loading post details. Please try again.");
          router.push('/');
      }
      return;
    }
    
    if (postData && sessionStatus === 'authenticated' && !isPostLoading) {
      if (postData.author.username !== session?.user?.name) {
        console.log('useEffect: Authorization Check failed, redirecting.');
        toast.error("You are not authorized to edit this post.");
        router.push(`/posts/${resolvedPostId}`);
        return;
      }
      console.log('useEffect: Setting form values:', postData);
      form.reset({
        title: postData.title || '',    // <-- แก้ไข: เพิ่ม || ''
        content: postData.content || '', // <-- แก้ไข: เพิ่ม || ''
        category: postData.category || '', // <-- แก้ไข: เพิ่ม || '' ตรงนี้สำคัญมาก
      });
    }
  }, [sessionStatus, postData, postError, form, router, resolvedPostId, session?.user?.name, isPostLoading]);

  // useMutation สำหรับการอัปเดต
  const mutation = useMutation({
    mutationFn: updatePost,
    onSuccess: (data) => {
      toast.success("Post updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['post', resolvedPostId] });
      queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      router.push(`/posts/${resolvedPostId}`);
      console.log('Mutation Success:', data);
    },
    onError: (error) => {
      console.error("Mutation Error: Failed to update post.", error);
      toast.error(`Failed to update post: ${axios.isAxiosError(error) ? error.response?.data?.message || error.message : error.message}`);
    },
  });

  // ฟังก์ชันที่ถูกเรียกเมื่อกดปุ่ม Submit
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Form submitted with values:', values);
    if (!resolvedPostId) {
        toast.error("Post ID is missing for update.");
        return;
    }
    if (session?.accessToken) {
      mutation.mutate({ postId: resolvedPostId, values, token: session.accessToken as string });
    } else {
      toast.error("Authentication token not found. Please sign in again.");
    }
  }

  // จัดการสถานะการโหลด/แสดง Skeleton
  if (!resolvedPostId || sessionStatus === 'loading' || isPostLoading) {
    console.log('Render: Displaying Skeleton for loading session/post/resolvedPostId.');
    return <EditPostFormSkeleton />;
  }

  if (!postData && !postError) {
      console.log('Render: postData not available, showing skeleton or fallback.');
      return <EditPostFormSkeleton />;
  }

  console.log('Render: Displaying Edit Form for post:', postData?.title);
  return (
    <div className="min-h-screen bg-custom-grey-100">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">แก้ไขโพสต์</CardTitle>
            <CardDescription>ทำการเปลี่ยนแปลงโพสต์ของคุณด้านล่าง</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>หัวข้อ</FormLabel>
                      <FormControl>
                        <Input placeholder="หัวข้อโพสต์ที่น่าสนใจของคุณ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>หมวดหมู่</FormLabel>
                      <FormControl>
                        <Input placeholder="เช่น: ประวัติศาสตร์, สัตว์เลี้ยง, การออกกำลังกาย" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เนื้อหา</FormLabel>
                      <FormControl>
                        <Textarea placeholder="เขียนโพสต์ที่ยอดเยี่ยมของคุณที่นี่..." className="min-h-[200px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 mt-6">
                  <Button type="button" variant="outline" onClick={() => router.back()}>ยกเลิก</Button>
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    บันทึกการเปลี่ยนแปลง
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}