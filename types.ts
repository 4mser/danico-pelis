export type ListType = 'Barbara' | 'Nico' | 'Juntos';

export interface TMDBMovie {
  id: number;
  title: string;
  poster?: string;
}

export interface AppMovie {
  _id: string;
  apiId: string;
  title: string;
  list: ListType;
  watched: boolean;
  poster?: string;
}