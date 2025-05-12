// app/AdminCupones/page.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { Spinner } from '@/app/spinner';
import { FiTrash } from 'react-icons/fi';
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
  // — Crear cupón —
  const [title, setTitle]       = useState('');
  const [desc, setDesc]         = useState('');
  const [owner, setOwner]       = useState<Owner>('Barbara');
  const [reusable, setReusable] = useState(false); // ← checkbox “Reutilizable”
  const [creating, setCreating] = useState(false);

  // — Listar —
  const [listOwner, setListOwner]   = useState<Owner>('Barbara');
  const [coupons, setCoupons]       = useState<(Coupon & { _tempLoading?: boolean })[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string|null>(null);

  // Carga inicial y al cambiar propietario
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    getCoupons(listOwner)
      .then(data => mounted && setCoupons(data))
      .catch(() => mounted && setError('Error cargando cupones'))
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false };
  }, [listOwner]);

  // Crear un nuevo cupón
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const newC = await createCoupon(title, desc, owner, reusable);
      if (owner === listOwner) {
        setCoupons(prev => [newC, ...prev]);
      }
      setTitle('');
      setDesc('');
      setReusable(false);
    } catch {
      setError('Error creando cupón');
    } finally {
      setCreating(false);
    }
  };

  // Canjear / descanjear
  const handleToggle = async (c: Coupon & { _tempLoading?: boolean }) => {
    setError(null);
    // guardamos si era reutilizable antes de cambiar nada
    const wasReusable = c.reusable;

    // flag de loading
    setCoupons(prev =>
      prev.map(x => x._id === c._id ? { ...x, _tempLoading: true } : x)
    );

    try {
      // llamamos al back
      await redeemCoupon(c._id, !c.redeemed);

      if (!wasReusable) {
        // NO reutilizable: lo eliminamos de la UI
        setCoupons(prev => prev.filter(x => x._id !== c._id));
      } else {
        // reutilizable: solo actualizamos el flag `redeemed`
        setCoupons(prev =>
          prev.map(x =>
            x._id === c._id
              ? { ...x, redeemed: !c.redeemed, _tempLoading: false }
              : x
          )
        );
      }
    } catch {
      setError('Error actualizando estado');
      // quitamos el loading flag si falla
      setCoupons(prev =>
        prev.map(x =>
          x._id === c._id ? { ...x, _tempLoading: false } : x
        )
      );
    }
  };

  // Eliminar manualmente
  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este cupón?')) return;
    setError(null);
    try {
      await deleteCoupon(id);
      setCoupons(prev => prev.filter(x => x._id !== id));
    } catch {
      setError('Error eliminando cupón');
    }
  };

  return (
    <div className="flex flex-col text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <Link href="/">← Volver</Link>
      </header>

      {/* Contenido */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {error && (
          <p className="text-red-500 text-center">{error}</p>
        )}

        {/* Formulario de creación */}
        <form onSubmit={handleCreate} className="space-y-4 bg-gray-800 p-4 rounded-md shadow">
          <h2 className="text-lg font-semibold">Crear cupón</h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select
              value={owner}
              onChange={e => setOwner(e.target.value as Owner)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              {OWNERS.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>

            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Título"
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
            />

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={reusable}
                onChange={e => setReusable(e.target.checked)}
                className="h-4 w-4"
              />
              <span>Reutilizable</span>
            </label>
          </div>

          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Descripción"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 h-20 resize-none"
          />

          <button
            type="submit"
            disabled={creating}
            className={`w-full py-2 rounded-md font-semibold transition-colors ${
              creating
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
            }`}
          >
            {creating ? 'Creando...' : 'Crear Cupón'}
          </button>
        </form>

        {/* Selector de owner */}
        <div className="flex justify-center gap-3">
          {OWNERS.map(o => (
            <button
              key={o}
              onClick={() => setListOwner(o)}
              className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                listOwner === o
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {o}
            </button>
          ))}
        </div>

        {/* Lista de cupones */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : coupons.length === 0 ? (
          <p className="text-gray-400 text-center">
            No hay cupones de {listOwner}.
          </p>
        ) : (
          <ul className="space-y-4">
            {coupons.map(c => {
              const isLoading = (c as any)._tempLoading;
              return (
                <li
                  key={c._id}
                  className="bg-gray-800 p-4 rounded-md shadow flex flex-col justify-between"
                >
                  <div>
                    <h3 className={`text-base sm:text-lg font-semibold ${c.redeemed ? 'line-through' : ''}`}>
                      {c.title}
                    </h3>
                    <p className={`text-gray-400 text-sm sm:text-base ${c.redeemed ? 'line-through' : ''}`}>
                      {c.description}
                    </p>
                    {c.reusable ? (
                      <span className="inline-block text-xs text-green-400 mt-3">
                        ♻️ Reutilizable
                      </span>
                    ) : (
                      <span className="inline-block text-xs text-yellow-500 mt-3">
                        ⚡️ Único
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={c.redeemed}
                        onChange={() => handleToggle(c)}
                        disabled={isLoading}
                      />
                      <div className={`
                        w-11 h-6 rounded-full bg-gray-600
                        peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-purple-500
                        peer-checked:bg-green-600 peer-disabled:opacity-50
                        relative before:content-[''] before:absolute
                        before:top-0.5 before:left-0.5
                        before:bg-white before:border before:border-gray-300
                        before:rounded-full before:h-5 before:w-5
                        before:transition-all peer-checked:before:translate-x-full
                      `} />
                    </label>

                    <button
                      onClick={() => handleDelete(c._id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <FiTrash />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
