// components/FoodPage.tsx
'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiCheck, FiPlus } from 'react-icons/fi';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts, toggleProductBought, updateProduct } from '@/services/api';
import { Product } from '@/types';
import { Spinner } from '@/app/spinner';

type StatusFilter = 'all' | 'pending' | 'bought';
type HeartFilter = 'none' | 'Barbara' | 'Nico' | 'Both';

// Variants para animación con stagger
const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,    // Retardo entre cada tarjeta
      delayChildren: 0.2,      // Pequeño delay antes de empezar
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
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

export default function FoodPage() {
  const router = useRouter();

  // Estados principales
  const [items, setItems]               = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [heartFilter, setHeartFilter]   = useState<HeartFilter>('none');
  const [rawSearch, setRawSearch]       = useState('');
  const [search, setSearch]             = useState('');
  const searchRef = useRef<NodeJS.Timeout | null>(null);

  // Estados de toggles para botones
  const [showFilters, setShowFilters]   = useState(false);
  const [togBought, setTogBought]       = useState<Record<string,boolean>>({});
  const [togHeart,  setTogHeart]        = useState<Record<string,boolean>>({});
  const [pickerId,  setPickerId]        = useState<string | null>(null);

  // Carga inicial de productos
  useEffect(() => {
    getProducts().then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  // Actualizar un solo producto en el array
  const refreshItem = (u: Product) =>
    setItems(old => old.map(x => x._id === u._id ? u : x));

  // Toggle comprado
  const handleBought = async (p: Product) => {
    setTogBought(t => ({ ...t, [p._id]: true }));
    const upd = await toggleProductBought(p._id, !p.bought);
    refreshItem(upd);
    setTogBought(t => ({ ...t, [p._id]: false }));
  };

  // Toggle corazones (like)
  const handleLike = async (p: Product, who: 'Barbara' | 'Nico') => {
    setTogHeart(t => ({ ...t, [p._id]: true }));
    // Actualización optimista en UI
    setItems(old => old.map(x => {
      if (x._id !== p._id) return x;
      return {
        ...x,
        likeBarbara: who === 'Barbara' ? !x.likeBarbara : x.likeBarbara,
        likeNico:     who === 'Nico'     ? !x.likeNico     : x.likeNico,
      };
    }));
    const body = who === 'Barbara'
      ? { likeBarbara: !p.likeBarbara }
      : { likeNico:     !p.likeNico };
    const upd = await updateProduct(p._id, body);
    refreshItem(upd);
    setTogHeart(t => ({ ...t, [p._id]: false }));
    setPickerId(null);
  };

  // Debounce para búsqueda
  const onSearchChange = (v: string) => {
    setRawSearch(v);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => setSearch(v), 300);
  };

  // Filtrar visibilidad
  const visible = useMemo(() => items
    .filter(p => {
      if (statusFilter === 'pending' && p.bought) return false;
      if (statusFilter === 'bought'  && !p.bought) return false;
      return p.name.toLowerCase().includes(search.toLowerCase());
    })
    .filter(p => {
      if (heartFilter === 'Barbara' && !p.likeBarbara) return false;
      if (heartFilter === 'Nico'     && !p.likeNico)     return false;
      if (heartFilter === 'Both'     && !(p.likeBarbara && p.likeNico)) return false;
      return true;
    })
  , [items, statusFilter, heartFilter, search]);

  return (
    <div className="bg-gray-900 text-white flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-gray-800 p-4 flex items-center space-x-3 shadow-xl">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-full focus:outline-none"
            placeholder="Buscar producto..."
            value={rawSearch}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className="px-4 py-2 bg-purple-600 rounded-full hover:bg-purple-500"
        >
          Filtros
        </button>
      </header>

      {/* Contenido */}
      <main className="flex-1 overflow-y-auto p-4 pb-10">
        {loading ? (
          <div className="w-full h-[70dvh] flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : visible.length === 0 ? (
          <p className="text-center text-gray-500 mt-20">No hay productos.</p>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            variants={listVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
          >
            <AnimatePresence>
              {visible.map(p => {
                const both = p.likeBarbara && p.likeNico;
                return (
                  <motion.div
                    key={p._id}
                    className="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg"
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-[147px] w-full object-cover"
                    />

                    {/* Comprado */}
                    <button
                      onClick={() => handleBought(p)}
                      disabled={togBought[p._id]}
                      className={`absolute top-2 shadow-md right-2 p-2 rounded-full ${
                        p.bought ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {togBought[p._id] ? <Spinner size="sm" /> : <FiCheck className="text-white text-2xl" />}
                    </button>

                    {/* Corazones / picker */}
                    <div className="absolute top-[52px] right-2">
                      {both ? (
                        <div className="relative">
                          <motion.button
                            whileTap={{ scale: 1.2 }}
                            onClick={() => setPickerId(pid => pid === p._id ? null : p._id)}
                            className="p-1 bg-gray-700 rounded-full hover:bg-gray-600"
                          >
                            <Icon icon="fluent-emoji:revolving-hearts" width="32" height="32" />
                          </motion.button>
                          {pickerId === p._id && (
                            <div
                              className="absolute top-11 right-0 flex bg-gray-700 rounded-full px-2 py-1 space-x-2 shadow-lg"
                              onClick={e => e.stopPropagation()}
                            >
                              <button onClick={() => handleLike(p, 'Barbara')}>
                                <Icon icon="fluent-emoji:pink-heart" width="32" height="32" />
                              </button>
                              <button onClick={() => handleLike(p, 'Nico')}>
                                <Icon icon="fluent-emoji:light-blue-heart" width="32" height="32" />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-1">
                          <motion.button
                            whileTap={{ scale: 1.1 }}
                            onClick={() => handleLike(p, 'Barbara')}
                            disabled={togHeart[p._id]}
                            className="p-1 bg-gray-700 shadow-md rounded-full hover:bg-gray-600"
                          >
                            <Icon
                              icon="fluent-emoji:pink-heart"
                              width="32" height="32"
                              className={p.likeBarbara ? 'text-pink-400' : 'opacity-50 hover:opacity-90'}
                            />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 1.1 }}
                            onClick={() => handleLike(p, 'Nico')}
                            disabled={togHeart[p._id]}
                            className="p-1 bg-gray-700 shadow-md rounded-full hover:bg-gray-600"
                          >
                            <Icon
                              icon="fluent-emoji:light-blue-heart"
                              width="32" height="32"
                              className={p.likeNico ? 'text-white' : 'opacity-50 hover:opacity-90'}
                            />
                          </motion.button>
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <h3 className={`font-semibold text-lg ${
                        p.bought ? 'line-through text-gray-500' : ''
                      }`}>
                        {p.name}
                      </h3>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* FAB Admin */}
      <button
        onClick={() => router.push('/AdminFood')}
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

      {/* Bottom-sheet filtros */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="fixed z-20 inset-0 bg-black bg-opacity-50 flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              className="w-full bg-gray-800 rounded-t-3xl p-6 space-y-6"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Estado */}
              <div className="flex space-x-2">
                {(['pending','bought','all'] as StatusFilter[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`flex-1 px-3 py-2 rounded-full text-center text-sm ${
                      statusFilter === f
                        ? 'bg-purple-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {f === 'pending' ? 'Pendientes'
                      : f === 'bought'  ? 'Comprados'
                      : 'Todos'}
                  </button>
                ))}
              </div>
              {/* Corazones */}
              <div className="flex space-x-4 justify-center">
                {([
                  { key: 'Barbara', icon: 'fluent-emoji:pink-heart',  label: 'Bárbara' },
                  { key: 'Nico',     icon: 'fluent-emoji:light-blue-heart', label: 'Nico'    },
                  { key: 'Both',     icon: 'fluent-emoji:revolving-hearts', label: 'Ambos' },
                ] as const).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setHeartFilter(curr => curr === f.key ? 'none' : f.key)}
                    className={`flex-1 flex flex-col items-center p-2 rounded-lg ${
                      heartFilter === f.key
                        ? 'bg-pink-600/50'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <Icon icon={f.icon} width="28" height="28" />
                    <span className="text-xs mt-1">{f.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-2 bg-purple-600 rounded-full hover:bg-purple-500"
              >
                Aplicar filtros
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
