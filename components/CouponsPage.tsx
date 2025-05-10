// components/CouponsPage.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Coupon } from '@/types';
import { Spinner } from '@/app/spinner';
import { getCoupons, redeemCoupon } from '@/services/api';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<Record<string, boolean>>({});

  // cargar cupones
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const data = await getCoupons();
        setCoupons(data);
      } catch {
        setError('No se pudieron cargar los cupones');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // manejar canje; si ya está canjeado, no hace nada
  const handleToggle = async (c: Coupon) => {
    if (c.redeemed) return;
    setToggling(prev => ({ ...prev, [c._id]: true }));
    try {
      const updated = await redeemCoupon(c._id, true);
      setCoupons(prev =>
        prev.map(item =>
          item._id === c._id ? { ...item, redeemed: updated.redeemed } : item
        )
      );
    } catch {
      // opcional: manejo de error
    } finally {
      setToggling(prev => ({ ...prev, [c._id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="bg-black min-h-full">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          🏷️ Cupones para Bárbara
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coupons.map(c => (
            <div key={c._id} className="relative">
              {/* Notches */}
              <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-black rounded-full" />
              <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-black rounded-full" />

              {/* Ticket */}
              <div
                className={`
                  bg-gradient-to-br from-gray-800 to-transparent
                  border-2 border-dashed border-gray-600
                  rounded-lg p-6 shadow-xl transition-colors
                  hover:bg-gray-700
                  ${c.redeemed ? 'opacity-50' : 'opacity-100'}
                `}
              >
                <h3
                  className={`
                    text-2xl font-semibold text-white mb-2
                    ${c.redeemed ? 'line-through' : ''}
                  `}
                >
                  {c.title}
                </h3>
                <p
                  className={`
                    text-gray-300 leading-relaxed
                    ${c.redeemed ? 'line-through' : ''}
                  `}
                >
                  {c.description}
                </p>

                {/* Switch de canje */}
                <div className="mt-4 flex items-center">
                  {toggling[c._id] ? (
                    <Spinner size="sm" />
                  ) : (
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={c.redeemed}
                        disabled={c.redeemed}
                        onChange={() => handleToggle(c)}
                      />
                      <div className={`
                        w-11 h-6 rounded-full relative
                        bg-gray-600 peer-focus:ring-2 peer-focus:ring-purple-500
                        before:content-[''] before:absolute before:top-0.5 before:left-0.5
                        before:bg-white before:border before:border-gray-300 before:rounded-full
                        before:h-5 before:w-5 before:transition-all
                        peer-checked:bg-green-600
                        peer-checked:before:translate-x-full
                        ${c.redeemed ? 'cursor-not-allowed' : 'cursor-pointer'}
                      `} />
                      <span className="ml-3 text-sm font-medium text-gray-200">
                        {c.redeemed ? 'Canjeado' : 'Disponible'}
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
