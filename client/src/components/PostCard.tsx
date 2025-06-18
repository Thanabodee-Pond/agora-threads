'use client';

import Link from 'next/link';
import { MessageCircle, Bookmark, Edit, Trash2 } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';
import { useState } from 'react';
import { getUserAvatar } from '@/lib/utils';
import { useAuth, axiosInstance } from '@/components/AuthProvider';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditPostForm } from '@/components/EditPostForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent as AlertDialogContentComponent,
  AlertDialogDescription as AlertDialogDescriptionComponent,
  AlertDialogFooter,
  AlertDialogHeader as AlertDialogHeaderComponent,
  AlertDialogTitle as AlertDialogTitleComponent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Post } from '@/types';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const { isLoggedIn, user, accessToken } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const isAuthor = isLoggedIn && user && (post.author.id === user.id);
  moment.locale('en');

  const formatDate = (dateString: string) => {
    return moment(dateString).format('DD MMMM HH:mm');
  };

  const commentCount = post.comments ? post.comments.length : 0;

  const handleDeletePost = async () => {
    if (!accessToken) { toast.error("Please sign in to delete posts."); return; }
    try {
      await axiosInstance.delete(`/posts/${post.id}`);
      toast.success("Post deleted successfully!");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete post:", error);
      let errorMessage = 'An error occurred while deleting the post.';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(`Failed to delete post: ${errorMessage}`);
    }
  };

  return (
    <div className="bg-custom-white overflow-hidden relative">

      {isAuthor && (
        <div className="absolute top-4 right-4 flex items-center space-x-1 z-10">
          {isDesktop ? (
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogTrigger asChild>
                <button aria-label="Edit post" className="p-2 rounded-full hover:bg-gray-200/70 focus:outline-none focus:ring-offset-2 group">
                  <Edit className="w-5 h-5 text-[#2B5F44] transition-colors group-hover:text-green-600" />
                </button>
              </DialogTrigger>
              <DialogContent className="w-[100vw] md:w-auto md:max-w-2xl p-0 sm:rounded-lg text-white border-none -mx-5">
                 <DialogHeader className="border-none">
                   <DialogTitle className=""></DialogTitle>
                 </DialogHeader>
                 <div className="p-0">
                   <EditPostForm post={post} onFinished={() => setIsEditModalOpen(false)} />
                 </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Link href={`/posts/${post.id}/edit`} passHref>
               <div className="p-2 rounded-full hover:bg-gray-200/70">
                  <Edit className="w-5 h-5 text-[#2B5F44]" />
               </div>
            </Link>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button aria-label="Delete post" className="p-2 rounded-full hover:bg-gray-200/70 focus:outline-none ">
                <Trash2 className="w-5 h-5 text-[#2B5F44] transition-colors" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContentComponent className='flex flex-col items-center w-96 h-60 justify-center'>
              <AlertDialogHeaderComponent className="text-center">
                <AlertDialogTitleComponent className="justify-cente text-center">
                  Please confirm if you wish to <br/> delete the post
                </AlertDialogTitleComponent>
                <AlertDialogDescriptionComponent className='text-center'>
                  Are you sure you want to delete the post? <br/> Once deleted, it cannot be recovered.
                </AlertDialogDescriptionComponent>
              </AlertDialogHeaderComponent>
              <AlertDialogFooter className="justify-center mt-3">
                <AlertDialogCancel className='w-40'>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeletePost} className='bg-[#F23536] w-40'>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContentComponent>
          </AlertDialog>
        </div>
      )}

      <Link href={`/posts/${post.id}`} className="block p-6">
        <div className="flex items-center mb-3 rounded-b-none">
          {getUserAvatar(post.author, 'md')}
          <div className="flex flex-col">
            <span className="font-semibold text-custom-text text-lg font-sans">
              {post.author.username}
            </span>
          </div>
        </div>
        {post.category && (
          <span className="inline-block bg-[#F3F3F3] text-gray-500 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
            {post.category}
          </span>
        )}
        <h2 className="text-2xl font-bold text-custom-text mb-2 font-sans leading-tight">
          {post.title}
        </h2>
        <p className="text-custom-text text-base mb-4 font-sans line-clamp-3">
          {post.content}
        </p>
        <div className="flex justify-between items-center text-custom-grey-300 text-sm font-sans">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              {commentCount} Comments
            </span>
            <span>{formatDate(post.createdAt)}</span>
          </div>
          <Bookmark className="w-5 h-5 cursor-pointer hover:text-custom-golden transition-colors" />
        </div>
      </Link>
    </div>
  );
}