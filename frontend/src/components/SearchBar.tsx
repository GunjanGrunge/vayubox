'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, File, Folder } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

// Helper function to safely format dates
const formatDate = (dateValue: string | Date): string => {
  if (!dateValue) return 'Unknown';
  
  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return date.toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
};

interface SearchResult {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  modifiedAt: Date;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onResultClick: (result: SearchResult) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onResultClick,
  className,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Project files',
    'Images',
    'Documents',
  ]);
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock search results - in real app, this would come from your search API
  const mockResults: SearchResult[] = [
    {
      id: '1',
      name: 'project-presentation.pptx',
      type: 'file',
      path: '/Documents/Work',
      size: 2048000,
      modifiedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'vacation-photos',
      type: 'folder',
      path: '/Photos',
      modifiedAt: new Date('2024-01-10'),
    },
    {
      id: '3',
      name: 'financial-report-2024.pdf',
      type: 'file',
      path: '/Documents/Finance',
      size: 1024000,
      modifiedAt: new Date('2024-01-12'),
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    
    if (value.length > 0) {
      // Filter mock results based on query
      const filtered = mockResults.filter(result =>
        result.name.toLowerCase().includes(value.toLowerCase()) ||
        result.path.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
    
    onSearch(value);
  };

  const handleResultClick = (result: SearchResult) => {
    onResultClick(result);
    setQuery(result.name);
    setIsOpen(false);
    
    // Add to recent searches if not already present
    if (!recentSearches.includes(result.name)) {
      setRecentSearches(prev => [result.name, ...prev.slice(0, 4)]);
    }
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
    onSearch(search);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    onSearch('');
  };

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search files and folders..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-primary-black/90 backdrop-blur-sm rounded-lg shadow-xl border border-primary-purple/30 z-50 max-h-80 overflow-y-auto glow"
          >
            {query.length === 0 ? (
              // Recent searches
              <div className="p-4">
                <h4 className="text-sm font-medium text-primary-yellow mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Recent searches
                </h4>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(search)}
                      className="w-full text-left px-3 py-2 text-sm text-primary-yellow/80 hover:bg-primary-purple/20 rounded-md transition-colors duration-150"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            ) : results.length > 0 ? (
              // Search results
              <div className="p-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2 px-2">
                  Search results
                </h4>
                <div className="space-y-1">
                  {results.map((result) => (
                    <motion.button
                      key={result.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-md transition-colors duration-150"
                    >
                      <div className="flex items-center space-x-3">
                        {result.type === 'folder' ? (
                          <Folder className="h-5 w-5 text-primary-purple" />
                        ) : (
                          <File className="h-5 w-5 text-gray-500" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {result.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {result.path}
                          </p>
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(result.modifiedAt)}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : query.length > 0 ? (
              // No results
              <div className="p-8 text-center">
                <Search className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  No results found for "{query}"
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Try adjusting your search terms
                </p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { SearchBar };
