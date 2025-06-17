'use client';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth, axiosInstance } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, X as CloseIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import LeftSidebar from '@/components/LeftSidebar'; 

export default function CreatePostPage() {
  const router = useRouter();
  const { isLoggedIn, accessToken } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false);
  const categories = [
    'History', 'Food', 'Pets', 'Health', 'Fashion', 'Exercise', 'Others' 
  ];

  const handleCancel = () => {
    router.back();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-custom-grey-100 flex flex-col items-center justify-center p-4">
        <p className="text-custom-text text-lg text-center mb-4">Please sign in to create a post.</p>
        <Button onClick={() => router.push('/sign-in')} className="bg-custom-green-300 text-custom-white px-6 py-3 rounded-md hover:opacity-90 font-sans text-base">
          Go to Sign In
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter content.");
      return;
    }
    if (category === null) {
        toast.error("Please choose a community.");
        return;
    }

    try {
      const postData = {
        title,
        content,
        category: category,
      };

      const response = await axiosInstance.post('/posts', postData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      toast.success("Post created successfully!");
      
      router.push('/');

    } catch (err: any) {
      console.error('Failed to create post:', err);
      toast.error(`Failed to create post: ${err.response?.data?.message || err.message}`);
    }
  };

  const toggleCommunityDropdown = () => {
    setIsCommunityDropdownOpen(prev => !prev);
  };

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setIsCommunityDropdownOpen(false); 
  };

  return (
    <div className="min-h-screen bg-[#BBC2C0] flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row px-0 md:px-8"> 
        <div className="hidden md:block md:w-1/5 flex-shrink-0 bg-custom-white">
          <LeftSidebar />
        </div>
        <main className="flex-grow flex flex-col w-full h-full md:w-3/5 items-center justify-center bg-[#BBC2C0] px-0 md:px-0 -mt-30"> 

          <div className="md:hidden w-full max-w-sm rounded-lg shadow-lg my-auto"> 
            {/* Mobile Header for Create Post */}
            <div className="relative flex py-4 px-6 bg-white rounded-t-lg">
              <h2 className="text-2xl font-bold text-gray-800 text-left">Create Post</h2>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold text-left"
                onClick={handleCancel}
              >
                <CloseIcon className="h-6 w-6" />
              </Button>
            </div>

            {/* Mobile Form Body */}
            <div className="bg-white p-6 rounded-b-lg space-y-6">
              {/* Community Dropdown - Mobile */}
              <div className="relative w-full flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full max-w-[400px] h-10 justify-center pr-3 py-2 text-base text-[#49A569] border border-[#49A569] rounded-md shadow-sm bg-white hover:bg-white hover:text-[#49A569]"
                  onClick={toggleCommunityDropdown}
                >
                  <span className="truncate">
                    {category || "Choose a community"}
                  </span>
                  <ChevronDown className="w- h-4" />
                </Button>

                {isCommunityDropdownOpen && (
                  <div className="absolute z-5 mt-1 w-full max-w-[1000px] bg-white border border-gray-300 rounded-md shadow-lg h-[300px] overflow-auto mt-12">
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

              {/* Title Input - Mobile */}
              <div>
                <Input
                  id="post-title-mobile"
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-base placeholder-gray-500"
                />
              </div>

              {/* Content Textarea - Mobile */}
              <div>
                <Textarea
                  id="post-content-mobile"
                  placeholder="What's on your mind..."
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-base placeholder-gray-500 min-h-[120px]"
                />
              </div>

              {/* Buttons - Mobile */}
              <div className="flex flex-col items-center gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 px-6 py-2 rounded-md font-medium shadow-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-[#36A258] text-white hover:bg-[#2B8B4C] px-6 py-2 rounded-md font-medium shadow-sm"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>


          <div className="hidden md:flex flex-row max-w-3xl rounded-lg shadow-lg overflow-hidden mt-60  mx-auto w-full">
              {/* Main Content Card (Create Post Form) */}
              <Card className="flex-grow bg-white rounded-r-lg">
                  <CardHeader className="relative p-6 pb-0 flex flex-row items-center justify-between">
                      <CardTitle className="text-3xl font-bold text-gray-800 -mb-6 -mt-8">Create Post</CardTitle>
                      <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                          onClick={handleCancel}
                      >
                          <CloseIcon className="h-6 w-6" />
                      </Button>
                  </CardHeader>

                  <CardContent className="p-6 pt-0">
                      <form onSubmit={handleSubmit} className="space-y-6">
                          {/* Community Dropdown - Desktop */}
                          <div className="relative w-full max-w-[200px] mt-4">
                              <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full justify-between pr-3 py-2 text-base text-[#49A569] border border-[#49A569] rounded-md shadow-sm bg-white hover:bg-white hover:text-[#49A569]"
                                  onClick={toggleCommunityDropdown}
                              >
                                  <span className="truncate">
                                      {category || "Choose a community"}
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
                                  value={title}
                                  onChange={(e) => setTitle(e.target.value)}
                                  className="w-full p-3 border border-gray-300 rounded-md text-base placeholder-gray-500"
                              />
                          </div>

                          {/* Content Textarea - Desktop */}
                          <div>
                              <Textarea
                                  id="post-content-desktop"
                                  placeholder="What's on your mind..."
                                  rows={8}
                                  value={content}
                                  onChange={(e) => setContent(e.target.value)}
                                  className="w-full p-3 border border-gray-300 rounded-md text-base placeholder-gray-500 min-h-[120px]"
                              />
                          </div>

                          {/* Buttons - Desktop */}
                          <div className="flex justify-end gap-3 mt-8">
                              <Button
                                  type="button"
                                  variant="outline"
                                  onClick={handleCancel}
                                  className="bg-white text-green-600 border border-green-600 hover:bg-green-50 px-6 py-2 rounded-md font-medium shadow-sm"
                              >
                                  Cancel
                              </Button>
                              <Button
                                  type="submit"
                                  className="bg-[#36A258] text-white hover:bg-[#2B8B4C] px-6 py-2 rounded-md font-medium shadow-sm"
                              >
                                  Post
                              </Button>
                          </div>
                      </form>
                  </CardContent>
              </Card>
          </div>
        </main>

        <div className="hidden md:block md:w-1/5 flex-shrink-0 bg-custom-white">
        </div>
      </div>
    </div>
  );
}