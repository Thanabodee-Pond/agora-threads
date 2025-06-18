
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react'; 
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import axios from 'axios';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ChevronDown, X as CloseIcon } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useAuth, axiosInstance } from '@/components/AuthProvider';
import type { Post } from '@/types'; 

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  content: z.string().min(10, { message: 'Content must be at least 10 characters.' }),
  category: z.string().min(1, { message: "Please choose a community." }).nullable().optional(),
});

const updatePost = async ({ postId, values, token }: { postId: string; values: z.infer<typeof formSchema>; token: string }) => {
  const { data } = await axiosInstance.patch(`/posts/${postId}`, values, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

interface EditPostFormProps {
  post: Post;
  onFinished: () => void;
}

export function EditPostForm({ post, onFinished }: EditPostFormProps) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false);
  const categories = [ 'History', 'Food', 'Pets', 'Health', 'Fashion', 'Exercise', 'Others' ];
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title || '',
      content: post?.content || '',
      category: post?.category || '',
    },
  });

  const mutation = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      toast.success("Post updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', post.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      onFinished();
    },
    onError: (error) => {
       toast.error(`Failed to update post: ${axios.isAxiosError(error) ? error.response?.data?.message || 'An error occurred' : 'An unexpected error occurred'}`);
    },
  });

  const handleCategorySelect = (selectedCategory: string) => {
    form.setValue('category', selectedCategory);
    setIsCommunityDropdownOpen(false);
  };

function onSubmit(values: z.infer<typeof formSchema>) {

  if (!accessToken) { toast.error("Authentication required."); return; }
  const dataToSend = { ...values, category: values.category === '' ? null : values.category };
  mutation.mutate({ postId: post.id.toString(), values: dataToSend, token: accessToken });
}

  const CommunityDropdown = (
    <div className="relative w-full max-w-[120px]">
      <Button type="button" variant="outline" className="w-full justify-center pr-3 py-2 text-base text-[#49A569] border border-[#49A569]" onClick={() => setIsCommunityDropdownOpen(prev => !prev)}>
        <span className="truncate">{form.watch('category') || "Choose a community"}</span>
        <ChevronDown className="w-4 h-4 ml-2" />
      </Button>
      {isCommunityDropdownOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {categories.map((cat) => ( <div key={cat} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" onClick={() => handleCategorySelect(cat)}>{cat}</div> ))}
        </div>
      )}
    </div>
  );

  const TitleField = <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormControl><Input placeholder="Title" {...field} /></FormControl><FormMessage /></FormItem> )} />;
  const ContentField = <FormField control={form.control} name="content" render={({ field }) => ( <FormItem><FormControl><Textarea placeholder="What's on your mind..." rows={8} {...field} className="min-h-[120px]" /></FormControl><FormMessage /></FormItem> )} />;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex flex-col h-full">
        {isDesktop ? (
          // ----- DESKTOP -----
          <Card className="w-[100vw] max-w-2xl h-full border-none shadow-none flex flex-col">
            <CardHeader className="relative p-6 pb-2">
              <CardTitle className="text-3xl font-bold text-gray-800 -mb-5 -mt-4">Edit Post</CardTitle>
              <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-gray-500 -mt-4" onClick={onFinished}>
                <CloseIcon className="h-6 w-6" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 pt-4 flex-grow flex flex-col">
              <div className="space-y-6 flex-grow">
                {CommunityDropdown}
                {TitleField}
                {ContentField}
              </div>
              <div className="flex justify-end gap-3 pt-8">
                <Button type="button" variant="outline" onClick={onFinished}>Cancel</Button>
                <Button type="submit" disabled={mutation.isPending} className="bg-[#36A258] hover:bg-[#2B8B4C]">
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // ----- MOBILE -----
          <Card className='mx-auto my-auto '>
          <div className="w-[70vw] h-full bg-white flex flex-col">
            <div className="relative flex py-4 px-6 items-center">
              <h2 className="text-xl font-bold text-gray-800 text-left">Edit Post</h2>
              <Button variant="ghost" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2" onClick={onFinished}>
                <CloseIcon className="h-6 w-6" />
              </Button>
            </div>
            <div className="p-6 space-y-6 flex-grow overflow-y-auto">
              {CommunityDropdown}
              {TitleField}
              {ContentField}
            </div>
            <div className="p-4 flex flex-col gap-3">
              <Button type="button" variant="outline" onClick={onFinished} className="w-full">Cancel</Button>
              <Button type="submit" disabled={mutation.isPending} className="bg-[#36A258] w-full">
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm
              </Button>
            </div>
          </div>
          </Card>
        )}
      </form>
    </Form>
  );
}