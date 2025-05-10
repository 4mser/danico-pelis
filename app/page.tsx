// app/page.tsx
'use client';

import React, { useState } from 'react';
import HomePage from '@/components/HomePage';
import CouponsPage from '@/components/CouponsPage';

export default function Page() {
  const [section, setSection] = useState<'pelis' | 'cupones'>('pelis');

  return (
    <div className="flex flex-col h-[100dvh] bg-black">
      {/* CONTENIDO */}
      <div className="flex-1 overflow-y-auto">
        {section === 'pelis' 
          ? <HomePage isHomeSection={true} /> 
          : <CouponsPage />}
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
      </nav>
    </div>
  );
}
