// src/components/FiltersSheet.tsx
'use client';

import React, { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

type StatusFilter = 'all' | 'pending' | 'bought';
type HeartFilter  = 'none' | 'Barbara' | 'Nico' | 'Both';

interface FiltersSheetProps {
  isOpen: boolean;
  statusFilter: StatusFilter;
  heartFilter: HeartFilter;
  onClose: () => void;
  setStatus: (f: StatusFilter) => void;
  setHeart: (f: HeartFilter) => void;
}

export const FiltersSheet: FC<FiltersSheetProps> = ({
  isOpen,
  statusFilter,
  heartFilter,
  onClose,
  setStatus,
  setHeart
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full bg-gray-800 rounded-t-3xl p-6 space-y-6"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'tween' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex space-x-2">
            {(['pending','bought','all'] as StatusFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setStatus(f)}
                className={`flex-1 px-3 py-2 rounded-full text-center text-sm ${
                  statusFilter === f
                    ? 'bg-purple-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {f === 'pending' ? 'Pendientes'
                  : f === 'bought' ? 'Comprados'
                  : 'Todos'}
              </button>
            ))}
          </div>
          <div className="flex space-x-4 justify-center">
            {([
              { key: 'Barbara', icon: 'fluent-emoji:pink-heart',  label: 'Bárbara' },
              { key: 'Nico',     icon: 'fluent-emoji:light-blue-heart', label: 'Nico' },
              { key: 'Both',     icon: 'fluent-emoji:revolving-hearts', label: 'Ambos' },
            ] as const).map(f => (
              <button
                key={f.key}
                onClick={() => setHeart(heartFilter === f.key ? 'none' : f.key)}
                className={`flex-1 flex flex-col items-center p-2 rounded-lg ${
                  heartFilter === f.key
                    ? 'bg-pink-600/50'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <Icon icon={f.icon} width="28" height="28" />
                <span className="text-xs mt-1">{f.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 bg-purple-600 rounded-full hover:bg-purple-500"
          >
            Aplicar filtros
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
