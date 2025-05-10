// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import HomePage from '@/components/HomePage';
import CouponsPage from '@/components/CouponsPage';
import FoodPage from '@/components/FoodPage';

type Section = 'pelis' | 'cupones' | 'comida';
type SectionWithKey = { section: Section; remountKey: number; };

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
  // persistimos sección + montamos contador para la key de animación
  const [section, setSection] = useLocalStorageState<Section>('app:section', 'pelis');
  const [remountKey, setRemountKey] = useState(0);

  // cada vez que sección cambie, incrementamos remountKey
  useEffect(() => {
    setRemountKey(k => k + 1);
  }, [section]);

  return (
    <div className="flex flex-col h-[100dvh]">

      {/* CONTENIDO: todas montadas, sólo ocultas/mostradas */}
      <div className="flex-1 overflow-y-auto relative">
        <div className={section === 'pelis' ? 'block' : 'hidden'}>
          <HomePage isHomeSection={true} remountKey={remountKey} />
        </div>
        <div className={section === 'cupones' ? 'block' : 'hidden'}>
          <CouponsPage remountKey={remountKey} />
        </div>
        <div className={section === 'comida' ? 'block' : 'hidden'}>
          <FoodPage remountKey={remountKey} />
        </div>
      </div>

      {/* MENÚ INFERIOR */}
      <nav className="h-16 bg-gray-900 border-t border-gray-700 flex">
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
