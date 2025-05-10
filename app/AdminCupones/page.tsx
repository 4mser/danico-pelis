// app/AdminCupones/page.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import {
  getCoupons,
  createCoupon,
  redeemCoupon,
  deleteCoupon,
} from '@/services/api';
import { Coupon } from '@/types';

export default function AdminCuponesPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCoupons = async () => {
    try {
      const data = await getCoupons();
      setCoupons(data);
    } catch {
      setError('Error cargando cupones');
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setLoading(true);
    try {
      await createCoupon(title, description);
      setTitle('');
      setDescription('');
      await loadCoupons();
    } catch {
      setError('Error creando cupón');
    } finally {
      setLoading(false);
    }
  };

  const toggleRedeem = async (c: Coupon) => {
    try {
      await redeemCoupon(c._id, !c.redeemed);
      await loadCoupons();
    } catch {
      setError('Error actualizando estado');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCoupon(id);
      await loadCoupons();
    } catch {
      setError('Error eliminando cupón');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <div className="flex-1 overflow-y-auto max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-center">Admin de Cupones</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descripción"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 h-24 resize-none"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold transition-colors ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
            }`}
          >
            {loading ? 'Creando...' : 'Crear Cupón'}
          </button>
        </form>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Cupones creados</h2>
          {coupons.length === 0 ? (
            <p className="text-gray-400">No hay cupones.</p>
          ) : (
            <ul className="space-y-3">
              {coupons.map(c => (
                <li
                  key={c._id}
                  className="flex justify-between items-center bg-gradient-to-br from-gray-800 to-transparent border-2 border-dashed border-gray-600 rounded-lg p-4 shadow-lg"
                >
                  <div>
                    <h3 className="text-lg font-semibold">{c.title}</h3>
                    <p className="text-gray-400">{c.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleRedeem(c)}
                      className={`px-2 py-1 rounded-full text-sm font-medium transition-colors ${
                        c.redeemed
                          ? 'bg-green-600 text-white'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      {c.redeemed ? 'Descanjear' : 'Canjear'}
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="px-2 py-1 rounded-full bg-red-600 text-white text-sm"
                    >
                      X
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
