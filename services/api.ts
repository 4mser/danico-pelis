// src/services/api.ts
import axios from 'axios'
import type {
  AppMovie,
  Coupon,
  ListType,
  Product,
  TMDBMovie,
  InteractionType,
  Pet,
} from '@/types'

export const API_URL = 'https://pelis-danico-production.up.railway.app'
// export const API_URL = 'http://localhost:3000'

/** ——— Mascota ——— */
export const getPet = async (): Promise<Pet> => {
  const res = await axios.get<Pet>(`${API_URL}/pets`)
  return res.data
}
export const interactWithPet = async (
  type: InteractionType,
): Promise<Pet> => {
  const res = await axios.post<Pet>(`${API_URL}/pets/interact/${type}`)
  return res.data
}

/** ——— Películas ——— */
export const searchMovies = async (query: string): Promise<TMDBMovie[]> => {
  const res = await axios.get<TMDBMovie[]>(
    `${API_URL}/tmdb/search`,
    { params: { query } },
  )
  return res.data
}
export const addMovieToList = async (
  movie: TMDBMovie,
  list: ListType,
): Promise<void> => {
  await axios.post(`${API_URL}/movies`, {
    title: movie.title,
    apiId: movie.id.toString(),
    list,
    poster: movie.poster ?? null,
  })
  await interactWithPet('addMovie')
}
export const getMoviesByList = async (
  list: ListType,
): Promise<AppMovie[]> => {
  const res = await axios.get<AppMovie[]>(`${API_URL}/movies/${list}`)
  return res.data
}
export const toggleWatched = async (
  id: string,
  watched: boolean,
): Promise<void> => {
  await axios.patch(`${API_URL}/movies/${id}/watched`, { watched: !watched })
  if (!watched) {
    await interactWithPet('markWatched')
  }
}
export const deleteMovie = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/movies/${id}`)
  await interactWithPet('deleteMovie')
}

/** ——— Cupones ——— */
export const getCoupons = async (
  owner?: 'Nico' | 'Barbara'
): Promise<Coupon[]> => {
  const res = await axios.get<Coupon[]>(`${API_URL}/coupons`, {
    params: owner ? { owner } : {},
  })
  return res.data
}
export const createCoupon = async (
  title: string,
  description: string,
  owner: 'Nico' | 'Barbara',
  reusable: boolean,
  expirationDate?: string,
): Promise<Coupon> => {
  const body: Record<string, any> = { title, description, owner, reusable }
  if (expirationDate) body.expirationDate = expirationDate
  const res = await axios.post<Coupon>(`${API_URL}/coupons`, body)
  await interactWithPet('addCoupon')
  return res.data
}
export const redeemCoupon = async (
  id: string,
  redeemed: boolean,
): Promise<Coupon | { deleted: true }> => {
  const res = await axios.patch<Coupon | { deleted: true }>(
    `${API_URL}/coupons/${id}/redeem`,
    { redeemed },
  )
  if (redeemed) await interactWithPet('redeemCoupon')
  return res.data
}
export const deleteCoupon = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/coupons/${id}`)
}

/** ——— Productos ——— */
export const getProducts = async (): Promise<Product[]> => {
  const res = await axios.get<Product[]>(`${API_URL}/products`)
  return res.data
}

export const getProductById = async (id: string): Promise<Product> => {
  const res = await axios.get<Product>(`${API_URL}/products/${id}`)
  return res.data
}

/**
 * Crea un producto usando FormData:
 * - imageFile (archivo) O imageUrl (string)
 * - storeName?, storeLink?
 */
export const createProduct = async (formData: FormData): Promise<Product> => {
  try {
    const res = await axios.post<Product>(
      `${API_URL}/products`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    await interactWithPet('addProduct')
    return res.data
  } catch (err) {
    console.error('Error creando producto:', err)
    throw err
  }
}

/**
 * Actualiza un producto: acepta FormData igual que createProduct.
 */
export const updateProduct = async (
  id: string,
  formData: FormData,
): Promise<Product> => {
  const before = await getProductById(id)
  try {
    const res = await axios.patch<Product>(
      `${API_URL}/products/${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    const after = res.data

    if (!before.bought && after.bought) {
      await interactWithPet('buyProduct')
    }
    const likedOneNow =
      ((after.likeNico && !before.likeNico) ||
       (after.likeBarbara && !before.likeBarbara)) &&
      !after.likeBoth
    if (likedOneNow) {
      await interactWithPet('likeOne')
    }
    if (!before.likeBoth && after.likeBoth) {
      await interactWithPet('likeBoth')
    }

    return after
  } catch (err) {
    console.error('Error actualizando producto:', err)
    throw err
  }
}

/**
 * Togglear solo la propiedad 'bought' con JSON simple
 */
export const toggleProductBought = async (
  id: string,
  currentBought: boolean,
): Promise<Product> => {
  const before = await getProductById(id)
  const res = await axios.patch<Product>(
    `${API_URL}/products/${id}`,
    { bought: !currentBought }
  )
  const after = res.data
  if (!before.bought && after.bought) {
    await interactWithPet('buyProduct')
  }
  return after
}

/**
 * Borra un producto
 */
export const deleteProduct = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/products/${id}`)
  await interactWithPet('deleteProduct')
}

// — resto de servicios (pet, movies, coupons) permanece igual —
