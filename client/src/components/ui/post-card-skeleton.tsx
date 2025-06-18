import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function PostCardSkeleton() {
  return (
    <Card className="w-full max-w-2xl mx-auto animate-pulse">
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex-1 pr-4 space-y-2">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div> 
          <div className="h-4 bg-gray-200 rounded w-1/2"></div> 
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-9 bg-gray-200 rounded-md"></div> 
          <div className="h-9 w-9 bg-gray-200 rounded-md"></div> 
        </div>
      </CardContent>
    </Card>
  );
}