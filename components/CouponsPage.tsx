// components/CouponsPage.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import { Spinner } from '@/app/spinner';
import { getCoupons, redeemCoupon } from '@/services/api';
import type { Coupon } from '@/types';

type Owner = 'Barbara' | 'Nico';
const OWNERS: Owner[] = ['Barbara', 'Nico'];

// Variantes más sutiles
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show:  { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function CouponsPage() {
  const router = useRouter();
  const [owner, setOwner] = useState<Owner>(OWNERS[0]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<Record<string, boolean>>({});
  const cacheRef = useRef<Partial<Record<Owner, Coupon[]>>>({});

  // Carga optimizada con caché
  useEffect(() => {
    let mounted = true;
    setError(null);

    const cached = cacheRef.current[owner];
    if (cached) {
      setCoupons(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    getCoupons(owner)
      .then(data => {
        if (!mounted) return;
        cacheRef.current[owner] = data;
        setCoupons(data);
      })
      .catch(() => mounted && setError('Error cargando cupones'))
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false };
  }, [owner]);

  const handleToggle = async (c: Coupon) => {
    if (c.redeemed) return;
    setToggling(p => ({ ...p, [c._id]: true }));
    try {
      const updated = await redeemCoupon(c._id, !c.redeemed);
      setCoupons(prev =>
        prev.map(x => x._id === updated._id ? updated : x)
      );
      cacheRef.current[owner] = cacheRef.current[owner]!.map(x =>
        x._id === updated._id ? updated : x
      );
    } finally {
      setToggling(p => ({ ...p, [c._id]: false }));
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[80dvh]">
      <Spinner size="lg" />
    </div>
  );
  if (error) return (
    <div className="text-red-500 text-center py-8">⚠️ {error}</div>
  );

  return (
    <div className="bg-gray-900 relative">
      <div className="px-4 pt-7 sm:max-w-3xl mx-auto space-y-6 pb-20">

        <h1 className="text-3xl font-bold text-white text-center">Cupones de {owner} 🎟️</h1>

        <div className="flex justify-center gap-2">
          {OWNERS.map(o => (
            <button
              key={o}
              onClick={() => setOwner(o)}
              className={`px-4 py-1 rounded-full font-semibold transition-colors ${
                owner === o
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {o}
            </button>
          ))}
        </div>

       

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          {coupons.map(c => {
            const isLoading = toggling[c._id];
            const bgColor = c.owner === 'Barbara' ? 'bg-pink-800' : 'bg-blue-900';
              const dotColor = c.owner === 'Barbara' ? 'bg-pink-300' : 'bg-blue-300';;

            return (
              <motion.div
                key={c._id}
                className="relative"
                variants={itemVariants}
                layout
              >
                <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-11 h-11 bg-gray-900 rounded-full" />
                <div className="absolute -right-7 top-1/2 -translate-y-1/2 w-11 h-11 bg-gray-900 rounded-full" />

                <div className={`
                  bg-gradient-to-br from-gray-800 to-transparent
                  border-2 border-dashed border-gray-600
                  rounded-lg p-6 shadow-lg 
                  ${c.redeemed ? 'opacity-50' : 'opacity-100'}
                `}>
                  <h3 className={`text-2xl font-semibold text-white mb-2 ${c.redeemed ? 'line-through' : ''}`}>
                    {c.title}
                  </h3>
                  <p className={`text-gray-300 text-base mb-4 ${c.redeemed ? 'line-through' : ''}`}>
                    {c.description}
                  </p>

                  <div className="flex justify-between items-center">
                    {/* Tag de owner */}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
                      <span className={`w-2 h-2 rounded-full mr-1 ${dotColor}`} />
                      {c.owner}
                    </span>

                    {/* Switch de canjear */}
                    {isLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      <label className="relative inline-flex gap-2 items-center cursor-pointer">
                        canjear
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={c.redeemed}
                          onChange={() => handleToggle(c)}
                        />
                        <div className={`
                          w-11 h-6 rounded-full bg-gray-600 peer-focus:ring-2 peer-focus:ring-purple-500
                          peer-checked:bg-green-600 peer-disabled:opacity-50
                          relative before:content-[''] before:absolute before:top-0.5 before:left-0.5
                          before:bg-white before:border before:border-gray-300 before:rounded-full
                          before:h-5 before:w-5 before:transition-all peer-checked:before:translate-x-full
                        `} />
                      </label>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <button
        onClick={() => router.push('/AdminCupones')}
        className="
          fixed bottom-20 right-4 w-14 h-14 rounded-full p-[2px]
          bg-gradient-to-r from-pink-500 to-purple-600
          hover:from-pink-600 hover:to-purple-700
          animate-pulse z-10
        "
      >
        <span className="bg-black/70 w-full h-full flex items-center justify-center text-2xl rounded-full">
          <FiPlus className="text-white" />
        </span>
      </button>
    </div>
  );
}
