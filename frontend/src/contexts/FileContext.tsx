'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { FileItem, Folder, SearchFilters, ViewMode, SortBy, SortOrder, UploadProgress } from '@/types';
import { useAuth } from './SimpleAuthContext';
import { S3Service } from '@/lib/s3Service';
import toast from '@/lib/toast';

interface FileContextType {
  files: FileItem[];
  folders: Folder[];
  currentFolder: Folder | null;
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  searchFilters: SearchFilters;
  loading: boolean;
  uploadProgresses: UploadProgress[];
  
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
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ query: '' });
  const [loading, setLoading] = useState(false);
  const [uploadProgresses, setUploadProgresses] = useState<UploadProgress[]>([]);

  // Load files from S3 directly
  const loadFiles = useCallback(async (folderId?: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const prefix = folderId ? `${folderId}/` : '';
      const s3Files = await S3Service.listFiles(prefix);
      
      const filesWithUrls = await Promise.all(
        s3Files
          .filter((item): item is { Key?: string; Size?: number; LastModified?: Date } => 'Key' in item)
          .map(async (s3File) => ({
            id: `file_${s3File.Key}`,
            name: s3File.Key?.split('/').pop() || 'Unknown',
            size: s3File.Size || 0,
            type: 'application/octet-stream',
            url: s3File.Key ? await S3Service.getPresignedUrl(s3File.Key) : '',
            s3Key: s3File.Key,
            folderId: folderId || undefined,
            uploadedAt: s3File.LastModified || new Date(),
            updatedAt: s3File.LastModified || new Date(),
            userId: user.email,
            tags: [] as string[],
            isStarred: false,
            path: s3File.Key || '',
          }))
      );
      
      setFiles(filesWithUrls);
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load folders from S3 - simplified version
  const loadFolders = useCallback(async (parentId?: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const prefix = parentId ? `${parentId}/` : '';
      const s3Files = await S3Service.listFiles(prefix);
      
      // Extract folder names from S3 prefixes - check for CommonPrefixes instead of Prefix
      const folderPrefixes = s3Files
        .filter((item) => 'Prefix' in item && item.Prefix)
        .map((item) => {
          const prefix = 'Prefix' in item ? item.Prefix! : '';
          const folderName = prefix.replace(/\/$/, '').split('/').pop() || 'Unknown';
          const folderPath = prefix.replace(/\/$/, '');
          
          return {
            id: `folder_${prefix}`,
            name: folderName,
            parentId: parentId,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: user.email,
            isStarred: false,
            path: folderPath,
          } as Folder;
        });
      
      setFolders(folderPrefixes);
    } catch (error) {
      console.error('Error loading folders:', error);
      toast.error('Failed to load folders');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Upload files using S3 directly
  const uploadFiles = useCallback(async (files: File[], folderId?: string) => {
    if (!user) return;

    const newProgresses: UploadProgress[] = files.map((file) => ({
      fileId: Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadProgresses((prev) => [...prev, ...newProgresses]);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progress = newProgresses[i];
        
        try {
          // Generate S3 key with folder structure
          const s3Key = folderId ? `${folderId}/${file.name}` : file.name;
          
          // Upload to S3
          const url = await S3Service.uploadFile(file, s3Key, file.type);
          
          // Update progress to 100%
          setUploadProgresses((prev) =>
            prev.map((p) =>
              p.fileId === progress.fileId
                ? { ...p, progress: 100, status: 'completed' }
                : p
            )
          );

          // Create file item and add to state
          const newFile: FileItem = {
            id: progress.fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            url: url,
            s3Key: s3Key,
            uploadedAt: new Date(),
            updatedAt: new Date(),
            userId: user.email,
            folderId: folderId,
            tags: [],
            isStarred: false,
            path: s3Key,
          };

          setFiles((prev) => [...prev, newFile]);

        } catch (uploadError) {
          console.error(`Error uploading ${file.name}:`, uploadError);
          setUploadProgresses((prev) =>
            prev.map((p) =>
              p.fileId === progress.fileId
                ? { ...p, status: 'error', error: `Failed to upload ${file.name}` }
                : p
            )
          );
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      // Clear completed/error uploads after 3 seconds
      setTimeout(() => {
        const completedIds = newProgresses.map(p => p.fileId);
        setUploadProgresses((prev) => 
          prev.filter((p) => !completedIds.includes(p.fileId))
        );
      }, 3000);

      toast.success(`Successfully uploaded ${files.length} file(s)`);
      
      // Reload files to refresh the view
      await loadFiles(folderId);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    }
  }, [user, loadFiles]);

  // Create folder locally (for static deployment)
  const createFolder = useCallback(async (name: string, parentId?: string) => {
    if (!user) return;
    
    try {
      // Create a virtual folder
      const folderPath = parentId ? `${parentId}/${name}` : name;
      const newFolder: Folder = {
        id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        parentId,
        userId: user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        isStarred: false,
        path: folderPath,
      };

      // Add new folder to current state
      setFolders(prev => [...prev, newFolder]);
      toast.success(`Folder "${name}" created successfully`);
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  }, [user]);

  // Delete file using S3 directly
  const deleteFile = useCallback(async (fileId: string) => {
    try {
      // Find the file to get its S3 key
      const file = files.find(f => f.id === fileId);
      if (!file) {
        toast.error('File not found');
        return;
      }

      // Delete from S3
      await S3Service.deleteFile(file.s3Key || file.name);
      
      // Remove from local state
      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success('File deleted successfully');
      
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  }, [files]);

  // Delete folder locally (virtual folders)
  const deleteFolder = useCallback(async (folderId: string) => {
    try {
      // Update state - remove folder
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      toast.success('Folder deleted successfully');
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  }, []);

  // Rename file using S3 directly
  const renameFile = useCallback(async (fileId: string, newName: string) => {
    if (!user) return;
    
    try {
      // Find the file to get its s3Key
      const file = files.find(f => f.id === fileId);
      if (!file || !file.s3Key) {
        toast.error('File not found');
        return;
      }

      // Rename in S3
      const newS3Key = await S3Service.renameFile(file.s3Key, newName);
      
      // Update the file in state with new name and s3Key
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, name: newName, s3Key: newS3Key, path: newS3Key }
          : f
      ));
      toast.success('File renamed successfully');
      
    } catch (error) {
      console.error('Error renaming file:', error);
      toast.error('Failed to rename file');
    }
  }, [user, files]);

  // Rename folder locally (virtual folders)
  const renameFolder = useCallback(async (folderId: string, newName: string) => {
    try {
      // Update state
      setFolders(prev => prev.map(folder => 
        folder.id === folderId ? { ...folder, name: newName, path: folder.path.replace(/[^/]*$/, newName) } : folder
      ));
      toast.success('Folder renamed successfully');
    } catch (error) {
      console.error('Error renaming folder:', error);
      toast.error('Failed to rename folder');
    }
  }, []);

  // Move file using S3 directly
  const moveFile = useCallback(async (fileId: string, newFolderId?: string) => {
    if (!user) return;
    
    try {
      // Find the file to get its s3Key
      const file = files.find(f => f.id === fileId);
      if (!file || !file.s3Key) {
        toast.error('File not found');
        return;
      }

      // Generate new S3 key with new folder path
      const fileName = file.name;
      const newS3Key = newFolderId ? `${newFolderId}/${fileName}` : fileName;
      
      // Move in S3
      await S3Service.moveFile(file.s3Key, newS3Key);
      
      // Update the file in state with new folderId and s3Key
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, folderId: newFolderId, s3Key: newS3Key, path: newS3Key }
          : f
      ));
      toast.success('File moved successfully');
      
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
    viewMode,
    sortBy,
    sortOrder,
    searchFilters,
    loading,
    uploadProgresses,
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
