// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import HomePage from '@/components/HomePage';
import CouponsPage from '@/components/CouponsPage';
import FoodPage from '@/components/FoodPage';

type Section = 'pelis' | 'cupones' | 'comida';

/**
 * Hook para sincronizar un estado con localStorage.
 */
function useLocalStorageState<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  });

  const setAndStore = (value: T) => {
    setState(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [state, setAndStore];
}

export default function Page() {
  // 1) Persistimos la última sección en localStorage
  const [section, setSection] = useLocalStorageState<Section>('app:section', 'pelis');

  // (opcional) si quieres borrar la sección guardada al desmontar:
  // useEffect(() => () => localStorage.removeItem('app:section'), []);

  return (
    <div className="flex flex-col h-[100dvh]">

      {/* CONTENIDO: ocultamos/mostramos en lugar de montar/desmontar */}
      <div className="flex-1 overflow-y-auto relative">
        <div className={section === 'pelis' ? 'block' : 'hidden'}>
          <HomePage isHomeSection={true} />
        </div>
        <div className={section === 'cupones' ? 'block' : 'hidden'}>
          <CouponsPage />
        </div>
        <div className={section === 'comida' ? 'block' : 'hidden'}>
          <FoodPage />
        </div>
      </div>

      {/* MENÚ INFERIOR */}
      <nav className="h-16 bg-gray-900 border-t border-gray-700 flex">
        {/* Pelis */}
        <button
          onClick={() => setSection('pelis')}
          className={`
            flex-1 flex flex-col items-center justify-center
            ${section === 'pelis'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
              : 'text-gray-400 hover:text-gray-200'}
          `}
        >
          <span className="text-2xl">🎬</span>
          <span className="text-xs mt-1">Pelis</span>
        </button>

        {/* Cupones */}
        <button
          onClick={() => setSection('cupones')}
          className={`
            flex-1 flex flex-col items-center justify-center
            ${section === 'cupones'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
              : 'text-gray-400 hover:text-gray-200'}
          `}
        >
          <span className="text-2xl">🎟️</span>
          <span className="text-xs mt-1">Cupones</span>
        </button>

        {/* Comida */}
        <button
          onClick={() => setSection('comida')}
          className={`
            flex-1 flex flex-col items-center justify-center
            ${section === 'comida'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
              : 'text-gray-400 hover:text-gray-200'}
          `}
        >
          <span className="text-2xl">🍟</span>
          <span className="text-xs mt-1">Cosas Ricas</span>
        </button>
      </nav>
    </div>
  );
}
