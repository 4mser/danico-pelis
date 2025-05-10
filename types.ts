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
}


export interface Product {
  _id: string;
  name: string;
  image: string;
  bought: boolean;
  likeNico: boolean;
  likeBarbara: boolean;
  likeBoth: boolean;

}
