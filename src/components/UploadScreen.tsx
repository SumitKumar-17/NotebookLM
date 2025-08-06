"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { UploadCloudIcon, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface UploadScreenProps {
  setDocumentId: (id: Id<"documents">) => void;
}

export default function UploadScreen({ setDocumentId }: UploadScreenProps) {
  const [isUploading, setIsUploading] = useState(false);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createDocument = useMutation(api.documents.createDocument);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setIsUploading(true);

    try {
      const file = acceptedFiles[0];
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      const newDocumentId = await createDocument({ storageId, name: file.name });
      setDocumentId(newDocumentId);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please check the console and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  return (
    <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">Chat with your PDF</h1>
        <p className="text-lg text-gray-600">Upload a document to get started</p>
        <div
            {...getRootProps()}
            className={`w-96 h-56 mt-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors
            ${isDragActive ? "bg-blue-100 border-blue-500" : "bg-white border-gray-300 hover:border-blue-500"}`}
        >
            <input {...getInputProps()} />
            {isUploading ? (
            <>
                <Loader2 className="w-12 h-12 text-gray-500 animate-spin" />
                <p className="mt-4 text-sm text-gray-600">Uploading & Processing...</p>
            </>
            ) : (
            <>
                <UploadCloudIcon className="w-12 h-12 text-gray-400" />
                <p className="mt-4 text-base font-semibold text-gray-600">
                {isDragActive ? "Drop the file here" : "Click or drag PDF to upload"}
                </p>
                <p className="text-sm text-gray-500">Maximum file size 100MB.</p>
            </>
            )}
        </div>
    </div>
  );
}