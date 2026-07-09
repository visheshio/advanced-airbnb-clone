import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Heart, Share2, ChevronLeft, MapPin, Shield, Award, Clock,
  Users, Bed, Bath, Check, Zap, X, ChevronRight, ChevronLeft as ChevronPrev,
  Wifi, Monitor, AlertTriangle, Phone, Building2, ShoppingBag, Stethoscope,
  Bus, Volume2, Footprints, ShieldCheck, Calendar, BadgePercent, Laptop,
  Armchair, ScreenShare, Moon, Activity, MapPinned, Sparkles
} from 'lucide-react';
import { AMENITY_LABELS, Reservation } from '../data/mockData';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/formatPrice';
import { differenceInDays } from 'date-fns';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PropertyMap from '../components/map/PropertyMap';

/** Compute the "True Total" with all fees + tax */
function computeTrueTotal(price: number, nights: number, cleaningFee: number, serviceFee: number, taxRate?: number): { base: number; cleaning: number; service: number; tax: number; total: number } {
  const base = price * nights;
  const cleaning = cleaningFee;
  const service = serviceFee;
  const subtotal = base + cleaning + service;
  const tax = taxRate ? Math.round(subtotal * taxRate) : 0;
  const total = subtotal + tax;
  return { base, cleaning, service, tax, total };
}

/** Host Health Score color */
function getHealthColor(score: number): string {
  if (score >= 90) return 'text-emerald-500';
  if (score >= 70) return 'text-amber-500';
  return 'text-red-500';
}
function getHealthBg(score: number): string {
  if (score >= 90) return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800';
  if (score >= 70) return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
  return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
}
function getHealthLabel(score: number): string {
  if (score >= 95) return 'Exceptional Host';
  if (score >= 90) return 'Excellent Host';
  if (score >= 80) return 'Good Host';
  if (score >= 70) return 'Average Host';
  return 'Needs Improvement';
}

export default function ListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, toggleFavorite, addReservation, selectedCurrency, listings, reviews, favoriteListingIds, setLoginModal } = useStore();

  // Find listing from store (includes user-created) or fall back
  const listing = listings.find((l) => l.id === id);
  const listingReviews = reviews.filter((r) => r.listingId === id);

  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'reviews' | 'area'>('overview');
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false);
  const [showBlindReview, setShowBlindReview] = useState(false);
  const [blindReviewData, setBlindReviewData] = useState({ rating: 5, comment: '', cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 });

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 dark:bg-slate-950">
        <div className="text-7xl">🏠</div>
        <h2 className="text-2xl font-bold dark:text-slate-100">Listing not found</h2>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold">Go Home</button>
      </div>
    );
  }

  const isFavorite = favoriteListingIds.includes(listing.id);
  const nights = checkIn && checkOut ? Math.max(0, differenceInDays(new Date(checkOut), new Date(checkIn))) : 0;
  const trueTotals = computeTrueTotal(listing.price, nights || 3, listing.cleaningFee, listing.serviceFee, listing.taxRate);
  const bookingTotals = nights > 0 ? computeTrueTotal(listing.price, nights, listing.cleaningFee, listing.serviceFee, listing.taxRate) : null;

  const handleBook = () => {
    if (!user) { setLoginModal(true); return; }
    if (!checkIn || !checkOut || nights <= 0) return;
    const reservation: Reservation = {
      id: Date.now().toString(),
      listingId: listing.id,
      listing,
      checkIn,
      checkOut,
      nights,
      adults: guests,
      children: 0,
      totalPrice: bookingTotals!.total,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    addReservation(reservation);
    setBookingSuccess(true);
    toast.success('🎉 Booking confirmed! Redirecting to trips...');
    setTimeout(() => navigate('/trips'), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleBlindReviewSubmit = () => {
    if (!user) { setLoginModal(true); return; }
    const { addReview } = useStore.getState();
    addReview({
      id: `review-${Date.now()}`,
      listingId: listing.id,
      guestId: user.id,
      reviewer: { firstName: user.firstName, lastName: user.lastName.charAt(0) + '.', profileImage: user.profileImage },
      overallRating: blindReviewData.rating,
      comment: blindReviewData.comment,
      ratings: { cleanliness: blindReviewData.cleanliness, accuracy: blindReviewData.accuracy, checkIn: blindReviewData.checkIn, communication: blindReviewData.communication, location: blindReviewData.location, value: blindReviewData.value },
      createdAt: new Date().toISOString(),
      revealedAt: null, // Will only reveal when host also submits
    });
    setShowBlindReview(false);
    toast.success('🔒 Review submitted! It will be revealed once the host also reviews.');
  };

  // Full-screen photo gallery
  if (showAllPhotos) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex items-center justify-between p-4 flex-shrink-0">
          <button onClick={() => setShowAllPhotos(false)} className="bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition text-white">
            <X className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold">{photoIndex + 1} / {listing.images.length}</span>
          <div className="w-10" />
        </div>
        <div className="flex-1 relative flex items-center justify-center px-4">
          <img src={listing.images[photoIndex]} alt={`Photo ${photoIndex + 1}`} className="max-h-full max-w-full object-contain rounded-xl" />
          {photoIndex > 0 && (
            <button onClick={() => setPhotoIndex(photoIndex - 1)} className="absolute left-4 bg-white/20 hover:bg-white/40 rounded-full p-3 text-white transition">
              <ChevronPrev className="w-6 h-6" />
            </button>
          )}
          {photoIndex < listing.images.length - 1 && (
            <button onClick={() => setPhotoIndex(photoIndex + 1)} className="absolute right-4 bg-white/20 hover:bg-white/40 rounded-full p-3 text-white transition">
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
        <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide flex-shrink-0">
          {listing.images.map((img, i) => (
            <img key={i} src={img} alt="" onClick={() => setPhotoIndex(i)}
              className={`h-16 w-24 object-cover rounded-lg cursor-pointer flex-shrink-0 transition ${i === photoIndex ? 'ring-2 ring-white opacity-100' : 'opacity-60 hover:opacity-80'}`} />
          ))}
        </div>
      </div>
    );
  }

  const tabs = listing.areaIntelligence
    ? (['overview', 'amenities', 'reviews', 'area'] as const)
    : (['overview', 'amenities', 'reviews'] as const);

  return (
    <div className="dark:bg-slate-950 min-h-screen transition-colors pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <div className="pt-4 pb-2">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition group">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-slate-100 leading-tight">{listing.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-sm font-semibold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="dark:text-slate-200">{listing.averageRating}</span>
                <span className="text-gray-500 dark:text-slate-400 font-normal">· {listing.reviewCount} reviews</span>
              </div>
              {listing.owner.isSuperhost && (
                <span className="flex items-center gap-1 text-sm font-semibold text-rose-500">
                  <Award className="w-4 h-4" /> Superhost
                </span>
              )}
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400">
                <MapPin className="w-4 h-4" />
                {listing.location.city}, {listing.location.state}
              </div>
              {listing.remoteWorkReady && (
                <span className="flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  <Monitor className="w-4 h-4" /> WFH Ready
                </span>
              )}
              {listing.tenantModeAvailable && (
                <span className="flex items-center gap-1 text-sm font-semibold text-violet-600 dark:text-violet-400">
                  <Calendar className="w-4 h-4" /> Long-term Available
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button onClick={() => toggleFavorite(listing.id)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-semibold transition ${isFavorite ? 'border-rose-300 bg-rose-50 dark:bg-rose-950 text-rose-600' : 'border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              {isFavorite ? 'Saved' : 'Save'}
            </button>
          </div>
        </motion.div>

        {/* Photo Gallery */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-64 sm:h-[420px] rounded-2xl overflow-hidden mb-8">
          <div className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden" onClick={() => setShowAllPhotos(true)}>
            <img src={listing.images[0]} alt="Main" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          {listing.images.slice(1, 5).map((img, i) => (
            <div key={i} className="relative overflow-hidden cursor-pointer" onClick={() => { setPhotoIndex(i + 1); setShowAllPhotos(true); }}>
              <img src={img} alt={`Photo ${i + 2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              {i === 3 && listing.images.length > 5 && (
                <button className="absolute inset-0 bg-black/50 text-white flex items-center justify-center text-sm font-bold hover:bg-black/60 transition">
                  +{listing.images.length - 5} photos
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ── TRUE TOTAL PRICE BANNER ─────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mb-8 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-emerald-800 dark:text-emerald-300">True Total Price™ — No Hidden Fees</h3>
          </div>
          <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-3">
            Unlike other platforms, we show you the <strong>real total cost upfront</strong>. No surprises at checkout.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase">3 Nights</p>
              <p className="font-bold text-gray-900 dark:text-slate-100">{formatPrice(trueTotals.base, selectedCurrency)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase">Cleaning</p>
              <p className="font-bold text-gray-900 dark:text-slate-100">{formatPrice(trueTotals.cleaning, selectedCurrency)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase">Service</p>
              <p className="font-bold text-gray-900 dark:text-slate-100">{formatPrice(trueTotals.service, selectedCurrency)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase">Tax ({listing.taxRate ? `${(listing.taxRate * 100).toFixed(0)}%` : '0%'})</p>
              <p className="font-bold text-gray-900 dark:text-slate-100">{formatPrice(trueTotals.tax, selectedCurrency)}</p>
            </div>
            <div className="bg-emerald-600 dark:bg-emerald-500 rounded-xl p-3 text-white col-span-2 sm:col-span-1">
              <p className="text-xs font-bold uppercase opacity-80">TRUE TOTAL</p>
              <p className="font-black text-lg">{formatPrice(trueTotals.total, selectedCurrency)}</p>
            </div>
          </div>
        </motion.div>

        {/* Content + Booking */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-16">
          {/* Left */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host bar */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-6">
              <div>
                <h2 className="text-xl font-bold dark:text-slate-100">
                  {listing.propertyType.charAt(0).toUpperCase() + listing.propertyType.slice(1)} hosted by {listing.owner.firstName}
                </h2>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-slate-400 mt-1 flex-wrap">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {listing.guestCount} guests</span>
                  <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {listing.bedroomCount} bedrooms · {listing.bedCount} beds</span>
                  <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {listing.bathroomCount} baths</span>
                </div>
              </div>
              <img src={listing.owner.profileImage} alt={listing.owner.firstName} className="w-14 h-14 rounded-full bg-gray-100 ring-2 ring-rose-100 flex-shrink-0" />
            </div>

            {/* ── HOST HEALTH SCORE ───────────────────────────── */}
            {listing.hostHealthScore !== undefined && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border ${getHealthBg(listing.hostHealthScore)}`}>
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-200 dark:text-slate-700" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" strokeWidth="2.5" strokeDasharray={`${listing.hostHealthScore}, 100`}
                      strokeLinecap="round" className={getHealthColor(listing.hostHealthScore)} stroke="currentColor" />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-sm font-black ${getHealthColor(listing.hostHealthScore)}`}>
                    {listing.hostHealthScore}
                  </span>
                </div>
                <div>
                  <p className="font-bold dark:text-slate-100">Host Health Score: {getHealthLabel(listing.hostHealthScore)}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-slate-400 mt-1">
                    <span>📊 Response rate: {listing.owner.responseRate}%</span>
                    <span>⏱️ {listing.owner.responseTime}</span>
                    <span>{listing.cancellationHistory === 0 ? '✅ Never cancelled' : `⚠️ Cancelled ${listing.cancellationHistory}x`}</span>
                    {listing.cancellationHistory === 0 && listing.hostHealthScore >= 90 && (
                      <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">🏆 Super Consistent</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Highlights */}
            <div className="space-y-4">
              {listing.instantBook && (
                <div className="flex items-start gap-4 p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-xl border border-yellow-100 dark:border-yellow-900/50">
                  <Zap className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold dark:text-slate-100">Instant Book</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Book without waiting for host approval.</p>
                  </div>
                </div>
              )}
              {listing.owner.isSuperhost && (
                <div className="flex items-start gap-4 p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900/50">
                  <Award className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold dark:text-slate-100">{listing.owner.firstName} is a Superhost</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Superhosts are experienced, highly rated hosts committed to great stays.</p>
                  </div>
                </div>
              )}

              {/* ── WORK FROM HOME MODE ─────────────────────────── */}
              {listing.remoteWorkReady && (
                <div className="p-5 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <Laptop className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-indigo-900 dark:text-indigo-300">🖥️ Digital Nomad Certified</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className={`flex items-center gap-2 p-2.5 rounded-xl text-sm ${listing.internetSpeedMbps ? 'bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-800' : 'opacity-40'}`}>
                      <Wifi className="w-4 h-4 text-indigo-500" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-slate-100">{listing.internetSpeedMbps || '?'} Mbps</p>
                        <p className="text-xs text-gray-400">Tested monthly</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 p-2.5 rounded-xl text-sm ${listing.hasDedicatedDesk ? 'bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-800' : 'opacity-40'}`}>
                      <Monitor className="w-4 h-4 text-indigo-500" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-slate-100">Dedicated Desk</p>
                        <p className="text-xs text-gray-400">{listing.hasDedicatedDesk ? '✅ Available' : '❌ N/A'}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 p-2.5 rounded-xl text-sm ${listing.hasErgonomicChair ? 'bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-800' : 'opacity-40'}`}>
                      <Armchair className="w-4 h-4 text-indigo-500" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-slate-100">Ergonomic Chair</p>
                        <p className="text-xs text-gray-400">{listing.hasErgonomicChair ? '✅ Available' : '❌ N/A'}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 p-2.5 rounded-xl text-sm ${listing.hasMultipleMonitors ? 'bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-800' : 'opacity-40'}`}>
                      <ScreenShare className="w-4 h-4 text-indigo-500" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-slate-100">Extra Monitors</p>
                        <p className="text-xs text-gray-400">{listing.hasMultipleMonitors ? '✅ Available' : '❌ N/A'}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 p-2.5 rounded-xl text-sm ${listing.quietHoursGuarantee ? 'bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-800' : 'opacity-40'}`}>
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-slate-100">Quiet Hours</p>
                        <p className="text-xs text-gray-400">{listing.quietHoursGuarantee ? '✅ Guaranteed' : '❌ N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TENANT MODE ─────────────────────────────────── */}
              {listing.tenantModeAvailable && (
                <div className="p-4 bg-violet-50 dark:bg-violet-950/30 rounded-xl border border-violet-200 dark:border-violet-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    <h3 className="font-bold text-violet-800 dark:text-violet-300">Tenant Mode Available</h3>
                    {listing.monthlyDiscount && (
                      <span className="bg-violet-600 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                        {listing.monthlyDiscount}% OFF monthly
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-violet-700 dark:text-violet-400">
                    Stay 28+ nights with flexible month-to-month terms.
                    {listing.utilityIncluded && ' Utilities included in the price.'}
                    {listing.monthlyDiscount && ` Save ${listing.monthlyDiscount}% on monthly bookings.`}
                  </p>
                </div>
              )}

              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-gray-600 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold dark:text-slate-100">Great location · {listing.location.city}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">95% of recent guests gave the location a 5-star rating.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-gray-600 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold dark:text-slate-100">Check-in: {listing.houseRules.checkInTime}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Flexible check-out until {listing.houseRules.checkOutTime}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-slate-700">
              <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`relative px-4 pb-3 text-sm font-semibold capitalize transition whitespace-nowrap ${activeTab === tab ? 'text-gray-900 dark:text-slate-100' : 'text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'}`}>
                    {tab === 'area' ? '📍 Area Intel' : tab} {tab === 'reviews' && `(${listingReviews.length})`}
                    {activeTab === tab && (
                      <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-slate-100 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {activeTab === 'overview' && (
                  <div className="space-y-5">
                    <p className="text-gray-700 dark:text-slate-300 leading-relaxed text-base">{listing.description}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Check-in', value: listing.houseRules.checkInTime },
                        { label: 'Check-out', value: listing.houseRules.checkOutTime },
                        { label: 'Cancellation', value: listing.cancellationPolicy },
                        { label: 'Max guests', value: `${listing.guestCount} people` },
                      ].map((item) => (
                        <div key={item.label} className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                          <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">{item.label}</p>
                          <p className="font-semibold text-gray-900 dark:text-slate-100 capitalize">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h3 className="font-bold dark:text-slate-100 mb-3">House rules</h3>
                      <div className="flex flex-wrap gap-2">
                        {!listing.houseRules.petsAllowed && <span className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full text-sm font-medium">🚫 No pets</span>}
                        {listing.houseRules.petsAllowed && <span className="bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-medium">🐾 Pets welcome</span>}
                        {!listing.houseRules.smokingAllowed && <span className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full text-sm font-medium">🚭 No smoking</span>}
                        {!listing.houseRules.partiesAllowed && <span className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full text-sm font-medium">🎉 No parties</span>}
                        {listing.houseRules.partiesAllowed && <span className="bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-medium">🎊 Events allowed</span>}
                      </div>
                    </div>

                    {/* ── LOCAL EXPERIENCES ─────────────────────────── */}
                    {listing.localExperiences && listing.localExperiences.length > 0 && (
                      <div>
                        <h3 className="font-bold dark:text-slate-100 mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-amber-500" /> Local Experiences by {listing.owner.firstName}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {listing.localExperiences.map((exp) => (
                            <motion.div key={exp.id} whileHover={{ scale: 1.02 }}
                              className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-200 dark:border-amber-800 cursor-pointer"
                              onClick={() => toast.success(`"${exp.title}" — Contact ${exp.hostName} to book!`)}>
                              <div className="flex items-start gap-3">
                                <span className="text-3xl">{exp.icon}</span>
                                <div className="flex-1">
                                  <p className="font-bold text-gray-900 dark:text-slate-100">{exp.title}</p>
                                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{exp.description}</p>
                                  <div className="flex items-center gap-3 mt-2 text-xs">
                                    <span className="font-bold text-amber-700 dark:text-amber-400">{formatPrice(exp.price, selectedCurrency)}</span>
                                    <span className="text-gray-400">·</span>
                                    <span className="text-gray-500 dark:text-slate-400">{exp.duration}</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'amenities' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {listing.amenities.map((amenity) => {
                      const info = AMENITY_LABELS[amenity];
                      if (!info) return null;
                      return (
                        <motion.div key={amenity} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition group">
                          <span className="text-2xl">{info.icon}</span>
                          <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">{info.label}</span>
                          <Check className="w-4 h-4 text-emerald-500 ml-auto opacity-0 group-hover:opacity-100 transition" />
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    {/* Rating summary */}
                    <div className="flex items-center gap-6 p-5 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                      <div className="text-center">
                        <p className="text-5xl font-black text-gray-900 dark:text-slate-100">{listing.averageRating}</p>
                        <div className="flex gap-0.5 mt-1 justify-center">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={`w-4 h-4 ${s <= Math.round(listing.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{listing.reviewCount} reviews</p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {['Cleanliness', 'Accuracy', 'Check-in', 'Communication', 'Location', 'Value'].map((key) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-slate-400 w-24">{key}</span>
                            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                              <div className="h-full bg-gray-900 dark:bg-slate-100 rounded-full" style={{ width: `${(listing.averageRating / 5) * 100}%` }} />
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-slate-300 w-6">{listing.averageRating}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Blind Review System CTA */}
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="font-bold text-indigo-800 dark:text-indigo-300">🔒 Dual Blind Review System</h4>
                      </div>
                      <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-3">
                        Reviews are only revealed after <strong>both guest and host submit</strong>. This prevents retaliation reviews and ensures honest feedback.
                      </p>
                      <button onClick={() => { user ? setShowBlindReview(true) : setLoginModal(true); }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition">
                        Write a Blind Review
                      </button>
                    </div>

                    {listingReviews.length === 0 ? (
                      <p className="text-gray-500 dark:text-slate-400">No reviews yet. Be the first to review!</p>
                    ) : (
                      <div className="space-y-5">
                        {listingReviews.map((review) => (
                          <div key={review.id} className="border-b border-gray-100 dark:border-slate-800 pb-5">
                            <div className="flex items-center gap-3 mb-3">
                              <img src={review.reviewer.profileImage} alt={review.reviewer.firstName} className="w-10 h-10 rounded-full bg-gray-100" />
                              <div>
                                <p className="font-bold text-sm dark:text-slate-100">{review.reviewer.firstName} {review.reviewer.lastName}</p>
                                <p className="text-xs text-gray-400 dark:text-slate-500">{format(new Date(review.createdAt), 'MMMM yyyy')}</p>
                              </div>
                              <div className="ml-auto flex items-center gap-1">
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.overallRating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                  ))}
                                </div>
                                {review.revealedAt === null && (
                                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold ml-2">
                                    🔒 Blind
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">"{review.comment}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── AREA INTELLIGENCE TAB ─────────────────────── */}
                {activeTab === 'area' && listing.areaIntelligence && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800">
                        <Footprints className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                        <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{listing.areaIntelligence.walkabilityScore}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">Walkability</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 text-center border border-green-200 dark:border-green-800">
                        <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
                        <p className="text-2xl font-black text-green-700 dark:text-green-300">{listing.areaIntelligence.safetyRating}/5</p>
                        <p className="text-xs text-green-600 dark:text-green-400 font-bold">Safety</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 text-center border border-amber-200 dark:border-amber-800">
                        <Volume2 className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                        <div>
                          <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Day: {listing.areaIntelligence.noiseLevel.day}</p>
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Night: {listing.areaIntelligence.noiseLevel.night}</p>
                        </div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 text-center border border-purple-200 dark:border-purple-800">
                        <Bus className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                        <p className="text-xs font-bold text-purple-700 dark:text-purple-300">
                          {listing.areaIntelligence.publicTransport.length} Options
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">Transport</p>
                      </div>
                    </div>

                    {/* Nearby Essentials */}
                    <div>
                      <h4 className="font-bold dark:text-slate-100 mb-3">📍 Nearby Essentials</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                          <Stethoscope className="w-5 h-5 text-red-500" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold dark:text-slate-100">{listing.areaIntelligence.nearbyHospital.name}</p>
                            <p className="text-xs text-gray-400">Hospital</p>
                          </div>
                          <span className="text-sm font-bold text-gray-600 dark:text-slate-300">{listing.areaIntelligence.nearbyHospital.distance}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                          <Building2 className="w-5 h-5 text-blue-500" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold dark:text-slate-100">{listing.areaIntelligence.nearbyPharmacy.name}</p>
                            <p className="text-xs text-gray-400">Pharmacy</p>
                          </div>
                          <span className="text-sm font-bold text-gray-600 dark:text-slate-300">{listing.areaIntelligence.nearbyPharmacy.distance}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                          <ShoppingBag className="w-5 h-5 text-green-500" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold dark:text-slate-100">{listing.areaIntelligence.nearbyGrocery.name}</p>
                            <p className="text-xs text-gray-400">Grocery</p>
                          </div>
                          <span className="text-sm font-bold text-gray-600 dark:text-slate-300">{listing.areaIntelligence.nearbyGrocery.distance}</span>
                        </div>
                      </div>
                    </div>

                    {/* Public Transport */}
                    <div>
                      <h4 className="font-bold dark:text-slate-100 mb-3">🚌 Public Transport</h4>
                      <div className="flex flex-wrap gap-2">
                        {listing.areaIntelligence.publicTransport.map((t, i) => (
                          <span key={i} className="bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 dark:text-slate-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Community Ratings */}
                    <div>
                      <h4 className="font-bold dark:text-slate-100 mb-3">⭐ Community Ratings (from verified guests)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {listing.areaIntelligence.communityRatings.map((rating) => (
                          <div key={rating.aspect} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                            <span className="font-semibold text-sm dark:text-slate-200 flex-1">{rating.aspect}</span>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-3.5 h-3.5 ${s <= rating.score ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-slate-600'}`} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Host card */}
            <div className="border border-gray-200 dark:border-slate-700 rounded-2xl p-6 bg-gray-50 dark:bg-slate-800/50">
              <div className="flex items-start gap-4">
                <img src={listing.owner.profileImage} alt={listing.owner.firstName} className="w-16 h-16 rounded-full bg-gray-100 ring-2 ring-rose-100" />
                <div className="flex-1">
                  <p className="font-black text-lg dark:text-slate-100">{listing.owner.firstName} {listing.owner.lastName}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Host since {listing.owner.hostSince}</p>
                  {listing.owner.isSuperhost && (
                    <div className="flex items-center gap-1 text-rose-500 text-sm mt-1 font-semibold">
                      <Award className="w-4 h-4" /> Superhost
                    </div>
                  )}
                </div>
                <div className="text-right text-sm">
                  <p className="font-bold text-gray-900 dark:text-slate-100">{listing.owner.responseRate}%</p>
                  <p className="text-gray-500 dark:text-slate-400 text-xs">response rate</p>
                  <p className="font-semibold text-gray-700 dark:text-slate-300 mt-2 text-xs">{listing.owner.responseTime}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/30">
                <Shield className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 dark:text-slate-400">To protect your payment, never transfer money or communicate outside of the HomeRental website or app.</p>
              </div>
            </div>

            {/* ── Property Map ─────────────────────────────── */}
            <div className="border-t border-gray-100 dark:border-slate-800 pt-8">
              <PropertyMap
                city={listing.location.city}
                state={listing.location.state}
                country={listing.location.country}
                address={listing.location.address}
                title={listing.title}
                price={listing.price}
              />
            </div>

          </div>

          {/* ── BOOKING WIDGET ────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-4">
              {/* Main booking card */}
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-2xl shadow-gray-200/50 dark:shadow-slate-900/50">
                <AnimatePresence mode="wait">
                  {bookingSuccess ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 space-y-3">
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-black text-emerald-700 dark:text-emerald-400">Booking Confirmed!</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400">Redirecting to your trips...</p>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-2xl font-black dark:text-slate-100">{formatPrice(listing.price, selectedCurrency)}</span>
                        <span className="text-gray-500 dark:text-slate-400">/ night</span>
                        {listing.averageRating > 0 && (
                          <div className="ml-auto flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="font-bold dark:text-slate-200">{listing.averageRating}</span>
                          </div>
                        )}
                      </div>

                      {/* Tenant Mode banner in booking */}
                      {listing.tenantModeAvailable && listing.monthlyDiscount && (
                        <div className="mb-3 p-2 bg-violet-50 dark:bg-violet-950/30 rounded-lg text-center">
                          <p className="text-xs font-bold text-violet-700 dark:text-violet-400">
                            <BadgePercent className="w-3.5 h-3.5 inline mr-1" />
                            Monthly stay: {listing.monthlyDiscount}% off → {formatPrice(Math.round(listing.price * (1 - listing.monthlyDiscount / 100) * 30), selectedCurrency)}/month
                          </p>
                        </div>
                      )}

                      {/* Date picker */}
                      <div className="border-2 border-gray-200 dark:border-slate-600 rounded-xl overflow-hidden mb-3 focus-within:border-rose-400 transition-colors">
                        <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-slate-600">
                          <div className="p-3">
                            <label className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase mb-1">Check-in</label>
                            <input type="date" value={checkIn} min={new Date().toISOString().split('T')[0]}
                              onChange={(e) => setCheckIn(e.target.value)}
                              className="w-full text-sm outline-none bg-transparent dark:text-slate-200" />
                          </div>
                          <div className="p-3">
                            <label className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase mb-1">Checkout</label>
                            <input type="date" value={checkOut} min={checkIn || new Date().toISOString().split('T')[0]}
                              onChange={(e) => setCheckOut(e.target.value)}
                              className="w-full text-sm outline-none bg-transparent dark:text-slate-200" />
                          </div>
                        </div>
                        <div className="border-t border-gray-200 dark:border-slate-600 p-3">
                          <label className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase mb-1">Guests</label>
                          <div className="flex items-center gap-3">
                            <button onClick={() => setGuests((g) => Math.max(1, g - 1))}
                              className="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-slate-500 text-gray-600 dark:text-slate-300 font-bold hover:border-gray-700 transition flex items-center justify-center">−</button>
                            <span className="text-sm font-semibold dark:text-slate-200">{guests} guest{guests > 1 ? 's' : ''}</span>
                            <button onClick={() => setGuests((g) => Math.min(listing.guestCount, g + 1))}
                              className="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-slate-500 text-gray-600 dark:text-slate-300 font-bold hover:border-gray-700 transition flex items-center justify-center">+</button>
                          </div>
                        </div>
                      </div>

                      <button onClick={handleBook} disabled={!checkIn || !checkOut || nights <= 0}
                        className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg shadow-rose-200 dark:shadow-rose-900/30 disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                        {nights > 0 ? `Reserve · ${nights} night${nights > 1 ? 's' : ''}` : 'Check availability'}
                      </button>

                      <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-2">You won't be charged yet</p>

                      {/* True Total Price breakdown */}
                      {bookingTotals && nights > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 space-y-2 text-sm border-t border-gray-100 dark:border-slate-700 pt-4">
                          <div className="flex justify-between text-gray-600 dark:text-slate-400">
                            <span>{formatPrice(listing.price, selectedCurrency)} × {nights} night{nights > 1 ? 's' : ''}</span>
                            <span>{formatPrice(bookingTotals.base, selectedCurrency)}</span>
                          </div>
                          <div className="flex justify-between text-gray-600 dark:text-slate-400">
                            <span>Cleaning fee</span>
                            <span>{formatPrice(bookingTotals.cleaning, selectedCurrency)}</span>
                          </div>
                          <div className="flex justify-between text-gray-600 dark:text-slate-400">
                            <span>Service fee</span>
                            <span>{formatPrice(bookingTotals.service, selectedCurrency)}</span>
                          </div>
                          {bookingTotals.tax > 0 && (
                            <div className="flex justify-between text-gray-600 dark:text-slate-400">
                              <span>Tax ({listing.taxRate ? `${(listing.taxRate * 100).toFixed(0)}%` : '0%'} GST)</span>
                              <span>{formatPrice(bookingTotals.tax, selectedCurrency)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-black border-t border-gray-200 dark:border-slate-600 pt-2 mt-2 text-gray-900 dark:text-slate-100">
                            <span>True Total ({selectedCurrency})</span>
                            <span className="text-emerald-600 dark:text-emerald-400">{formatPrice(bookingTotals.total, selectedCurrency)}</span>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── EMERGENCY SUPPORT BUTTON ──────────────────── */}
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setShowEmergencyPanel(!showEmergencyPanel)}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-red-200 dark:shadow-red-900/30">
                <AlertTriangle className="w-5 h-5" />
                🆘 Emergency Support
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* ── EMERGENCY SUPPORT PANEL ──────────────────────── */}
      <AnimatePresence>
        {showEmergencyPanel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowEmergencyPanel(false)}>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" /> Emergency Support
                </h3>
                <button onClick={() => setShowEmergencyPanel(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <button onClick={() => { toast.success('Connecting to 24/7 emergency chat...'); setShowEmergencyPanel(false); }}
                  className="w-full p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 hover:bg-red-100 dark:hover:bg-red-950/50 transition text-left">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-red-800 dark:text-red-300">24/7 Emergency Chat</p>
                    <p className="text-xs text-red-600 dark:text-red-400">Real humans, not bots. Available now.</p>
                  </div>
                </button>
                <button onClick={() => { toast.success('Emergency relocation request submitted. We\'ll find you alternative accommodation within 2 hours.'); setShowEmergencyPanel(false); }}
                  className="w-full p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition text-left">
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPinned className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-800 dark:text-amber-300">Emergency Relocation</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">One-tap move if property is unacceptable.</p>
                  </div>
                </button>
                <button onClick={() => { toast.success('Connecting to partner hotel network in ' + listing.location.city + '...'); setShowEmergencyPanel(false); }}
                  className="w-full p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center gap-3 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition text-left">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-blue-800 dark:text-blue-300">Backup Hotel Network</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Partner hotels for emergency stays.</p>
                  </div>
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-500 text-center mt-4">
                We prioritize your safety. All emergency requests are handled within 2 hours.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BLIND REVIEW MODAL ─────────────────────────────── */}
      <AnimatePresence>
        {showBlindReview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowBlindReview(false)}>
            <motion.div initial={{ y: 50, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black dark:text-slate-100 flex items-center gap-2">
                  🔒 Blind Review
                </h3>
                <button onClick={() => setShowBlindReview(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                Your review will only be visible after the host also submits their review of you. This ensures honest, unbiased feedback.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold dark:text-slate-200 mb-1">Overall Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <button key={s} onClick={() => setBlindReviewData(d => ({ ...d, rating: s }))}
                        className="p-1">
                        <Star className={`w-8 h-8 transition ${s <= blindReviewData.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(['cleanliness', 'accuracy', 'checkIn', 'communication', 'location', 'value'] as const).map((key) => (
                    <div key={key}>
                      <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 capitalize mb-1">{key}</label>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <button key={s} onClick={() => setBlindReviewData(d => ({ ...d, [key]: s }))}>
                            <Star className={`w-5 h-5 transition ${s <= blindReviewData[key] ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-slate-600'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-bold dark:text-slate-200 mb-1">Your Review</label>
                  <textarea rows={4} placeholder="Share your honest experience..."
                    value={blindReviewData.comment}
                    onChange={(e) => setBlindReviewData(d => ({ ...d, comment: e.target.value }))}
                    className="w-full border-2 border-gray-200 dark:border-slate-600 rounded-xl p-3 text-sm outline-none focus:border-rose-400 bg-transparent dark:text-slate-200 transition" />
                </div>
                <button onClick={handleBlindReviewSubmit} disabled={!blindReviewData.comment.trim()}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-40">
                  Submit Blind Review 🔒
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
