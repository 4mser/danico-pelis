// components/FoodPage.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiCheck, FiPlus } from 'react-icons/fi';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import {
  getProducts,
  toggleProductBought,
  updateProduct,
} from '@/services/api';
import { Product } from '@/types';
import { Spinner } from '@/app/spinner';

type StatusFilter = 'all' | 'pending' | 'bought';
type HeartFilter = 'none' | 'Barbara' | 'Nico' | 'Both';

export default function FoodPage() {
  const router = useRouter();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [heartFilter, setHeartFilter] = useState<HeartFilter>('none');
  const [search, setSearch] = useState('');

  // loading flags y picker
  const [togBought, setTogBought] = useState<Record<string, boolean>>({});
  const [togHeart, setTogHeart] = useState<Record<string, boolean>>({});
  const [pickerId, setPickerId] = useState<string | null>(null);

  useEffect(() => {
    getProducts().then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const refreshItem = (u: Product) => {
    setItems(old => old.map(x => x._id === u._id ? u : x));
  };

  const handleBought = async (p: Product) => {
    setTogBought(t => ({ ...t, [p._id]: true }));
    const upd = await toggleProductBought(p._id, !p.bought);
    refreshItem(upd);
    setTogBought(t => ({ ...t, [p._id]: false }));
  };

  const handleLike = async (p: Product, who: 'Barbara' | 'Nico') => {
    setTogHeart(t => ({ ...t, [p._id]: true }));
    // optimista
    setItems(old => old.map(x => {
      if (x._id !== p._id) return x;
      return {
        ...x,
        likeBarbara: who === 'Barbara' ? !x.likeBarbara : x.likeBarbara,
        likeNico: who === 'Nico' ? !x.likeNico : x.likeNico,
      };
    }));
    const body = who === 'Barbara'
      ? { likeBarbara: !p.likeBarbara }
      : { likeNico: !p.likeNico };
    const upd = await updateProduct(p._id, body);
    refreshItem(upd);
    setTogHeart(t => ({ ...t, [p._id]: false }));
    setPickerId(null);
  };

  const visible = useMemo(() => items
    .filter(p => {
      if (statusFilter === 'pending' && p.bought) return false;
      if (statusFilter === 'bought' && !p.bought) return false;
      if (!p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .filter(p => {
      if (heartFilter === 'Barbara' && !p.likeBarbara) return false;
      if (heartFilter === 'Nico' && !p.likeNico) return false;
      if (heartFilter === 'Both' && !(p.likeBarbara && p.likeNico)) return false;
      return true;
    })
  , [items, statusFilter, heartFilter, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[100dvh] bg-black">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-black text-white">
      {/* ====== FILTROS ====== */}
      <header className="bg-gray-950 p-4 sticky top-0 z-10 space-y-3">
        {/* Buscador */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
          <input
            className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded focus:outline-none"
            placeholder="Buscar producto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Estado */}
        <div className="flex space-x-2">
          {(['pending','bought','all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1 rounded-full text-sm ${
                statusFilter===f ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {f === 'pending' ? 'Pendientes' : f === 'bought' ? 'Comprados' : 'Todos'}
            </button>
          ))}
        </div>

        {/* Corazones */}
        <div className="flex space-x-4">
          {([
            { key: 'Barbara', icon: 'fluent-emoji-flat:pink-heart', label: 'Bárbara' },
            { key: 'Nico',     icon: 'fluent-emoji-flat:black-heart', label: 'Nico' },
            { key: 'Both',     icon: 'fluent-emoji-flat:revolving-hearts', label: 'Ambos' },
          ] as const).map(f => (
            <div key={f.key} className="flex flex-col items-center">
              <motion.button
                whileTap={{ scale: f.key==='Both'?1.2:1.1 }}
                onClick={() => setHeartFilter(curr => curr === f.key ? 'none' : f.key)}
                className={`p-2 rounded-full ${
                  heartFilter===f.key ? 'bg-pink-600/50' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <Icon icon={f.icon} width="24" height="24"/>
              </motion.button>
              <span className="text-xs mt-1">{f.label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* ====== GRID DE PRODUCTOS ====== */}
      <div className="flex-1 overflow-y-auto p-4">
        {visible.length === 0 ? (
          <p className="text-center text-gray-400">No hay productos.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map(p => {
              const both = p.likeBarbara && p.likeNico;
              return (
                <div
                  key={p._id}
                  className="relative bg-gray-900 rounded-lg shadow flex flex-col overflow-hidden"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-40 w-full object-cover"
                  />

                  {/* Botón comprado */}
                  <button
                    onClick={() => handleBought(p)}
                    disabled={togBought[p._id]}
                    className={`absolute top-2 right-2 p-1 rounded-full ${
                      p.bought ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {togBought[p._id]
                      ? <Spinner size="sm" />
                      : <FiCheck className="text-white" />}
                  </button>

                  {/* Corazones */}
                  <div className="absolute top-2 left-2 flex space-x-1 items-center">
                    {both ? (
                      <div className="relative inline-block">
                        <motion.button
                          whileTap={{ scale: 1.2 }}
                          onClick={() => setPickerId(id => id === p._id ? null : p._id)}
                          className="p-1"
                        >
                          <Icon icon="fluent-emoji-flat:revolving-hearts" width="30" height="30" />
                        </motion.button>
                        {pickerId === p._id && (
                          <div
                            className="absolute top-8 left-0 flex bg-gray-800 rounded-full px-2 py-1 space-x-2 shadow-lg"
                            onClick={e => e.stopPropagation()}
                          >
                            <button onClick={() => handleLike(p, 'Barbara')}>
                              <Icon icon="fluent-emoji-flat:pink-heart" width="30" height="30" />
                            </button>
                            <button onClick={() => handleLike(p, 'Nico')}>
                              <Icon icon="fluent-emoji-flat:black-heart" width="30" height="30" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                        <div className='flex gap-1 flex-col'>
                          <motion.button
                          whileTap={{ scale: 1.1 }}
                          onClick={() => handleLike(p, 'Barbara')}
                          disabled={togHeart[p._id]}
                          className=""
                        >
                          <Icon
                            icon="fluent-emoji-flat:pink-heart"
                            width="30" height="30"
                            className={p.likeBarbara ? '' : 'opacity-50'}
                          />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 1.1 }}
                          onClick={() => handleLike(p, 'Nico')}
                          disabled={togHeart[p._id]}
                          className=""
                        >
                          <Icon
                            icon="fluent-emoji-flat:black-heart"
                            width="30" height="30"
                            className={p.likeNico ? '' : 'opacity-50'}
                          />
                        </motion.button>
                        </div>
                    )}
                  </div>

                  <div className="p-3 flex-1">
                    <h3 className={`text-white font-semibold ${
                      p.bought ? 'line-through text-gray-500' : ''
                    }`}>
                      {p.name}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botón flotante Admin */}
      <button
        onClick={() => router.push('/AdminFood')}
        className="
          fixed bottom-20 right-4 w-14 h-14 rounded-full p-[2px]
          bg-gradient-to-r from-pink-500 to-purple-600
          hover:from-pink-600 hover:to-purple-700
          animate-pulse z-20
        "
      >
        <span className="bg-black/70 w-full h-full flex items-center justify-center text-3xl rounded-full">
          <FiPlus className="text-white" />
        </span>
      </button>
    </div>
  );
}
