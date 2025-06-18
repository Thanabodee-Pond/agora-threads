export interface Author {
  id: number;
  username: string;
  avatarUrl?: string | null;
}

export interface Comment {
  id: number;
  content: string;
  postId: number;
  authorId: number;
  createdAt: string;
  author: Author;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: Author;
  category?: string | null;
  createdAt: string;
  comments: Comment[];
}