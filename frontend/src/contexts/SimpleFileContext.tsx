'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { FileItem, Folder } from '@/types';

interface FileContextType {
  files: FileItem[];
  folders: Folder[];
  currentPath: string;
  currentFolder: Folder | null;
  viewMode: 'grid' | 'list';
  loading: boolean;
  error: string | null;
  
  // Actions
  loadFolders: (path?: string) => Promise<void>;
  loadFiles: (path?: string) => Promise<void>;
  uploadFile: (file: File, folderPath?: string) => Promise<void>;
  uploadFiles: (files: File[], folderPath?: string) => Promise<void>;
  createFolder: (name: string, parentPath?: string) => Promise<void>;
  deleteItem: (path: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  renameItem: (oldPath: string, newName: string) => Promise<void>;
  renameFile: (fileId: string, newName: string) => Promise<void>;
  moveItem: (sourcePath: string, destinationPath: string) => Promise<void>;
  moveFile: (fileId: string, destinationPath: string) => Promise<void>;
  downloadFile: (filePath: string) => Promise<void>;
  setCurrentPath: (path: string) => void;
  setCurrentFolder: (folder: Folder | null) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  getTotalStorageUsed: () => number;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFolders = useCallback(async (path = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        action: 'list',
        path,
      });
      
      const response = await fetch(`/api/s3?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load folders: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const foldersWithIds = (data.folders || []).map((folder: {name: string, type: string, path: string}) => ({
        id: `folder_${folder.path}`,
        name: folder.name,
        parentId: undefined,
        userId: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        isStarred: false,
        path: folder.path,
      }));
      
      const filesWithIds = (data.files || []).map((file: {name: string, type: string, path: string, size: number, lastModified?: string}) => ({
        id: `file_${file.path}`,
        name: file.name,
        size: file.size,
        type: 'application/octet-stream',
        url: '',
        uploadedAt: new Date(file.lastModified || Date.now()),
        updatedAt: new Date(file.lastModified || Date.now()),
        userId: 'admin',
        tags: [],
        isStarred: false,
        path: file.path,
      }));
      
      setFolders(foldersWithIds);
      setFiles(filesWithIds);
      setCurrentPath(path);
    } catch (error) {
      console.error('Error loading folders:', error);
      setError(error instanceof Error ? error.message : 'Failed to load folders');
      setFolders([]);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (file: File, folderPath?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get presigned URL
      const response = await fetch('/api/s3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'upload',
          fileName: file.name,
          folderPath,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }
      
      const { url } = await response.json();
      
      // Upload file to S3
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: file,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }
      
      // Refresh the folder view
      await loadFolders(currentPath);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  }, [currentPath, loadFolders]);

  const createFolder = useCallback(async (name: string, parentPath?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/s3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createFolder',
          folderName: name,
          parentPath,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create folder');
      }
      
      // Refresh the folder view
      await loadFolders(currentPath);
    } catch (error) {
      console.error('Error creating folder:', error);
      setError(error instanceof Error ? error.message : 'Failed to create folder');
    } finally {
      setLoading(false);
    }
  }, [currentPath, loadFolders]);

  const deleteItem = useCallback(async (path: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/s3?path=${encodeURIComponent(path)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      
      // Refresh the folder view
      await loadFolders(currentPath);
    } catch (error) {
      console.error('Error deleting item:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  }, [currentPath, loadFolders]);

  const renameItem = useCallback(async (oldPath: string, newName: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/s3', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'rename',
          oldPath,
          newName,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to rename item');
      }
      
      // Refresh the folder view
      await loadFolders(currentPath);
    } catch (error) {
      console.error('Error renaming item:', error);
      setError(error instanceof Error ? error.message : 'Failed to rename item');
    } finally {
      setLoading(false);
    }
  }, [currentPath, loadFolders]);

  const moveItem = useCallback(async (sourcePath: string, destinationPath: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/s3', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'move',
          sourcePath,
          destinationPath,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to move item');
      }
      
      // Refresh the folder view
      await loadFolders(currentPath);
    } catch (error) {
      console.error('Error moving item:', error);
      setError(error instanceof Error ? error.message : 'Failed to move item');
    } finally {
      setLoading(false);
    }
  }, [currentPath, loadFolders]);

  const downloadFile = useCallback(async (filePath: string) => {
    try {
      const params = new URLSearchParams({
        action: 'download',
        path: filePath,
      });
      
      const response = await fetch(`/api/s3?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }
      
      const { url } = await response.json();
      
      // Open download URL in new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      setError(error instanceof Error ? error.message : 'Failed to download file');
    }
  }, []);

  // Helper functions for compatibility
  const loadFiles = loadFolders; // Same function
  const uploadFiles = async (files: File[], folderPath?: string) => {
    for (const file of files) {
      await uploadFile(file, folderPath);
    }
  };
  
  const deleteFile = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) await deleteItem(file.path);
  };
  
  const renameFile = async (fileId: string, newName: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) await renameItem(file.path, newName);
  };
  
  const moveFile = async (fileId: string, destinationPath: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) await moveItem(file.path, destinationPath);
  };
  
  const getTotalStorageUsed = () => {
    return files.reduce((total, file) => total + (file.size || 0), 0);
  };

  const value: FileContextType = {
    files,
    folders,
    currentPath,
    currentFolder,
    viewMode,
    loading,
    error,
    loadFolders,
    loadFiles,
    uploadFile,
    uploadFiles,
    createFolder,
    deleteItem,
    deleteFile,
    renameItem,
    renameFile,
    moveItem,
    moveFile,
    downloadFile,
    setCurrentPath,
    setCurrentFolder,
    setViewMode,
    getTotalStorageUsed,
  };

  return (
    <FileContext.Provider value={value}>
      {children}
    </FileContext.Provider>
  );
}

export function useFiles() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
}