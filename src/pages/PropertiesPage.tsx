import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Star, Eye, Edit, Trash2, BarChart2,
  Home, AlertTriangle, X, TrendingUp, Award
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Listing } from '../data/mockData';
import RentModal from '../components/modals/RentModal';

export default function PropertiesPage() {
  const navigate = useNavigate();
  const { myListings, deleteListing } = useStore();

  const [rentModalOpen, setRentModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // ── Open Add modal
  const handleAdd = () => {
    setEditingListing(null);
    setRentModalOpen(true);
  };

  // ── Open Edit modal with listing pre-filled
  const handleEdit = (listing: Listing) => {
    setEditingListing(listing);
    setRentModalOpen(true);
  };

  // ── Close either modal
  const handleModalClose = () => {
    setRentModalOpen(false);
    setEditingListing(null);
  };

  // ── Open delete confirmation
  const handleDeleteClick = (listing: Listing) => {
    setDeleteTarget(listing);
    setDeleteConfirmText('');
  };

  // ── Confirm delete
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    if (deleteConfirmText.toLowerCase() !== 'delete') return;
    try {
      setIsDeleting(true);
      await deleteListing(deleteTarget.id);
      setDeleteTarget(null);
      setDeleteConfirmText('');
    } catch (err: any) {
      alert(err.message || 'Failed to delete listing');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Stats derived from myListings
  const totalRevenue = myListings.reduce((sum, l) => sum + l.price * 12, 0);
  const avgRating = myListings.length
    ? (myListings.reduce((sum, l) => sum + l.averageRating, 0) / myListings.length).toFixed(2)
    : '—';
  const totalReviews = myListings.reduce((sum, l) => sum + l.reviewCount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">My Properties</h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              {myListings.length === 0
                ? 'No listings yet — add your first property!'
                : `${myListings.length} listing${myListings.length > 1 ? 's' : ''} managed by you`}
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 active:scale-95 transition shadow-md shadow-rose-200 dark:shadow-rose-900/30"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add new listing</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* ── Stats ── */}
        {myListings.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Total Listings',
                value: myListings.length,
                icon: Home,
                color: 'text-blue-600 dark:text-blue-400',
                bg: 'bg-blue-50 dark:bg-blue-950/40',
              },
              {
                label: 'Avg. Rating',
                value: avgRating,
                icon: Star,
                color: 'text-amber-600 dark:text-amber-400',
                bg: 'bg-amber-50 dark:bg-amber-950/40',
              },
              {
                label: 'Total Reviews',
                value: totalReviews,
                icon: Award,
                color: 'text-purple-600 dark:text-purple-400',
                bg: 'bg-purple-50 dark:bg-purple-950/40',
              },
              {
                label: 'Est. Annual Rev.',
                value: `₹${(totalRevenue / 100000).toFixed(1)}L`,
                icon: TrendingUp,
                color: 'text-green-600 dark:text-green-400',
                bg: 'bg-green-50 dark:bg-green-950/40',
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm"
              >
                <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">{label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty State ── */}
        {myListings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-rose-50 dark:bg-rose-950/40 rounded-full flex items-center justify-center mb-6">
              <Home className="w-12 h-12 text-rose-400 dark:text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">No properties yet</h2>
            <p className="text-gray-500 dark:text-slate-400 max-w-sm mb-8">
              List your first property and start earning. It only takes a few minutes to get started.
            </p>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-8 py-3.5 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition shadow-lg shadow-rose-200 dark:shadow-rose-900/30 text-lg"
            >
              <Plus className="w-5 h-5" />
              Add your first listing
            </button>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg text-center">
              {[
                { icon: '🏠', title: 'List for free', desc: 'No upfront costs to list your property' },
                { icon: '📅', title: 'You control dates', desc: 'Block any dates you want' },
                { icon: '💰', title: 'Earn more', desc: 'Set your own price per night' },
              ].map(({ icon, title, desc }) => (
                <div key={title}>
                  <div className="text-3xl mb-2">{icon}</div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{title}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Listings List ── */}
        {myListings.length > 0 && (
          <div className="space-y-4">
            {myListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-md dark:hover:shadow-slate-800/50 transition group"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="sm:w-52 h-44 sm:h-auto flex-shrink-0 overflow-hidden relative">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=60';
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow">
                        ● Active
                      </span>
                    </div>
                    {listing.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                        +{listing.images.length - 1} photos
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-slate-100 text-lg leading-tight line-clamp-1">
                          {listing.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                          📍 {listing.location.address}, {listing.location.city}
                          {listing.location.state ? `, ${listing.location.state}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
                      <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-2.5">
                        <p className="text-gray-400 dark:text-slate-500 text-xs mb-0.5">Price/night</p>
                        <p className="font-bold text-gray-900 dark:text-slate-100">
                          ₹{listing.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-2.5">
                        <p className="text-gray-400 dark:text-slate-500 text-xs mb-0.5">Rating</p>
                        <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-slate-100">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {listing.averageRating > 0 ? listing.averageRating.toFixed(2) : 'New'}
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-2.5">
                        <p className="text-gray-400 dark:text-slate-500 text-xs mb-0.5">Reviews</p>
                        <p className="font-bold text-gray-900 dark:text-slate-100">{listing.reviewCount}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-2.5">
                        <p className="text-gray-400 dark:text-slate-500 text-xs mb-0.5">Guests (max)</p>
                        <p className="font-bold text-gray-900 dark:text-slate-100">{listing.guestCount}</p>
                      </div>
                    </div>

                    {/* Amenities preview */}
                    {listing.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {listing.amenities.slice(0, 5).map((a) => (
                          <span key={a} className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-2 py-0.5 rounded-full capitalize">
                            {a}
                          </span>
                        ))}
                        {listing.amenities.length > 5 && (
                          <span className="text-xs text-gray-400 dark:text-slate-500 px-1 py-0.5">
                            +{listing.amenities.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => navigate(`/listings/${listing.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-xl text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-400 dark:hover:border-slate-400 transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>

                      <button
                        onClick={() => handleEdit(listing)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>

                      <button
                        onClick={() => navigate('/host/dashboard')}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-xl text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                      >
                        <BarChart2 className="w-3.5 h-3.5" /> Analytics
                      </button>

                      <button
                        onClick={() => handleDeleteClick(listing)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 rounded-xl text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/40 transition ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      <RentModal
        isOpen={rentModalOpen}
        onClose={handleModalClose}
        editListing={editingListing}
      />

      {/* ── Delete Confirmation Dialog ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl p-6 z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-950/50 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Delete Listing</h3>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Listing preview */}
            <div className="flex gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl mb-4">
              <img
                src={deleteTarget.images[0]}
                alt={deleteTarget.title}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&q=60';
                }}
              />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm line-clamp-1">{deleteTarget.title}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  {deleteTarget.location.city}, {deleteTarget.location.country}
                </p>
                <p className="text-xs font-medium text-rose-500 mt-0.5">
                  ₹{deleteTarget.price.toLocaleString('en-IN')}/night
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              This action is <strong className="text-gray-900 dark:text-slate-100">permanent</strong> and cannot be undone.
              All bookings and reviews associated with this listing will also be removed.
            </p>

            {/* Confirmation input */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Type <span className="font-bold text-red-500">"delete"</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder='Type "delete" here...'
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-300 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteConfirmText(''); }}
                className="flex-1 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmText.toLowerCase() !== 'delete' || isDeleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
