// src/components/RabanitoSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import type { Pet, InteractionType } from '@/types';
import { getPet } from '@/services/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const interactionLabels: Record<InteractionType, string> = {
  addMovie:     'añadieron una película',
  markWatched:  'vieron una película',
  deleteMovie:  'eliminaron una película',
  addProduct:   'añadieron un producto',
  buyProduct:   'compraron un producto',
  likeOne:      'a uno de ustedes le gustó algo',
  likeBoth:     'a ambos les gustó algo',
  addCoupon:    'añadieron un cupón',
  redeemCoupon: 'canjearon un cupón',
};

export default function RabanitoSection() {
  const [pet, setPet] = useState<Pet | null>(null);

  useEffect(() => {
    let mounted = true;

    getPet()
      .then(initial => mounted && setPet(initial))
      .catch(console.error);

    const socket: Socket = io(API_URL, { transports: ['websocket'] });
    socket.on('connect',    () => console.log('✅ Conectado a Rabanito WS'));
    socket.on('pet_update', (updated: Pet) => mounted && setPet(updated));
    socket.on('disconnect', () => console.log('⚠️ Desconectado de Rabanito WS'));

    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, []);

  if (!pet) {
    return (
      <div className="p-6 text-center text-gray-500">
        Cargando a Rabanito…
      </div>
    );
  }

  const colorMap: Record<'happiness' | 'energy' | 'curiosity', string> = {
    happiness: 'from-pink-400 to-pink-600',
    energy:    'from-yellow-400 to-yellow-600',
    curiosity: 'from-purple-400 to-purple-600',
  };

  const lastLabel = pet.lastInteractionType
    ? interactionLabels[pet.lastInteractionType]
    : '—';
  const lastTime = new Date(pet.lastInteractionAt).toLocaleTimeString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="max-w-md mt-10 mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg space-y-6"
    >
      <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white">
        🐇 Rabanito
      </h2>

      <AnimatePresence mode="wait">
        <motion.p
          key={pet.lastMessage}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="px-4 py-2 bg-gray-700 rounded-lg text-center font-medium text-gray-100"
        >
          {pet.lastMessage || '¡Hola! Soy Rabanito.'}
        </motion.p>
      </AnimatePresence>

      <div className="space-y-4">
        {(['happiness', 'energy', 'curiosity'] as const).map(key => {
          const value = pet[key];
          const gradient = colorMap[key];
          return (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <span className="capitalize font-semibold text-gray-700 dark:text-gray-300">
                  {key}
                </span>
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {value}%
                </span>
              </div>
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  className={`h-full bg-gradient-to-r ${gradient}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-gray-500 dark:text-gray-400 text-center"
      >
        Última interacción:{' '}
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {lastLabel}
        </span>{' '}
        a las{' '}
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {lastTime}
        </span>
      </motion.div>
    </motion.div>
  );
}
