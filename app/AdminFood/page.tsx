// app/AdminFood/page.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/services/api';
import { Product } from '@/types';
import { Spinner } from '@/app/spinner';

export default function AdminFoodPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const load = async () => {
    try {
      const data = await getProducts();
      setItems(data);
    } catch {
      // opcional: setError
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !image.trim()) return;
    setLoading(true);
    try {
      if (editingId) {
        await updateProduct(editingId, { name, image });
        setEditingId(null);
      } else {
        await createProduct(name, image);
      }
      setName('');
      setImage('');
      await load();
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p._id);
    setName(p.name);
    setImage(p.image);
  };

  const handleDelete = async (id: string) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await deleteProduct(id);
      await load();
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white">
      <div className="flex-1 overflow-y-auto max-w-3xl mx-auto p-6 space-y-6">
        <Link href="/" className="text-gray-400 hover:underline">
          ← Volver al Home
        </Link>
        <h1 className="text-3xl font-bold text-center">Admin de Productos</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre del producto"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
          />
          <input
            value={image}
            onChange={e => setImage(e.target.value)}
            placeholder="URL de la imagen"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
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
            {loading
              ? 'Guardando...'
              : editingId
              ? 'Actualizar Producto'
              : 'Crear Producto'}
          </button>
        </form>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Productos existentes</h2>
          {items.length === 0 ? (
            <p className="text-gray-400">No hay productos.</p>
          ) : (
            <ul className="space-y-3">
              {items.map(p => (
                <li
                  key={p._id}
                  className="flex justify-between items-center bg-gray-900 rounded-lg p-4 shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <span className="font-medium">{p.name}</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(p)}
                      className=" rounded-full  hover:text-blue-500 text-white text-sm flex items-center gap-1"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      disabled={actionLoading[p._id]}
                      className=" rounded-full  text-red-500  text-sm flex items-center gap-1"
                    >
                      {actionLoading[p._id] ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <FiTrash2 />
                        </>
                      )}
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
