'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { formatFileSize } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { showToast } from '@/lib/toast';

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
    
    if (acceptedFiles.length > 0) {
      showToast.success(`${acceptedFiles.length} file(s) added successfully`);
    }
  }, [selectedFiles, maxFiles, onFilesSelect]);

  const removeFile = (index: number) => {
    const removedFile = selectedFiles[index];
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelect(newFiles);
    showToast.success(`Removed ${removedFile.name}`);
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
          'relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 p-4 sm:p-6 lg:p-8',
          isDragActive
            ? 'border-primary-purple bg-primary-purple bg-opacity-10 scale-105 glow'
            : 'border-primary-purple/30 hover:border-primary-purple hover:bg-primary-purple/5',
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
                'h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 transition-colors duration-300',
                isDragActive ? 'text-primary-purple' : 'text-primary-yellow/60'
              )}
            />
          </motion.div>
          
          <h3 className="text-base sm:text-lg font-semibold text-primary-yellow mb-2">
            {isDragActive ? 'Drop files here' : 'Upload your files'}
          </h3>
          
          <p className="text-xs sm:text-sm text-primary-yellow/70 mb-4 px-2">
            Drag and drop files here, or click to browse
          </p>
          
          <Button 
            variant="outline" 
            size="sm" 
            type="button"
            className="border-primary-purple/30 text-primary-yellow hover:bg-primary-purple/20"
          >
            Choose Files
          </Button>
          
          <p className="text-xs text-primary-yellow/50 mt-2 px-2">
            Max {maxFiles} files, up to {formatFileSize(maxSize)} each
          </p>
        </div>
      </div>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
        >
          <h4 className="text-sm font-medium text-red-400 mb-2">
            Some files were rejected:
          </h4>
          <ul className="text-sm text-red-300 space-y-1">
            {fileRejections.map(({ file, errors }, index) => (
              <li key={index} className="text-xs sm:text-sm">
                {file.name}: {errors.map(e => e.message).join(', ')}
              </li>
            ))}
          </ul>
        </motion.div>
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
            <h4 className="text-sm font-medium text-primary-yellow mb-3">
              Selected Files ({selectedFiles.length})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 bg-primary-purple/10 border border-primary-purple/20 rounded-lg"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <File className="h-5 w-5 text-primary-purple flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-primary-yellow truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-primary-yellow/70">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 text-primary-yellow/60 hover:text-primary-pink transition-colors duration-200 flex-shrink-0 ml-2"
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
