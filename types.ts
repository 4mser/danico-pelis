export type ListType = 'Barbara' | 'Nico' | 'Juntos';

export interface TMDBMovie {
  id: number;
  title: string;
  poster?: string;
  type: 'movie' | 'series';
}

export interface AppMovie {
  _id: string;
  apiId: string;
  title: string;
  list: ListType;
  watched: boolean;
  poster?: string;
}

export interface Coupon {
  _id: string;
  title: string;
  description: string;
  redeemed: boolean;
  owner: string;
  reusable: boolean;
  expirationDate?: string; 
}


export interface Product {
  _id: string;
  name: string;
  image: string;
  bought: boolean;
  likeNico: boolean;
  likeBarbara: boolean;
  likeBoth: boolean;
  storeName?: string
  storeLink?: string
}


/** Nuevos tipos para la mascota */


/** Tipos para las interacciones que Rabanito maneja */
export type InteractionType =
  | 'addMovie'
  | 'markWatched'
  | 'deleteMovie'
  | 'addProduct'
  | 'buyProduct'
  | 'likeOne'
  | 'likeBoth'
  | 'addCoupon'
  | 'deleteProduct'  
  | 'redeemCoupon';

/** Representación de la mascota en la DB y el frontend */
export interface Pet {
  _id: string;
  name: string;
  happiness: number;
  energy: number;
  curiosity: number;
  lastInteractionAt: string;
  lastInteractionType: InteractionType | null;
  /** ← agregamos esta línea */
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
}
