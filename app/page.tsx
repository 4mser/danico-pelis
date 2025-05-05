'use client'
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { searchMovies, addMovieToList, getMoviesByList, toggleWatched, deleteMovie } from "../services/api";
import { TMDBMovie, AppMovie, ListType } from "../types";
import { Spinner } from "./spinner";
import { debounce } from "lodash";
import Image from "next/image";

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [tmdbMovies, setTmdbMovies] = useState<TMDBMovie[]>([]);
  const [selectedList, setSelectedList] = useState<ListType>("Barbara");
  const [appMovies, setAppMovies] = useState<AppMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAllResults, setShowAllResults] = useState(false);
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [selectedRandomMovie, setSelectedRandomMovie] = useState<AppMovie | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionProgress, setSelectionProgress] = useState(0);
  const [barbaraPressCount, setBarbaraPressCount] = useState(0);
  const [showLoveModal, setShowLoveModal] = useState(false);

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

  const handleBarbaraPress = () => {
    const newCount = barbaraPressCount + 1;
    setBarbaraPressCount(newCount);
    
    if (newCount >= 5) {
      setShowLoveModal(true);
      setBarbaraPressCount(0);
      
      setTimeout(() => {
        setShowLoveModal(false);
      }, 3000);
    }
    
    setTimeout(() => {
      if (barbaraPressCount > 0 && barbaraPressCount < 5) {
        setBarbaraPressCount(0);
      }
    }, 2000);
  };

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

  const handleDeleteMovie = async (movie: AppMovie) => {
    const confirmDelete = window.confirm(`¿Estás seguro que quieres eliminar "${movie.title}" de la lista?`);
    
    if (!confirmDelete) return;
  
    try {
      setLoading(true);
      await deleteMovie(movie._id);
      setAppMovies(prev => prev.filter(m => m._id !== movie._id));
      setError("");
    } catch (err) {
      setError("Error eliminando película");
    } finally {
      setLoading(false);
    }
  };

  const handleRandomSelection = () => {
    if (appMovies.length === 0) return;
    
    setShowRandomModal(true);
    setIsSelecting(true);
    setSelectedRandomMovie(null);
    setSelectionProgress(0);
    
    const duration = 3000;
    const startTime = Date.now();
    const interval = 100;
    
    const selectionInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setSelectionProgress(progress);
      
      const randomIndex = Math.floor(Math.random() * appMovies.length);
      setSelectedRandomMovie(appMovies[randomIndex]);
      
      if (progress >= 1) {
        clearInterval(selectionInterval);
        setIsSelecting(false);
        
        const finalIndex = Math.floor(Math.random() * appMovies.length);
        setSelectedRandomMovie(appMovies[finalIndex]);
      }
    }, interval);
  };

  const firstThreeResults = tmdbMovies.slice(0, 3);
  const remainingResults = tmdbMovies.slice(3);
  const displayedResults = showAllResults ? tmdbMovies : firstThreeResults;

  const handleClearSearch = () => {
    setQuery("");
    setTmdbMovies([]);
  };

  return (
    <div className="bg-black min-h-[100dvh]">
      <header className="bg-gradient-to-b from-gray-800 to-transparent py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-6">
            Lista de pelis que tenemos que ver jeje 😼🎬
          </h1>

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
            {loading && (
              <div className="absolute right-3 top-3">
                <Spinner size="sm" />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-3 mb-8 justify-center">
          {(["Barbara", "Nico", "Juntos"] as ListType[]).map((list) => (
            <button
              key={list}
              onClick={() => {
                setSelectedList(list);
                if (list === 'Barbara') {
                  handleBarbaraPress();
                }
              }}
              className={`px-4 py-2 text-sm rounded-full transition-colors duration-200
                ${selectedList === list 
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white" 
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300"}`}
            >
              {list === 'Barbara' && 'Barbara 😻'}
              {list === 'Nico' && 'Nico 🥵'}
              {list === 'Juntos' && 'Ver Juntos 😈'}
            </button>
          ))}
        </div>

        {appMovies.length > 1 && !listLoading && (
          <div className="text-center">
            <button
              onClick={handleRandomSelection}
              className="fixed animate-pulse bottom-4 right-4 w-14 h-14 flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-600 rounded-full
                hover:from-pink-600 hover:to-purple-700 transition-all duration-300 p-[2px]"
            >
              <span className="w-full h-full flex items-center justify-center rounded-full text-3xl bg-black/70">
                🎲
              </span> 
            </button>
          </div>
        )}

        {displayedResults.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Resultados de búsqueda</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedResults.map((movie) => (
                <div 
                  key={movie.id} 
                  className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
                >
                  {movie.poster && (
                    <img 
                      src={movie.poster} 
                      alt={movie.title} 
                      className="w-full h-96 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="font-semibold mb-2 truncate">{movie.title}</h3>
                  <div className="flex gap-2 flex-wrap">
                    {(["Barbara", "Nico", "Juntos"] as ListType[]).map((list) => (
                      <button
                        key={list}
                        onClick={() => handleAddMovie(movie, list)}
                        className="text-md px-3 py-1 rounded-full bg-gray-700 hover:bg-gray-600 
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
            <h2 className="text-2xl font-bold">{`Pelis para ${selectedList === 'Juntos' ? 'ver' : ''} ${selectedList}`}</h2>
            <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">
              {appMovies.length} {appMovies.length === 1 ? 'Película' : 'Películas'}
            </span>
          </div>

          {listLoading ? (
            <div className="text-center py-12 w-full flex justify-center">
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
                    <button
                      onClick={() => handleDeleteMovie(movie)}
                      className="text-red-600 hover:text-red-400 transition-colors p-1"
                      disabled={loading}
                      title="Eliminar película"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Modal de selección aleatoria */}
        <AnimatePresence>
          {showRandomModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <div className="relative w-full max-w-2xl p-6">
                <button
                  onClick={() => {
                    setShowRandomModal(false);
                    setSelectedRandomMovie(null);
                  }}
                  className="fixed top-4 right-4 text-white hover:text-pink-500 z-50 text-6xl"
                >
                  &times;
                </button>

                <div className=" rounded-xl overflow-hidden ">
                  <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold mb-6">
                      {isSelecting ? "Seleccionando..." : "¡Película seleccionada!"}
                    </h2>
                    
                    <div className="min-h-[300px] flex items-center justify-center">
                      {selectedRandomMovie ? (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring" }}
                          className="relative"
                        >
                          <img
                            src={selectedRandomMovie.poster || "/placeholder.jpg"}
                            alt={selectedRandomMovie.title}
                            className="mx-auto max-h-64 rounded-lg shadow-xl"
                          />
                        </motion.div>
                      ) : (
                        <Spinner size="lg" />
                      )}
                    </div>

                    {isSelecting && (
                      <motion.div 
                        className="mt-6 bg-gray-800 rounded-full h-2 overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          className="h-full bg-gradient-to-r from-pink-500 to-purple-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${selectionProgress * 100}%` }}
                          transition={{ duration: 3 }}
                        />
                      </motion.div>
                    )}

                    <motion.h3
                      className="text-xl font-bold mt-6"
                      animate={{
                        opacity: isSelecting ? 0.7 : 1,
                        y: isSelecting ? 10 : 0
                      }}
                    >
                      {selectedRandomMovie?.title || ""} 😈
                    </motion.h3>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de amor */}
        <AnimatePresence>
          {showLoveModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gradient-to-br from-pink-500 to-purple-600 p-8 rounded-xl text-center max-w-md mx-4"
              >
                <h2 className="text-3xl font-bold mb-4">Me gustas mucho 🥺🖤</h2>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg animate-fade-in-up">
            ⚠️ {error}
          </div>
        )}
      </main>
    </div>
  );
}