import { useState } from "react";
import dynamic from "next/dynamic";
import { Doc } from "../../convex/_generated/dataModel";
import Chat from "./Chat";
import { X, Loader2 } from "lucide-react";

// --- START: CORRECTED CODE ---
// Dynamically import the PdfViewer and disable server-side rendering (ssr: false)
// This prevents browser-only APIs from being called on the server during the build.
const PdfViewer = dynamic(() => import("./PdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  ),
});
// --- END: CORRECTED CODE ---


interface DocumentScreenProps {
    document: Doc<"documents">;
    clearDocumentId: () => void;
}

export default function DocumentScreen({ document, clearDocumentId }: DocumentScreenProps) {
  const [pageNumber, setPageNumber] = useState(1);

  return (
    <div className="w-full h-full p-4 md:p-6 flex flex-col md:flex-row gap-6 relative">
        <button onClick={clearDocumentId} className="absolute top-4 right-6 z-20 p-1 rounded-full hover:bg-gray-200 transition-colors" title="Upload another document">
            <X className="w-5 h-5 text-gray-600" />
        </button>
      <div className="md:w-1/2 h-1/2 md:h-full">
        <PdfViewer storageId={document.storageId} pageNumber={pageNumber} />
      </div>
      <div className="md:w-1/2 h-1/2 md:h-full flex flex-col">
        <Chat document={document} setPageNumber={setPageNumber} />
      </div>
    </div>
  );
}