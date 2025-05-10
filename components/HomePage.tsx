// components/HomePage.tsx
'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiCheck, FiPlus } from 'react-icons/fi';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchMovies, addMovieToList, getMoviesByList, toggleWatched, deleteMovie } from '@/services/api';
import { TMDBMovie, AppMovie, ListType } from '@/types';
import { Spinner } from '@/app/spinner';
import { debounce, uniqBy } from 'lodash';

interface HomePageProps {
  isHomeSection: boolean;
  remountKey: number;
}

interface MovieCardProps {
  movie: AppMovie;
  onToggleWatched: (id: string, currentState: boolean) => void;
  onDelete: (movie: AppMovie) => void;
  loading: boolean;
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 16 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const MovieCard: React.FC<MovieCardProps> = ({ movie, onToggleWatched, onDelete, loading }) => (
  <div className="bg-gradient-to-br from-gray-800 to-transparent rounded-lg p-4 flex items-center gap-4 hover:bg-gray-750 transition-colors">
    {movie.poster ? (
      <img src={movie.poster} alt={movie.title} className="w-20 h-28 object-cover rounded-lg" />
    ) : (
      <div className="w-20 h-28 bg-gray-700 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 text-xs">Sin imagen</span>
      </div>
    )}
    <div className="flex-1 flex items-center gap-4">
      <h3 className={`flex-1 font-medium ${movie.watched ? 'text-gray-500 line-through' : ''}`}>
        {movie.title}
      </h3>
      <label className="flex items-center gap-2 cursor-pointer shrink-0">
        <input
          type="checkbox"
          checked={movie.watched}
          onChange={() => onToggleWatched(movie._id, movie.watched)}
          className="w-5 h-5 rounded border-gray-600 bg-gray-700 checked:bg-purple-600 checked:border-purple-600 focus:ring-purple-600"
          disabled={loading}
        />
        <span className="text-sm">Vista</span>
      </label>
      <button
        onClick={() => onDelete(movie)}
        className="text-red-600 hover:text-red-400 transition-colors p-1"
        disabled={loading}
        title="Eliminar película"
      >
        🗑️
      </button>
    </div>
  </div>
);

export default function HomePage({ isHomeSection, remountKey }: HomePageProps) {
  const [query, setQuery] = useState('');
  const [tmdbMovies, setTmdbMovies] = useState<TMDBMovie[]>([]);
  const [selectedList, setSelectedList] = useState<ListType | 'Vistas'>('Barbara');
  const [appMovies, setAppMovies] = useState<AppMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAllResults, setShowAllResults] = useState(false);
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [selectedRandomMovie, setSelectedRandomMovie] = useState<AppMovie | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionProgress, setSelectionProgress] = useState(0);
  const [barbaraPressCount, setBarbaraPressCount] = useState(0);
  const [nicoPressCount, setNicoPressCount] = useState(0);
  const [showLoveModal, setShowLoveModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);

  const debouncedSearch = useRef(
    debounce(async (q: string) => {
      if (!q.trim()) { setTmdbMovies([]); return; }
      try {
        setLoading(true);
        const results = await searchMovies(q);
        setTmdbMovies(results);
        setShowAllResults(false);
        setError('');
      } catch {
        setError('Error buscando películas');
      } finally {
        setLoading(false);
      }
    }, 500)
  ).current;

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const fetchMovies = async () => {
    setListLoading(true);
    try {
      if (selectedList === 'Vistas') {
        const base: ListType[] = ['Barbara','Nico','Juntos'];
        const byList = await Promise.all(base.map(l => getMoviesByList(l)));
        const all = uniqBy(byList.flat(), '_id');
        setAppMovies(all.filter(m => m.watched));
      } else {
        const movies = await getMoviesByList(selectedList as ListType);
        setAppMovies(movies.filter(m => !m.watched));
      }
      setError('');
    } catch {
      setError('Error cargando películas');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => { fetchMovies(); }, [selectedList]);

  const handleAddMovie = async (movie: TMDBMovie, list: ListType) => {
    try {
      setLoading(true);
      await addMovieToList(movie, list);
      await fetchMovies();
      setTmdbMovies(prev => prev.filter(m => m.id !== movie.id));
      setError('');
    } catch { setError('Error añadiendo película'); }
    finally { setLoading(false); }
  };

  const handleToggleWatched = async (id: string, current: boolean) => {
    try {
      setLoading(true);
      await toggleWatched(id, current);
      await fetchMovies();
      setError('');
    } catch { setError('Error actualizando estado'); }
    finally { setLoading(false); }
  };

  const handleDeleteMovie = async (movie: AppMovie) => {
    if (!confirm(`¿Eliminar "${movie.title}"?`)) return;
    try {
      setLoading(true);
      await deleteMovie(movie._id);
      await fetchMovies();
      setError('');
    } catch { setError('Error eliminando película'); }
    finally { setLoading(false); }
  };

  const handleRandomSelection = () => {
    if (appMovies.length < 2) return;
    setShowRandomModal(true);
    setIsSelecting(true);
    setSelectedRandomMovie(null);
    setSelectionProgress(0);
    const duration = 3000, interval = 100, start = Date.now();
    const iv = setInterval(() => {
      const prog = Math.min((Date.now() - start) / duration, 1);
      setSelectionProgress(prog);
      setSelectedRandomMovie(appMovies[Math.floor(Math.random()*appMovies.length)]);
      if (prog >= 1) {
        clearInterval(iv);
        setIsSelecting(false);
        setSelectedRandomMovie(appMovies[Math.floor(Math.random()*appMovies.length)]);
      }
    }, interval);
  };

  const handleClearSearch = () => {
    setQuery('');
    setTmdbMovies([]);
  };

  // Easter eggs…
  const handleBarbaraPress = () => {
    const c = barbaraPressCount + 1;
    setBarbaraPressCount(c);
    if (c >= 5) {
      setShowLoveModal(true);
      setBarbaraPressCount(0);
      setTimeout(() => setShowLoveModal(false), 3000);
    }
    setTimeout(() => {
      if (barbaraPressCount > 0 && barbaraPressCount < 5)
        setBarbaraPressCount(0);
    }, 2000);
  };
  const handleNicoPress = () => {
    const c = nicoPressCount + 1;
    setNicoPressCount(c);
    if (c >= 5) {
      setShowCouponModal(true);
      setNicoPressCount(0);
      setTimeout(() => setShowCouponModal(false), 3000);
    }
    setTimeout(() => {
      if (nicoPressCount > 0 && nicoPressCount < 5)
        setNicoPressCount(0);
    }, 2000);
  };

  const firstThree = tmdbMovies.slice(0,3);
  const displayed = showAllResults ? tmdbMovies : firstThree;

  return (
    <div className="">
      {/* HEADER + BÚSQUEDA */}
      <header className="bg-gradient-to-b from-gray-800 to-transparent py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-6">
            Lista de pelis que tenemos que ver jeje 😼🎬
          </h1>
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-100"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="🔍 Buscar pelis..."
              disabled={loading}
            />
            {query && !loading && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >✕</button>
            )}
            {loading && <div className="absolute right-3 top-3"><Spinner size="sm" /></div>}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4">

        {/* SELECTORES */}
        <div className="flex gap-2 overflow-x-auto mb-8 justify-start pb-3">
          {(['Barbara','Nico','Juntos','Vistas'] as (ListType|'Vistas')[]).map(lst => (
            <button
              key={lst}
              onClick={() => {
                setSelectedList(lst);
                if (lst==='Barbara') handleBarbaraPress();
                if (lst==='Nico')     handleNicoPress();
              }}
              className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                selectedList===lst
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {lst==='Barbara' && 'Bárbara 😻'}
              {lst==='Nico'     && 'Nico 🥵'}
              {lst==='Juntos'   && 'Ver Juntos 😈'}
              {lst==='Vistas'   && 'Vistas 👀'}
            </button>
          ))}
        </div>

        {/* BOTÓN ALEATORIO */}
        {isHomeSection && appMovies.length>1 && !listLoading && (
          <button
            onClick={handleRandomSelection}
            className="fixed bottom-20 right-4 w-14 h-14 flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-600 rounded-full hover:from-pink-600 hover:to-purple-700 animate-pulse p-[2px]"
          >
            <span className="bg-black/70 w-full h-full flex items-center justify-center text-3xl rounded-full">
              🎲
            </span>
          </button>
        )}

        {/* RESULTADOS DE BÚSQUEDA */}
        {displayed.length>0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Resultados de búsqueda</h2>
            <motion.div
              key={remountKey}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={listVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              <AnimatePresence>
                {displayed.map(m => (
                  <motion.div
                    key={m.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                  >
                    <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
                      {m.poster && (
                        <img src={m.poster} alt={m.title}
                             className="w-full h-96 object-cover rounded-lg mb-4" />
                      )}
                      <h3 className="font-semibold mb-2 truncate">{m.title}</h3>
                      <div className="flex gap-2 flex-wrap">
                        {(['Barbara','Nico','Juntos'] as ListType[]).map(l => (
                          <button
                            key={l}
                            onClick={() => handleAddMovie(m, l)}
                            className="px-3 py-1 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors flex items-center gap-1"
                            disabled={loading}
                          >
                            + {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            {!showAllResults && tmdbMovies.length>3 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAllResults(true)}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg"
                >
                  Mostrar todas ({tmdbMovies.length})
                </button>
              </div>
            )}
          </section>
        )}

        {/* LISTA ACTIVA */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {selectedList==='Vistas'
                ? 'Películas Vistas'
                : `Pelis para ${selectedList==='Juntos' ? 'ver ' : ''}${selectedList}`}
            </h2>
            <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">
              {appMovies.length} {appMovies.length===1 ? 'Película' : 'Películas'}
            </span>
          </div>

          {listLoading ? (
            <div className="text-center py-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : appMovies.length===0 ? (
            <div className="text-center py-12 text-gray-400">
              {selectedList==='Vistas'
                ? 'No hay vistas aún'
                : 'No hay películas en esta lista'}
            </div>
          ) : (
            <motion.div
              key={remountKey}
              className="grid gap-4 pb-10"
              variants={listVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              <AnimatePresence>
                {appMovies.map(movie => (
                  <motion.div
                    key={movie._id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                  >
                    <MovieCard
                      movie={movie}
                      onToggleWatched={handleToggleWatched}
                      onDelete={handleDeleteMovie}
                      loading={loading}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        {/* MODALES y overlays de loading/error… */}
      </main>
    </div>
  );
}
