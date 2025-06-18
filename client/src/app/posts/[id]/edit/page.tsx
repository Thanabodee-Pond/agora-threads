
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import LeftSidebar from '@/components/LeftSidebar';
import { EditPostForm } from '@/components/EditPostForm';
import { EditPostFormSkeleton } from '@/components/ui/edit-post-form-skeleton';
import { useAuth, axiosInstance } from '@/components/AuthProvider';
import type { Post } from '@/types'; 

const fetchPostById = async (id: string): Promise<Post> => { 
  if (!id) throw new Error("Post ID is required for fetching.");
  const { data } = await axiosInstance.get(`/posts/${id}`);
  return data;
};

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { isLoggedIn } = useAuth();

  const {
    data: postData,
    isLoading: isPostLoading,
    error: postError,
  } = useQuery<Post, Error>({
    queryKey: ['post', postId],
    queryFn: () => fetchPostById(postId),
    enabled: !!postId && isLoggedIn,
  });

  if (isPostLoading) {
    return <EditPostFormSkeleton />;
  }

  if (postError || !postData) {
    return <div>Error loading post or post not found.</div>;
  }

  return (
    <div className="min-h-screen bg-white md:bg-[#BBC2C0] flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row container mx-auto md:px-4">
        
        <div className="hidden md:block md:w-[220px] flex-shrink-0 bg-white">
          <LeftSidebar />
        </div>

        <main className="flex-grow w-full md:w-3/5 md:ml-10 mt-20 flex justify-center items-start md:pt-4">
          
          <EditPostForm 
            post={postData} 
            onFinished={() => router.push(`/posts/${postData.id}`)} 
          />

        </main>
        
        <div className="hidden md:block md:w-[220px] flex-shrink-0"></div>
      </div>
    </div>
  );
}