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
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createOwner, setCreateOwner] = useState<Owner>('Barbara');
  const [createLoading, setCreateLoading] = useState(false);

  // — Listar cupones —
  const [listOwner, setListOwner] = useState<Owner>('Barbara');
  const [coupons, setCoupons] = useState<(Coupon & { _tempLoading?: boolean })[]>([]);
  const [listLoading, setListLoading] = useState(false);

  // — Error genérico —
  const [error, setError] = useState<string | null>(null);

  // Cargar cupones al montar y cuando cambie listOwner
  useEffect(() => {
    let mounted = true;
    setListLoading(true);
    setError(null);

    getCoupons(listOwner)
      .then(data => mounted && setCoupons(data))
      .catch(() => mounted && setError('Error cargando cupones'))
      .finally(() => mounted && setListLoading(false));

    return () => { mounted = false; };
  }, [listOwner]);

  // Manejador de creación
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim() || !createDescription.trim()) return;
    setCreateLoading(true);
    setError(null);

    try {
      const newCoupon = await createCoupon(createTitle, createDescription, createOwner);
      if (createOwner === listOwner) {
        setCoupons(prev => [newCoupon, ...prev]);
      }
      setCreateTitle('');
      setCreateDescription('');
    } catch {
      setError('Error creando cupón');
    } finally {
      setCreateLoading(false);
    }
  };

  // Canjear / descanjear inmediatamente
  const handleToggle = async (c: Coupon & { _tempLoading?: boolean }) => {
    setError(null);
    setCoupons(prev =>
      prev.map(x =>
        x._id === c._id ? { ...x, _tempLoading: true } : x
      )
    );
    try {
      const updated = await redeemCoupon(c._id, !c.redeemed);
      setCoupons(prev =>
        prev.map(x =>
          x._id === updated._id ? { ...updated, _tempLoading: false } : x
        )
      );
    } catch {
      setError('Error actualizando estado');
      setCoupons(prev =>
        prev.map(x =>
          x._id === c._id ? { ...x, _tempLoading: false } : x
        )
      );
    }
  };

  // Eliminar con confirmación y actualización instantánea
  const handleDelete = async (id: string) => {
    setError(null);
    if (!confirm('¿Seguro que quieres eliminar este cupón?')) return;
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
        <Link href="/">
          ← Volver
        </Link>
        <div className="w-6" />
      </header>

      {/* Contenido */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* Error genérico */}
        {error && (
          <p className="text-red-500 text-center">{error}</p>
        )}

        {/* Formulario de creación */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-4 rounded-md shadow">
          <h2 className="text-lg font-semibold">Crear cupón para:</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={createOwner}
              onChange={e => setCreateOwner(e.target.value as Owner)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              {OWNERS.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>

            <input
              value={createTitle}
              onChange={e => setCreateTitle(e.target.value)}
              placeholder="Título"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            />
          </div>

          <textarea
            value={createDescription}
            onChange={e => setCreateDescription(e.target.value)}
            placeholder="Descripción"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 h-20 resize-none"
          />

          <button
            type="submit"
            disabled={createLoading}
            className={`w-full py-2 rounded-md font-semibold transition-colors ${
              createLoading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
            }`}
          >
            {createLoading ? 'Creando...' : 'Crear Cupón'}
          </button>
        </form>

        {/* Filtro por owner */}
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
        {listLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : coupons.length === 0 ? (
          <p className="text-gray-400 text-center">No hay cupones de {listOwner}.</p>
        ) : (
          <ul className="space-y-4">
            {coupons.map(c => {
              const isLoading = c._tempLoading;
              const color = c.owner === 'Barbara' ? 'bg-pink-800' : 'bg-blue-900';
              const dotColor = c.owner === 'Barbara' ? 'bg-pink-300' : 'bg-blue-300';
              return (
                <li
                  key={c._id}
                  className="flex flex-col justify-between bg-gray-800 rounded-md p-4 shadow"
                >
                  {/* Contenido */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">{c.title}</h3>
                    <p className="text-gray-400 text-sm sm:text-base">{c.description}</p>
                  </div>

                  {/* Footer: tag a la izquierda, acciones a la derecha */}
                  <div className="mt-4 flex justify-between items-center">
                    {/* Tag de owner */}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                      <span className={`w-2 h-2 rounded-full mr-1 ${dotColor}`} />
                      {c.owner}
                    </span>

                    {/* Switch + ícono eliminar */}
                    <div className="inline-flex items-center space-x-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={c.redeemed}
                          onChange={() => handleToggle(c as Coupon & { _tempLoading?: boolean })}
                          disabled={isLoading}
                        />
                        <div className={`w-11 h-6 bg-gray-600 peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-purple-500 rounded-full peer-checked:bg-green-600 peer-disabled:opacity-50 before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:bg-white before:border before:border-gray-300 before:rounded-full before:h-5 before:w-5 before:transition-all peer-checked:before:translate-x-full`} />
                      </label>
                      <button onClick={() => handleDelete(c._id)} className="p-1">
                        <FiTrash className="text-red-400 hover:text-red-600" />
                      </button>
                    </div>
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
