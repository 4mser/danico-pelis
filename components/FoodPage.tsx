// components/FoodPage.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { FiSearch, FiCheck } from 'react-icons/fi';

interface Product {
  id: number;
  name: string;
  image: string;
}

const products: Product[] = [
  { id: 1, name: 'Leche de soya', image: '/images/soya.webp' },
  { id: 2, name: 'Cheesecake Frambuesa Vegano Enki', image: '/images/cheesecake.webp' },
  { id: 3, name: 'Muffins de Sabor a Verde', image: '/images/muffin.jpg' },
  { id: 4, name: 'Suflés de Garbanzo sabor a Queso', image: '/images/sufles.webp' },
  { id: 5, name: 'Empanadas pastelera choclo de sabor a verde', image: '/images/empanada.webp' },
  { id: 6, name: 'Cajitas de leche de soya de chocolate', image: '/images/cajitaleche.webp' },
  { id: 7, name: 'Frutos secos (se los devora)', image: '/images/frutossecos.webp' },
  { id: 8, name: 'Chorizos NotCo', image: '/images/notchorizos.webp' },
  { id: 10, name: 'Barritas de proteína Wild', image: '/images/wild.webp' },
  { id: 11, name: 'Mantequilla de maní', image: '/images/mantequilla-de-mani.jpg' },
];

export default function FoodPage() {
  const [boughtSet, setBoughtSet] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<'all' | 'pending' | 'bought'>('all');
  const [search, setSearch] = useState('');

  const toggleBought = (id: number) => {
    setBoughtSet(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const visible = useMemo(() =>
    products.filter(p => {
      if (filter === 'bought' && !boughtSet.has(p.id)) return false;
      if (filter === 'pending' && boughtSet.has(p.id)) return false;
      return p.name.toLowerCase().includes(search.toLowerCase());
    }),
    [search, filter, boughtSet]
  );

  return (
    <div className="flex flex-col h-full">
      {/* CABECERA FIJA */}
      <header className="bg-gray-950 p-4 sticky top-0 z-10">
        <div className="relative">
          <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded bg-gray-800  text-white placeholder-gray-500 focus:outline-none"
          />
        </div>
        <div className="flex space-x-2 mt-3">
          {(['all', 'pending', 'bought'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-3 py-1 rounded-full text-sm 
                ${filter === f 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}
              `}
            >
              {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes' : 'Listos 🥵'}
            </button>
          ))}
        </div>
      </header>

      {/* CONTENIDO SCROLLABLE */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map(product => {
            const bought = boughtSet.has(product.id);
            return (
              <div
                key={product.id}
                className="relative bg-gray-900 rounded-lg shadow-lg overflow-hidden md:hover:scale-[1.02] transition-transform"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
                <button
                  onClick={() => toggleBought(product.id)}
                  className={`
                    absolute top-2 right-2 p-1 rounded-full 
                    ${bought ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-600'}
                    focus:outline-none
                  `}
                >
                  <FiCheck className="h-5 w-5 text-white" />
                </button>
                <div className="p-3">
                  <h3
                    className={`text-white font-semibold text-base 
                      ${bought ? 'line-through text-gray-500' : ''}
                    `}
                  >
                    {product.name}
                  </h3>
                </div>
              </div>
            );
          })}
          {visible.length === 0 && (
            <p className="col-span-full text-center text-gray-400">
              No hay productos que coincidan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
