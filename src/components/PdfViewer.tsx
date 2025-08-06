import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Loader2, ZoomIn, ZoomOut } from 'lucide-react';

// Point to the worker file that will be in your "public" folder
if (typeof window !== 'undefined') {
  // Use the modern module worker, which is more compatible with Next.js
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();
}

interface PdfViewerProps {
  storageId: Id<"_storage">;
  pageNumber: number;
}

export default function PdfViewer({ storageId, pageNumber }: PdfViewerProps) {
  const fileUrl = useQuery(api.documents.getFileUrl, { storageId });
  const [numPages, setNumPages] = useState<number>();
  const [scale, setScale] = useState(1.5);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const viewerLoading = <div className="w-full h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="w-full h-full flex flex-col border rounded-xl bg-gray-100">
      <div className="p-2 border-b bg-white flex justify-center items-center gap-2 text-sm text-gray-600">
        <button onClick={() => setScale(s => s > 0.5 ? s - 0.1 : s)} className="p-1 rounded-full hover:bg-gray-100"><ZoomOut className="w-4 h-4" /></button>
        <span>{(scale * 100).toFixed(0)}%</span>
        <button onClick={() => setScale(s => s < 2.5 ? s + 0.1 : s)} className="p-1 rounded-full hover:bg-gray-100"><ZoomIn className="w-4 h-4" /></button>
        <div className="w-px h-5 bg-gray-200 mx-2"></div>
        <span>Page {pageNumber} of {numPages ?? '...'}</span>
      </div>
      <div className="flex-1 overflow-auto">
        {fileUrl ? (
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={viewerLoading}
            className="flex justify-center py-4"
          >
            <Page
                pageNumber={pageNumber}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                scale={scale}
                loading={viewerLoading}
            />
          </Document>
        ) : viewerLoading}
      </div>
    </div>
  );
}