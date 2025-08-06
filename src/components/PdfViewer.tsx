import { useState, useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Loader2 } from 'lucide-react';

// Core viewer
import { Viewer, Worker } from '@react-pdf-viewer/core';
// Plugins
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
// Default layout
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PdfViewerProps {
  storageId: Id<"_storage">;
  pageNumber: number;
}

export default function PdfViewer({ storageId, pageNumber }: PdfViewerProps) {
  const fileUrl = useQuery(api.documents.getFileUrl, { storageId });

  // Create a ref to control the viewer instance
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // This effect will run whenever the pageNumber prop from the chat component changes
  useEffect(() => {
    if (pageNumber) {
      jumpToPage(pageNumber - 1); // jumpToPage is 0-indexed, so we subtract 1
    }
  }, [pageNumber]);

  const viewerLoading = (
    <div className="w-full h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  );

  if (!fileUrl) {
    return viewerLoading;
  }

  return (
    <div className="w-full h-full border rounded-xl overflow-hidden">
      {/* Use a reliable CDN for the worker script */}
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer
          fileUrl={fileUrl}
          plugins={[
            pageNavigationPluginInstance,
            defaultLayoutPluginInstance,
          ]}
          renderLoader={() => viewerLoading}
        />
      </Worker>
    </div>
  );
}