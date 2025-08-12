'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { FileItem, Folder, UploadProgress, SearchFilters, ViewMode, SortBy, SortOrder } from '@/types';
import { useAuth } from './SimpleAuthContext';
import toast from '@/lib/toast';

interface FileContextType {
  files: FileItem[];
  folders: Folder[];
  currentFolder: Folder | null;
  uploadProgress: UploadProgress[];
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  searchFilters: SearchFilters;
  loading: boolean;
  
  // Actions
  loadFiles: (folderId?: string) => Promise<void>;
  loadFolders: (parentId?: string) => Promise<void>;
  uploadFiles: (files: File[], folderId?: string) => Promise<void>;
  createFolder: (name: string, parentId?: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  renameFile: (fileId: string, newName: string) => Promise<void>;
  renameFolder: (folderId: string, newName: string) => Promise<void>;
  moveFile: (fileId: string, newFolderId?: string) => Promise<void>;
  moveFolder: (folderId: string, newParentId?: string) => Promise<void>;
  toggleFavorite: (fileId: string) => Promise<void>;
  starFile: (fileId: string) => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  setSorting: (sortBy: SortBy, order: SortOrder) => void;
  setSearchFilters: (filters: SearchFilters) => void;
  setCurrentFolder: (folder: Folder | null) => void;
  getFilesByType: (type: string) => FileItem[];
  getRecentFiles: (limit?: number) => FileItem[];
  getFavoriteFiles: () => FileItem[];
  getFileSize: (fileId: string) => number;
  getTotalStorageUsed: () => number;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [uploadProgress, _setUploadProgress] = useState<UploadProgress[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ query: '' });
  const [loading, setLoading] = useState(false);

  // Load files from API
  const loadFiles = useCallback(async (folderId?: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const url = `/api/files${folderId ? `?folderId=${folderId}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setFiles(data.files);
        // toast.success('Files loaded successfully'); // Removing unnecessary toast
      } else {
        toast.error(data.message || 'Failed to load files');
      }
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load folders from API
  const loadFolders = useCallback(async (parentId?: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const url = `/api/folders${parentId ? `?parentId=${parentId}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setFolders(data.folders);
        // toast.success('Folders loaded successfully'); // Removing unnecessary toast
      } else {
        toast.error(data.message || 'Failed to load folders');
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      toast.error('Failed to load folders');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Upload files to AWS S3 via API
  const uploadFiles = useCallback(async (files: File[], folderId?: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      if (folderId) formData.append('folderId', folderId);
      
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add uploaded files to current state
        setFiles(prev => [...prev, ...data.files]);
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to upload files');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create folder via API
  const createFolder = useCallback(async (name: string, parentId?: string) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, parentId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add new folder to current state
        setFolders(prev => [...prev, data.folder]);
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  }, [user]);

  // Delete file via API
  const deleteFile = useCallback(async (fileId: string) => {
    try {
      // Find the file to get its S3 key
      const file = files.find(f => f.id === fileId);
      if (!file) {
        toast.error('File not found');
        return;
      }

      const response = await fetch(`/api/files?s3Key=${encodeURIComponent(file.s3Key || file.name)}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove file from current state
        setFiles(prev => prev.filter(f => f.id !== fileId));
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  }, [files]);

  // Delete folder
  const deleteFolder = useCallback(async (folderId: string) => {
    try {
      // Update localStorage
      const storedFolders = localStorage.getItem('dropaws_folders');
      const allFolders: Folder[] = storedFolders ? JSON.parse(storedFolders) : [];
      const updatedFolders = allFolders.filter(folder => folder.id !== folderId);
      localStorage.setItem('dropaws_folders', JSON.stringify(updatedFolders));
      
      // Update state
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      toast.success('Folder deleted successfully');
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  }, []);

  // Rename file via API
  const renameFile = useCallback(async (fileId: string, newName: string) => {
    if (!user) return;
    
    try {
      // Find the file to get its s3Key
      const file = files.find(f => f.id === fileId);
      if (!file || !file.s3Key) {
        toast.error('File not found');
        return;
      }

      const response = await fetch('/api/files', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'rename',
          s3Key: file.s3Key,
          newName,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the file in state with new name and s3Key
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, name: newName, s3Key: data.newS3Key }
            : f
        ));
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to rename file');
      }
    } catch (error) {
      console.error('Error renaming file:', error);
      toast.error('Failed to rename file');
    }
  }, [user, files]);

  // Rename folder
  const renameFolder = useCallback(async (folderId: string, newName: string) => {
    try {
      // Update localStorage
      const storedFolders = localStorage.getItem('dropaws_folders');
      const allFolders: Folder[] = storedFolders ? JSON.parse(storedFolders) : [];
      const updatedFolders = allFolders.map(folder => 
        folder.id === folderId ? { ...folder, name: newName } : folder
      );
      localStorage.setItem('dropaws_folders', JSON.stringify(updatedFolders));
      
      // Update state
      setFolders(prev => prev.map(folder => 
        folder.id === folderId ? { ...folder, name: newName } : folder
      ));
      toast.success('Folder renamed successfully');
    } catch (error) {
      console.error('Error renaming folder:', error);
      toast.error('Failed to rename folder');
    }
  }, []);

  // Move file via API
  const moveFile = useCallback(async (fileId: string, newFolderId?: string) => {
    if (!user) return;
    
    try {
      // Find the file to get its s3Key
      const file = files.find(f => f.id === fileId);
      if (!file || !file.s3Key) {
        toast.error('File not found');
        return;
      }

      const response = await fetch('/api/files', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'move',
          s3Key: file.s3Key,
          newFolderId,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the file in state with new folderId and s3Key
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, folderId: newFolderId, s3Key: data.newS3Key }
            : f
        ));
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to move file');
      }
    } catch (error) {
      console.error('Error moving file:', error);
      toast.error('Failed to move file');
    }
  }, [user, files]);

  // Move folder
  const moveFolder = useCallback(async (folderId: string, newParentId?: string) => {
    try {
      // For now, just update local state since we don't have API for moving
      setFolders(prev => prev.map(folder => 
        folder.id === folderId ? { ...folder, parentId: newParentId } : folder
      ));
      toast.success('Folder moved successfully');
    } catch (error) {
      console.error('Error moving folder:', error);
      toast.error('Failed to move folder');
    }
  }, []);

  // Toggle favorite (using isStarred)
  const toggleFavorite = useCallback(async (fileId: string) => {
    try {
      // For now, just update local state since we don't have API for favorites
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, isStarred: !file.isStarred } : file
      ));
      toast.success('File star status updated');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update star status');
    }
  }, []);

  // Star file (same as toggle favorite)
  const starFile = useCallback(async (fileId: string) => {
    try {
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, isStarred: !file.isStarred } : file
      ));
      toast.success('File star status updated');
    } catch (error) {
      console.error('Error starring file:', error);
      toast.error('Failed to update star status');
    }
  }, []);

  // Set sorting
  const setSorting = useCallback((newSortBy: SortBy, newOrder: SortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newOrder);
  }, []);

  // Utility functions
  const getFilesByType = useCallback((type: string) => {
    return files.filter(file => file.type.startsWith(type));
  }, [files]);

  const getRecentFiles = useCallback((limit = 10) => {
    return [...files]
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, limit);
  }, [files]);

  const getFavoriteFiles = useCallback(() => {
    return files.filter(file => file.isStarred);
  }, [files]);

  const getFileSize = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId);
    return file?.size || 0;
  }, [files]);

  const getTotalStorageUsed = useCallback(() => {
    return files.reduce((total, file) => total + (file.size || 0), 0);
  }, [files]);

  const value: FileContextType = {
    files,
    folders,
    currentFolder,
    uploadProgress,
    viewMode,
    sortBy,
    sortOrder,
    searchFilters,
    loading,
    loadFiles,
    loadFolders,
    uploadFiles,
    createFolder,
    deleteFile,
    deleteFolder,
    renameFile,
    renameFolder,
    moveFile,
    moveFolder,
    toggleFavorite,
    starFile,
    setViewMode,
    setSorting,
    setSearchFilters,
    setCurrentFolder,
    getFilesByType,
    getRecentFiles,
    getFavoriteFiles,
    getFileSize,
    getTotalStorageUsed,
  };

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
}

export function useFiles() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
}
