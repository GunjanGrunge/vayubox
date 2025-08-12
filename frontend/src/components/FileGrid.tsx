'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Folder,
  MoreVertical,
  Star,
  Download,
  Edit2,
  Trash2,
  Move,
  Eye,
} from 'lucide-react';
import { FileItem, Folder as FolderType } from '@/types';
import { formatFileSize, getFileIcon } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Helper function to safely format dates
const formatDate = (dateValue: string | Date): string => {
  if (!dateValue) return 'Unknown';
  
  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return date.toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
};

interface FileGridProps {
  files: FileItem[];
  folders: FolderType[];
  onFileClick?: (file: FileItem) => void;
  onFolderClick?: (folder: FolderType) => void;
  onFileAction?: (action: string, fileId: string) => void;
  onFolderAction?: (action: string, folderId: string) => void;
  viewMode?: 'grid' | 'list';
}

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  actions: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
  }>;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ isOpen, position, onClose, actions }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed z-50 bg-primary-black rounded-lg shadow-xl border border-primary-purple/30 py-1 min-w-[160px] glow"
        style={{ left: position.x, top: position.y }}
      >
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              action.onClick();
              onClose();
            }}
            className={cn(
              'w-full flex items-center space-x-2 px-3 py-2 text-sm text-left text-primary-yellow hover:bg-primary-purple/20 transition-colors duration-150',
              action.danger && 'text-red-400 hover:bg-red-500/20'
            )}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </motion.div>
    </>
  );
};

const FileGrid: React.FC<FileGridProps> = ({
  files,
  folders,
  onFileClick,
  onFolderClick,
  onFileAction,
  onFolderAction,
  viewMode = 'grid',
}) => {
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    type: 'file' | 'folder';
    id: string;
  }>({ isOpen: false, position: { x: 0, y: 0 }, type: 'file', id: '' });

  const handleRightClick = (
    e: React.MouseEvent,
    type: 'file' | 'folder',
    id: string
  ) => {
    e.preventDefault();
    
    const menuWidth = 160; // min-w-[160px] from context menu
    const menuHeight = 200; // approximate height for menu items
    
    let x = e.clientX;
    let y = e.clientY;
    
    // Adjust position if menu would go off screen
    if (x + menuWidth > window.innerWidth) {
      x = e.clientX - menuWidth;
    }
    
    if (y + menuHeight > window.innerHeight) {
      y = e.clientY - menuHeight;
    }
    
    // Ensure menu doesn't go off the left or top of screen
    x = Math.max(10, x);
    y = Math.max(10, y);
    
    setContextMenu({
      isOpen: true,
      position: { x, y },
      type,
      id,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, isOpen: false });
  };

  const getFileActions = (fileId: string) => [
    {
      label: 'Preview',
      icon: <Eye className="h-4 w-4" />,
      onClick: () => onFileAction?.('preview', fileId),
    },
    {
      label: 'Download',
      icon: <Download className="h-4 w-4" />,
      onClick: () => onFileAction?.('download', fileId),
    },
    {
      label: 'Rename',
      icon: <Edit2 className="h-4 w-4" />,
      onClick: () => onFileAction?.('rename', fileId),
    },
    {
      label: 'Move',
      icon: <Move className="h-4 w-4" />,
      onClick: () => onFileAction?.('move', fileId),
    },
    {
      label: 'Star',
      icon: <Star className="h-4 w-4" />,
      onClick: () => onFileAction?.('star', fileId),
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onFileAction?.('delete', fileId),
      danger: true,
    },
  ];

  const getFolderActions = (folderId: string) => [
    {
      label: 'Open',
      icon: <Eye className="h-4 w-4" />,
      onClick: () => onFolderAction?.('open', folderId),
    },
    {
      label: 'Rename',
      icon: <Edit2 className="h-4 w-4" />,
      onClick: () => onFolderAction?.('rename', folderId),
    },
    {
      label: 'Move',
      icon: <Move className="h-4 w-4" />,
      onClick: () => onFolderAction?.('move', folderId),
    },
    {
      label: 'Star',
      icon: <Star className="h-4 w-4" />,
      onClick: () => onFolderAction?.('star', folderId),
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onFolderAction?.('delete', folderId),
      danger: true,
    },
  ];

  if (viewMode === 'grid') {
    return (
      <div className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {/* Folders */}
          {folders.map((folder, index) => (
            <motion.div
              key={folder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-primary-black/50 backdrop-blur-sm rounded-xl border border-primary-purple/30 p-4 hover:shadow-lg hover:border-primary-purple/50 transition-all duration-200 cursor-pointer glow"
              onClick={() => onFolderClick?.(folder)}
              onContextMenu={(e) => handleRightClick(e, 'folder', folder.id)}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <Folder className="h-12 w-12 text-primary-purple" />
                  {folder.isStarred && (
                    <Star className="h-4 w-4 text-primary-yellow absolute -top-1 -right-1 fill-current" />
                  )}
                </div>
                <p className="text-sm font-medium text-primary-yellow truncate w-full text-center">
                  {folder.name}
                </p>
                <p className="text-xs text-primary-yellow/70">
                  {formatDate(folder.createdAt)}
                </p>
              </div>
              <button
                className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-primary-purple/20 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRightClick(e, 'folder', folder.id);
                }}
              >
                <MoreVertical className="h-4 w-4 text-primary-yellow/70" />
              </button>
            </motion.div>
          ))}

          {/* Files */}
          {files.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (folders.length + index) * 0.05 }}
              className="group relative bg-primary-black/50 backdrop-blur-sm rounded-xl border border-primary-purple/30 p-4 hover:shadow-lg hover:border-primary-purple/50 transition-all duration-200 cursor-pointer glow"
              onClick={() => onFileClick?.(file)}
              onContextMenu={(e) => handleRightClick(e, 'file', file.id)}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  {file.thumbnailUrl ? (
                    <Image
                      src={file.thumbnailUrl}
                      alt={file.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-2xl">
                      {getFileIcon(file.name)}
                    </div>
                  )}
                  {file.isStarred && (
                    <Star className="h-4 w-4 text-primary-yellow absolute -top-1 -right-1 fill-current" />
                  )}
                </div>
                <p className="text-sm font-medium text-primary-yellow truncate w-full text-center">
                  {file.name}
                </p>
                <p className="text-xs text-primary-yellow/70">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-primary-purple/20 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRightClick(e, 'file', file.id);
                }}
              >
                <MoreVertical className="h-4 w-4 text-primary-yellow/70" />
              </button>
            </motion.div>
          ))}
        </div>

        <ContextMenu
          isOpen={contextMenu.isOpen}
          position={contextMenu.position}
          onClose={closeContextMenu}
          actions={
            contextMenu.type === 'file'
              ? getFileActions(contextMenu.id)
              : getFolderActions(contextMenu.id)
          }
        />
      </div>
    );
  }

  // List view
  return (
    <div className="relative overflow-hidden">
      <div className="bg-primary-black/50 backdrop-blur-sm rounded-xl border border-primary-purple/30 overflow-hidden glow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-primary-purple/20">
            <thead className="bg-primary-purple/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-yellow uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-yellow uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-yellow uppercase tracking-wider">
                  Modified
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-primary-black/30 divide-y divide-primary-purple/20">
              {folders.map((folder) => (
                <tr
                  key={folder.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onFolderClick?.(folder)}
                  onContextMenu={(e) => handleRightClick(e, 'folder', folder.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Folder className="h-5 w-5 text-primary-purple mr-3" />
                      <div className="text-sm font-medium text-gray-900">
                        {folder.name}
                      </div>
                      {folder.isStarred && (
                        <Star className="h-4 w-4 text-primary-yellow ml-2 fill-current" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    —
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(folder.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRightClick(e, 'folder', folder.id);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {files.map((file) => (
                <tr
                  key={file.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onFileClick?.(file)}
                  onContextMenu={(e) => handleRightClick(e, 'file', file.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 mr-3 flex items-center justify-center text-lg">
                        {getFileIcon(file.name)}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {file.name}
                      </div>
                      {file.isStarred && (
                        <Star className="h-4 w-4 text-primary-yellow ml-2 fill-current" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(file.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRightClick(e, 'file', file.id);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={closeContextMenu}
        actions={
          contextMenu.type === 'file'
            ? getFileActions(contextMenu.id)
            : getFolderActions(contextMenu.id)
        }
      />
    </div>
  );
};

export { FileGrid };
