'use client';

import React, { useState, useCallback, ChangeEvent, DragEvent } from 'react';

interface UploadCardProps {
  title: string;
  onFileUpload: (file: File | null) => void;
  allowedTypes: string[];
  maxSizeMB: number;
}

export default function UploadCard({
  title,
  onFileUpload,
  allowedTypes,
  maxSizeMB,
}: UploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (selectedFile: File) => {
    if (!allowedTypes.includes(selectedFile.type)) {
      setError(`Invalid file type. Allowed: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}.`);
      return false;
    }

    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB.`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleFile = (selectedFile: File | null) => {
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      onFileUpload(selectedFile);
    } else {
      setFile(null);
      setPreviewUrl(null);
      onFileUpload(null);
    }
  };

  const onDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFile(event.dataTransfer.files[0]);
    }
  }, [allowedTypes, maxSizeMB, onFileUpload]);

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const onFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFile(event.target.files[0]);
    }
  }, [allowedTypes, maxSizeMB, onFileUpload]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md h-full">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={() => document.getElementById(`${title.toLowerCase().replace(/ /g, '-')}-file-input`)?.click()}
        className={`border-2 border-dashed rounded-lg p-6 w-full h-64 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
          ${error
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700'}
        `}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Drag and drop an image here, or click to select
          </p>
        )}
        <input
          id={`${title.toLowerCase().replace(/ /g, '-')}-file-input`}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={onFileChange}
          className="hidden"
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {file && !error && (
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">File: {file.name}</p>
      )}
    </div>
  );
}
