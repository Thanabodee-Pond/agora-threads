// File: client/src/app/posts/[id]/edit/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
// import { format } from 'date-fns'; // ไม่ได้ใช้ในหน้านี้แล้ว สามารถลบได้
import { EditPostFormSkeleton } from '@/components/ui/edit-post-form-skeleton';

// Schema สำหรับตรวจสอบข้อมูลในฟอร์ม
const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
});

// Type Definitions
interface Author {
  username: string;
}
interface Post {
  id: number;
  title: string;
  content: string;
  author: Author;
  createdAt: string;
}

// ฟังก์ชันสำหรับดึงข้อมูลโพสต์เดียว
const fetchPost = async (id: string): Promise<Post> => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`;
  console.log('API Call: Fetching post from URL:', url);
  try {
    const { data } = await axios.get(url);
    console.log('API Call: Post fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('API Call Error: Failed to fetch post from URL:', url, error);
    throw error;
  }
};

// ฟังก์ชันสำหรับอัปเดตโพสต์
const updatePost = async ({ postId, values, token }: { postId: string; values: z.infer<typeof formSchema>; token: string }) => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`;
  console.log('API Call: Updating post to URL:', url);
  try {
    const { data } = await axios.patch(url, values, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('API Call: Post updated successfully:', data);
    return data;
  } catch (error) {
    console.error('API Call Error: Failed to update post to URL:', url, error);
    throw error;
  }
};

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();

  // 1. ดึงข้อมูลโพสต์เดิม
  const {
    data: postData,
    isLoading: isPostLoading,
    error: postError,
  } = useQuery<Post, Error>({ // ระบุ generic type ของ error ด้วย
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
    enabled: !!postId && sessionStatus === 'authenticated',
  });

  // 2. ตั้งค่า React Hook Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  // 3. จัดการ Redirect และ Toast ใน useEffect (Side Effects)
  // และจัดการการ set form values
  useEffect(() => {
    // Redirect ถ้าไม่อยู่ในสถานะ authenticated
    if (sessionStatus === 'unauthenticated') {
      console.log('useEffect: Redirecting unauthenticated user.');
      toast.error("Please sign in to edit posts.");
      router.push('/sign-in');
      return;
    }

    // Redirect ถ้า postData ไม่พบหรือมี error (และไม่ใช่สถานะ loading)
    // ตรวจสอบ postError หลังจาก sessionStatus ไม่ใช่ 'unauthenticated'
    if (postError) {
      console.error('useEffect: Post data error, redirecting to home.', postError);
      // ในกรณีที่ error เป็น 404 (Not Found) หรือ 403 (Forbidden)
      if (axios.isAxiosError(postError) && (postError.response?.status === 404 || postError.response?.status === 403)) {
          toast.error("Post not found or you don't have permission to view it.");
          router.push('/'); // หรือไปหน้า my-posts
      } else {
          toast.error("Error loading post details. Please try again.");
      }
      router.push('/'); // redirect ไปหน้าหลักหรือหน้า my-posts
      return;
    }

    // ถ้า postData มีค่าและไม่ใช่สถานะ loading (เพื่อให้แน่ใจว่าโหลดเสร็จแล้ว)
    // และ user session เป็น authenticated แล้ว
    if (postData && sessionStatus === 'authenticated' && !isPostLoading) {
      // ตรวจสอบสิทธิ์ผู้ใช้
      if (postData.author.username !== session?.user?.name) {
        console.log('useEffect: Authorization Check failed, redirecting.');
        toast.error("You are not authorized to edit this post.");
        router.push(`/posts/${postId}`);
        return;
      }
      // ถ้ามีสิทธิ์ ให้อัปเดตฟอร์ม
      console.log('useEffect: Setting form values:', postData);
      form.reset({
        title: postData.title,
        content: postData.content,
      });
    }

  }, [sessionStatus, postData, postError, form, router, postId, session?.user?.name, isPostLoading]); // เพิ่ม isPostLoading ใน dependency

  // 4. useMutation สำหรับการอัปเดต
  const mutation = useMutation({
    mutationFn: updatePost,
    onSuccess: (data) => {
      toast.success("Post updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      router.push(`/posts/${postId}`);
      console.log('Mutation Success:', data);
    },
    onError: (error) => {
      console.error("Mutation Error: Failed to update post.", error);
      toast.error("Failed to update post.");
    },
  });

  // 5. ฟังก์ชันที่ถูกเรียกเมื่อกดปุ่ม Submit
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Form submitted with values:', values);
    if (session?.accessToken) {
      mutation.mutate({ postId, values, token: session.accessToken as string });
    } else {
      toast.error("Authentication token not found. Please sign in again.");
    }
  }

  // 6. จัดการสถานะการโหลด/แสดง Skeleton (Render Logic)
  // ส่วนนี้ควรเป็น PURE FUNCTION ที่ไม่มี Side Effects
  if (sessionStatus === 'loading' || isPostLoading) {
    console.log('Render: Displaying Skeleton for loading session/post.');
    return <EditPostFormSkeleton />;
  }

  // ถ้า postError มีค่า, useEffect ควรจะ redirect ไปแล้ว
  // แต่ถ้าบางกรณีที่ useEffect ยังไม่ทำงาน, หรือ postData ไม่มีค่า
  // เรายังคงแสดง Skeleton เพื่อป้องกัน UI ว่างเปล่า
  if (!postData && !postError) { // ถ้ายังไม่มี postData และไม่มี error ที่ทำให้ redirect ไปแล้ว
      console.log('Render: postData not available, showing skeleton.');
      return <EditPostFormSkeleton />;
  }


  console.log('Render: Displaying Edit Form for post:', postData?.title);
  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Edit Post</CardTitle>
          <CardDescription>Make changes to your post below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Your engaging post title" {...field} />
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
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Write your amazing post here..." className="min-h-[200px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Post
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}