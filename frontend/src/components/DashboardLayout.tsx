'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Search,
  Upload,
  Grid3X3,
  List,
  FolderPlus,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { FileUpload } from '@/components/FileUpload';
import { FileGrid } from '@/components/FileGrid';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useFiles } from '@/contexts/SimpleFileContext';
import { cn } from '@/lib/utils';
import { Folder, FileItem } from '@/types';
import toast from '@/lib/toast';

const DashboardLayout: React.FC = () => {
  const { logout } = useAuth();
  const {
    files,
    folders,
    currentFolder,
    viewMode,
    setViewMode,
    loadFiles,
    loadFolders,
    uploadFiles,
    createFolder,
    setCurrentFolder,
    deleteFile,
    renameFile,
    moveFile,
    getTotalStorageUsed,
  } = useFiles();

  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // File action modals
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [selectedTargetFolder, setSelectedTargetFolder] = useState<string>('');

  // Helper function to format bytes into human readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate storage usage
  const totalStorageUsed = getTotalStorageUsed();
  const maxStorage = 10 * 1024 * 1024 * 1024; // 10 GB in bytes
  const storagePercentage = (totalStorageUsed / maxStorage) * 100;

  React.useEffect(() => {
    loadFiles();
    loadFolders();
  }, [loadFiles, loadFolders]);

  const handleUpload = (files: File[]) => {
    uploadFiles(files, currentFolder?.id);
    setShowUploadModal(false);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim(), currentFolder?.id);
      setNewFolderName('');
      setShowCreateFolderModal(false);
    }
  };

  const handleFolderClick = (folder: Folder) => {
    setCurrentFolder(folder);
    loadFiles(folder.id);
    loadFolders(folder.id);
  };

  const handleBackNavigation = () => {
    setCurrentFolder(null);
    loadFiles();
    loadFolders();
  };

  const handleFileAction = (action: string, fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    switch (action) {
      case 'delete':
        if (window.confirm('Are you sure you want to delete this file?')) {
          deleteFile(fileId);
        }
        break;
      case 'rename':
        setSelectedFileId(fileId);
        setNewFileName(file.name);
        setShowRenameModal(true);
        break;
      case 'move':
        setSelectedFileId(fileId);
        setSelectedTargetFolder('');
        setShowMoveModal(true);
        break;
      case 'download':
        handleFileDownload(file);
        break;
      case 'preview':
        handleFilePreview(file);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleFileDownload = async (file: FileItem) => {
    try {
      const response = await fetch(`/api/files/presigned?s3Key=${encodeURIComponent(file.s3Key || '')}&action=download`);
      const data = await response.json();
      
      if (data.success) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = data.presignedUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error('Failed to generate download link');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleFilePreview = async (file: FileItem) => {
    try {
      const response = await fetch(`/api/files/presigned?s3Key=${encodeURIComponent(file.s3Key || '')}&action=view`);
      const data = await response.json();
      
      if (data.success) {
        // Open presigned URL in new tab for preview
        window.open(data.presignedUrl, '_blank');
      } else {
        toast.error('Failed to generate preview link');
      }
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to preview file');
    }
  };

  const handleRenameSubmit = async () => {
    if (selectedFileId && newFileName.trim()) {
      await renameFile(selectedFileId, newFileName.trim());
      setShowRenameModal(false);
      setSelectedFileId(null);
      setNewFileName('');
    }
  };

  const handleMoveSubmit = async () => {
    if (selectedFileId && selectedTargetFolder) {
      await moveFile(selectedFileId, selectedTargetFolder);
      setShowMoveModal(false);
      setSelectedFileId(null);
      setSelectedTargetFolder('');
      // Refresh files to show updated structure
      loadFiles(currentFolder?.id);
    }
  };



  return (
    <div className="h-screen bg-primary-black flex">

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 bg-primary-black border-r border-primary-purple/20 flex-col hidden lg:flex"
      >
        {/* Logo */}
        <div className="p-6 border-b border-primary-purple/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <Image 
                src="/logo.png" 
                alt="Vayubox Logo" 
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-primary-yellow">Vayubox</span>
          </div>
        </div>

        {/* Navigation - Removed for simplicity */}

        {/* Storage Info */}
        <div className="p-4 border-t border-primary-purple/20">
          <div className="bg-primary-purple/10 rounded-lg p-4 border border-primary-purple/20">
            <h4 className="text-sm font-medium text-primary-yellow mb-2">Storage</h4>
            <div className="w-full bg-primary-black rounded-full h-2 border border-primary-purple/30">
              <div 
                className="bg-gradient-to-r from-primary-purple to-primary-pink h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-primary-yellow/70 mt-1">
              {formatBytes(totalStorageUsed)} of {formatBytes(maxStorage)} used
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-primary-black border-b border-primary-purple/20 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-yellow/60" />
                <Input
                  placeholder="Search files and folders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-primary-black border-primary-purple/30 text-primary-yellow placeholder:text-primary-yellow/50"
                />
              </div>

              {/* Desktop Actions */}
              <div className="hidden sm:flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateFolderModal(true)}
                  className="border-primary-purple/30 text-primary-yellow hover:bg-primary-purple/20"
                >
                  <FolderPlus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">New Folder</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowUploadModal(true)}
                  className="bg-primary-purple hover:bg-primary-pink text-primary-yellow glow-hover"
                >
                  <Upload className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Upload</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* View Toggle */}
              <div className="hidden sm:flex items-center bg-primary-purple/10 rounded-lg p-1 border border-primary-purple/30">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-md transition-all duration-200',
                    viewMode === 'grid'
                      ? 'bg-primary-purple text-primary-yellow shadow-sm glow'
                      : 'text-primary-yellow/60 hover:text-primary-yellow hover:bg-primary-purple/20'
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-md transition-all duration-200',
                    viewMode === 'list'
                      ? 'bg-primary-purple text-primary-yellow shadow-sm glow'
                      : 'text-primary-yellow/60 hover:text-primary-yellow hover:bg-primary-purple/20'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Simple Sign Out Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="text-primary-pink hover:bg-red-500/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex sm:hidden items-center justify-center space-x-4 mt-4 pt-4 border-t border-primary-purple/20">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateFolderModal(true)}
              className="flex-1 border-primary-purple/30 text-primary-yellow hover:bg-primary-purple/20"
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowUploadModal(true)}
              className="flex-1 bg-primary-purple hover:bg-primary-pink text-primary-yellow glow-hover"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="fade-in"
          >
            {/* Breadcrumb Navigation */}
            <div className="mb-6 flex items-center space-x-2 text-sm bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <button
                onClick={handleBackNavigation}
                className="flex items-center space-x-1 hover:text-primary-yellow transition-colors text-primary-yellow/70"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a3 3 0 00-3-3H8a3 3 0 01-3-3V7z" />
                </svg>
                <span>Home</span>
              </button>
              
              {currentFolder && (
                <>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-primary-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a3 3 0 00-3-3H8a3 3 0 01-3-3V7z" />
                    </svg>
                    <span className="text-primary-yellow font-medium">{currentFolder.name}</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-primary-yellow mb-2">
                {currentFolder ? `${currentFolder.name}` : 'All Files'}
              </h1>
              <p className="text-primary-yellow/70">
                {files.length + folders.length} items
              </p>
            </div>

            {/* Upload Guidelines */}
            <div className="mb-6 bg-primary-purple/10 border border-primary-purple/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-yellow mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-primary-yellow mb-1">💡 Upload Tips</h3>
                  <p className="text-xs text-primary-yellow/70">
                    To upload files to a folder: <strong>1)</strong> Navigate inside the folder and click Upload, or <strong>2)</strong> Upload files here and then move them to the desired folder using the context menu.
                  </p>
                </div>
              </div>
            </div>

            <FileGrid
              files={files}
              folders={folders}
              viewMode={viewMode}
              onFileClick={(file) => console.log('File clicked:', file)}
              onFolderClick={handleFolderClick}
              onFileAction={handleFileAction}
              onFolderAction={(action, folderId) => console.log('Folder action:', action, folderId)}
            />
          </motion.div>
        </main>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Files"
        size="lg"
      >
        <FileUpload onFilesSelect={handleUpload} />
      </Modal>

      {/* Create Folder Modal */}
      <Modal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        title="Create New Folder"
      >
        <div className="space-y-4">
          <Input
            label="Folder Name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Enter folder name"
            autoFocus
          />
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowCreateFolderModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Create Folder
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rename File Modal */}
      <Modal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        title="Rename File"
      >
        <div className="space-y-4">
          <Input
            label="New File Name"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="Enter new file name"
            autoFocus
          />
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowRenameModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit} disabled={!newFileName.trim()}>
              Rename
            </Button>
          </div>
        </div>
      </Modal>

      {/* Move File Modal */}
      <Modal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        title="Move File"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-yellow mb-2">
              Select Destination Folder
            </label>
            <select
              value={selectedTargetFolder}
              onChange={(e) => setSelectedTargetFolder(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-primary-purple focus:border-transparent"
            >
              <option value="">Root Folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowMoveModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleMoveSubmit}>
              Move
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { DashboardLayout };
