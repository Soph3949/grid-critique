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
    <div
      className="flex flex-col items-center justify-center p-6 rounded-2xl shadow-sm h-full"
      style={{ background: '#FFFDF9', border: '1.5px solid #EDE0D4' }}
    >
      <h2 className="text-xl font-semibold mb-4" style={{ color: '#3D2C2C' }}>{title}</h2>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={() => document.getElementById(`${title.toLowerCase().replace(/ /g, '-')}-file-input`)?.click()}
        className={`border-2 border-dashed rounded-xl p-6 w-full h-64 flex flex-col items-center justify-center text-center transition-all cursor-pointer`}
        style={
          error
            ? { borderColor: '#E8A4B8', background: '#FFF5F7' }
            : {
                borderColor: '#D9C8BC',
                background: '#FAF7F2',
              }
        }
        onMouseEnter={(e) => {
          if (!error) {
            (e.currentTarget as HTMLDivElement).style.borderColor = '#E8A4B8';
            (e.currentTarget as HTMLDivElement).style.background = '#FFF5F7';
          }
        }}
        onMouseLeave={(e) => {
          if (!error) {
            (e.currentTarget as HTMLDivElement).style.borderColor = '#D9C8BC';
            (e.currentTarget as HTMLDivElement).style.background = '#FAF7F2';
          }
        }}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="text-3xl">🖼️</div>
            <p className="text-sm" style={{ color: '#8C7B72' }}>
              Drag and drop an image here, or click to select
            </p>
            <p className="text-xs" style={{ color: '#B0A099' }}>
              JPG, PNG, WEBP up to {maxSizeMB}MB
            </p>
          </div>
        )}
        <input
          id={`${title.toLowerCase().replace(/ /g, '-')}-file-input`}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={onFileChange}
          className="hidden"
        />
      </div>
      {error && <p className="text-sm mt-2" style={{ color: '#C47A90' }}>{error}</p>}
      {file && !error && (
        <p className="text-sm mt-2" style={{ color: '#9DB8A0' }}>✓ {file.name}</p>
      )}
    </div>
  );
}
