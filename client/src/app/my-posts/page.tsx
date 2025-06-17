'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

interface Post {
  id: number;
  title: string;
  createdAt: string;
}

const fetchMyPosts = async (token: string): Promise<Post[]> => {
  const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/my-posts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const deletePost = async ({ postId, token }: { postId: number; token: string }) => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`; 
  console.log('API Call: Attempting to DELETE post from URL:', url); 
  await axios.delete(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default function MyPostsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ['my-posts', session?.user?.id],
    queryFn: () => fetchMyPosts(session?.accessToken as string),
    enabled: status === 'authenticated',
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      toast.success("Post deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      setPostToDelete(null);
    },
    onError: (err) => { 
      console.error("Failed to delete post:", err); 
      toast.error("Failed to delete post.");
      setPostToDelete(null);
    }
  });

  const confirmDelete = () => {
    if (postToDelete !== null && session?.accessToken) {
      deleteMutation.mutate({ postId: postToDelete, token: session.accessToken });
    }
  };


  if (status === 'loading') return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (status === 'unauthenticated') { router.push('/sign-in'); return null; }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex w-full max-w-2xl mx-auto justify-between items-center my-6 md:my-8">
        <h1 className="text-3xl md:text-4xl font-bold mx-auto">My Posts</h1>
      </div>
      <div className="space-y-4">
        {isLoading && <p className="text-center">Loading your posts...</p>}
        {error && <p className="text-center text-red-500">Failed to load posts.</p>}

        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post.id} className="w-full max-w-2xl mx-auto">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <Link href={`/posts/${post.id}`} className="font-semibold text-lg hover:underline flex-1 truncate pr-4">
                      {post.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">
                    Created on {format(new Date(post.createdAt), 'PPP')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/posts/${post.id}/edit`}>
                    <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                  </Link>
                  <Button variant="destructive" size="icon" onClick={() => setPostToDelete(post.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          !isLoading && <p className="text-center text-gray-600">You haven't created any posts yet.</p>
        )}
      </div>

      <AlertDialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post
              and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}