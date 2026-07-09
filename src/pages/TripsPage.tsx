import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, XCircle, CheckCircle, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import AuthGate from '../components/common/AuthGate';

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', color: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400', icon: <CheckCircle className="w-4 h-4" /> },
  pending: { label: 'Pending', color: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400', icon: <Clock className="w-4 h-4" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400', icon: <XCircle className="w-4 h-4" /> },
  completed: { label: 'Completed', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400', icon: <CheckCircle className="w-4 h-4" /> },
};

export default function TripsPage() {
  const navigate = useNavigate();
  const { user, reservations, cancelReservation } = useStore();

  if (!user) return <AuthGate title="Sign in to see your trips" subtitle="Log in to view your upcoming and past bookings across India." />;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">Your Trips</h1>
        <p className="text-gray-500 dark:text-slate-400 mb-8">Manage your upcoming and past trips</p>

        {reservations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <div className="text-7xl">✈️</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-200">No trips yet</h3>
            <p className="text-gray-500 dark:text-slate-400 text-center max-w-sm">
              Start exploring amazing Indian destinations and book your perfect getaway
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition"
            >
              Explore homes
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation, i) => {
              const status = STATUS_CONFIG[reservation.status];
              return (
                <motion.div
                  key={reservation.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-md dark:hover:shadow-slate-800 transition group"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div
                      className="sm:w-48 h-40 sm:h-auto flex-shrink-0 cursor-pointer overflow-hidden"
                      onClick={() => navigate(`/listings/${reservation.listingId}`)}
                    >
                      <img
                        src={reservation.listing.images[0]}
                        alt={reservation.listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h3
                            className="font-semibold text-gray-900 dark:text-slate-100 cursor-pointer hover:text-rose-600 transition text-lg"
                            onClick={() => navigate(`/listings/${reservation.listingId}`)}
                          >
                            {reservation.listing.title}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400 mt-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {reservation.listing.location.city}, {reservation.listing.location.country}
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                          <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                          <div>
                            <p className="font-medium">{format(new Date(reservation.checkIn), 'MMM d')}</p>
                            <p className="text-xs text-gray-400 dark:text-slate-500">Check-in</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                          <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                          <div>
                            <p className="font-medium">{format(new Date(reservation.checkOut), 'MMM d, yyyy')}</p>
                            <p className="text-xs text-gray-400 dark:text-slate-500">Check-out</p>
                          </div>
                        </div>
                        <div className="text-gray-600 dark:text-slate-300">
                          <p className="font-medium">{reservation.nights} nights · {reservation.adults} guest{reservation.adults > 1 ? 's' : ''}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-500">Stay details</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span className="text-xl font-bold text-gray-900 dark:text-slate-100">
                            ₹{reservation.totalPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-sm text-gray-400 dark:text-slate-500 ml-1">total</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {reservation.status === 'completed' && (
                            <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                              <Star className="w-4 h-4 text-yellow-500" />
                              Leave review
                            </button>
                          )}
                          {(reservation.status === 'confirmed' || reservation.status === 'pending') && (
                            <button
                              onClick={() => cancelReservation(reservation.id)}
                              className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 transition"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/listings/${reservation.listingId}`)}
                            className="px-4 py-2 bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-medium hover:bg-gray-700 dark:hover:bg-white transition"
                          >
                            View listing
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
