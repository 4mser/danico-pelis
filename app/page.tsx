'use client'
import { useState, useEffect, useCallback } from "react";
import { searchMovies, addMovieToList, getMoviesByList, toggleWatched } from "../services/api";
import { TMDBMovie, AppMovie, ListType } from "../types";
import { Spinner } from "./spinner";
import { debounce } from "lodash";

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [tmdbMovies, setTmdbMovies] = useState<TMDBMovie[]>([]);
  const [selectedList, setSelectedList] = useState<ListType>("Dani");
  const [appMovies, setAppMovies] = useState<AppMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAllResults, setShowAllResults] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setTmdbMovies([]);
        return;
      }
      
      try {
        setLoading(true);
        const results = await searchMovies(searchQuery);
        setTmdbMovies(results);
        setShowAllResults(false);
        setError("");
      } catch (err) {
        setError("Error buscando películas");
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query, debouncedSearch]);

  useEffect(() => {
    fetchMovies();
  }, [selectedList]);

  const fetchMovies = async () => {
    try {
      setListLoading(true);
      const movies = await getMoviesByList(selectedList);
      setAppMovies(movies);
      setError("");
    } catch (err) {
      setError("Error cargando películas");
    } finally {
      setListLoading(false);
    }
  };

  const handleAddMovie = async (movie: TMDBMovie, list: ListType) => {
    try {
      setLoading(true);
      await addMovieToList(movie, list);
      await fetchMovies();
      setTmdbMovies(prev => prev.filter(m => m.id !== movie.id));
      setError("");
    } catch (err) {
      setError("Error añadiendo película");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWatched = async (id: string, currentState: boolean) => {
    try {
      setLoading(true);
      await toggleWatched(id, currentState);
      setAppMovies(prev => 
        prev.map(movie => 
          movie._id === id ? { ...movie, watched: !movie.watched } : movie
        )
      );
      setError("");
    } catch (err) {
      setError("Error actualizando estado");
    } finally {
      setLoading(false);
    }
  };

  const firstThreeResults = tmdbMovies.slice(0, 3);
  const remainingResults = tmdbMovies.slice(3);
  const displayedResults = showAllResults ? tmdbMovies : firstThreeResults;

  const handleClearSearch = () => {
    setQuery("");
    setTmdbMovies([]);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="bg-gradient-to-b from-gray-800 to-transparent py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-6">Lista de pelis que tenemos que ver jeje 😼 🎬</h1>
          
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 
                focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-100"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="🔍 Buscar pelis..."
              disabled={loading}
            />
            {query && !loading && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            {/* {loading && (
              <div className="absolute right-3 top-3">
                <Spinner size="sm" />
              </div>
            )} */}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-3 mb-8 justify-center">
          {(["Dani", "Nico", "Juntos"] as ListType[]).map((list) => (
            <button
              key={list}
              onClick={() => setSelectedList(list)}
              className={`px-4 py-2 text-sm rounded-full transition-colors duration-200
                ${selectedList === list 
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white" 
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300"}`}
            >
              {list === 'Dani' && 'Dani 🖤'}
              {list === 'Nico' && 'Nico 👹'}
              {list === 'Juntos' && 'Ver Juntos 😈 🔞'}
            </button>
          ))}
        </div>

        {displayedResults.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Resultados de búsqueda</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedResults.map((movie) => (
                <div 
                  key={movie.id} 
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
                >
                  {movie.poster && (
                    <img 
                      src={movie.poster} 
                      alt={movie.title} 
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="font-semibold mb-2 truncate">{movie.title}</h3>
                  <div className="flex gap-2 flex-wrap">
                    {(["Dani", "Nico", "Juntos"] as ListType[]).map((list) => (
                      <button
                        key={list}
                        onClick={() => handleAddMovie(movie, list)}
                        className="text-sm px-3 py-1 rounded-full bg-gray-700 hover:bg-gray-600 
                          transition-colors flex items-center gap-1"
                        disabled={loading}
                      >
                        <span>+</span>
                        <span className="">{list}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {!showAllResults && remainingResults.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAllResults(true)}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg
                    transition-colors duration-200"
                >
                  Mostrar todas las películas ({tmdbMovies.length})
                </button>
              </div>
            )}
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{`Pelis para ${selectedList === 'Juntos' ? 'ver' :''} ${selectedList}`}</h2>
            <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">
              {appMovies.length} {appMovies.length === 1 ? 'Película' : 'Películas'}
            </span>
          </div>
          
          {listLoading ? (
            <div className="text-center py-12 w-full  flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : appMovies.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No hay películas en esta lista
            </div>
          ) : (
            <div className="grid gap-4">
              {appMovies.map((movie) => (
                <div 
                  key={movie._id} 
                  className="bg-gradient-to-br from-gray-800 to-transparent rounded-lg p-4 flex items-center gap-4
                    hover:bg-gray-750 transition-colors"
                >
                  {movie.poster ? (
                  <img 
                    src={movie.poster} 
                    alt={movie.title} 
                    className="w-20 h-28 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-28 bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs text-center">Sin imagen</span>
                  </div>
                )}
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex-1">
                      <h3 className={`font-medium ${movie.watched ? 'text-gray-500 line-through' : ''}`}>
                        {movie.title}
                      </h3>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={movie.watched}
                        onChange={() => handleToggleWatched(movie._id, movie.watched)}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 
                          checked:bg-purple-600 checked:border-purple-600 focus:ring-purple-600"
                        disabled={loading}
                      />
                      <span className="text-sm">Vista</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {loading && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}
        
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg
            animate-fade-in-up">
            ⚠️ {error}
          </div>
        )}
      </main>
      <p className="text-center opacity-10 text-white/40">Me gustas 🥺</p>
    </div>
  );
}