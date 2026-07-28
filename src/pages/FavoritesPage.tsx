import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import ListingCard from '../components/listings/ListingCard';
import AuthGate from '../components/common/AuthGate';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { user, listings, favoriteListingIds } = useStore();

  if (!user) {
    return (
      <AuthGate
        title="Sign in to see your favorites"
        subtitle="Log in to view and manage your saved dream homes and vacation rentals across India."
      />
    );
  }

  // Filter listings to only show those that are in favoriteListingIds
  const favoriteListings = listings.filter((l) => favoriteListingIds.includes(l.id));

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">Your Favorites</h1>
        <p className="text-gray-500 dark:text-slate-400 mb-8">All your saved properties in one place</p>

        {favoriteListings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <div className="text-7xl">❤️</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-200">No favorites yet</h3>
            <p className="text-gray-500 dark:text-slate-400 text-center max-w-sm">
              As you search, click the heart icon on your favorite places to save them here.
            </p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition"
            >
              Explore homes
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {favoriteListings.map((listing, index) => (
              <ListingCard key={listing.id} listing={listing} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
