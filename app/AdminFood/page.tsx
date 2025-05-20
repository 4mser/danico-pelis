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
  const [items, setItems] = useState<Product[]>([])
  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [storeName, setStoreName] = useState('')
  const [storeLink, setStoreLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  const load = async () => {
    const data = await getProducts()
    setItems(data)
  }

  useEffect(() => {
    load()
  }, [])

  const resetForm = () => {
    setName('')
    setImageUrl('')
    setImageFile(null)
    setStoreName('')
    setStoreLink('')
    setEditingId(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      if (imageFile) {
        formData.append('imageFile', imageFile)
      } else if (imageUrl.trim()) {
        formData.append('imageUrl', imageUrl.trim())
      }
      if (storeName.trim()) formData.append('storeName', storeName.trim())
      if (storeLink.trim()) formData.append('storeLink', storeLink.trim())

      if (editingId) {
        await updateProduct(editingId, formData)
      } else {
        await createProduct(formData)
      }
      resetForm()
      await load()
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (p: Product) => {
    setEditingId(p._id)
    setName(p.name)
    setImageUrl(p.image)
    setStoreName(p.storeName || '')
    setStoreLink(p.storeLink || '')
    setImageFile(null)
  }

  const handleDelete = async (id: string) => {
    setActionLoading(prev => ({ ...prev, [id]: true }))
    try {
      await deleteProduct(id)
      await load()
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] text-white">
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
            required
          />

          

          <input
            value={storeName}
            onChange={e => setStoreName(e.target.value)}
            placeholder="Nombre del local (opcional)"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
          />
          <input
            value={storeLink}
            onChange={e => setStoreLink(e.target.value)}
            placeholder="Link de la tienda (opcional)"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
          />

<div className="flex flex-col gap-4">
            <label className="">
              <span className="block text-sm mb-1">Subir imagen</span>
              <input
                type="file"
                accept="image/*"
                onChange={e => setImageFile(e.target.files?.[0] ?? null)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </label>
            <label className="">
              <span className="block text-sm mb-1">O usar URL de imágen</span>
              <input
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </label>
          </div>
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
                  className="flex justify-between items-center bg-gray-800 rounded-lg p-4 shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{p.name}</span>
                      {p.storeName && (
                        <a
                          href={p.storeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-400 hover:underline"
                        >
                          {p.storeName}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(p)}
                      className="rounded-full hover:text-blue-500 text-white text-sm flex items-center gap-1"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      disabled={actionLoading[p._id]}
                      className="rounded-full text-red-500 text-sm flex items-center gap-1"
                    >
                      {actionLoading[p._id] ? (
                        <Spinner size="sm" />
                      ) : (
                        <FiTrash2 />
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
  )
}
