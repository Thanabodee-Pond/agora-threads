import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import React from 'react';
import Image from 'next/image'; 
import { User } from 'lucide-react'; 

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getUserAvatar = (
  user: { username: string; avatarUrl?: string | null },
  size: 'sm' | 'md' = 'sm'
): React.ReactNode => {
  const sizeClass = size === 'sm' ? 'w-7 h-7' : 'w-10 h-10';
  const imageSize = size === 'sm' ? 28 : 40;
  const iconSize = size === 'sm' ? 16 : 24;

  if (user && user.username === 'pond') {
    return (
      <Image
        src="/pond_avatar2.png"
        alt={user.username}
        width={imageSize}
        height={imageSize}
        className={`${sizeClass} rounded-full mr-2 object-cover border border-custom-grey-100`}
      />
    );
  } 
  else if (user && user.avatarUrl && user.avatarUrl.trim() !== '') {
    return (
      <Image
        src={user.avatarUrl}
        alt={user.username}
        width={imageSize}
        height={imageSize}
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