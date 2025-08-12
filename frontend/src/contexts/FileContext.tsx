'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { FileItem, Folder, UploadProgress, SearchFilters, ViewMode, SortBy, SortOrder } from '@/types';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';

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
  toggleFileStar: (fileId: string) => Promise<void>;
  toggleFolderStar: (folderId: string) => Promise<void>;
  searchFiles: (filters: SearchFilters) => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  setSorting: (sortBy: SortBy, order: SortOrder) => void;
  setCurrentFolder: (folder: Folder | null) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function useFiles() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
}

export function FileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ query: '' });
  const [loading, setLoading] = useState(false);

  const loadFiles = useCallback(async (folderId?: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const filesRef = collection(db, 'files');
      const q = query(
        filesRef,
        where('userId', '==', user.uid),
        where('folderId', '==', folderId || null),
        orderBy('uploadedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const filesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as FileItem[];
      
      setFiles(filesData);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadFolders = useCallback(async (parentId?: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const foldersRef = collection(db, 'folders');
      const q = query(
        foldersRef,
        where('userId', '==', user.uid),
        where('parentId', '==', parentId || null),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const foldersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Folder[];
      
      setFolders(foldersData);
    } catch (error) {
      console.error('Error loading folders:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const uploadFiles = async (files: File[], folderId?: string) => {
    // This would integrate with AWS S3 upload logic
    // For now, we'll just create the file records
    console.log('Uploading files:', files, 'to folder:', folderId);
  };

  const createFolder = async (name: string, parentId?: string) => {
    if (!user) return;
    
    const newFolder: Omit<Folder, 'id'> = {
      name,
      parentId,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      isStarred: false,
      path: parentId ? `${currentFolder?.path || ''}/${name}` : name,
    };
    
    const docRef = await addDoc(collection(db, 'folders'), newFolder);
    setFolders(prev => [...prev, { ...newFolder, id: docRef.id }]);
  };

  const deleteFile = async (fileId: string) => {
    await deleteDoc(doc(db, 'files', fileId));
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const deleteFolder = async (folderId: string) => {
    await deleteDoc(doc(db, 'folders', folderId));
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
  };

  const renameFile = async (fileId: string, newName: string) => {
    await updateDoc(doc(db, 'files', fileId), {
      name: newName,
      updatedAt: new Date(),
    });
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, name: newName, updatedAt: new Date() } : file
    ));
  };

  const renameFolder = async (folderId: string, newName: string) => {
    await updateDoc(doc(db, 'folders', folderId), {
      name: newName,
      updatedAt: new Date(),
    });
    setFolders(prev => prev.map(folder => 
      folder.id === folderId ? { ...folder, name: newName, updatedAt: new Date() } : folder
    ));
  };

  const moveFile = async (fileId: string, newFolderId?: string) => {
    await updateDoc(doc(db, 'files', fileId), {
      folderId: newFolderId || null,
      updatedAt: new Date(),
    });
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, folderId: newFolderId, updatedAt: new Date() } : file
    ));
  };

  const moveFolder = async (folderId: string, newParentId?: string) => {
    await updateDoc(doc(db, 'folders', folderId), {
      parentId: newParentId || null,
      updatedAt: new Date(),
    });
    setFolders(prev => prev.map(folder => 
      folder.id === folderId ? { ...folder, parentId: newParentId, updatedAt: new Date() } : folder
    ));
  };

  const toggleFileStar = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    const newStarred = !file.isStarred;
    await updateDoc(doc(db, 'files', fileId), {
      isStarred: newStarred,
      updatedAt: new Date(),
    });
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, isStarred: newStarred, updatedAt: new Date() } : f
    ));
  };

  const toggleFolderStar = async (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    
    const newStarred = !folder.isStarred;
    await updateDoc(doc(db, 'folders', folderId), {
      isStarred: newStarred,
      updatedAt: new Date(),
    });
    setFolders(prev => prev.map(f => 
      f.id === folderId ? { ...f, isStarred: newStarred, updatedAt: new Date() } : f
    ));
  };

  const searchFiles = async (filters: SearchFilters) => {
    setSearchFilters(filters);
    // Implement search logic here
    console.log('Searching with filters:', filters);
  };

  const setSorting = (newSortBy: SortBy, order: SortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(order);
  };

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
    toggleFileStar,
    toggleFolderStar,
    searchFiles,
    setViewMode,
    setSorting,
    setCurrentFolder,
  };

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
}
