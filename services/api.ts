import axios from 'axios';
import type {
  AppMovie,
  Coupon,
  ListType,
  Product,
  TMDBMovie,
  InteractionType,
  Pet,
} from '@/types';

// const API_URL = 'https://pelis-danico-production.up.railway.app';
const API_URL = 'http://localhost:3000';

/** ——— Mascota ——— */

/** Obtiene estado + mensaje de Rabanito */
export const getPet = async (): Promise<Pet> => {
  const res = await axios.get<Pet>(`${API_URL}/pets`);
  return res.data;
};

/** Dispara interacción y recibe estado + mensaje actualizado */
export const interactWithPet = async (
  type: InteractionType,
): Promise<Pet> => {
  const res = await axios.post<Pet>(
    `${API_URL}/pets/interact/${type}`,
  );
  return res.data;
};

/** ——— Películas ——— */

export const searchMovies = async (query: string): Promise<TMDBMovie[]> => {
  const res = await axios.get<TMDBMovie[]>(
    `${API_URL}/tmdb/search`,
    { params: { query } },
  );
  return res.data;
};

export const addMovieToList = async (
  movie: TMDBMovie,
  list: ListType,
): Promise<void> => {
  await axios.post(`${API_URL}/movies`, {
    title: movie.title,
    apiId: movie.id.toString(),
    list,
    poster: movie.poster ?? null,
  });
  await interactWithPet('addMovie');
};

export const getMoviesByList = async (
  list: ListType,
): Promise<AppMovie[]> => {
  const res = await axios.get<AppMovie[]>(`${API_URL}/movies/${list}`);
  return res.data;
};

export const toggleWatched = async (
  id: string,
  watched: boolean,
): Promise<void> => {
  await axios.patch(`${API_URL}/movies/${id}/watched`, { watched: !watched });
  if (!watched) {
    await interactWithPet('markWatched');
  }
};

export const deleteMovie = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/movies/${id}`);
  await interactWithPet('deleteMovie');
};

/** ——— Cupones ——— */

export const getCoupons = async (): Promise<Coupon[]> => {
  const res = await axios.get<Coupon[]>(`${API_URL}/coupons`);
  return res.data;
};

export const createCoupon = async (
  title: string,
  description: string,
): Promise<Coupon> => {
  const res = await axios.post<Coupon>(`${API_URL}/coupons`, {
    title,
    description,
  });
  await interactWithPet('addCoupon');
  return res.data;
};

export const redeemCoupon = async (
  id: string,
  redeemed: boolean,
): Promise<Coupon> => {
  const res = await axios.patch<Coupon>(
    `${API_URL}/coupons/${id}/redeem`,
    { redeemed: !redeemed },
  );
  if (!redeemed) {
    await interactWithPet('redeemCoupon');
  }
  return res.data;
};

export const deleteCoupon = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/coupons/${id}`);
};

/** ——— Productos ——— */

export const getProducts = async (): Promise<Product[]> => {
  const res = await axios.get<Product[]>(`${API_URL}/products`);
  return res.data;
};

export const createProduct = async (
  name: string,
  image?: string,
): Promise<Product> => {
  const res = await axios.post<Product>(`${API_URL}/products`, {
    name,
    image,
  });
  await interactWithPet('addProduct');
  return res.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const res = await axios.get<Product>(`${API_URL}/products/${id}`);
  return res.data;
};

export const updateProduct = async (
  id: string,
  data: Partial<{
    name: string;
    image: string;
    bought: boolean;
    likeNico: boolean;
    likeBarbara: boolean;
  }>,
): Promise<Product> => {
  const before = await getProductById(id);
  const res = await axios.patch<Product>(`${API_URL}/products/${id}`, data);
  const after = res.data;

  if (data.bought === true && !before.bought) {
    await interactWithPet('buyProduct');
  }

  const likedOneNow =
    ((data.likeNico && !before.likeNico) ||
      (data.likeBarbara && !before.likeBarbara)) &&
    !after.likeBoth;
  if (likedOneNow) {
    await interactWithPet('likeOne');
  }

  if (!before.likeBoth && after.likeBoth) {
    await interactWithPet('likeBoth');
  }

  return after;
};

export const toggleProductBought = async (
  id: string,
  bought: boolean,
): Promise<Product> => {
  return updateProduct(id, { bought: !bought });
};

export const deleteProduct = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/products/${id}`);
};
