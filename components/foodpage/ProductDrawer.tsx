// src/components/ProductDrawer.tsx
'use client';

import React, { FC } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Icon } from '@iconify/react';
import type { Product } from '@/types';

interface ProductDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onLike: (p: Product, who: 'Barbara' | 'Nico') => void;
}

export const ProductDrawer: FC<ProductDrawerProps> = ({
  product,
  isOpen,
  onClose,
  onLike
}) => {
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 150) onClose();
  };

  return (
    <>
      {/* Overlay: estático mientras isOpen */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={onClose}
        />
      )}

      {/* Sheet: solo este se anima con AnimatePresence */}
      <AnimatePresence initial={false}>
        {isOpen && product && (
          <motion.div
            key="drawer-sheet"
            className="fixed inset-x-0 bottom-0 z-50 w-full max-h-[90dvh] bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-3xl p-6 overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            style={{ touchAction: 'none' }}
          >
            <div className="w-10 h-1 bg-gray-600 rounded mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-center">{product.name}</h2>

            {/* Imagen con overlay de "both" */}
            <div className="relative mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full max-h-[50dvh] object-cover rounded-lg"
              />

              {product.likeBoth && (
                <div className="absolute top-2 left-2 flex items-center space-x-1 bg-gray-800/60 backdrop-blur-md px-2 py-1 rounded-full">
                  <Icon
                    icon="fluent-emoji:revolving-hearts"
                    width="20" height="20"
                    className="text-white"
                  />
                  <span className="text-white text-xs">
                    A ambos les gusta este producto
                  </span>
                </div>
              )}
            </div>

            {product.storeName && (
              <a
                href={product.storeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-md text-blue-400 hover:underline mb-2 block"
              >
                {product.storeName}
              </a>
            )}

            <p>
              <strong>Estado:</strong> {product.bought ? 'Comprado' : 'Pendiente'}
            </p>

            <div className="flex mt-4 items-center space-x-7">
              <button
                onClick={() => onLike(product, 'Barbara')}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-800"
              >
                <Icon
                  icon="fluent-emoji:pink-heart"
                  width="32" height="32"
                  className={product.likeBarbara ? 'text-pink-400' : 'opacity-50'}
                />
                <span className="text-xs mt-1">Bárbara</span>
              </button>

              <button
                onClick={() => onLike(product, 'Nico')}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-800"
              >
                <Icon
                  icon="fluent-emoji:light-blue-heart"
                  width="32" height="32"
                  className={product.likeNico ? 'text-white' : 'opacity-50'}
                />
                <span className="text-xs mt-1">Nico</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
