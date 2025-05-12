// components/CouponsPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import { Spinner } from '@/app/spinner';
import { getCoupons, redeemCoupon } from '@/services/api';
import type { Coupon } from '@/types';

type Owner = 'Barbara' | 'Nico';
const OWNERS: Owner[] = ['Barbara', 'Nico'];

// Animaciones Framer Motion
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 16 },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export default function CouponsPage() {
  const router = useRouter();
  const [owner, setOwner] = useState<Owner>(OWNERS[0]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<Record<string, boolean>>({});

  // Carga cada vez que cambia el filtro "owner"
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    getCoupons(owner)
      .then(data => {
        if (mounted) setCoupons(data);
      })
      .catch(() => {
        if (mounted) setError('No se pudieron cargar los cupones');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [owner]);

  // Handler: marcar cupón canjeado
  const handleToggle = async (c: Coupon) => {
    if (c.redeemed) return;
    setToggling(prev => ({ ...prev, [c._id]: true }));
    try {
      const updated = await redeemCoupon(c._id, true);
      setCoupons(prev =>
        prev.map(x => x._id === updated._id ? updated : x)
      );
    } finally {
      setToggling(prev => ({ ...prev, [c._id]: false }));
    }
  };

  // Renderizados especiales
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
    <div className="min-h-full bg-gray-900 relative">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Título general */}
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Cupones 🎟️
        </h1>

        {/* Filtro por owner */}
        <div className="mb-8 flex justify-center gap-4">
          {OWNERS.map(o => (
            <button
              key={o}
              onClick={() => setOwner(o)}
              className={`
                px-5 py-2 rounded-full font-semibold transition-colors
                ${owner === o
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              {o}
            </button>
          ))}
        </div>

        {/* Subtítulo dinámico */}
        <h2 className="text-xl font-semibold text-white text-center mb-8">
          Cupones de {owner}
        </h2>

        {/* Grid de cupones */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {coupons.map(c => (
              <motion.div
                key={c._id}
                className="relative"
                variants={itemVariants}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                {/* Decoración lateral */}
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-900 rounded-full" />
                <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-900 rounded-full" />

                {/* Tarjeta del cupón */}
                <div className={`
                  bg-gradient-to-br from-gray-800 to-transparent
                  border-2 border-dashed border-gray-600
                  rounded-lg p-6 shadow-xl transition-colors
                  hover:bg-gray-700
                  ${c.redeemed ? 'opacity-50' : 'opacity-100'}
                `}>
                  <h3 className={`
                    text-2xl font-semibold text-white mb-2
                    ${c.redeemed ? 'line-through' : ''}
                  `}>
                    {c.title}
                  </h3>
                  <p className={`
                    text-gray-300 leading-relaxed
                    ${c.redeemed ? 'line-through' : ''}
                  `}>
                    {c.description}
                  </p>

                  <div className="mt-4 flex justify-end">
                    {toggling[c._id]
                      ? <Spinner size="sm" />
                      : (
                        <button
                          onClick={() => handleToggle(c)}
                          disabled={c.redeemed}
                          className={`
                            px-3 py-1 rounded-full text-sm font-medium transition-colors
                            ${c.redeemed
                              ? 'bg-green-600 text-white cursor-not-allowed'
                              : 'bg-white/10 text-white hover:bg-white/20'}
                          `}
                        >
                          {c.redeemed ? 'Canjeado' : 'Canjear'}
                        </button>
                      )
                    }
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Botón flotante para crear nuevos cupones */}
      <button
        onClick={() => router.push('/AdminCupones')}
        className="
          fixed bottom-20 right-4 w-14 h-14 rounded-full p-[2px]
          bg-gradient-to-r from-pink-500 to-purple-600
          hover:from-pink-600 hover:to-purple-700
          animate-pulse z-10
        "
      >
        <span className="bg-black/70 w-full h-full flex items-center justify-center text-3xl rounded-full">
          <FiPlus className="text-white" />
        </span>
      </button>
    </div>
  );
}
