'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { formatFileSize } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedFileTypes?: string[];
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelect,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedFileTypes = ['*/*'],
  className,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...selectedFiles, ...acceptedFiles].slice(0, maxFiles);
    setSelectedFiles(newFiles);
    onFilesSelect(newFiles);
  }, [selectedFiles, maxFiles, onFilesSelect]);

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelect(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
  });

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 p-8',
          isDragActive
            ? 'border-primary-purple bg-primary-purple bg-opacity-5 scale-105'
            : 'border-gray-300 hover:border-primary-purple hover:bg-gray-50',
          selectedFiles.length > 0 && 'border-primary-purple bg-primary-purple bg-opacity-5'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            animate={isDragActive ? { scale: 1.1, rotate: 10 } : { scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="mb-4"
          >
            <Upload
              className={cn(
                'h-12 w-12 transition-colors duration-300',
                isDragActive ? 'text-primary-purple' : 'text-gray-400'
              )}
            />
          </motion.div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isDragActive ? 'Drop files here' : 'Upload your files'}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop files here, or click to browse
          </p>
          
          <Button variant="outline" size="sm" type="button">
            Choose Files
          </Button>
          
          <p className="text-xs text-gray-500 mt-2">
            Max {maxFiles} files, up to {formatFileSize(maxSize)} each
          </p>
        </div>
      </div>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-2">
            Some files were rejected:
          </h4>
          <ul className="text-sm text-red-700 space-y-1">
            {fileRejections.map(({ file, errors }, index) => (
              <li key={index}>
                {file.name}: {errors.map(e => e.message).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Selected Files */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Selected Files ({selectedFiles.length})
            </h4>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { FileUpload };
