import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Map, List, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import ListingCard from '../components/listings/ListingCard';
import { SkeletonGrid } from '../components/common/SkeletonCard';
import ListingsMap from '../components/map/ListingsMap';

const SORT_OPTIONS = [
  { value: 'recommended', label: '⭐ Recommended' },
  { value: 'price_asc', label: '₹ Price: Low to High' },
  { value: 'price_desc', label: '₹ Price: High to Low' },
  { value: 'rating', label: '🌟 Top Rated' },
  { value: 'reviews', label: '💬 Most Reviewed' },
];

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const { filteredListings, setSearchFilters, filterListings, searchFilters, clearFilters } = useStore();
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [showFilters, setShowFilters] = useState(false);

  const location = searchParams.get('location') || '';

  useEffect(() => {
    if (location) setSearchFilters({ location });
    filterListings();
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, [location]);

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return b.averageRating - a.averageRating;
    if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-gray-900 dark:text-slate-100 truncate">
                {location ? `Stays in ${location}` : 'All Stays in India'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {loading ? 'Searching...' : `${sortedListings.length} properties found`}
                {searchFilters.startDate && searchFilters.endDate && (
                  <span> · {searchFilters.startDate} → {searchFilters.endDate}</span>
                )}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 outline-none font-medium cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition ${
                  showFilters ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:border-gray-400'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>

              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:border-gray-400 transition"
              >
                {showMap ? <List className="w-4 h-4" /> : <Map className="w-4 h-4" />}
                {showMap ? 'List' : 'Map'}
              </button>

              {location && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 border border-rose-200 hover:bg-rose-50 transition"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1 block">Min Price</label>
                <input
                  type="number"
                  placeholder="₹0"
                  value={searchFilters.minPrice || ''}
                  onChange={(e) => { setSearchFilters({ minPrice: Number(e.target.value) }); filterListings(); }}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1 block">Max Price</label>
                <input
                  type="number"
                  placeholder="₹1,00,000"
                  value={searchFilters.maxPrice < 100000 ? searchFilters.maxPrice : ''}
                  onChange={(e) => { setSearchFilters({ maxPrice: Number(e.target.value) || 100000 }); filterListings(); }}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1 block">Min Bedrooms</label>
                <input
                  type="number"
                  placeholder="Any"
                  min={0}
                  value={searchFilters.bedroomCount || ''}
                  onChange={(e) => { setSearchFilters({ bedroomCount: Number(e.target.value) }); filterListings(); }}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1 block">Guests</label>
                <input
                  type="number"
                  placeholder="Any"
                  min={1}
                  value={searchFilters.guestCount > 1 ? searchFilters.guestCount : ''}
                  onChange={(e) => { setSearchFilters({ guestCount: Number(e.target.value) || 1 }); filterListings(); }}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 outline-none focus:border-rose-400"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16 md:mb-0">
        {loading ? (
          <SkeletonGrid count={8} />
        ) : sortedListings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <div className="text-7xl">😔</div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-slate-200">No stays found</h3>
            <p className="text-gray-500 dark:text-slate-400 text-center max-w-sm">
              We couldn't find any properties matching your criteria. Try adjusting your filters or searching a different location.
            </p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition"
              >
                Clear all filters
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 border border-gray-200 dark:border-slate-600 rounded-xl font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                Go back
              </button>
            </div>
          </motion.div>
        ) : showMap ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[600px]">
              <ListingsMap listings={sortedListings} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[600px] scrollbar-hide">
              {sortedListings.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} index={i} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Active filters summary */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {location && (
                <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-800">
                  📍 {location}
                </span>
              )}
              {searchFilters.guestCount > 1 && (
                <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
                  👥 {searchFilters.guestCount} guests
                </span>
              )}
              {searchFilters.minPrice > 0 && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  ₹{searchFilters.minPrice.toLocaleString('en-IN')}+ / night
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedListings.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} index={i} />
              ))}
            </div>

            {sortedListings.length > 0 && (
              <div className="mt-10 text-center">
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Showing all {sortedListings.length} results</p>
                <button className="px-8 py-3 border-2 border-gray-900 dark:border-slate-400 text-gray-900 dark:text-slate-300 font-bold rounded-xl hover:bg-gray-900 hover:text-white dark:hover:bg-slate-700 transition">
                  <Search className="w-4 h-4 inline mr-2" />
                  Search more destinations
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
