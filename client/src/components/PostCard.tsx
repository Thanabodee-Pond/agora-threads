// client/components/PostCard.tsx
import Link from 'next/link';
import { MessageCircle, Bookmark } from 'lucide-react';
import moment from 'moment'; // <<-- ตรวจสอบว่ามีการ import moment
import 'moment/locale/th'; // <<-- ตรวจสอบว่ามีการ import locale th

// กำหนด Type สำหรับ Comment เพื่อความชัดเจน (ใช้เหมือนใน page.tsx)
interface Comment {
  id: number; // หรือ string ตาม backend
  content: string;
  postId: number; // หรือ string
  authorId: number; // หรือ string
  createdAt: string;
  author: {
    username: string;
  };
}

interface PostCardProps {
  post: {
    id: string; // หรือ number ตาม backend
    title: string;
    content: string;
    author: {
      username: string;
      avatarUrl?: string;
    };
    category?: string; // ตั้งเป็น optional เผื่อบางโพสต์ไม่มี
    createdAt: string;
    comments: Comment[]; // <--- บรรทัดนี้สำคัญ: ให้ตรงกับ backend response
  };
}

export default function PostCard({ post }: PostCardProps) {
  // ตั้งค่า locale ของ moment เป็นภาษาไทยสำหรับ Card นี้ด้วย
  moment.locale('th');

  const formatDate = (dateString: string) => {
    // ใช้ moment แทน Date().toLocaleDateString เพื่อให้สอดคล้องกัน
    return moment(dateString).format('DD MMMM BBBB'); // เช่น 15 มิถุนายน 2568
  };

  // คำนวณ commentCount จากความยาวของ Array comments
  const commentCount = post.comments ? post.comments.length : 0;

  return (
    <div className="bg-custom-white overflow-hidden">
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

        {/* ปรับดีไซน์ Category ตรงนี้ */}
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