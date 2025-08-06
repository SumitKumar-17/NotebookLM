"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import UploadScreen from "@/components/UploadScreen";
import DocumentScreen from "@/components/DocumentScreen";
import { useSearchParams, useRouter } from 'next/navigation'

export default function Home() {
  const searchParams = useSearchParams()
  const router = useRouter();
  const documentId = searchParams.get('documentId') as Id<"documents"> | null;

  // Function to update the URL with the new document ID
  const setDocumentId = (id: Id<"documents">) => {
    router.push(`/?documentId=${id}`);
  };

  // Function to clear the document ID from the URL
  const clearDocumentId = () => {
    router.push('/');
  }

  // Fetch document data only if documentId is present
  const document = useQuery(
    api.documents.getDocument,
    documentId ? { id: documentId } : "skip"
  );

  return (
    <main className="h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-800">
      {!documentId || !document ? (
        <UploadScreen setDocumentId={setDocumentId} />
      ) : (
        <DocumentScreen document={document} clearDocumentId={clearDocumentId} />
      )}
    </main>
  );
}