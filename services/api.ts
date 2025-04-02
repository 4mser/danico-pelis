import { AppMovie, ListType, TMDBMovie } from "@/types";
import axios from "axios";

const API_URL = "https://pelis-danico-production.up.railway.app";

export const searchMovies = async (query: string): Promise<TMDBMovie[]> => {
  try {
    const res = await axios.get(`${API_URL}/tmdb/search?query=${query}`);
    return res.data;
  } catch (error) {
    console.error("Error searching movies:", error);
    throw new Error("Error al buscar películas");
  }
};

export const addMovieToList = async (movie: TMDBMovie, list: ListType) => {
  try {
    await axios.post(`${API_URL}/movies`, {
      title: movie.title,
      apiId: movie.id.toString(),
      list,
      poster: movie.poster || null // Asegurar que se envía el poster
    });
  } catch (error) {
    console.error("Error adding movie:", error);
    throw new Error("Error al añadir película");
  }
};

export const getMoviesByList = async (list: ListType): Promise<AppMovie[]> => {
  try {
    const res = await axios.get(`${API_URL}/movies/${list}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw new Error("Error al obtener películas");
  }
};

export const toggleWatched = async (id: string, watched: boolean) => {
  try {
    await axios.patch(`${API_URL}/movies/${id}/watched`, { watched: !watched });
  } catch (error) {
    console.error("Error toggling watched:", error);
    throw new Error("Error al actualizar estado");
  }
};

export const deleteMovie = async (id: string) => {
  try {
    await axios.delete(`${API_URL}/movies/${id}`);
  } catch (error) {
    console.error("Error deleting movie:", error);
    throw new Error("Error al eliminar película");
  }
};