import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function PostDetailSkeleton() {
  return (
    <div className="container mx-auto max-w-3xl p-4 md:p-8 space-y-8 animate-pulse">
      <Card>
        <CardHeader>
          <div className="h-9 bg-gray-200 rounded w-3/4 mb-4"></div> {/* Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200"></div> {/* Avatar */}
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-24"></div> {/* Username */}
              <div className="h-4 bg-gray-200 rounded w-32"></div> {/* Posted on Date */}
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-lg leading-relaxed whitespace-pre-wrap border-t pt-6 mt-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </CardContent>
      </Card>

      {/* Comment Section Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-7 bg-gray-200 rounded w-48"></div> {/* Add a Comment Title */}
        </CardHeader>
        <CardContent>
          <div className="h-24 bg-gray-200 rounded mb-4"></div> {/* Textarea */}
          <div className="h-10 bg-gray-200 rounded w-32 ml-auto"></div> {/* Post Comment Button */}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="h-7 bg-gray-200 rounded w-64"></div> {/* Comments (X) Title */}
        <Card className="p-4 shadow-sm bg-white">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-200"></div> {/* Comment Avatar */}
            <div className="space-y-1">
              <div className="h-4 bg-gray-200 rounded w-20"></div> {/* Comment Username */}
              <div className="h-3 bg-gray-200 rounded w-28"></div> {/* Comment Date */}
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-11/12 pt-3 pl-11"></div> {/* Comment Content */}
        </Card>
        <Card className="p-4 shadow-sm bg-white">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            <div className="space-y-1">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-28"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-11/12 pt-3 pl-11"></div>
        </Card>
      </div>
    </div>
  );
}