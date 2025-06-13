// File: client/src/app/page.tsx
'use client';
import PostCard from '@/components/PostCard';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  content: string;
  author: { username: string; };
  createdAt: string;
  comments: unknown[];
}

const fetchPosts = async (): Promise<Post[]> => {
  const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts`);
  return data;
};

export default function HomePage() {
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });

  if (isLoading) return <div className="flex justify-center items-center h-[calc(100vh-4rem)]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="text-red-500 text-center mt-10">Error fetching posts. Please ensure the backend server is running.</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center my-6 md:my-8">Latest Posts</h1>
      <div className="space-y-6">
        {posts && posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <p className="text-center text-gray-600">No posts found.</p>
        )}
      </div>
    </div>
  );
}
