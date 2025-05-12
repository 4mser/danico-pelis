// app/AdminCupones/page.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { Spinner } from '@/app/spinner';
import {
  getCoupons,
  createCoupon,
  redeemCoupon,
  deleteCoupon,
} from '@/services/api';
import type { Coupon } from '@/types';

type Owner = 'Barbara' | 'Nico';
const OWNERS: Owner[] = ['Barbara', 'Nico'];

export default function AdminCuponesPage() {
  // — Estados para el formulario de creación —
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createOwner, setCreateOwner] = useState<Owner>('Barbara');
  const [createLoading, setCreateLoading] = useState(false);

  // — Estados para la lista —
  const [listOwner, setListOwner] = useState<Owner>('Barbara');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [listLoading, setListLoading] = useState(false);

  // — Estado de error común —
  const [error, setError] = useState<string | null>(null);

  // Carga la lista de cupones cada vez que cambia listOwner
  useEffect(() => {
    let mounted = true;
    setListLoading(true);
    setError(null);

    getCoupons(listOwner)
      .then(data => {
        if (mounted) setCoupons(data);
      })
      .catch(() => {
        if (mounted) setError('Error cargando cupones');
      })
      .finally(() => {
        if (mounted) setListLoading(false);
      });

    return () => { mounted = false };
  }, [listOwner]);

  // Maneja la creación de un nuevo cupón
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim() || !createDescription.trim()) return;
    setCreateLoading(true);
    setError(null);

    try {
      await createCoupon(createTitle, createDescription, createOwner);
      setCreateTitle('');
      setCreateDescription('');
      // recarga la lista
      setListOwner(createOwner);
    } catch {
      setError('Error creando cupón');
    } finally {
      setCreateLoading(false);
    }
  };

  // Marca/desmarca como canjeado
  const handleRedeem = async (c: Coupon) => {
    try {
      await redeemCoupon(c._id, !c.redeemed);
      // refetch
      setListOwner(listOwner);
    } catch {
      setError('Error al actualizar estado');
    }
  };

  // Elimina un cupón
  const handleDelete = async (id: string) => {
    try {
      await deleteCoupon(id);
      setListOwner(listOwner);
    } catch {
      setError('Error eliminando cupón');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-gray-900">
        <Link href="/">
          ← Home
        </Link>
        <h1 className="text-2xl font-bold">Admin de Cupones</h1>
        <div className="w-6" />
      </header>

      <main className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto space-y-8">
        {/* Formulario de creación */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-center">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              value={createOwner}
              onChange={e => setCreateOwner(e.target.value as Owner)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
            >
              {OWNERS.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <input
              value={createTitle}
              onChange={e => setCreateTitle(e.target.value)}
              placeholder="Título"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
            />
          </div>

          <textarea
            value={createDescription}
            onChange={e => setCreateDescription(e.target.value)}
            placeholder="Descripción"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 h-24 resize-none"
          />

          <button
            type="submit"
            disabled={createLoading}
            className={`
              w-full py-2 rounded-lg font-semibold transition-colors
              ${createLoading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
              }
            `}
          >
            {createLoading ? 'Creando...' : 'Crear Cupón'}
          </button>
        </form>

        {/* Filtrado de la lista */}
        <div className="flex justify-center gap-4">
          {OWNERS.map(o => (
            <button
              key={o}
              onClick={() => setListOwner(o)}
              className={`
                px-4 py-2 rounded-full font-semibold transition-colors
                ${listOwner === o
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              {o}
            </button>
          ))}
        </div>

        {/* Lista de cupones */}
        {listLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : coupons.length === 0 ? (
          <p className="text-gray-400 text-center">No hay cupones.</p>
        ) : (
          <ul className="space-y-4">
            {coupons.map(c => (
              <li
                key={c._id}
                className="flex flex-col sm:flex-row justify-between bg-gray-800 rounded-lg p-4 shadow"
              >
                <div>
                  <h3 className="text-lg font-semibold">
                    [{c.owner}] {c.title}
                  </h3>
                  <p className="text-gray-400">{c.description}</p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-2">
                  <button
                    onClick={() => handleRedeem(c)}
                    disabled={c.redeemed}
                    className={`
                      px-3 py-1 rounded-full text-sm font-medium transition-colors
                      ${c.redeemed
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-white/10 text-white hover:bg-white/20'
                      }
                    `}
                  >
                    {c.redeemed ? 'Descanjear' : 'Canjear'}
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="px-3 py-1 rounded-full bg-red-600 text-white text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
