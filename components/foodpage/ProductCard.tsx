// src/components/ProductCard.tsx
'use client';

import React, { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { Icon } from '@iconify/react';
import { Spinner } from '@/app/spinner';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  isTogglingBought: boolean;
  onToggleBought: (p: Product) => void;
  onLike: (p: Product, who: 'Barbara' | 'Nico') => void;
  pickerId: string | null;
  setPickerId: (id: string | null) => void;
  onClick: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 16 },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export const ProductCard: FC<ProductCardProps> = ({
  product: p,
  isTogglingBought,
  onToggleBought,
  onLike,
  pickerId,
  setPickerId,
  onClick
}) => {
  const both = p.likeBarbara && p.likeNico;

  return (
    <motion.div
      onClick={onClick}
      className={
        `
        relative bg-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer
        ${p.bought ? 'bg-transparent shadow-none border border-dashed border-white/20' : ''}
      `}
      variants={itemVariants}
    >
      <img
        src={p.image}
        alt={p.name}
        className={
          `
          h-[147px] w-full object-cover transition-all duration-200
          ${p.bought ? 'filter grayscale' : ''}
        `}
      />

      <div className="absolute inset-0 flex justify-end items-start p-2 pointer-events-auto">
        <div className="flex flex-col items-end space-y-2">
          <button
            onClick={e => { e.stopPropagation(); onToggleBought(p); }}
            className={`p-2 rounded-full ${
              p.bought ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isTogglingBought
              ? <Spinner size="sm" />
              : <FiCheck className="text-white text-xl" />}
          </button>

          {both ? (
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setPickerId(pickerId === p._id ? null : p._id); }}
                className="p-2 bg-gray-700 rounded-full hover:bg-gray-600"
              >
                <Icon icon="fluent-emoji:revolving-hearts" width="24" height="24" />
              </button>
              <AnimatePresence>
                {pickerId === p._id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-11 right-0 flex bg-gray-700 rounded-full px-2 py-[3px] space-x-2 shadow-lg"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onLike(p, 'Barbara')}
                      className="p-2 bg-gray-700 rounded-full hover:bg-gray-600"
                    >
                      <Icon icon="fluent-emoji:pink-heart" width="24" height="24" />
                    </button>
                    <button
                      onClick={() => onLike(p, 'Nico')}
                      className="p-2 bg-gray-700 rounded-full hover:bg-gray-600"
                    >
                      <Icon icon="fluent-emoji:light-blue-heart" width="24" height="24" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={e => { e.stopPropagation(); onLike(p, 'Barbara'); }}
                className="p-2 bg-gray-700 rounded-full hover:bg-gray-600"
              >
                <Icon
                  icon="fluent-emoji:pink-heart"
                  width="24" height="24"
                  className={p.likeBarbara ? 'text-pink-400' : 'opacity-50'}
                />
              </button>
              <button
                onClick={e => { e.stopPropagation(); onLike(p, 'Nico'); }}
                className="p-2 bg-gray-700 rounded-full hover:bg-gray-600"
              >
                <Icon
                  icon="fluent-emoji:light-blue-heart"
                  width="24" height="24"
                  className={p.likeNico ? 'text-white' : 'opacity-50'}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-3">
        <h3 className={`font-semibold text-lg ${p.bought ? 'line-through text-gray-500' : ''}`}>
          {p.name}
        </h3>
        {p.storeName && (
          <p className="text-sm text-gray-400">
            {p.storeName}
          </p>
        )}
      </div>
    </motion.div>
  );
};
