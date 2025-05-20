'use client';

import React, { useState } from 'react';
import HomePage from '@/components/HomePage';
import CouponsPage from '@/components/CouponsPage';
import FoodPage from '@/components/FoodPage';
import RabanitoSection from '@/components/RabanitoSection';
import MapaPage from './mapa/page';

export default function Page() {
  const [section, setSection] = useState<
    'pelis' | 'cupones' | 'comida' | 'bob' | 'mapa'
  >('pelis');

  return (
    <div className="flex flex-col h-[100dvh]">
      {/* CONTENIDO */}
      <div className="flex-1 overflow-y-auto">
        {section === 'pelis'   && <HomePage isHomeSection={true} />}
        {section === 'cupones' && <CouponsPage />}
        {section === 'comida'  && <FoodPage />}
        {section === 'bob'     && <RabanitoSection />}
        {section === 'mapa'     && <MapaPage />}
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
          <span className="text-xs mt-1">Para ver</span>
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

        {/* Rabanito */}
        <button
          onClick={() => setSection('bob')}
          className={`
            flex-1 flex flex-col items-center justify-center
            ${section === 'bob'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
              : 'text-gray-400 hover:text-gray-200'}
          `}
        >
          <span className="text-2xl">🐇</span>
          <span className="text-xs mt-1">Rabanito</span>
        </button>

        <button
          onClick={() => setSection('mapa')}
          className={`
            flex-1 flex flex-col items-center justify-center
            ${section === 'bob'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
              : 'text-gray-400 hover:text-gray-200'}
          `}
        >
          <span className="text-2xl">📍</span>
          <span className="text-xs mt-1">Mapa</span>
        </button>
      </nav>
    </div>
  );
}
