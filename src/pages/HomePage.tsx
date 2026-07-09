import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import CategoryFilter from '../components/common/CategoryFilter';
import ListingCard from '../components/listings/ListingCard';
import { SkeletonGrid } from '../components/common/SkeletonCard';
import { Search, TrendingUp, Map, List, SlidersHorizontal, X, Star, Zap, Award, Monitor, Users } from 'lucide-react';
import ListingsMap from '../components/map/ListingsMap';

const POPULAR_DESTINATIONS = [
  { name: 'Goa', state: 'Goa', emoji: '🏖️', listings: 18, img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=80' },
  { name: 'Manali', state: 'Himachal Pradesh', emoji: '🏔️', listings: 11, img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { name: 'Jaipur', state: 'Rajasthan', emoji: '🏰', listings: 14, img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&q=80' },
  { name: 'Kerala', state: 'Backwaters', emoji: '🌴', listings: 22, img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=80' },
  { name: 'Andaman', state: 'Islands', emoji: '🏝️', listings: 7, img: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=80' },
  { name: 'Varanasi', state: 'Uttar Pradesh', emoji: '🕌', listings: 9, img: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?w=400&q=80' },
];

const QUICK_FILTERS = [
  { key: 'instantBook', label: '⚡ Instant Book', icon: <Zap className="w-3.5 h-3.5" /> },
  { key: 'superhost', label: '🏆 Superhost', icon: <Award className="w-3.5 h-3.5" /> },
  { key: 'rating', label: '⭐ 4.8+ Rating', icon: <Star className="w-3.5 h-3.5" /> },
  { key: 'remoteWork', label: '💻 Remote Work', icon: <Monitor className="w-3.5 h-3.5" /> },
];

export default function HomePage() {
  const {
    filteredListings, filterListings, setSearchModal,
    searchFilters, setSearchFilters, mapView, toggleMapView,
    clearFilters, listings, loadListings, isLoading
  } = useStore();

  const [loading, setLoading] = useState(isLoading);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('recommended');

  useEffect(() => {
    const initializeListings = async () => {
      try {
        // Load listings from API if not already loaded
        if (listings.length === 0) {
          await loadListings();
        }
        filterListings();
      } finally {
        const t = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(t);
      }
    };

    initializeListings();
  }, []);

  const toggleQuickFilter = (key: string) => {
    const next = activeQuickFilters.includes(key)
      ? activeQuickFilters.filter((k) => k !== key)
      : [...activeQuickFilters, key];
    setActiveQuickFilters(next);

    if (key === 'instantBook') setSearchFilters({ instantBook: !searchFilters.instantBook });
    if (key === 'superhost') setSearchFilters({ superhost: !searchFilters.superhost });
    if (key === 'rating') setSearchFilters({ minRating: searchFilters.minRating > 0 ? 0 : 4.8 });
    if (key === 'remoteWork') setSearchFilters({ remoteWorkReady: !searchFilters.remoteWorkReady });
    setTimeout(() => filterListings(), 50);
  };

  const hasActiveFilters =
    activeQuickFilters.length > 0 ||
    searchFilters.minPrice > 0 ||
    searchFilters.maxPrice < 100000;

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case 'priceLow': return a.price - b.price;
      case 'priceHigh': return b.price - a.price;
      case 'topRated': return b.averageRating - a.averageRating;
      default: return 0;
    }
  });

  return (
    <div className="dark:bg-slate-950 min-h-screen transition-colors duration-300">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="relative h-80 sm:h-[420px] bg-gradient-to-br from-rose-500 via-pink-600 to-violet-700 flex items-center justify-center overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-8 left-12 w-44 h-44 bg-white rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-8 right-16 w-56 h-56 bg-yellow-300 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-400 opacity-20 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative text-center text-white px-4 max-w-2xl"
        >
          <p className="text-white/80 font-medium mb-2 tracking-widest text-sm uppercase">Discover India</p>
          <h1 className="text-4xl sm:text-6xl font-black mb-4 leading-tight drop-shadow-lg">
            Find Your Perfect<br />
            <span className="text-yellow-300">Indian Getaway</span>
          </h1>
          <p className="text-lg text-white/80 mb-8">
            From Goa beaches to Himalayan retreats — handpicked stays across India
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSearchModal(true)}
              className="flex items-center gap-3 bg-white text-gray-800 rounded-full px-8 py-4 font-bold text-lg shadow-2xl hover:shadow-rose-300/50 transition-all"
            >
              <Search className="w-5 h-5 text-rose-500" />
              Start Exploring
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={toggleMapView}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-full px-6 py-4 font-semibold hover:bg-white/30 transition"
            >
              <Map className="w-5 h-5" />
              View Map
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* ── Stats ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-4 gap-4">
          {[
            { label: 'Stays in India', value: '120+' },
            { label: 'Happy Guests', value: '850+' },
            { label: 'Indian Cities', value: '18+' },
            { label: 'Avg Rating', value: '4.8 ★' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-lg sm:text-2xl font-black text-gray-900 dark:text-slate-100">{value}</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Popular Destinations ─────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">🇮🇳 Popular Destinations</h2>
          <button
            onClick={() => setSearchModal(true)}
            className="text-sm text-rose-500 font-semibold hover:text-rose-600 transition"
          >
            View all →
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {POPULAR_DESTINATIONS.map((dest, i) => (
            <motion.button
              key={dest.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSearchFilters({ location: dest.name });
                setTimeout(() => filterListings(), 50);
              }}
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-full aspect-square rounded-2xl overflow-hidden relative shadow-md group-hover:shadow-xl transition-shadow">
                <img
                  src={dest.img}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-1.5 left-2 text-white text-xs font-bold">{dest.listings}+</span>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-gray-900 dark:text-slate-100">{dest.name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">{dest.state}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Category Filter ───────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-white dark:bg-slate-950 shadow-sm">
        <CategoryFilter />
      </div>

      {/* ── Filter Bar ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick filters */}
          {QUICK_FILTERS.map((f) => (
            <motion.button
              key={f.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleQuickFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all ${
                activeQuickFilters.includes(f.key)
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-gray-400'
              }`}
            >
              {f.icon}
              {f.label}
            </motion.button>
          ))}

          {/* Price filter */}
          <div className="relative">
            <button
              onClick={() => setShowPriceFilter(!showPriceFilter)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all ${
                searchFilters.minPrice > 0 || searchFilters.maxPrice < 100000
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-gray-400'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Price Range
            </button>
            <AnimatePresence>
              {showPriceFilter && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  className="absolute top-10 left-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-xl z-20 w-64"
                >
                  <p className="text-xs font-bold text-gray-700 dark:text-slate-300 mb-3">
                    ₹{searchFilters.minPrice.toLocaleString('en-IN')} – ₹{searchFilters.maxPrice.toLocaleString('en-IN')}
                  </p>
                  <input
                    type="range"
                    min={0} max={100000} step={1000}
                    value={searchFilters.minPrice}
                    onChange={(e) => {
                      setSearchFilters({ minPrice: Number(e.target.value) });
                      setTimeout(() => filterListings(), 50);
                    }}
                    className="w-full mb-2"
                  />
                  <input
                    type="range"
                    min={0} max={100000} step={1000}
                    value={searchFilters.maxPrice}
                    onChange={(e) => {
                      setSearchFilters({ maxPrice: Number(e.target.value) });
                      setTimeout(() => filterListings(), 50);
                    }}
                    className="w-full"
                  />
                  <button
                    onClick={() => setShowPriceFilter(false)}
                    className="mt-3 w-full py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition"
                  >
                    Apply
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Map / List toggle */}
          <button
            onClick={toggleMapView}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-gray-400 transition ml-auto"
          >
            {mapView ? <List className="w-3.5 h-3.5" /> : <Map className="w-3.5 h-3.5" />}
            {mapView ? 'List View' : 'Map View'}
          </button>

          {/* Clear filters */}
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => { clearFilters(); setActiveQuickFilters([]); }}
              className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold text-rose-500 border border-rose-200 hover:bg-rose-50 transition"
            >
              <X className="w-3.5 h-3.5" /> Clear all
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Main Content: List or Map ─────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16 md:mb-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            {loading ? 'Loading...' : `${filteredListings.length} places to stay`}
          </h2>
          {!mapView && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 outline-none"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="topRated">Top Rated</option>
            </select>
          )}
        </div>

        {loading ? (
          <SkeletonGrid count={8} />
        ) : filteredListings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <div className="text-7xl">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-slate-200">No places found</h3>
            <p className="text-gray-500 dark:text-slate-400">Try adjusting your filters</p>
            <button
              onClick={() => { clearFilters(); setActiveQuickFilters([]); }}
              className="px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition"
            >
              Clear filters
            </button>
          </motion.div>
        ) : mapView ? (
          /* Map View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[600px] rounded-2xl overflow-hidden">
              <ListingsMap
                listings={sortedListings}
                selectedId={selectedMapId}
                onSelect={setSelectedMapId}
              />
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[600px] pr-1 scrollbar-hide">
              {/* Travel Buddy Promo in Map View */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex-shrink-0">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <span className="text-8xl">🤝</span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Users className="w-5 h-5" /> Travel Buddy
                  </h3>
                  <p className="text-sm text-purple-100 mb-4 max-w-sm">
                    Find companions sharing your destination and split costs!
                  </p>
                  <a href="/travel-buddy" className="inline-block bg-white text-purple-600 font-bold px-4 py-2 rounded-xl text-sm hover:shadow-lg transition">
                    Find Matches
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sortedListings.map((listing, i) => (
                  <ListingCard key={listing.id} listing={listing} index={i} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="space-y-8">
            {/* Travel Buddy Promo Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-1/2 -translate-y-1/2 right-10 opacity-20 hidden md:block">
                <span className="text-9xl">✈️</span>
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                    <Users className="w-6 h-6" /> Find Your Travel Buddy
                  </h3>
                  <p className="text-purple-100 max-w-lg">
                    Whether you are heading to Goa or the Himalayas, find like-minded travelers heading to the same destination on the same dates. Split costs on larger properties and make memories together.
                  </p>
                </div>
                <a href="/travel-buddy" className="inline-flex flex-shrink-0 items-center justify-center bg-white text-purple-600 font-bold px-6 py-3 rounded-full text-sm hover:scale-105 hover:shadow-xl transition shadow-lg w-full md:w-auto">
                  Explore Travel Buddies
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedListings.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
