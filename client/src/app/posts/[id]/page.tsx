// File: client/src/app/posts/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import moment from 'moment';

import Header from '@/components/Header';
import LeftSidebar from '@/components/LeftSidebar';
import { Button } from '@/components/ui/button';
import { Loader2, MessageCircle, Bookmark, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CommentSidebar from '@/components/CommentSidebar';


// 1. Type Definitions (ยังคงเดิม)
interface Author {
  id: string;
  username: string;
  avatarUrl?: string;
}

interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  createdAt: string;
  author: {
    username: string;
    avatarUrl?: string;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  category?: string;
  author: Author;
  createdAt: string;
  comments: Comment[];
}

// 2. Axios Instance และฟังก์ชัน API (ยังคงเดิม)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const fetchPostById = async (id: string): Promise<Post> => {
  if (!id) throw new Error("Post ID is required for fetching.");
  const { data } = await axiosInstance.get(`/posts/${id}`);
  return data;
};

const addComment = async ({ postId, content, token }: { postId: string; content: string; token: string }) => {
  console.log("Sending comment:", { postId, content }); // เพิ่ม console log เพื่อดูข้อมูลที่ส่ง
  const { data } = await axiosInstance.post(`/comments`, { postId: parseInt(postId), content }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// 3. Main Component
export default function PostDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const queryClient = useQueryClient();
  const { data: session, status: sessionStatus } = useSession();
  const [newCommentContent, setNewCommentContent] = useState('');
  const [isCommentInputVisible, setIsCommentInputVisible] = useState(false); // เปลี่ยนชื่อ state ให้สื่อถึงการแสดง input field

  useEffect(() => {
    // moment.locale('th'); // ลบบรรทัดนี้ออก หรือคอมเมนต์ไว้ เพื่อให้ใช้ภาษาอังกฤษเป็นค่าเริ่มต้น
  }, []);

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
      console.log("Comment success:", newComment); // เพิ่ม console log เมื่อสำเร็จ
      toast.success("Comment added successfully!");
      setNewCommentContent('');
      setIsCommentInputVisible(false); // ปิด input field หลังจากส่งคอมเมนต์สำเร็จ

      queryClient.setQueryData<Post>(['post', postId], (oldPost) => {
        if (!oldPost) return oldPost;
        // สร้าง comment object ที่สมบูรณ์ รวมถึง author
        const commentWithAuthor: Comment = {
          ...newComment,
          author: {
            username: session?.user?.name || 'Anonymous', // ใช้ชื่อผู้ใช้จาก session
            avatarUrl: session?.user?.image || undefined, // ใช้อวาตารจาก session
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
      console.error("Comment error:", error.response?.data || error.message); // เพิ่ม console log เมื่อมีข้อผิดพลาด
      toast.error(`Failed to add comment: ${errorMessage}`);
    },
  });

  if (isPostLoading) {
    return (
      <div className="min-h-screen bg-[#BBC2C0] flex flex-col">
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
      <div className="min-h-screen bg-[#BBC2C0] flex flex-col">
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
      <div className="min-h-screen bg-[#BBC2C0] flex flex-col">
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

  // Helper function for date format, uses .fromNow()
  const formatTimeAgo = (dateString: string) => {
    return moment(dateString).fromNow(); // e.g., "5 minutes ago", "2 hours ago", "3 days ago"
  };

  const getUserAvatar = (user: { username: string; avatarUrl?: string }, size: 'sm' | 'md' = 'sm') => {
    const avatarSizeClass = size === 'sm' ? 'w-7 h-7' : 'w-10 h-10';
    const textBaseSize = size === 'sm' ? 'text-xs' : 'text-sm'; // For fallback avatar text size
  
    if (user.avatarUrl) {
      return (
        <img
          src={user.avatarUrl}
          alt={user.username}
          className={`${avatarSizeClass} rounded-full mr-2 object-cover border border-custom-grey-100`}
        />
      );
    }
    return (
      <div className={`${avatarSizeClass} rounded-full bg-gray-300 flex items-center justify-center font-semibold text-gray-600 mr-2 ${textBaseSize}`}>
        {user.username.charAt(0).toUpperCase()}
      </div>
    );
  };

  const handlePostComment = () => {
    if (newCommentContent.trim() === '') { // Prevent empty comments
      toast.error("Comment cannot be empty.");
      return;
    }
    if (session?.accessToken) {
      console.log("Attempting to post comment with token:", session.accessToken); // Log token
      addCommentMutation.mutate({
        postId: postId,
        content: newCommentContent,
        token: session.accessToken as string,
      });
    } else {
      toast.error("Authentication token not found. Please log in again.");
    }
  };


  // --- Render UI ของหน้ารายละเอียดโพสต์ ---
  return (
    <div className="min-h-screen bg-[#BBC2C0] flex flex-col">
      <Header />

      {/* Main content area below header. This div now applies horizontal padding like app/page.tsx */}
      <div className="flex-grow flex flex-col md:flex-row px-4 md:pl-8 md:pr-0">
        {/* Sidebar ด้านซ้าย (ซ่อนบนมือถือ) - Adjusted to match app/page.tsx */}
        <div className="hidden md:block md:w-[220px] flex-shrink-0 bg-custom-white">
          <LeftSidebar />
        </div>

        {/* Content Area (Main Post + Right Sidebar) - NEW STRUCTURE */}
        {/* Adjusted ml-20 to this wrapper div */}
        <div className="flex-grow flex bg-white ml-30">
          {/* Main Post Content */}
          {/* Removed ml-20, p-4 md:p-8 moved here to control padding within the main content area */}
          <main className="flex-grow flex flex-col w-full p-4 md:p-8 ml-15">
            {/* ปุ่มย้อนกลับไปหน้า Home */}
            <div className="mb-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="text-custom-text hover:text-custom-green-500 hover:bg-transparent group px-0"
              >
                <div className="
                  w-8 h-8 rounded-full flex items-center justify-center
                  bg-[#D8E9E4] group-hover:bg-[#49A569]
                  transition-colors duration-200
                ">
                  <ArrowLeft className="w-5 h-5 text-[#49A569] group-hover:text-white" />
                </div>
              </Button>
            </div>

            {/* ส่วนแสดงรายละเอียดของโพสต์ */}
            <div className="mb-4">
              <div className="flex items-center mb-3">
                <img
                  src={postData.author.avatarUrl || '/pond_avatar.png'}
                  alt={postData.author.username}
                  className="w-10 h-10 rounded-full object-cover mr-3 border border-custom-grey-100"
                />
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

            {/* Conditional rendering สำหรับปุ่ม Add Comments หรือ Comment Input */}
            <div className="mb-6">
              {sessionStatus === 'authenticated' ? (
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
                  />
                ) : (
                  <Button
                    className="bg-[#49A569] text-white px-4 py-2 rounded-md hover:bg-green-900 font-sans self-start"
                    onClick={() => setIsCommentInputVisible(true)} // แสดง input field
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
            
            {/* ส่วนแสดงความคิดเห็น (Comment List) - จะถูกแสดงเสมอ ไม่ว่า Comment Input จะเปิดหรือไม่ */}
            <div className="space-y-4 divide-y divide-custom-grey-100 mt-4">
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

          {/* Right Sidebar - NEW */}
          {/* hidden md:block: ซ่อนบนจอเล็ก, แสดงบนจอใหญ่ */}
          {/* w-1/5: ใช้ 20% ของความกว้างของ parent (ซึ่งคือ div ที่มี flex-grow) */}
          {/* flex-shrink-0: ป้องกันไม่ให้ sidebar หดตัวเมื่อพื้นที่ไม่พอ */}
          <aside className="hidden md:block w-1/5 flex-shrink-0 bg-white p-4 ">
          </aside>
        </div>
      </div>
    </div>
  );
}