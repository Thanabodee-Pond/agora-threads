'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ChevronDown, X as CloseIcon } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { EditPostFormSkeleton } from '@/components/ui/edit-post-form-skeleton';
import { useAuth, axiosInstance } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  content: z.string().min(10, { message: 'Content must be at least 10 characters.' }),
  category: z.string().nullable().optional(),
});

interface Author {
  id: number;
  username: string;
  avatarUrl?: string | null;
}
interface Post {
  id: number;
  title: string;
  content: string;
  category: string | null;
  author: Author;
  createdAt: string;
}

const fetchPostById = async (id: string): Promise<Post> => { 
  if (!id) throw new Error("Post ID is required for fetching.");
  const url = `/posts/${id}`;
  console.log('API Call: Fetching post from URL:', url);
  try {
    const { data } = await axiosInstance.get(url);
    console.log('API Call: Post fetched successfully:', data);
    return data;
  } catch (error: any) {
    console.error('API Call Error: Failed to fetch post from URL:', url, error);
    throw error;
  }
};

const updatePost = async ({ postId, values, token }: { postId: string; values: z.infer<typeof formSchema>; token: string }) => {
  const url = `/posts/${postId}`;
  console.log('API Call: Updating post to URL:', url);
  try {
    const { data } = await axiosInstance.patch(url, values, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('API Call: Post updated successfully:', data);
    return data;
  } catch (error: any) {
    console.error('API Call Error: Failed to update post to URL:', url, error);
    throw error;
  }
};

interface EditPostPageProps {
  params: { id: string };
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoggedIn, accessToken, user } = useAuth();

  const [resolvedPostId, setResolvedPostId] = useState<string | null>(null);
  const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false);
  
  const dropdownContainerRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const formFieldsContainerRef = useRef<HTMLDivElement>(null);
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState('max-h-60'); 

  const categories = [
    'History', 'Food', 'Pets', 'Health', 'Fashion', 'Exercise', 'Others'
  ];

  useEffect(() => {
    if (params.id) {
      setResolvedPostId(params.id);
    }
  }, [params.id]);

  const {
    data: postData,
    isLoading: isPostLoading,
    error: postError,
  } = useQuery<Post, Error>({
    queryKey: ['post', resolvedPostId],
    queryFn: () => fetchPostById(resolvedPostId as string),
    enabled: !!resolvedPostId && isLoggedIn,
    refetchOnMount: false, 
    refetchOnWindowFocus: false,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: useMemo(() => ({
      title: postData?.title || '',
      content: postData?.content || '',
      category: postData?.category || '',
    }), [postData]),
  });

  useEffect(() => {
    if (!resolvedPostId) return;

    if (!isLoggedIn) {
      console.log('useEffect: Redirecting unauthenticated user.');
      toast.error("Please sign in to edit posts.");
      router.push('/sign-in');
      return;
    }

    if (isPostLoading || !postData) {
        return;
    }

    if (postError) {
        console.error('useEffect: Post data error, redirecting to home.', postError);
        if (axios.isAxiosError(postError) && (postError.response?.status === 404 || postError.response?.status === 403)) {
            toast.error("Post not found or you don't have permission to view it.");
            router.push('/');
        } else {
            toast.error("Error loading post details. Please try again.");
            router.push('/');
        }
        return;
    }
    
    if (user?.id !== postData.author.id) {
      console.log('useEffect: Authorization Check failed, redirecting.');
      toast.error("You are not authorized to edit this post.");
      router.push(`/posts/${resolvedPostId}`);
      return;
    }

    console.log('useEffect: Setting form values:', postData);
    form.reset({
      title: postData.title || '',
      content: postData.content || '',
      category: postData.category || '',
    });
  }, [isLoggedIn, postData, postError, form, router, resolvedPostId, user?.id, isPostLoading]);

  const mutation = useMutation({
    mutationFn: updatePost,
    onSuccess: (data) => {
      toast.success("Post updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['post', resolvedPostId] });
      queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      router.push(`/posts/${resolvedPostId}`);
      console.log('Mutation Success:', data);
    },
    onError: (error) => {
      console.error("Mutation Error: Failed to update post.", error);
      toast.error(`Failed to update post: ${axios.isAxiosError(error) ? error.response?.data?.message || error.message : error.message}`);
    },
  });

  const handleClose = () => {
    router.back();
  };

  const handleCategorySelect = (selectedCategory: string) => {
    form.setValue('category', selectedCategory);
    setIsCommunityDropdownOpen(false);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Form submitted with values:', values);
    if (!resolvedPostId) {
        toast.error("Post ID is missing for update.");
        return;
    }
    if (values.category === undefined || values.category === '') {
        toast.error("Please choose a community.");
        return;
    }

    if (accessToken) {
      const dataToSend = {
        ...values,
        category: values.category === '' ? null : values.category
      };
      mutation.mutate({ postId: resolvedPostId, values: dataToSend, token: accessToken });
    } else {
      toast.error("Authentication token not found. Please sign in again.");
    }
  }

  useEffect(() => {
    if (isCommunityDropdownOpen && dropdownButtonRef.current && formFieldsContainerRef.current) {
      const buttonRect = dropdownButtonRef.current.getBoundingClientRect();
      const formFieldsRect = formFieldsContainerRef.current.getBoundingClientRect();
      
      const buttonsDiv = document.querySelector('.edit-post-buttons-mobile'); 
      const buttonsTop = buttonsDiv ? buttonsDiv.getBoundingClientRect().top : window.innerHeight;

      const remainingSpace = buttonsTop - buttonRect.bottom - 12;

      setDropdownMaxHeight(`max-h-[${Math.max(60, remainingSpace)}px]`); 
      
    } else if (!isCommunityDropdownOpen) {
        setDropdownMaxHeight('max-h-60');
    }
  }, [isCommunityDropdownOpen]);


  if (!resolvedPostId || !isLoggedIn || isPostLoading) {
    console.log('Render: Displaying Skeleton for initial loading/auth check.');
    return <EditPostFormSkeleton />;
  }

  if (postError) {
    console.error('Render: Displaying error state for post data.', postError);
    return (
        <div className="flex justify-center items-center min-h-screen">
            <p className="text-red-500">Error loading post details: {postError.message}</p>
        </div>
    );
  }

  if (!postData) {
    console.log('Render: No post data available, showing fallback.');
    return (
        <div className="flex justify-center items-center min-h-screen">
            <p className="text-gray-500">Post not found or inaccessible.</p>
        </div>
    );
  }

  console.log('Render: Displaying Edit Form for post:', postData?.title);
  return (
    <div className="min-h-screen bg-[#939494] flex flex-col">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex items-center justify-center bg-[#939494]">
        <div className="md:hidden w-full max-w-sm rounded-lg shadow-lg mt-5">
          <div className="relative flex  py-4 px-6 bg-white rounded-t-lg">
            <h2 className="text-xl font-bold text-gray-800 text-left">Edit Post</h2>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold"
              onClick={handleClose}
            >
              <CloseIcon className="h-6 w-6" />
            </Button>
          </div>

          <div className="bg-white p-6 rounded-b-lg space-y-6">
            <Form {...form}> 
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="relative w-full z-20" ref={dropdownContainerRef}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center pr-3 py-2 text-base text-[#49A569] border border-[#49A569] rounded-md shadow-sm bg-white hover:bg-white hover:text-[#49A569]"
                    onClick={() => setIsCommunityDropdownOpen(prev => !prev)}
                    ref={dropdownButtonRef}
                  >
                    <span className="truncate">
                      {form.watch('category') || "Choose a community"}
                    </span>
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>

                  {isCommunityDropdownOpen && (
                    <div className={cn(
                      "absolute z-30 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg overflow-auto",
                      dropdownMaxHeight 
                    )}>
                      {categories.map((cat) => (
                        <div
                          key={cat}
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleCategorySelect(cat)}
                        >
                          {cat}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div ref={formFieldsContainerRef}>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="Title"
                            {...field}
                            className="w-full p-3 border border-gray-300 rounded-md text-base placeholder-gray-500 mb-5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="What's on your mind..."
                            rows={8}
                            {...field}
                            className="w-full p-3 border border-gray-300 rounded-md text-base placeholder-gray-500 min-h-[120px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Buttons */}
                <div className="flex flex-col items-center gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="bg-white w-full text-green-600 border border-green-600 hover:bg-green-50 px-6 py-2 rounded-md font-medium shadow-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="bg-[#36A258] w-full text-white hover:bg-[#2B8B4C] px-6 py-2 rounded-md font-medium shadow-sm"
                  >
                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm
                  </Button>
                </div>
              </form>
            </Form> 
          </div>
        </div>

        <Card className="hidden md:block w-full max-w-2xl bg-white rounded-lg shadow-lg">
          <CardHeader className="relative p-6 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-800">Edit Post</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={handleClose}
            >
              <CloseIcon className="h-6 w-6" />
            </Button>
          </CardHeader>

          <CardContent className="p-6 pt-0">
            <Form {...form}> 
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="relative w-full max-w-[200px] mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between pr-3 py-2 text-base text-[#49A569] border border-[#49A569] rounded-md shadow-sm bg-white hover:bg-white hover:text-[#49A569]"
                    onClick={() => setIsCommunityDropdownOpen(prev => !prev)}
                  >
                    <span className="truncate">
                      {form.watch('category') || "Choose a community"}
                    </span>
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>

                  {isCommunityDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {categories.map((cat) => (
                        <div
                          key={cat}
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleCategorySelect(cat)}
                        >
                          {cat}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title Input - Desktop */}
                <div>
                  <Input
                    id="post-title-desktop"
                    type="text"
                    placeholder="Title"
                    value={form.watch('title')}
                    onChange={(e) => form.setValue('title', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md text-base placeholder-gray-500"
                  />
                </div>

                {/* Content Textarea - Desktop */}
                <div>
                  <Textarea
                    id="post-content-desktop"
                    placeholder="What's on your mind..."
                    rows={8}
                    value={form.watch('content')}
                    onChange={(e) => form.setValue('content', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md text-base placeholder-gray-500 min-h-[120px]"
                  />
                </div>

                {/* Buttons - Desktop */}
                <div className="flex justify-end gap-3 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="bg-white text-green-600 border border-green-600 hover:bg-green-50 px-6 py-2 rounded-md font-medium shadow-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="bg-[#36A258] text-white hover:bg-[#2B8B4C] px-6 py-2 rounded-md font-medium shadow-sm"
                  >
                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}