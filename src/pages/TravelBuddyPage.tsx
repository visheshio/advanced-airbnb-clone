import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { MOCK_TRAVEL_BUDDIES, TravelBuddy } from '../data/mockData';
import {
  Users, MapPin, Calendar, MessageCircle, Shield, Search,
  Heart, X, CheckCircle, Sparkles, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const INTERESTS_EMOJI: Record<string, string> = {
  surfing: '🏄', photography: '📸', nightlife: '🎉', food: '🍽️', trekking: '🥾',
  yoga: '🧘', meditation: '🧘‍♂️', rafting: '🚣', 'remote-work': '💻', 'digital-nomad': '🌐',
  ayurveda: '💆', cooking: '🍳', backwaters: '🚢', nature: '🌿', motorcycling: '🏍️',
  adventure: '⛰️', camping: '⛺', beach: '🏖️', reading: '📚', 'budget-travel': '💰',
  startups: '🚀', coffee: '☕', networking: '🤝', history: '🏛️', cycling: '🚲',
  heritage: '🕌',
};

const DESTINATIONS = ['All', 'Goa', 'Manali', 'Rishikesh', 'Kerala', 'Ladakh', 'Gokarna', 'Bangalore', 'Hampi'];

export default function TravelBuddyPage() {
  const { user, setLoginModal } = useStore();
  const [selectedDest, setSelectedDest] = useState('All');
  const [selectedBuddy, setSelectedBuddy] = useState<TravelBuddy | null>(null);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBuddies = MOCK_TRAVEL_BUDDIES.filter((b) => {
    if (selectedDest !== 'All' && !b.destination.toLowerCase().includes(selectedDest.toLowerCase())) return false;
    if (searchQuery && !b.name.toLowerCase().includes(searchQuery.toLowerCase()) && !b.destination.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleConnect = (buddy: TravelBuddy) => {
    if (!user) {
      setLoginModal(true);
      return;
    }
    toast.success(`🤝 Connection request sent to ${buddy.name}! Check your messages.`);
  };

  return (
    <div className="dark:bg-slate-950 min-h-screen transition-colors">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 py-16 px-4 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-10 left-20 w-44 h-44 bg-white rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          className="absolute bottom-5 right-16 w-56 h-56 bg-pink-300 rounded-full blur-3xl"
        />
        <div className="relative max-w-4xl mx-auto text-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-white/70 font-medium tracking-widest text-sm uppercase">Travel Buddy</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              Find Your Perfect <span className="text-yellow-300">Travel Companion</span>
            </h1>
            <p className="text-lg text-white/80 mb-6 max-w-xl mx-auto">
              Solo travelers can match with others heading to the same destination on the same dates.
              Split costs on larger properties and make memories together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 w-full sm:w-80 outline-none focus:bg-white/30 transition"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => { user ? setShowMatchForm(true) : setLoginModal(true); }}
                className="px-6 py-3 bg-white text-purple-700 font-bold rounded-full shadow-xl hover:shadow-purple-300/30 transition whitespace-nowrap"
              >
                <Sparkles className="w-5 h-5 inline mr-2" />
                Post My Trip
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Destination Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {DESTINATIONS.map((dest) => (
            <button
              key={dest}
              onClick={() => setSelectedDest(dest)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                selectedDest === dest
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              {dest}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="grid grid-cols-3 gap-4 bg-gray-50 dark:bg-slate-900 rounded-2xl p-4">
          <div className="text-center">
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{MOCK_TRAVEL_BUDDIES.length}+</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Active Travelers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{DESTINATIONS.length - 1}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Destinations</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400">100%</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Verified Profiles</p>
          </div>
        </div>
      </div>

      {/* Buddy Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-xl font-bold dark:text-slate-100 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" />
          {filteredBuddies.length} traveler{filteredBuddies.length !== 1 ? 's' : ''} looking for companions
        </h2>

        {filteredBuddies.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold dark:text-slate-100">No matches found</h3>
            <p className="text-gray-500 dark:text-slate-400 mt-2">Try a different destination or be the first to post!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBuddies.map((buddy, i) => (
              <motion.div
                key={buddy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedBuddy(buddy)}
                className="group bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 cursor-pointer hover:shadow-xl hover:shadow-purple-100 dark:hover:shadow-purple-900/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <img src={buddy.profileImage} alt={buddy.name} className="w-14 h-14 rounded-full bg-gray-100 ring-2 ring-purple-100" />
                    {buddy.verified && (
                      <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 text-blue-500 fill-blue-500 bg-white dark:bg-slate-900 rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold dark:text-slate-100">{buddy.name}, {buddy.age}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{buddy.gender} · {buddy.languages.join(', ')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-purple-600 dark:text-purple-400 font-semibold mb-2">
                  <MapPin className="w-4 h-4" /> {buddy.destination}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(buddy.dateRange.start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} –{' '}
                  {new Date(buddy.dateRange.end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </div>

                <p className="text-sm text-gray-600 dark:text-slate-300 line-clamp-2 mb-3">{buddy.bio}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {buddy.interests.slice(0, 4).map((int) => (
                    <span key={int} className="text-xs bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-full text-gray-600 dark:text-slate-400">
                      {INTERESTS_EMOJI[int] || '🏷️'} {int}
                    </span>
                  ))}
                  {buddy.interests.length > 4 && (
                    <span className="text-xs text-gray-400 dark:text-slate-500 px-2 py-1">+{buddy.interests.length - 4}</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">{buddy.budget}</span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); handleConnect(buddy); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-full hover:bg-purple-700 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Connect
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── BUDDY DETAIL MODAL ─────────────────────────────── */}
      <AnimatePresence>
        {selectedBuddy && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setSelectedBuddy(null)}>
            <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black dark:text-slate-100">Traveler Profile</h3>
                <button onClick={() => setSelectedBuddy(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mb-4">
                <div className="relative inline-block">
                  <img src={selectedBuddy.profileImage} alt={selectedBuddy.name} className="w-20 h-20 rounded-full bg-gray-100 ring-4 ring-purple-100 mx-auto" />
                  {selectedBuddy.verified && (
                    <CheckCircle className="absolute -bottom-1 right-0 w-6 h-6 text-blue-500 fill-blue-500 bg-white dark:bg-slate-900 rounded-full" />
                  )}
                </div>
                <h4 className="font-black text-xl mt-2 dark:text-slate-100">{selectedBuddy.name}, {selectedBuddy.age}</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400">{selectedBuddy.gender} · {selectedBuddy.languages.join(', ')}</p>
                {selectedBuddy.verified && (
                  <span className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full mt-1 font-bold">
                    <Shield className="w-3 h-3" /> Verified Profile
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-bold text-sm dark:text-slate-100">{selectedBuddy.destination}</p>
                    <p className="text-xs text-gray-400">Destination</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-bold text-sm dark:text-slate-100">
                      {new Date(selectedBuddy.dateRange.start).toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })} –{' '}
                      {new Date(selectedBuddy.dateRange.end).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400">Travel Dates</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-700 dark:text-slate-300 mb-4">{selectedBuddy.bio}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {selectedBuddy.interests.map((int) => (
                  <span key={int} className="text-xs bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-gray-700 dark:text-slate-300 font-medium">
                    {INTERESTS_EMOJI[int] || '🏷️'} {int}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-gray-500 dark:text-slate-400">Budget:</span>
                <span className="font-bold dark:text-slate-100">{selectedBuddy.budget}</span>
              </div>

              <div className="flex gap-2">
                <button onClick={() => { handleConnect(selectedBuddy); setSelectedBuddy(null); }}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition shadow-lg flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5" /> Send Message
                </button>
                <button onClick={() => { toast('❤️ Saved to favorites!'); }}
                  className="p-3 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                  <Heart className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── POST MY TRIP MODAL ─────────────────────────────── */}
      <AnimatePresence>
        {showMatchForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowMatchForm(false)}>
            <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black dark:text-slate-100">📝 Post Your Trip</h3>
                <button onClick={() => setShowMatchForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-bold dark:text-slate-200">Destination</label>
                  <input type="text" placeholder="e.g. Goa, Manali, Ladakh..."
                    className="w-full mt-1 p-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl outline-none focus:border-purple-400 bg-transparent dark:text-slate-200 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-bold dark:text-slate-200">From</label>
                    <input type="date" className="w-full mt-1 p-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl outline-none focus:border-purple-400 bg-transparent dark:text-slate-200 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-bold dark:text-slate-200">To</label>
                    <input type="date" className="w-full mt-1 p-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl outline-none focus:border-purple-400 bg-transparent dark:text-slate-200 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold dark:text-slate-200">Budget per night</label>
                  <input type="text" placeholder="e.g. ₹5,000-10,000"
                    className="w-full mt-1 p-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl outline-none focus:border-purple-400 bg-transparent dark:text-slate-200 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-bold dark:text-slate-200">About Your Trip</label>
                  <textarea rows={3} placeholder="Tell potential buddies about your plans..."
                    className="w-full mt-1 p-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl outline-none focus:border-purple-400 bg-transparent dark:text-slate-200 text-sm" />
                </div>
                <button onClick={() => { toast.success('🎉 Trip posted! You\'ll be notified when someone matches.'); setShowMatchForm(false); }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition shadow-lg">
                  Post & Find Buddies
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
