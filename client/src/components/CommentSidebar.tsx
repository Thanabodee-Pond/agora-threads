'use client'

import React, { Dispatch, SetStateAction } from 'react';import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; 
import { Loader2, X } from 'lucide-react'; 

interface CommentSidebarProps {
  onClose: () => void;
  onPostComment: () => void;
  isLoading: boolean;
  commentContent: string;
  setCommentContent: Dispatch<SetStateAction<string>>;
  isMobile: boolean;
  setIsMobileCommentModalOpen: Dispatch<SetStateAction<boolean>>;
}

const CommentSidebar: React.FC<CommentSidebarProps> = ({
  onClose,
  onPostComment,
  isLoading,
  commentContent,
  setCommentContent,

}) => {
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center md:hidden -mt-42">
        <div className="bg-white rounded-lg p-6 mx-4 w-full max-w-md shadow-lg relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-custom-text font-sans">Add Comments</h3>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <X className="w-5 h-5" /> 
            </button>
          </div>
          <Textarea
            placeholder="What's on your mind..."
            className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#49A569] resize-none"
            rows={5} 
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          />
          <div className="flex flex-col justify-end space-y-3 md:flex-row md:space-x-3 md:space-y-0"> 
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#49A569] text-[#49A569] hover:bg-gray-100 font-sans px-4 py-2 rounded-md" 
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#49A569] text-white px-4 py-2 rounded-md hover:bg-green-900 font-sans" 
              onClick={onPostComment}
              disabled={isLoading || commentContent.trim() === ''}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Post
            </Button>
          </div>
        </div>
      </div>
      <div className="hidden md:block -mt-10">
        <div className="flex flex-col">
          <Textarea
            placeholder="What's on your mind..."
            className="p-3 border border-gray-300 rounded-md mb-4 focus:ring-custom-green-300 focus:border-custom-green-300 resize-none mt-10"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            rows={5} 
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              className="border-[#49A569] text-[#49A569] hover:bg-gray-100 font-sans px-6"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#49A569] text-white hover:bg-green-700 font-sans px-9"
              onClick={onPostComment}
              disabled={isLoading || commentContent.trim() === ''}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Post
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommentSidebar;