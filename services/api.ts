// src/api.ts

import { AppMovie, Coupon, ListType, Product, TMDBMovie } from '@/types';
import axios from 'axios';


const API_URL = 'https://pelis-danico-production.up.railway.app';
// const API_URL = 'http://localhost:3000';

// ===== Funciones de películas =====

export const searchMovies = async (query: string): Promise<TMDBMovie[]> => {
  try {
    const res = await axios.get<TMDBMovie[]>(
      `${API_URL}/tmdb/search`,
      { params: { query } }
    );
    return res.data;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw new Error('Error al buscar películas');
  }
};

export const addMovieToList = async (
  movie: TMDBMovie,
  list: ListType
): Promise<void> => {
  try {
    await axios.post(`${API_URL}/movies`, {
      title: movie.title,
      apiId: movie.id.toString(),
      list,
      poster: movie.poster || null,
    });
  } catch (error) {
    console.error('Error adding movie:', error);
    throw new Error('Error al añadir película');
  }
};

export const getMoviesByList = async (
  list: ListType
): Promise<AppMovie[]> => {
  try {
    const res = await axios.get<AppMovie[]>(`${API_URL}/movies/${list}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw new Error('Error al obtener películas');
  }
};

export const toggleWatched = async (
  id: string,
  watched: boolean
): Promise<void> => {
  try {
    await axios.patch(`${API_URL}/movies/${id}/watched`, { watched: !watched });
  } catch (error) {
    console.error('Error toggling watched:', error);
    throw new Error('Error al actualizar estado');
  }
};

export const deleteMovie = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/movies/${id}`);
  } catch (error) {
    console.error('Error deleting movie:', error);
    throw new Error('Error al eliminar película');
  }
};

// ===== Funciones de cupones =====

/**
 * Obtiene todos los cupones
 */
export const getCoupons = async (): Promise<Coupon[]> => {
  try {
    const res = await axios.get<Coupon[]>(`${API_URL}/coupons`);
    return res.data;
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw new Error('Error al obtener cupones');
  }
};

/**
 * Crea un nuevo cupón
 */
export const createCoupon = async (
  title: string,
  description: string
): Promise<Coupon> => {
  try {
    const res = await axios.post<Coupon>(`${API_URL}/coupons`, {
      title,
      description,
    });
    return res.data;
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw new Error('Error al crear cupón');
  }
};

/**
 * Marca o desmarca un cupón como canjeado
 */
export const redeemCoupon = async (
  id: string,
  redeemed: boolean
): Promise<Coupon> => {
  try {
    const res = await axios.patch<Coupon>(
      `${API_URL}/coupons/${id}/redeem`,
      { redeemed }
    );
    return res.data;
  } catch (error) {
    console.error('Error redeeming coupon:', error);
    throw new Error('Error al actualizar cupón');
  }
};

/**
 * Elimina un cupón
 */
export const deleteCoupon = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/coupons/${id}`);
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw new Error('Error al eliminar cupón');
  }
};



// ===== Funciones de productos =====

/**
 * Obtiene todos los productos
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    const res = await axios.get<Product[]>(`${API_URL}/products`);
    return res.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Error al obtener productos');
  }
};

/**
 * Crea un nuevo producto
 */
export const createProduct = async (
  name: string,
  image: string
): Promise<Product> => {
  try {
    const res = await axios.post<Product>(`${API_URL}/products`, {
      name,
      image,
    });
    return res.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Error al crear producto');
  }
};

/**
 * Actualiza nombre, url de imagen o estado “bought” de un producto
 */
// src/services/api.ts
// …
export const updateProduct = async (
  id: string,
  data: Partial<{
    name: string;
    image: string;
    bought: boolean;
    likeNico: boolean;
    likeBarbara: boolean;
  }>
): Promise<Product> => {
  const res = await axios.patch<Product>(`${API_URL}/products/${id}`, data);
  return res.data;
};


/**
 * Marca o desmarca un producto como comprado
 */
export const toggleProductBought = async (
  id: string,
  bought: boolean
): Promise<Product> => {
  try {
    const res = await axios.patch<Product>(`${API_URL}/products/${id}`, {
      bought,
    });
    return res.data;
  } catch (error) {
    console.error('Error toggling product bought:', error);
    throw new Error('Error al actualizar estado de compra');
  }
};

/**
 * Elimina un producto
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/products/${id}`);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Error al eliminar producto');
  }
};