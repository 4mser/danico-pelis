// src/components/FoodPage.tsx
'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';

import { getProducts, toggleProductBought, updateProduct } from '@/services/api';
import type { Product } from '@/types';

import { SearchHeader } from './foodpage/SearchHeader';
import { ProductCard } from './foodpage/ProductCard';
import { FiltersSheet } from './foodpage/FiltersSheet';
import { ProductDrawer } from './foodpage/ProductDrawer';
import { Spinner } from '@/app/spinner';

export default function FoodPage() {
  const router = useRouter();

  const [items, setItems]               = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all'|'pending'|'bought'>('all');
  const [heartFilter, setHeartFilter]   = useState<'none'|'Barbara'|'Nico'|'Both'>('none');

  const [rawSearch, setRawSearch]       = useState('');
  const [search, setSearch]             = useState('');
  const debounceRef = useRef<NodeJS.Timeout|null>(null);

  const [togBought, setTogBought]       = useState<Record<string,boolean>>({});
  const [pickerId, setPickerId]         = useState<string|null>(null);
  const [showFilters, setShowFilters]   = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product|null>(null);

  // Carga inicial
  useEffect(() => {
    getProducts().then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const refreshItem = (u: Product) =>
    setItems(old => old.map(x => x._id === u._id ? u : x));

  // Bought
  const handleBought = async (p: Product) => {
    setTogBought(t => ({ ...t, [p._id]: true }));
    const upd = await toggleProductBought(p._id, p.bought);
    refreshItem(upd);
    setTogBought(t => ({ ...t, [p._id]: false }));
  };

  // Like CON optimistic update SIN deshabilitar botones
  const handleLike = async (p: Product, who: 'Barbara' | 'Nico') => {
    // Optimistic UI:
    setItems(old => old.map(x => {
      if (x._id !== p._id) return x;
      return {
        ...x,
        likeBarbara: who === 'Barbara' ? !x.likeBarbara : x.likeBarbara,
        likeNico:    who === 'Nico'     ? !x.likeNico     : x.likeNico,
        likeBoth:    (who === 'Barbara' ? !x.likeBarbara : x.likeBarbara)
                   && (who === 'Nico'    ? !x.likeNico     : x.likeNico),
      };
    }));
    // Backend en segundo plano
    const form = new FormData();
    form.append(
      who === 'Barbara' ? 'likeBarbara' : 'likeNico',
      (!(who === 'Barbara' ? p.likeBarbara : p.likeNico)).toString()
    );
    try {
      const upd = await updateProduct(p._id, form);
      refreshItem(upd);
    } catch (e) {
      console.error('Error updating like', e);
    }
  };

  // Debounce búsqueda
  const handleRawSearch = (v: string) => {
    setRawSearch(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(v.trim()), 300);
  };

  // Filtrado
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
    <div className="bg-gray-900 text-white flex flex-col min-h-screen">
      <SearchHeader
        rawSearch={rawSearch}
        onRawSearchChange={handleRawSearch}
        onOpenFilters={() => setShowFilters(true)}
      />

      <main className="flex-1 overflow-y-auto p-4 pb-20">
        {loading ? (
          <div className="w-full h-[70dvh] flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : visible.length === 0 ? (
          <p className="text-center text-gray-500 mt-20">No hay productos.</p>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
          >
            {visible.map(p => (
              <ProductCard
                key={p._id}
                product={p}
                isTogglingBought={!!togBought[p._id]}
                onToggleBought={handleBought}
                onLike={handleLike}
                pickerId={pickerId}
                setPickerId={setPickerId}
                onClick={() => setSelectedProduct(p)}
              />
            ))}
          </motion.div>
        )}
      </main>

      <button
        onClick={() => router.push('/AdminFood')}
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

      <FiltersSheet
        isOpen={showFilters}
        statusFilter={statusFilter}
        heartFilter={heartFilter}
        onClose={() => setShowFilters(false)}
        setStatus={setStatusFilter}
        setHeart={setHeartFilter}
      />

      <ProductDrawer
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onLike={handleLike}
      />
    </div>
  );
}
