// File: client/src/components/PostCard.tsx
'use client';

import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

// --- ส่วนที่แก้ไข: เปลี่ยน Path การ Import ---
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// -----------------------------------------

// กำหนด Type ของ Post ให้ตรงกับข้อมูลที่มาจาก Backend
interface Post {
  id: number;
  title: string;
  content: string;
  author: {
    username: string;
  };
  createdAt: string;
  comments: unknown[]; // เราแค่ต้องการ .length จึงใช้ unknown[] ได้
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md hover:shadow-lg transition-shadow flex flex-col">
      <Link
        href={`/posts/${post.id}`}
        className="block hover:bg-gray-50/50 rounded-t-lg flex-grow"
      >
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Avatar>
              <AvatarFallback>{post.author.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post.author.username}</p>
              <p className="text-xs text-gray-500">
                Posted on {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <CardTitle className="text-xl font-semibold pt-2 text-gray-800">
            {post.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 line-clamp-3">{post.content}</p>
        </CardContent>
      </Link>
      
      <CardFooter className="flex justify-between border-t pt-4 mt-auto">
        <Badge variant="secondary">Community</Badge>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments.length} Comments</span>
        </div>
      </CardFooter>
    </Card>
  );
}