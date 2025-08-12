'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onItemClick: (item: BreadcrumbItem) => void;
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  onItemClick,
  className,
}) => {
  // Always include home as the first item
  const allItems: BreadcrumbItem[] = [
    { id: 'home', name: 'Home', path: '/' },
    ...items,
  ];

  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)}>
      {allItems.map((item, index) => (
        <React.Fragment key={item.id}>
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onItemClick(item)}
            className={cn(
              'flex items-center px-2 py-1 rounded-md transition-colors duration-200',
              index === allItems.length - 1
                ? 'text-gray-900 font-medium cursor-default'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            )}
            disabled={index === allItems.length - 1}
          >
            {index === 0 ? (
              <Home className="h-4 w-4" />
            ) : (
              <span className="truncate max-w-32">{item.name}</span>
            )}
          </motion.button>
          
          {index < allItems.length - 1 && (
            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export { Breadcrumb };
