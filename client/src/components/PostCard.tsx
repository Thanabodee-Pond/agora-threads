// client/components/PostCard.tsx
import Link from 'next/link';
import { MessageCircle, Bookmark } from 'lucide-react';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    author: {
      username: string;
      avatarUrl?: string;
    };
    category: string;
    createdAt: string;
    commentCount: number;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    // *** สำคัญ: ไม่มี rounded-lg ที่นี่ ***
    // ไม่มี border-b หรือ shadow-sm ด้วย
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
            {/* แสดง Category ตรงนี้ */}
            <span className="text-custom-grey-300 text-sm font-sans mb-1">
              {post.category}
            </span>
          </div>
        </div>

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
              {post.commentCount} Comments
            </span>
            <span>{formatDate(post.createdAt)}</span>
          </div>
          <Bookmark className="w-5 h-5 cursor-pointer hover:text-custom-golden transition-colors" />
        </div>
      </Link>
    </div>
  );
}