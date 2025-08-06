import { Suspense } from 'react';
import PageContent from '@/components/PageContent';
import { Loader2 } from 'lucide-react';

// A server component that provides a Suspense boundary for the client component.
export default function Home() {
  return (
    <main className="h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-800">
      <Suspense fallback={<Loader2 className="w-12 h-12 animate-spin text-gray-500" />}>
        <PageContent />
      </Suspense>
    </main>
  );
}