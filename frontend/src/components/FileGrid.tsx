'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  File,
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
        className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px]"
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
              'w-full flex items-center space-x-2 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors duration-150',
              action.danger && 'text-red-600 hover:bg-red-50'
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
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
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
              className="group relative bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
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
                <p className="text-sm font-medium text-gray-900 truncate w-full text-center">
                  {folder.name}
                </p>
                <p className="text-xs text-gray-500">
                  {folder.createdAt.toLocaleDateString()}
                </p>
              </div>
              <button
                className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRightClick(e, 'folder', folder.id);
                }}
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
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
              className="group relative bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => onFileClick?.(file)}
              onContextMenu={(e) => handleRightClick(e, 'file', file.id)}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  {file.thumbnailUrl ? (
                    <img
                      src={file.thumbnailUrl}
                      alt={file.name}
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
                <p className="text-sm font-medium text-gray-900 truncate w-full text-center">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRightClick(e, 'file', file.id);
                }}
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
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
    <div className="relative">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modified
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
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
                    {folder.updatedAt.toLocaleDateString()}
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
                    {file.updatedAt.toLocaleDateString()}
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
