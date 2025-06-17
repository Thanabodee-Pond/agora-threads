import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function FloatingCreateButton() {
  return (
    <Link href="/create-post" className="fixed bottom-6 right-6">
      <Button className="bg-custom-green-300 text-custom-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:opacity-90">
        <Plus className="w-6 h-6" />
      </Button>
    </Link>
  );
}