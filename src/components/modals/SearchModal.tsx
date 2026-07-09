import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, MapPin, Calendar, IndianRupee, ChevronRight, ChevronLeft, Zap, Award } from 'lucide-react';
import { useStore } from '../../store/useStore';

const STEPS = { LOCATION: 0, DATE: 1, INFO: 2, FILTERS: 3 } as const;
type Step = typeof STEPS[keyof typeof STEPS];

const INDIAN_DESTINATIONS = [
  { name: 'Goa', state: 'Goa', emoji: '🏖️' },
  { name: 'Manali', state: 'Himachal Pradesh', emoji: '🏔️' },
  { name: 'Jaipur', state: 'Rajasthan', emoji: '🏰' },
  { name: 'Kerela Backwaters', state: 'Kerala', emoji: '🌴' },
  { name: 'Andaman Islands', state: 'Andaman & Nicobar', emoji: '🏝️' },
  { name: 'Varanasi', state: 'Uttar Pradesh', emoji: '🕌' },
  { name: 'Darjeeling', state: 'West Bengal', emoji: '🍃' },
  { name: 'Udaipur', state: 'Rajasthan', emoji: '💙' },
  { name: 'Rishikesh', state: 'Uttarakhand', emoji: '🧘' },
  { name: 'Coorg', state: 'Karnataka', emoji: '☕' },
  { name: 'Ooty', state: 'Tamil Nadu', emoji: '🌿' },
  { name: 'Shimla', state: 'Himachal Pradesh', emoji: '❄️' },
  { name: 'Mumbai', state: 'Maharashtra', emoji: '🌆' },
  { name: 'Mysore', state: 'Karnataka', emoji: '🏯' },
  { name: 'Srinagar', state: 'Jammu & Kashmir', emoji: '🌸' },
  { name: 'Jaisalmer', state: 'Rajasthan', emoji: '🏜️' },
];

const AMENITY_OPTIONS = [
  { key: 'wifi', label: 'WiFi', emoji: '📶' },
  { key: 'pool', label: 'Pool', emoji: '🏊' },
  { key: 'parking', label: 'Parking', emoji: '🅿️' },
  { key: 'ac', label: 'AC', emoji: '❄️' },
  { key: 'kitchen', label: 'Kitchen', emoji: '🍳' },
  { key: 'gym', label: 'Gym', emoji: '💪' },
  { key: 'breakfast', label: 'Breakfast', emoji: '🥐' },
  { key: 'petsAllowed', label: 'Pet Friendly', emoji: '🐾' },
];

const PROPERTY_TYPES = [
  { key: 'villa', label: 'Villa', emoji: '🏡' },
  { key: 'apartment', label: 'Apartment', emoji: '🏢' },
  { key: 'cabin', label: 'Cabin', emoji: '🏕️' },
  { key: 'hotel', label: 'Hotel', emoji: '🏨' },
  { key: 'cottage', label: 'Cottage', emoji: '🛖' },
  { key: 'treehouse', label: 'Treehouse', emoji: '🌳' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const { setSearchFilters, filterListings } = useStore();
  const [step, setStep] = useState<Step>(STEPS.LOCATION);
  const [location, setLocation] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [roomCount, setRoomCount] = useState(0);
  const [bathroomCount, setBathroomCount] = useState(0);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [propertyType, setPropertyType] = useState('');
  const [instantBook, setInstantBook] = useState(false);
  const [superhost, setSuperhost] = useState(false);

  const filteredDests = locationInput
    ? INDIAN_DESTINATIONS.filter(
        (d) =>
          d.name.toLowerCase().includes(locationInput.toLowerCase()) ||
          d.state.toLowerCase().includes(locationInput.toLowerCase())
      )
    : INDIAN_DESTINATIONS;

  const onSubmit = useCallback(() => {
    setSearchFilters({
      location,
      startDate: startDate || null,
      endDate: endDate || null,
      guestCount,
      bedroomCount: roomCount,
      bathroomCount,
      minPrice,
      maxPrice,
      amenities: selectedAmenities,
      propertyType,
      instantBook,
      superhost,
    });
    setTimeout(() => filterListings(), 50);
    navigate(`/search?location=${encodeURIComponent(location)}`);
    onClose();
    setStep(STEPS.LOCATION);
  }, [location, startDate, endDate, guestCount, roomCount, bathroomCount, minPrice, maxPrice, selectedAmenities, propertyType, instantBook, superhost]);

  const stepLabels = ['Location', 'Dates', 'Guests', 'Filters'];
  const isLastStep = step === STEPS.FILTERS;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-xl max-h-[90vh] flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700 flex-shrink-0">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-slate-300" />
            </button>
            <h2 className="font-bold text-gray-900 dark:text-slate-100">
              {['Where to?', 'When to go?', 'Who is coming?', 'Filters'][step]}
            </h2>
            <span className="text-xs font-semibold text-gray-400">{step + 1}/{stepLabels.length}</span>
          </div>

          {/* Step Progress */}
          <div className="flex px-5 pt-3 gap-1 flex-shrink-0">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <div className={`h-1.5 w-full rounded-full transition-all ${i <= step ? 'bg-rose-500' : 'bg-gray-100 dark:bg-slate-700'}`} />
                <span className={`text-xs font-medium ${i === step ? 'text-rose-500' : 'text-gray-400 dark:text-slate-500'}`}>{label}</span>
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {step === STEPS.LOCATION && (
                  <div className="space-y-4">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" />
                      <input
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        placeholder="Search destinations..."
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-xl text-sm outline-none focus:border-rose-400 transition"
                        autoFocus
                      />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      {locationInput ? `${filteredDests.length} results` : 'Popular in India'}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {filteredDests.map((dest) => (
                        <button
                          key={dest.name}
                          onClick={() => { setLocation(dest.name); setLocationInput(dest.name); }}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                            location === dest.name
                              ? 'border-rose-500 bg-rose-50 dark:bg-rose-950'
                              : 'border-gray-100 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-500'
                          }`}
                        >
                          <span className="text-2xl">{dest.emoji}</span>
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-slate-100">{dest.name}</p>
                            <p className="text-xs text-gray-400 dark:text-slate-500">{dest.state}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === STEPS.DATE && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="border-2 border-gray-200 dark:border-slate-600 rounded-xl p-3">
                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase flex items-center gap-1 mb-2">
                          <Calendar className="w-3.5 h-3.5" /> Check-in
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full text-sm outline-none bg-transparent dark:text-slate-200 focus:text-rose-500"
                        />
                      </div>
                      <div className="border-2 border-gray-200 dark:border-slate-600 rounded-xl p-3">
                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase flex items-center gap-1 mb-2">
                          <Calendar className="w-3.5 h-3.5" /> Check-out
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          min={startDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full text-sm outline-none bg-transparent dark:text-slate-200 focus:text-rose-500"
                        />
                      </div>
                    </div>
                    {/* Quick date buttons */}
                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Quick select</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'This weekend', days: 2 },
                        { label: 'Next week', days: 7 },
                        { label: '2 weeks', days: 14 },
                        { label: 'A month', days: 30 },
                      ].map((opt) => {
                        const from = new Date();
                        const to = new Date(Date.now() + opt.days * 86400000);
                        return (
                          <button
                            key={opt.label}
                            onClick={() => {
                              setStartDate(from.toISOString().split('T')[0]);
                              setEndDate(to.toISOString().split('T')[0]);
                            }}
                            className="px-4 py-2 border-2 border-gray-200 dark:border-slate-600 rounded-full text-sm font-medium hover:border-rose-400 hover:text-rose-500 transition"
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === STEPS.INFO && (
                  <div className="space-y-5">
                    {[
                      { label: 'Guests', sub: 'Adults + children', value: guestCount, set: setGuestCount, min: 1 },
                      { label: 'Bedrooms', sub: 'Minimum bedrooms', value: roomCount, set: setRoomCount, min: 0 },
                      { label: 'Bathrooms', sub: 'Minimum bathrooms', value: bathroomCount, set: setBathroomCount, min: 0 },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-slate-100">{item.label}</p>
                          <p className="text-sm text-gray-500 dark:text-slate-400">{item.sub}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => item.set(Math.max(item.min, item.value - 1))}
                            className="w-9 h-9 rounded-full border-2 border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 font-bold hover:border-gray-600 dark:hover:border-slate-400 transition flex items-center justify-center text-lg"
                          >−</button>
                          <span className="w-5 text-center font-bold text-gray-900 dark:text-slate-100">{item.value}</span>
                          <button
                            onClick={() => item.set(item.value + 1)}
                            className="w-9 h-9 rounded-full border-2 border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 font-bold hover:border-gray-600 dark:hover:border-slate-400 transition flex items-center justify-center text-lg"
                          >+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {step === STEPS.FILTERS && (
                  <div className="space-y-5">
                    {/* Price Range */}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-rose-500" /> Price Range (per night)
                      </p>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">
                        ₹{minPrice.toLocaleString('en-IN')} – ₹{maxPrice.toLocaleString('en-IN')}
                      </p>
                      <div className="space-y-2">
                        <input type="range" min={0} max={100000} step={1000} value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))} className="w-full" />
                        <input type="range" min={0} max={100000} step={1000} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full" />
                      </div>
                    </div>

                    {/* Property Type */}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-slate-100 mb-2">Property Type</p>
                      <div className="grid grid-cols-3 gap-2">
                        {PROPERTY_TYPES.map((pt) => (
                          <button
                            key={pt.key}
                            onClick={() => setPropertyType(propertyType === pt.key ? '' : pt.key)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm font-medium transition ${
                              propertyType === pt.key
                                ? 'border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-600'
                                : 'border-gray-200 dark:border-slate-600 hover:border-gray-400 text-gray-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="text-2xl">{pt.emoji}</span>
                            {pt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-slate-100 mb-2">Amenities</p>
                      <div className="grid grid-cols-2 gap-2">
                        {AMENITY_OPTIONS.map((a) => (
                          <button
                            key={a.key}
                            onClick={() => setSelectedAmenities((prev) =>
                              prev.includes(a.key) ? prev.filter((x) => x !== a.key) : [...prev, a.key]
                            )}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-sm font-medium transition ${
                              selectedAmenities.includes(a.key)
                                ? 'border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-600'
                                : 'border-gray-200 dark:border-slate-600 hover:border-gray-400 text-gray-700 dark:text-slate-300'
                            }`}
                          >
                            <span>{a.emoji}</span>{a.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3">
                      {[
                        { label: 'Instant Book', icon: <Zap className="w-4 h-4 text-yellow-500" />, sub: 'Book without waiting', val: instantBook, set: setInstantBook },
                        { label: 'Superhost only', icon: <Award className="w-4 h-4 text-rose-500" />, sub: 'Verified top hosts', val: superhost, set: setSuperhost },
                      ].map((t) => (
                        <div key={t.label} className="flex items-center justify-between border border-gray-100 dark:border-slate-700 rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            {t.icon}
                            <div>
                              <p className="font-semibold text-sm text-gray-900 dark:text-slate-100">{t.label}</p>
                              <p className="text-xs text-gray-400 dark:text-slate-500">{t.sub}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => t.set(!t.val)}
                            className={`w-11 h-6 rounded-full transition-colors relative ${t.val ? 'bg-rose-500' : 'bg-gray-200 dark:bg-slate-600'}`}
                          >
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${t.val ? 'translate-x-5' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 p-5 border-t border-gray-100 dark:border-slate-700 flex-shrink-0">
            {step > STEPS.LOCATION ? (
              <button
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="flex items-center gap-1 px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <button
                onClick={() => { setLocation(''); setLocationInput(''); }}
                className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition underline"
              >
                Clear
              </button>
            )}
            <button
              onClick={isLastStep ? onSubmit : () => setStep((s) => (s + 1) as Step)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-xl hover:from-rose-600 hover:to-pink-700 transition shadow-lg shadow-rose-200 dark:shadow-rose-900/30"
            >
              {isLastStep ? (
                <><Search className="w-4 h-4" /> Search Stays</>
              ) : (
                <>Next <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
