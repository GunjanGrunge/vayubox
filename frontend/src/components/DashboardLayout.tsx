'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Upload,
  Grid3X3,
  List,
  Filter,
  Plus,
  Star,
  Clock,
  FolderPlus,
  Bell,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { FileUpload } from '@/components/FileUpload';
import { FileGrid } from '@/components/FileGrid';
import { useAuth } from '@/contexts/AuthContext';
import { useFiles } from '@/contexts/FileContext';
import { ViewMode } from '@/types';
import { cn } from '@/lib/utils';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    files,
    folders,
    viewMode,
    setViewMode,
    loadFiles,
    loadFolders,
    uploadFiles,
    createFolder,
  } = useFiles();

  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  React.useEffect(() => {
    loadFiles();
    loadFolders();
  }, [loadFiles, loadFolders]);

  const handleUpload = (files: File[]) => {
    uploadFiles(files);
    setShowUploadModal(false);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowCreateFolderModal(false);
    }
  };

  const sidebarItems = [
    { icon: Clock, label: 'Recent', active: true },
    { icon: Star, label: 'Starred', active: false },
    { icon: FolderPlus, label: 'My Files', active: false },
  ];

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 bg-white border-r border-gray-200 flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-purple to-primary-pink rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-white">D</span>
            </div>
            <span className="text-xl font-bold text-gray-900">DropAws</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {sidebarItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200',
                  item.active
                    ? 'bg-primary-purple text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Storage Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Storage</h4>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-purple h-2 rounded-full w-3/4"></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              7.5 GB of 10 GB used
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search files and folders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateFolderModal(true)}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-md transition-colors duration-200',
                    viewMode === 'grid'
                      ? 'bg-white text-primary-purple shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-md transition-colors duration-200',
                    viewMode === 'list'
                      ? 'bg-white text-primary-purple shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-primary-purple rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.displayName?.charAt(0) || 'U'}
                    </span>
                  </div>
                </button>

                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  >
                    <div className="px-3 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.displayName}
                      </p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                    </div>
                    <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </button>
                    <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={logout}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Recent Files
              </h1>
              <p className="text-gray-600">
                {files.length + folders.length} items
              </p>
            </div>

            <FileGrid
              files={files}
              folders={folders}
              viewMode={viewMode}
              onFileClick={(file) => console.log('File clicked:', file)}
              onFolderClick={(folder) => console.log('Folder clicked:', folder)}
              onFileAction={(action, fileId) => console.log('File action:', action, fileId)}
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
    </div>
  );
};

export { DashboardLayout };
