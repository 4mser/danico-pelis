// components/CouponsPage.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coupon } from '@/types';
import { Spinner } from '@/app/spinner';
import { getCoupons, redeemCoupon } from '@/services/api';

// Variants para animación stagger
const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 16,
    }
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

export default function CouponsPage() {
  const [coupons, setCoupons]     = useState<Coupon[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [toggling, setToggling]   = useState<Record<string, boolean>>({});

  // Carga inicial de cupones
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

  // Manejar canje
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
      // opcional: mostrar mensaje de error
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

  // Ordenar: primero no canjeados, luego canjeados
  const sortedCoupons = [...coupons].sort((a, b) =>
    a.redeemed === b.redeemed ? 0 : a.redeemed ? 1 : -1
  );

  return (
    <div className="min-h-full w-full bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8 overflow-x-hidden relative">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Cupones para Bárbara 🏷️ 🖤
        </h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={listVariants}
          initial="hidden"
          animate="show"
          exit="hidden"
        >
          <AnimatePresence>
            {sortedCoupons.map(c => (
              <motion.div
                key={c._id}
                className="relative"
                variants={itemVariants}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                {/* Notches */}
                <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gray-900 rounded-full" />
                <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gray-900 rounded-full" />

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
                  <div className="mt-4 flex items-center justify-end">
                    {toggling[c._id] ? (
                      <Spinner size="sm" />
                    ) : (
                      <label className="inline-flex items-center cursor-pointer gap-2">
                        <span className="text-sm font-medium text-gray-200">
                          {c.redeemed ? 'Canjeado' : 'Canjear'}
                        </span>
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
                      </label>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
