'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import moment from 'moment';

import Header from '@/components/Header';
import LeftSidebar from '@/components/LeftSidebar';
import { Button } from '@/components/ui/button';
import { Loader2, MessageCircle, Bookmark, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CommentSidebar from '@/components/CommentSidebar'; 
import { useAuth, axiosInstance } from '@/components/AuthProvider' 
import { User } from 'lucide-react';

interface Author {
  id: number;
  username: string;
  avatarUrl?: string | null;
}

interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  createdAt: string;
  author: {
    username: string;
    avatarUrl?: string | null;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  category?: string | null;
  author: Author;
  createdAt: string;
  comments: Comment[];
}

const fetchPostById = async (id: string): Promise<Post> => {
  if (!id) throw new Error("Post ID is required for fetching.");
  const { data } = await axiosInstance.get(`/posts/${id}`);
  return data;
};

const addComment = async ({ postId, content, token }: { postId: string; content: string; token: string }) => {
  console.log("Sending comment with token:", token);
  const { data } = await axiosInstance.post(`/comments`, { postId: parseInt(postId), content }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export default function PostDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const queryClient = useQueryClient();
  const { isLoggedIn, accessToken, user } = useAuth();
  const [newCommentContent, setNewCommentContent] = useState('');
  const [isCommentInputVisible, setIsCommentInputVisible] = useState(false);
  const [isMobileCommentModalOpen, setIsMobileCommentModalOpen] = useState(false); 
  const [isMobile, setIsMobile] = useState(false); 

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); 
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []); 

  useEffect(() => {
    if (isCommentInputVisible && isMobile) {
      setIsMobileCommentModalOpen(true); 
    } else if (!isCommentInputVisible) {
      setIsMobileCommentModalOpen(false);
    }
  }, [isCommentInputVisible, isMobile]);


  const {
    data: postData,
    isLoading: isPostLoading,
    error: postError,
  } = useQuery<Post, Error>({
    queryKey: ['post', postId],
    queryFn: () => fetchPostById(postId),
    enabled: !!postId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  const addCommentMutation = useMutation({
    mutationFn: addComment,
    onSuccess: (newComment) => {
      console.log("Comment success:", newComment);
      toast.success("Comment added successfully!");
      setNewCommentContent('');
      setIsCommentInputVisible(false);
      queryClient.setQueryData<Post>(['post', postId], (oldPost) => {
        if (!oldPost) return oldPost;
        const commentWithAuthor: Comment = {
          ...newComment,
          author: {
            id: user?.id || newComment.authorId,
            username: user?.username || 'Anonymous', 
            avatarUrl: user?.avatarUrl || null, 
          },
        };
        return {
          ...oldPost,
          comments: [...oldPost.comments, commentWithAuthor],
        };
      });
    },
    onError: (error) => {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message : error.message;
      console.error("Comment error:", error.response?.data || error.message);
      toast.error(`Failed to add comment: ${errorMessage}`);
    },
  });

  if (isPostLoading) {
    return (
      <div className="min-h-screen bg-white md:bg-[#BBC2C0] flex flex-col">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <Loader2 className="h-10 w-10 animate-spin text-custom-text" />
          <p className="ml-2 text-custom-text">Loading post details...</p>
        </div>
      </div>
    );
  }

  if (postError) {
    toast.error("Error loading post or post not found.");
    return (
      <div className="min-h-screen bg-white md:bg-[#BBC2C0] flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col justify-center items-center p-4">
          <p className="text-red-500 text-lg mb-4">Error: {postError.message}</p>
          <Link href="/">
            <Button className="bg-[#49A569] text-white hover:bg-green-700">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="min-h-screen bg-white md:bg-[#BBC2C0] flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col justify-center items-center p-4">
          <p className="text-custom-text text-lg mb-4">Post not found.</p>
          <Link href="/">
            <Button className="bg-[#49A569] text-white hover:bg-green-700">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatTimeAgo = (dateString: string) => {
    return moment(dateString).fromNow();
  };

const getUserAvatar = (user: { username: string; avatarUrl?: string | null }, size: 'sm' | 'md' = 'sm') => {
  const sizeClass = size === 'sm' ? 'w-7 h-7' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 16 : 24;

  if (user && user.username === 'pond') {
    return (
      <img
        src="/pond_avatar2.png" 
        alt={user.username}
        className={`${sizeClass} mr-2`}
      />
    );
  } 
  else if (user && user.avatarUrl && user.avatarUrl.trim() !== '') {
    return (
      <img
        src={user.avatarUrl}
        alt={user.username}
        className={`${sizeClass} rounded-full mr-2 object-cover border border-custom-grey-100`}
      />
    );
  } 
  else {
    return (
      <div 
        className={`${sizeClass} rounded-full mr-2 bg-gray-200 flex items-center justify-center border border-custom-grey-100`}
      >
        <User size={iconSize} className="text-gray-500" />
      </div>
    );
  }
};

  const handlePostComment = () => {
    if (newCommentContent.trim() === '') {
      toast.error("Comment cannot be empty.");
      return;
    }
    if (!accessToken) {
      toast.error("Authentication token not found. Please log in again.");
      return;
    }
    const postIdNum = parseInt(postId, 10);
    if (isNaN(postIdNum)) {
        toast.error("Invalid Post ID for comment.");
        return;
    }
    
    console.log("Attempting to post comment with token:", accessToken);
    addCommentMutation.mutate({
      postId: postIdNum.toString(),
      content: newCommentContent,
      token: accessToken,
    });
  };

return (
  <div className="min-h-screen bg-white md:bg-[#BBC2C0] flex flex-col">
    <Header />
    <div className="flex-grow flex flex-col md:flex-row md:pl-8 md:pr-0">
      <div className="hidden md:block md:w-[220px] flex-shrink-0 bg-custom-white">
        <LeftSidebar />
      </div>

      <div className={`flex-grow flex w-full md:ml-30
                      ${isMobileCommentModalOpen ? 'bg-[#939494]' : 'bg-white'}`}> 
        
        <main className={`flex-grow flex flex-col p-4 md:p-8 
                           w-full
                           md:ml-15 /* Desktop: add left margin */
                           ${isMobileCommentModalOpen ? 'bg-[#939494]' : 'bg-white'}`}> 
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-custom-text hover:text-custom-green-500 hover:bg-transparent group px-0"
            >
              <div className="
                w-8 h-8 rounded-full flex items-center justify-center
                bg-[#D8E9E4] group-hover:bg-[#49A569]
                transition-colors duration-200 mt-10
              ">
                <ArrowLeft className="w-5 h-5 text-[#49A569] group-hover:text-white" />
              </div>
            </Button>
          </div>

          <div className="mb-4">
            <div className="flex items-center mb-3 mt-4">
              {getUserAvatar(postData.author, 'md')}
              <div className="flex items-baseline">
                <span className="font-semibold text-custom-text text-lg font-sans">
                  {postData.author.username}
                </span>
                <span className="text-sm text-gray-500 ml-2">{formatTimeAgo(postData.createdAt)}</span>
              </div>
            </div>

            {postData.category && (
              <span className="inline-block bg-[#F3F3F3] text-gray-500 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
                {postData.category}
              </span>
            )}

            <h2 className="text-2xl font-bold text-custom-text mb-2 font-sans leading-tight">
              {postData.title}
            </h2>

            <p className="text-custom-text text-base mb-4 font-sans leading-relaxed">
              {postData.content}
            </p>

            <div className="flex justify-between items-center text-custom-grey-300 text-sm font-sans">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {postData.comments.length} Comments
                </span>
              </div>
              <Bookmark className="w-5 h-5 cursor-pointer hover:text-custom-golden transition-colors" />
            </div>
          </div>

          <div className="mb-6">
            {isLoggedIn ? (
              isCommentInputVisible ? (
                <CommentSidebar
                  onClose={() => {
                    setIsCommentInputVisible(false);
                    setNewCommentContent('');
                  }}
                  onPostComment={handlePostComment}
                  isLoading={addCommentMutation.isPending}
                  commentContent={newCommentContent}
                  setCommentContent={setNewCommentContent}
                  setIsMobileCommentModalOpen={setIsMobileCommentModalOpen} 
                  isMobile={isMobile} 
                />
              ) : (
                <Button
                  className="bg-[#49A569] text-white px-4 py-2 rounded-md hover:bg-green-900 font-sans self-start"
                  onClick={() => setIsCommentInputVisible(true)}
                >
                  Add Comments
                </Button>
              )
            ) : (
              <p className="text-custom-grey-300 mt-4 self-start">
                  <Link href="/sign-in" className="text-custom-green-500 hover:underline">Log in</Link> to add comments.
              </p>
            )}
          </div>
          
          <div className="space-y-4 mt-4">
            {postData.comments.length > 0 ? (
              postData.comments
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map((comment) => (
                    <div key={comment.id} className="pt-4 first:pt-0">
                      <div className="flex items-center mb-1">
                        {getUserAvatar(comment.author)}
                        <span className="font-semibold text-custom-text text-sm">{comment.author.username}</span>
                        <span className="text-xs text-custom-grey-300 ml-2">{formatTimeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-custom-text text-sm ml-9">{comment.content}</p>
                    </div>
                  ))
              ) : (
                null
              )}
            </div>
          </main>

          <aside className="hidden md:block w-1/5 flex-shrink-0 bg-white p-4 ">
          </aside>
        </div>
      </div>
    </div>
  );
}