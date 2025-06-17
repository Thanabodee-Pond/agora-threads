// File: client/components/PostCard.tsx

import Link from 'next/link';
import Image from 'next/image'; 
import { MessageCircle, Bookmark, Edit, Trash2 } from 'lucide-react'; 
import moment from 'moment';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { axiosInstance } from '@/components/AuthProvider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Alert Dialog Component

// กำหนด Type สำหรับ Comment 
interface Comment {
  id: number;
  content: string;
  postId: number;
  authorId: number;
  createdAt: string;
  author: {
    username: string;
    avatarUrl?: string | null; 
  };
}

interface PostCardProps {
  post: {
    id: number; 
    title: string;
    content: string;
    author: {
      id: number; // 
      username: string;
      avatarUrl?: string | null; 
    };
    category?: string | null; 
    createdAt: string;
    comments: Comment[];
  };
}

const getUserAvatar = (user: { username: string; avatarUrl?: string | null }, size: 'sm' | 'md' = 'sm') => {
  const avatarSizeClass = size === 'sm' ? 'w-7 h-7' : 'w-10 h-10';
  const defaultAvatarPath = '/pond_avatar.png'; // รูปภาพ default อยู่ใน public 

  if (user.avatarUrl && user.avatarUrl.trim() !== '') {
    return (
      <Image
        src={user.avatarUrl}
        alt={`${user.username}'s avatar`}
        width={size === 'sm' ? 28 : 40}
        height={size === 'sm' ? 28 : 40}
        className={`${avatarSizeClass} rounded-full object-cover mr-3 border border-custom-grey-100`}
      />
    );
  }
  return (
    <Image
      src={defaultAvatarPath}
      alt={`${user.username}'s avatar`}
      width={size === 'sm' ? 28 : 40}
      height={size === 'sm' ? 28 : 40}
      className={`${avatarSizeClass} rounded-full mr-3 object-cover border border-custom-grey-100`}
    />
  );
};


export default function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const { isLoggedIn, user, accessToken } = useAuth(); // ดึง user และ accessToken จาก useAuth
  
  // ตรวจสอบว่าเป็นเจ้าของโพสต์
  // **สำคัญ**: user?.id ต้องเป็น number และ post.author.id ก็ต้องเป็น number
  const isAuthor = isLoggedIn && user && (post.author.id === user.id);
  // ตั้งค่า locale ของ moment เป็นภาษาไทย
  moment.locale('en'); 

  const formatDate = (dateString: string) => {
    return moment(dateString).format('DD MMMM YYYY'); 
  };

  const commentCount = post.comments ? post.comments.length : 0;

  // การลบโพสต์
  const handleDeletePost = async () => {
    if (!accessToken) {
      toast.error("Please sign in to delete posts.");
      return;
    }
    try {
      await axiosInstance.delete(`/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast.success("Post deleted successfully!");
      router.push('/'); // Redirect ไปหน้าแรกหลังลบ
    } catch (error: any) {
      console.error("Failed to delete post:", error);
      toast.error(`Failed to delete post: ${error.response?.data?.message || error.message}`);
    }
  };


  return (
    <div className="bg-custom-white overflow-hidden relative"> 
      
      {isAuthor && (
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-10"> 
          <Link href={`/posts/${post.id}/edit`} passHref>
            <Edit className="w-5 h-5 text-[#2B5F44] cursor-pointer hover:text-green-600 transition-colors" />
          </Link>
          {/* Alert Dialog สำหรับยืนยันการลบ */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Trash2 className="w- h-5 text-[#2B5F44] cursor-pointer hover:text-green-900 transition-colors" />
            </AlertDialogTrigger>
            <AlertDialogContent className='flex flex-col items-center w-96 h-60 justify-center'> 
              <AlertDialogHeader className="text-center"> 
                <AlertDialogTitle className="justify-cente text-center">
                  Please confirm if you wish to <br/> delete the post
                </AlertDialogTitle >
                <AlertDialogDescription className='text-center'>
                  Are you sure you want to delete the post? <br/> Once deleted, it cannot be recovered.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="justify-center mt-3">
                <AlertDialogCancel className='w-40'>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeletePost} className='bg-[#F23536] w-40'>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <Link href={`/posts/${post.id}`} className="block p-6">
        <div className="flex items-center mb-3 rounded-b-none">
          <img
            src={post.author.avatarUrl || '/pond_avatar.png'}
            alt={post.author.username}
            className="w-10 h-10 rounded-full object-cover mr-3 border border-custom-grey-100"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-custom-text text-lg font-sans">
              {post.author.username}
            </span>
          </div>
        </div>

        <span className="inline-block bg-[#F3F3F3] text-gray-500 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
          {post.category}
        </span>

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