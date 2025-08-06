import { useState } from "react";
import { Doc } from "../../convex/_generated/dataModel";
import PdfViewer from "./PdfViewer";
import Chat from "./Chat";
import { X } from "lucide-react";

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