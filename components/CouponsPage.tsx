// components/CouponsPage.tsx
'use client';

import React from 'react';

interface Coupon {
  id: number;
  emoji: string;
  title: string;
  description: string;
}

const coupons: Coupon[] = [
    {
      id: 1,
      emoji: '🥐',
      title: 'Cupón válido por un desayuno a la cama',
      description: 'Te llevo cositas ricas para comer apenas despiertes <3.',
    },
    {
      id: 2,
      emoji: '💆‍♀️',
      title: 'Cupón válido por un masajito',
      description: 'Masajito de cuerpo completo para ti.',
    },
    {
      id: 3,
      emoji: '🧺',
      title: 'Cupón válido por un picnic',
      description: 'Vamos al Arboretum, llevamos cositas ricas y escuchamos nuestra playlist.',
    },
    {
      id: 4,
      emoji: '🎬',
      title: 'Cupón válido por una salida a caminar de la manito',
      description: 'Paseo por Valdi para conversar y estar de la manito (me da lo mismo si dices q te suda)',
    },
    {
      id: 5,
      emoji: '🍽️',
      title: 'Cupón válido por una cena romántica 3c3c',
      description: 'Vamos a comer algo rico vegano los 2 solitos.',
    },
    {
      id: 6,
      emoji: '🥵',
      title: 'Cupón válido por un ... 😏 jeje',
      description: 'Yatusae',
    },
  ];
  
  
  

export default function CouponsPage() {
  return (
    <div className="bg-black min-h-full">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          🏷️ Cupones para Bárbara
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coupons.map(({ id, emoji, title, description }) => (
            <div key={id} className="relative">
              {/* Notches */}
              <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-black rounded-full"></div>
              <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-black rounded-full"></div>

              {/* Ticket body */}
              <div className="bg-gradient-to-br from-gray-800 to-transparent border-2 border-dashed border-gray-600 rounded-lg p-6 shadow-xl hover:bg-gray-700 transition-colors">
                <h3 className="text-2xl font-semibold text-white mb-2 flex items-center gap-2">
                  <span className="text-3xl">{emoji}</span> {title}
                </h3>
                <p className="text-gray-300 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
