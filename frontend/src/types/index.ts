export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  updatedAt: Date;
  userId: string;
  folderId?: string;
  tags: string[];
  isStarred: boolean;
  path: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  color?: string;
  isStarred: boolean;
  path: string;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface SearchFilters {
  query: string;
  fileType?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  isStarred?: boolean;
  folderId?: string;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'date' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';
