// File: client/src/components/CommentSidebar.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X } from 'lucide-react';

interface CommentSidebarProps {
  onClose: () => void;
  onPostComment: () => void;
  isLoading: boolean;
  commentContent: string;
  setCommentContent: (content: string) => void;
}

const CommentSidebar: React.FC<CommentSidebarProps> = ({
  onClose,
  onPostComment,
  isLoading,
  commentContent,
  setCommentContent,
}) => {
  return (
    // ไม่มี class 'absolute' หรือ 'fixed' อีกต่อไป
    // จะใช้เป็น block element ปกติ
    <div className="-mt-10"> {/* เพิ่ม shadow, border, และ mt-4 */}
      <div className="flex justify-between items-center pb-3 mb-3 ">
        <h2 className="text-xl font-bold text-custom-text"></h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className=""
        >
      
        </Button>
      </div>
      <div className="flex flex-col">
        <Textarea
          placeholder="What's on your mind..."
          className="p-3 border border-gray-300 rounded-md mb-4 focus:ring-custom-green-300 focus:border-custom-green-300 resize-none"
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          rows={5} // ปรับให้เล็กลงหน่อย เพราะไม่ได้กินเต็มหน้าจอ
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
            disabled={isLoading || commentContent.trim() === ''}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentSidebar;