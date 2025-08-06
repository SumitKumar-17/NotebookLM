"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import UploadScreen from "@/components/UploadScreen";

// Dynamically import the entire DocumentScreen and disable server-side rendering.
const DocumentScreen = dynamic(() => import('@/components/DocumentScreen'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-gray-500" />
        </div>
    ),
});

export default function PageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const documentId = searchParams.get('documentId') as Id<"documents"> | null;

  const setDocumentId = (id: Id<"documents">) => {
    router.push(`/?documentId=${id}`);
  };

  const clearDocumentId = () => {
    router.push('/');
  }

  const document = useQuery(
    api.documents.getDocument,
    documentId ? { id: documentId } : "skip"
  );

  return (
    <>
      {!documentId || !document ? (
        <UploadScreen setDocumentId={setDocumentId} />
      ) : (
        <DocumentScreen document={document} clearDocumentId={clearDocumentId} />
      )}
    </>
  );
}