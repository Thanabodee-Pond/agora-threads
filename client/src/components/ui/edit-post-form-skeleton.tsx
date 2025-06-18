import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function EditPostFormSkeleton() {
  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-8 animate-pulse">
      <Card>
        <CardHeader>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div> {/* Title */}
          <div className="h-5 bg-gray-200 rounded w-64"></div> {/* Description */}
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div> {/* Label: Title */}
            <div className="h-10 bg-gray-200 rounded"></div> {/* Input: Title */}
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div> {/* Label: Content */}
            <div className="h-32 bg-gray-200 rounded"></div> {/* Textarea: Content */}
          </div>
          <div className="flex justify-end gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded"></div> {/* Cancel Button */}
            <div className="h-10 w-28 bg-gray-200 rounded"></div> {/* Update Post Button */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}