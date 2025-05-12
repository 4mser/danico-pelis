'use client';

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Pet } from '@/types';
import { getPet } from '@/services/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function RabanitoSection() {
  const [pet, setPet] = useState<Pet | null>(null);

  useEffect(() => {
    let mounted = true;

    // 1) Estado inicial vía REST
    getPet()
      .then((initialPet) => {
        if (mounted) setPet(initialPet);
      })
      .catch(console.error);

    // 2) Conexión WS al servidor
    const socket: Socket = io(API_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('✅ Conectado a Rabanito WS');
    });

    socket.on('pet_update', (updated: Pet) => {
      if (mounted) setPet(updated);
    });

    socket.on('disconnect', () => {
      console.log('⚠️ Desconectado de Rabanito WS');
    });

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
    happiness: 'pink-500',
    energy: 'yellow-500',
    curiosity: 'purple-500',
  };

  return (
    <div className="max-w-lg mx-auto p-6  rounded-xl  space-y-6">
      {/* Nombre */}
      <h2 className="text-3xl font-bold text-center">🐇 {pet.name}</h2>

      {/* Mensaje juguetón */}
      <p className="px-4 py-2  rounded-lg text-center text-white">
        {pet.lastMessage || '¡Hola! Soy Rabanito.'}
      </p>

      {/* Estadísticas */}
      <div className="space-y-4">
        {(['happiness', 'energy', 'curiosity'] as const).map((key) => {
          const value = pet[key];
          const color = colorMap[key];
          return (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <span className="capitalize font-medium">{key}</span>
                <span>{value}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full">
                <div
                  className={`h-3 rounded-full bg-${color}`}
                  style={{ width: `${value}%`, transition: 'width 0.5s ease-in-out' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Última interacción */}
      <div className="text-sm text-gray-500 text-center">
        Última interacción:{' '}
        <span className="font-medium">
          {pet.lastInteractionType ?? '—'}
        </span>{' '}
        a las{' '}
        <span className="font-medium">
          {new Date(pet.lastInteractionAt).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
