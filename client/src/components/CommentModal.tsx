// File: client/src/components/CommentModal.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // ใช้ Textarea แทน Input สำหรับ multi-line input
import { Loader2 } from 'lucide-react';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostComment: () => void;
  isLoading: boolean;
  commentContent: string;
  setCommentContent: (content: string) => void;
}

const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  onPostComment,
  isLoading,
  commentContent,
  setCommentContent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100">
        <h2 className="text-xl font-bold mb-4 text-custom-text">Add your comment</h2>
        <Textarea
          placeholder="What's on your mind..." // Placeholder จากรูป image_ccd0f1.png
          className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:ring-custom-green-300 focus:border-custom-green-300 resize-y min-h-[100px]"
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          rows={4}
        />
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100 font-sans"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="bg-[#49A569] text-white hover:bg-green-700 font-sans"
            onClick={onPostComment}
            disabled={isLoading || commentContent.trim() === ''} // Disable ถ้ากำลังโหลด หรือเนื้อหาว่างเปล่า
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;