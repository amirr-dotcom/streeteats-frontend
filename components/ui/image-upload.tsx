'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './button';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Upload Image',
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  },
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError('');
      setUploading(true);

      try {
        // Convert to base64 for now (in production, upload to cloud storage)
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          onChange(base64String);
          setUploading(false);
        };
        reader.onerror = () => {
          setError('Failed to read file');
          setUploading(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError('Failed to upload image');
        setUploading(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={uploading} />
        {value ? (
          <div className="space-y-2">
            <img
              src={value}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg object-cover"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click or drag to replace
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-400">
              {isDragActive
                ? 'Drop the image here'
                : 'Drag & drop an image here, or click to select'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              PNG, JPG, GIF, WEBP up to 5MB
            </p>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {uploading && (
        <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
      )}
      {value && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange('')}
          disabled={uploading}
        >
          Remove Image
        </Button>
      )}
    </div>
  );
}

