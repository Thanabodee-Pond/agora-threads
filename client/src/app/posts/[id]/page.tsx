// File: client/src/app/posts/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { toast } from "sonner";

// Type Definitions
interface Author {
  username: string;
}
interface Comment {
  id: number;
  content: string;
  author: Author;
  createdAt: string;
}
interface Post {
  id: number;
  title: string;
  content: string;
  author: Author;
  createdAt: string;
  comments: Comment[];
}

// ฟังก์ชันสำหรับดึงข้อมูลโพสต์เดียว (เวอร์ชันที่ถูกต้อง)
const fetchPost = async (id: string): Promise<Post> => {
  const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`);
  return data;
};

// ฟังก์ชันสำหรับสร้างคอมเมนต์ใหม่
const createComment = async ({ postId, content, token }: { postId: number; content: string; token: string }) => {
  const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/comments`, { postId, content }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export default function PostDetailsPage() {
  const params = useParams();
  const postId = params.id as string;
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [comment, setComment] = useState('');

  const { data: post, isLoading, error } = useQuery<Post>({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
    enabled: !!postId,
  });

  const mutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      toast.success("Comment posted successfully!");
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      setComment('');
    },
    onError: (err) => {
      console.error("Failed to create comment:", err);
      toast.error("Failed to post comment. Please try again.");
    }
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim() && session?.accessToken) {
      mutation.mutate({
        postId: parseInt(postId),
        content: comment,
        token: session.accessToken as string,
      });
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="text-red-500 text-center mt-10">Error loading post. Please check the console.</div>;
  if (!post) return <div className="text-center mt-10">Post not found.</div>;

  return (
    <div className="container mx-auto max-w-3xl p-4 md:p-8 space-y-8">
      {/* ส่วนแสดงเนื้อหาโพสต์ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{post.title}</CardTitle>
          <div className="flex items-center gap-3 pt-4">
            <Avatar>
              <AvatarFallback>{post.author.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post.author.username}</p>
              <p className="text-xs text-gray-500">
                Posted on {format(new Date(post.createdAt), 'PPP')}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-lg leading-relaxed whitespace-pre-wrap border-t pt-6 mt-4">
          {post.content}
        </CardContent>
      </Card>

      {/* ส่วนสร้างคอมเมนต์ */}
      <Card>
        <CardHeader>
          <CardTitle>Add a Comment</CardTitle>
        </CardHeader>
        <CardContent>
          {session ? (
            <form onSubmit={handleAddComment} className="space-y-4">
              <Textarea
                placeholder="What are your thoughts?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                disabled={mutation.isPending}
              />
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post Comment
              </Button>
            </form>
          ) : (
            <p>Please <Link href="/sign-in" className="font-bold underline text-green-600">Sign In</Link> to leave a comment.</p>
          )}
        </CardContent>
      </Card>

      {/* ส่วนแสดงคอมเมนต์ทั้งหมด */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Comments ({post.comments.length})</h2>
        {post.comments.length > 0 ? (
            post.comments.map((c) => (
                <Card key={c.id} className="p-4 shadow-sm bg-white">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{c.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{c.author.username}</p>
                      <p className="text-xs text-gray-500">{format(new Date(c.createdAt), 'PPP p')}</p>
                    </div>
                  </div>
                  <p className="pt-3 pl-11">{c.content}</p>
                </Card>
            ))
        ) : (
            <p className="text-center text-gray-500 py-4">No comments yet.</p>
        )}
      </div>
    </div>
  );
}