import { useState } from 'react';
import { X, Star, Lock, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Review } from '../../data/mockData';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
}

const RATING_ASPECTS = [
  { key: 'cleanliness', label: 'Cleanliness', emoji: '🧹' },
  { key: 'accuracy', label: 'Accuracy', emoji: '🎯' },
  { key: 'checkIn', label: 'Check-in', emoji: '🔑' },
  { key: 'communication', label: 'Communication', emoji: '💬' },
  { key: 'location', label: 'Location', emoji: '📍' },
  { key: 'value', label: 'Value', emoji: '💰' },
] as const;

export default function BlindReviewModal({ isOpen, onClose, listingId, listingTitle }: Props) {
  const { user, addReview } = useStore();
  const [comment, setComment] = useState('');
  const [ratings, setRatings] = useState({
    cleanliness: 0, accuracy: 0, checkIn: 0, communication: 0, location: 0, value: 0,
  });
  const [hoveredStar, setHoveredStar] = useState<{ aspect: string; star: number } | null>(null);

  const handleClose = () => {
    setComment('');
    setRatings({ cleanliness: 0, accuracy: 0, checkIn: 0, communication: 0, location: 0, value: 0 });
    onClose();
  };

  const allRated = Object.values(ratings).every((r) => r > 0);
  const overallRating = allRated
    ? Math.round((Object.values(ratings).reduce((s, r) => s + r, 0) / 6) * 10) / 10
    : 0;

  const handleSubmit = () => {
    if (!allRated) { toast.error('Please rate all aspects'); return; }
    if (!comment.trim()) { toast.error('Please write a comment'); return; }
    if (!user) { toast.error('Please log in to write a review'); return; }

    const review: Review = {
      id: `rev-${Date.now()}`,
      listingId,
      guestId: user.id,
      reviewer: {
        firstName: user.firstName,
        lastName: user.lastName ? user.lastName.charAt(0) + '.' : '',
        profileImage: user.profileImage,
      },
      overallRating,
      comment: comment.trim(),
      ratings,
      createdAt: new Date().toISOString().split('T')[0],
      revealedAt: null, // BLIND — not yet revealed
    };

    addReview(review);
    toast.success('🔒 Review submitted! It will be revealed when the host submits their review.');
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Write a Review</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1">{listingTitle}</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Blind Review Notice */}
              <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900">
                <Lock className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">Blind Review System</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400/80 mt-0.5">
                    Your review will remain hidden until the host also submits their review. This prevents retaliation and ensures honest feedback from both sides.
                  </p>
                </div>
              </div>

              {/* Rating Aspects */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Rate your experience</h3>
                {RATING_ASPECTS.map(({ key, label, emoji }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-slate-300 flex items-center gap-2">
                      <span>{emoji}</span> {label}
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isHovered = hoveredStar?.aspect === key && hoveredStar?.star >= star;
                        const isSelected = ratings[key as keyof typeof ratings] >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoveredStar({ aspect: key, star })}
                            onMouseLeave={() => setHoveredStar(null)}
                            onClick={() => setRatings((r) => ({ ...r, [key]: star }))}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-5 h-5 transition-colors ${
                                isHovered || isSelected
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300 dark:text-slate-600'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall score preview */}
              {allRated && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900"
                >
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="text-lg font-black text-amber-700 dark:text-amber-400">{overallRating}</span>
                  <span className="text-sm text-amber-600 dark:text-amber-500">Overall Rating</span>
                </motion.div>
              )}

              {/* Comment */}
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-slate-100 mb-2">Your Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell future guests about your experience. What did you love? What could be improved?"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm resize-none"
                />
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{comment.length}/500 characters</p>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!allRated || !comment.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-200 dark:shadow-amber-900/30 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Submit Blind Review
              </button>

              <p className="text-center text-xs text-gray-400 dark:text-slate-500 flex items-center justify-center gap-1">
                <Eye className="w-3 h-3" />
                Reviews become visible once both guest and host submit
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
