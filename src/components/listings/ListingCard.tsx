import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, ChevronLeft, ChevronRight, Zap, Award, Wifi, Monitor, Calendar, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Listing } from '../../data/mockData';
import { useStore } from '../../store/useStore';
import { formatPrice } from '../../utils/formatPrice';

interface Props {
  listing: Listing;
  index?: number;
}

/** Compute the "True Total" for a 3-night average stay */
function computeTrueTotal(listing: Listing, nights = 3): number {
  const base = listing.price * nights;
  const fees = listing.cleaningFee + listing.serviceFee;
  const tax = listing.taxRate ? (base + fees) * listing.taxRate : 0;
  return Math.round(base + fees + tax);
}

function getHealthColor(score: number): string {
  if (score >= 90) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950';
  if (score >= 70) return 'text-amber-600 bg-amber-50 dark:bg-amber-950';
  return 'text-red-600 bg-red-50 dark:bg-red-950';
}

export default function ListingCard({ listing, index = 0 }: Props) {
  const navigate = useNavigate();
  const { toggleFavorite, selectedCurrency, favoriteListingIds } = useStore();
  const [imgIndex, setImgIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const images = listing.images;
  const isFavorite = favoriteListingIds.includes(listing.id);

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(listing.id);
  };

  const trueTotal = computeTrueTotal(listing);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      onClick={() => navigate(`/listings/${listing.id}`)}
      className="group cursor-pointer card-hover"
    >
      {/* Image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800">
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={images[imgIndex]}
          alt={listing.title}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image';
          }}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Favourite */}
        <motion.button
          onClick={handleFavorite}
          whileTap={{ scale: 0.85 }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/50 transition"
        >
          <Heart
            className={`w-4 h-4 transition-all duration-300 ${isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : 'text-white fill-white/40'}`}
          />
        </motion.button>

        {/* Top-left Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {listing.owner.isSuperhost && (
            <span className="bg-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Award className="w-3 h-3 text-rose-500" /> Superhost
            </span>
          )}
          {listing.remoteWorkReady && (
            <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Monitor className="w-3 h-3" /> WFH Ready
            </span>
          )}
          {listing.tenantModeAvailable && (
            <span className="bg-violet-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Long-term
            </span>
          )}
        </div>

        {/* Bottom badges */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          {listing.instantBook && (
            <div className="bg-white/90 dark:bg-slate-900/90 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Zap className="w-3 h-3 text-yellow-500" /> Instant
            </div>
          )}
          {listing.remoteWorkReady && listing.internetSpeedMbps && (
            <div className="bg-white/90 dark:bg-slate-900/90 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Wifi className="w-3 h-3 text-indigo-500" /> {listing.internetSpeedMbps} Mbps
            </div>
          )}
        </div>

        {/* Host Health Score badge (bottom-right) */}
        {listing.hostHealthScore !== undefined && (
          <div className={`absolute bottom-3 right-3 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm ${getHealthColor(listing.hostHealthScore)}`}>
            <Activity className="w-3 h-3" /> {listing.hostHealthScore}
          </div>
        )}

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {images.slice(0, 5).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === imgIndex ? 'bg-white w-3' : 'bg-white/60 w-1.5'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm text-gray-900 dark:text-slate-100 leading-snug line-clamp-1">
            {listing.location.city}, {listing.location.state}
          </p>
          {listing.averageRating > 0 && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm text-gray-800 dark:text-slate-200 font-medium">{listing.averageRating.toFixed(2)}</span>
            </div>
          )}
        </div>
        <p className="text-gray-500 dark:text-slate-400 text-sm line-clamp-1">{listing.title}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-bold text-gray-900 dark:text-slate-100 text-sm">{formatPrice(listing.price, selectedCurrency)}</span>
          <span className="text-gray-500 dark:text-slate-400 text-sm">/ night</span>
          {listing.monthlyDiscount && (
            <span className="text-xs text-violet-600 dark:text-violet-400 font-semibold ml-auto">
              {listing.monthlyDiscount}% off monthly
            </span>
          )}
        </div>
        {/* True Total Price */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            {formatPrice(trueTotal, selectedCurrency)} total
          </span>
          <span className="text-xs text-gray-400 dark:text-slate-500">· 3 nights incl. fees{listing.taxRate ? ' & tax' : ''}</span>
        </div>
      </div>
    </motion.div>
  );
}
