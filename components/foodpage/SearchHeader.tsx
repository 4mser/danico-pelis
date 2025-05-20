// src/components/SearchHeader.tsx
'use client';

import React, { FC } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';

interface SearchHeaderProps {
  rawSearch: string;
  onRawSearchChange: (v: string) => void;
  onOpenFilters: () => void;
}

export const SearchHeader: FC<SearchHeaderProps> = ({
  rawSearch,
  onRawSearchChange,
  onOpenFilters
}) => {
  return (
    <header className="sticky top-0 z-20 bg-gray-800 p-4 flex items-center space-x-3 shadow-xl">
      <div className="relative flex-1">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-full focus:outline-none"
          placeholder="Buscar producto..."
          value={rawSearch}
          onChange={e => onRawSearchChange(e.target.value)}
        />
      </div>
      <button
        onClick={onOpenFilters}
        className="p-2 bg-purple-600 rounded-full hover:bg-purple-500"
      >
        <FiFilter className="text-white text-xl" />
      </button>
    </header>
  );
};
