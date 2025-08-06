"use client";

import { useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Loader2 } from 'lucide-react';
import { Viewer, Worker } from '@react-pdf-viewer/core';

import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import * as pdfjs from 'pdfjs-dist';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PdfViewerProps {
  storageId: Id<"_storage">;
  pageNumber: number;
}

export default function PdfViewer({ storageId, pageNumber }: PdfViewerProps) {
  const fileUrl = useQuery(api.documents.getFileUrl, { storageId });

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  useEffect(() => {
    if (pageNumber) {
      jumpToPage(pageNumber - 1); 
    }
  }, [pageNumber, jumpToPage]);

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
      <Worker workerUrl={workerUrl}>
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