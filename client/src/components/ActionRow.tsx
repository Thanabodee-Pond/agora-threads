'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; 
import { Search, ChevronDown } from 'lucide-react'; 
import { cn } from '@/lib/utils'; 

export default function ActionRow() {
  const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false);

  const toggleCommunityDropdown = () => {
    setIsCommunityDropdownOpen(prevState => !prevState);
  };

  return (
    <div className="bg-custom-white w-full p-4 rounded-lg shadow-sm mb-4 md:p-0 md:rounded-none md:shadow-none md:mb-0">
      <div className="flex flex-row items-center justify-between flex-wrap gap-4 py-4 md:gap-10">
        {/* ส่วนของช่องค้นหา (Search Input) */}
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-grey-300" />
          <input
            data-slot="input"
            className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 min-w-0 bg-transparent px-3 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive pl-9 pr-4 py-2 border border-white rounded-md focus:ring-custom-green-300 focus:border-custom-green-300 text-custom-text placeholder-custom-grey-300 font-sans w-full"
            placeholder="Search"
            type="text"
          />
        </div>

        {/* ส่วนของ Community Dropdown */}
        <div className="relative w-full md:w-auto" id="community-dropdown-container">
          <div className="flex items-center justify-between md:justify-start">
            <Button
              onClick={toggleCommunityDropdown}
              className="text-custom-grey-300 hover:text-custom-text font-sans"
            >
              Community
            </Button>
            <Button
              onClick={toggleCommunityDropdown}
              className="p-2 -ml-2 text-custom-grey-300 hover:text-custom-text font-sans"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
          {/* เนื้อหา Dropdown */}
          <div className={cn(
            "absolute right-0 mt-2 w-full md:w-48 bg-white border border-custom-grey-100 rounded-md shadow-lg z-50",
            isCommunityDropdownOpen ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-95",
            "transition-all duration-200 ease-in-out transform origin-top-right"
          )}>
            <Link className="block px-4 py-2 text-sm text-custom-text hover:bg-[#D8E9E4] font-sans" href="/community/history">History</Link>
            <Link className="block px-4 py-2 text-sm text-custom-text hover:bg-[#D8E9E4] font-sans" href="/community/food">Food</Link>
            <Link className="block px-4 py-2 text-sm text-custom-text hover:bg-[#D8E9E4] font-sans" href="/community/pets">Pets</Link>
            <Link className="block px-4 py-2 text-sm text-custom-text hover:bg-[#D8E9E4] font-sans" href="/community/health">Health</Link>
            <Link className="block px-4 py-2 text-sm text-custom-text hover:bg-[#D8E9E4] font-sans" href="/community/fashion">Fashion</Link>
            <Link className="block px-4 py-2 text-sm text-custom-text hover:bg-[#D8E9E4] font-sans" href="/community/exercise">Exercise</Link>
            <Link className="block px-4 py-2 text-sm text-custom-text hover:bg-[#D8E9E4] font-sans" href="/community/others">Others</Link>
          </div>
        </div>

        {/* ปุ่ม Create + */}
        <div className="w-full md:w-auto flex justify-end md:justify-start">
          <Link href="/create-post" className="w-full md:w-auto">
            <Button className="bg-[#49A569] text-white px-4 py-2 rounded-md hover:bg-green-900 font-sans w-full">Create +</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}