import { useState, useEffect } from 'react';
import {
  X, Home, ChevronRight, ChevronLeft, Check,
  MapPin, Upload,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Listing } from '../../data/mockData';

const PROPERTY_TYPES = [
  { id: 'house',      label: 'House',      emoji: '🏠' },
  { id: 'apartment',  label: 'Apartment',  emoji: '🏢' },
  { id: 'villa',      label: 'Villa',      emoji: '🏡' },
  { id: 'cabin',      label: 'Cabin',      emoji: '🏕️' },
  { id: 'cottage',    label: 'Cottage',    emoji: '🏘️' },
  { id: 'treehouse',  label: 'Treehouse',  emoji: '🌲' },
  { id: 'boat',       label: 'Houseboat',  emoji: '⛵' },
  { id: 'camper',     label: 'Camper',     emoji: '🚐' },
];

const CATEGORIES = [
  { id: 'beach',       label: 'Beach',       emoji: '🏖️' },
  { id: 'countryside', label: 'Countryside', emoji: '🌄' },
  { id: 'luxury',      label: 'Luxury',      emoji: '💎' },
  { id: 'modern',      label: 'Modern',      emoji: '🏙️' },
  { id: 'lake',        label: 'Lake',        emoji: '🏞️' },
  { id: 'camping',     label: 'Camping',     emoji: '⛺' },
  { id: 'desert',      label: 'Desert',      emoji: '🏜️' },
  { id: 'skiing',      label: 'Skiing',      emoji: '⛷️' },
  { id: 'castles',     label: 'Heritage',    emoji: '🏰' },
  { id: 'islands',     label: 'Islands',     emoji: '🏝️' },
  { id: 'trending',    label: 'Trending',    emoji: '🔥' },
  { id: 'arctic',      label: 'Hills',       emoji: '🏔️' },
  { id: 'pools',       label: 'Pools',       emoji: '🏊' },
  { id: 'remote-work', label: 'Remote Work', emoji: '💻' },
];

const AMENITY_OPTIONS = [
  { id: 'wifi',         label: 'WiFi',          icon: '📶' },
  { id: 'pool',         label: 'Pool',          icon: '🏊' },
  { id: 'kitchen',      label: 'Kitchen',       icon: '🍳' },
  { id: 'parking',      label: 'Parking',       icon: '🅿️' },
  { id: 'ac',           label: 'Air conditioning', icon: '❄️' },
  { id: 'heating',      label: 'Heating',       icon: '🔥' },
  { id: 'washer',       label: 'Washer',        icon: '🫧' },
  { id: 'dryer',        label: 'Dryer',         icon: '🌀' },
  { id: 'gym',          label: 'Gym',           icon: '💪' },
  { id: 'hotTub',       label: 'Hot Tub',       icon: '🛁' },
  { id: 'fireplace',    label: 'Fireplace',     icon: '🪵' },
  { id: 'workspace',    label: 'Workspace',     icon: '💻' },
  { id: 'breakfast',    label: 'Breakfast',     icon: '🥐' },
  { id: 'bbqGrill',     label: 'BBQ Grill',     icon: '🍖' },
  { id: 'balcony',      label: 'Balcony',       icon: '🌅' },
  { id: 'garden',       label: 'Garden',        icon: '🌿' },
  { id: 'beachfront',   label: 'Beachfront',    icon: '🏖️' },
  { id: 'oceanView',    label: 'Ocean View',    icon: '🌊' },
  { id: 'mountainView', label: 'Mountain View', icon: '⛰️' },
  { id: 'lakeView',     label: 'Lake View',     icon: '🏞️' },
  { id: 'cityView',     label: 'City View',     icon: '🏙️' },
  { id: 'petsAllowed',  label: 'Pets Allowed',  icon: '🐾' },
  { id: 'tv',           label: 'TV',            icon: '📺' },
  { id: 'elevator',     label: 'Elevator',      icon: '🛗' },
];

const STEPS = [
  { label: 'Type',      title: 'What type of property?' },
  { label: 'Category',  title: 'Best describes your place?' },
  { label: 'Location',  title: "Where's your property?" },
  { label: 'Details',   title: 'Share some basics' },
  { label: 'Amenities', title: 'What does your place offer?' },
  { label: 'Photos',    title: 'Add some photos' },
  { label: 'Pricing',   title: 'Set your price' },
  { label: 'Preview',   title: 'Review & publish' },
];

interface FormData {
  propertyType: string;
  category: string;
  city: string;
  state: string;
  address: string;
  title: string;
  description: string;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  imageInput: string;
  price: string;
  cleaningFee: string;
  serviceFee: string;
  instantBook: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
}

const defaultForm: FormData = {
  propertyType: '',
  category: '',
  city: '',
  state: '',
  address: '',
  title: '',
  description: '',
  guests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  amenities: [],
  images: [],
  imageInput: '',
  price: '',
  cleaningFee: '',
  serviceFee: '',
  instantBook: false,
  petsAllowed: false,
  smokingAllowed: false,
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editListing?: Listing | null;
}

export default function RentModal({ isOpen, onClose, editListing }: Props) {
  const { addListing, updateListing, user } = useStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [published, setPublished] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Populate form when editing
  useEffect(() => {
    if (editListing) {
      setForm({
        propertyType: editListing.propertyType,
        category: editListing.category,
        city: editListing.location.city,
        state: editListing.location.state,
        address: editListing.location.address,
        title: editListing.title,
        description: editListing.description,
        guests: editListing.guestCount,
        bedrooms: editListing.bedroomCount,
        beds: editListing.bedCount,
        bathrooms: editListing.bathroomCount,
        amenities: editListing.amenities,
        images: editListing.images,
        imageInput: '',
        price: String(editListing.price),
        cleaningFee: String(editListing.cleaningFee),
        serviceFee: String(editListing.serviceFee),
        instantBook: editListing.instantBook,
        petsAllowed: editListing.houseRules.petsAllowed,
        smokingAllowed: editListing.houseRules.smokingAllowed,
      });
      setStep(0);
      setPublished(false);
    } else {
      setForm(defaultForm);
      setStep(0);
      setPublished(false);
    }
  }, [editListing, isOpen]);

  if (!isOpen) return null;

  const isEdit = !!editListing;

  const set = (key: keyof FormData, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const counter = (key: 'guests' | 'bedrooms' | 'beds' | 'bathrooms', min: number, max: number) => (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => set(key, Math.max(min, (form[key] as number) - 1))}
        className="w-9 h-9 rounded-full border-2 border-gray-300 dark:border-slate-600 flex items-center justify-center text-gray-700 dark:text-slate-300 hover:border-rose-400 dark:hover:border-rose-500 transition text-lg font-semibold"
      >−</button>
      <span className="text-xl font-bold w-8 text-center text-gray-900 dark:text-slate-100">{form[key] as number}</span>
      <button
        type="button"
        onClick={() => set(key, Math.min(max, (form[key] as number) + 1))}
        className="w-9 h-9 rounded-full border-2 border-gray-300 dark:border-slate-600 flex items-center justify-center text-gray-700 dark:text-slate-300 hover:border-rose-400 dark:hover:border-rose-500 transition text-lg font-semibold"
      >+</button>
    </div>
  );

  const toggleAmenity = (id: string) => {
    const updated = form.amenities.includes(id)
      ? form.amenities.filter((a) => a !== id)
      : [...form.amenities, id];
    set('amenities', updated);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const maxFiles = 10 - form.images.length;
    const toProcess = Array.from(files).slice(0, maxFiles);
    if (toProcess.length === 0) {
      setErrors((e) => ({ ...e, image: 'Maximum 10 photos allowed' }));
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const invalidFiles = toProcess.filter(f => !validTypes.includes(f.type));
    if (invalidFiles.length > 0) {
      setErrors((e) => ({ ...e, image: 'Only JPEG, PNG, WebP and GIF files are allowed' }));
      return;
    }
    setErrors((e) => ({ ...e, image: '' }));
    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          setForm((prev) => ({ ...prev, images: [...prev.images, dataUrl] }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    set('images', form.images.filter((_, i) => i !== idx));
  };

  const validateStep = () => {
    const errs: Record<string, string> = {};
    if (step === 0 && !form.propertyType) errs.propertyType = 'Select a property type';
    if (step === 1 && !form.category) errs.category = 'Select a category';
    if (step === 2) {
      if (!form.city.trim()) errs.city = 'City is required';
      if (!form.address.trim()) errs.address = 'Address is required';
    }
    if (step === 3) {
      if (!form.title.trim()) errs.title = 'Title is required';
      if (form.title.trim().length < 10) errs.title = 'Title must be at least 10 characters';
      if (!form.description.trim()) errs.description = 'Description is required';
      if (form.description.trim().length < 30) errs.description = 'Description must be at least 30 characters';
    }
    if (step === 5 && form.images.length === 0) errs.images = 'Add at least one photo';
    if (step === 6) {
      if (!form.price || Number(form.price) < 500) errs.price = 'Price must be at least ₹500/night';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));



  const handlePublish = () => {
    if (!validateStep()) return;

    setIsSubmitting(true);

    const isWfhCategory = form.category === 'remote-work';
    const hasWorkspace = form.amenities.includes('workspace');

    const newListing: Listing = {
      id: editListing?.id || `my-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      propertyType: form.propertyType,
      category: form.category,
      location: {
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim() || form.city.trim(),
        country: 'India',
      },
      images: form.images.length > 0 ? form.images : [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'
      ],
      guestCount: form.guests,
      bedroomCount: form.bedrooms,
      bedCount: form.beds,
      bathroomCount: form.bathrooms,
      price: Number(form.price),
      cleaningFee: Number(form.cleaningFee) || 0,
      serviceFee: Number(form.serviceFee) || 0,
      amenities: form.amenities,
      averageRating: editListing?.averageRating || 0,
      reviewCount: editListing?.reviewCount || 0,
      owner: {
        id: user?.id || 'demo-user',
        firstName: user?.firstName || 'You',
        lastName: user?.lastName || '',
        profileImage: user?.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=host',
        isSuperhost: false,
        hostSince: new Date().getFullYear().toString(),
        responseRate: 100,
        responseTime: 'within an hour',
      },
      houseRules: {
        checkInTime: '15:00',
        checkOutTime: '11:00',
        petsAllowed: form.petsAllowed,
        smokingAllowed: form.smokingAllowed,
        partiesAllowed: false,
      },
      cancellationPolicy: 'moderate',
      instantBook: form.instantBook,
      taxRate: 0.12,
      hostHealthScore: 90,
      cancellationHistory: 0,
      remoteWorkReady: isWfhCategory || hasWorkspace,
      internetSpeedMbps: (isWfhCategory || hasWorkspace) ? 100 : undefined,
      hasDedicatedDesk: isWfhCategory || hasWorkspace,
      hasErgonomicChair: isWfhCategory,
      hasMultipleMonitors: false,
      quietHoursGuarantee: isWfhCategory,
    };

    if (isEdit) {
      updateListing(newListing.id, newListing);
    } else {
      addListing(newListing);
    }
    setPublished(true);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setPublished(false);
    setStep(0);
    setForm(defaultForm);
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const inputClass = (err?: string) =>
    `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 transition ${
      err
        ? 'border-red-400 dark:border-red-500'
        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
    }`;

  // ─── Success Screen ───────────────────────────────────────────────
  if (published) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl p-10 text-center">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            {isEdit ? 'Listing Updated! 🎉' : 'Listing Published! 🎉'}
          </h2>
          <p className="text-gray-500 dark:text-slate-400 mb-2">
            <span className="font-semibold text-gray-800 dark:text-slate-200">{form.title}</span>
          </p>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
            {form.city}, India · ₹{Number(form.price).toLocaleString('en-IN')}/night
          </p>
          {!isEdit && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-4 text-sm text-rose-700 dark:text-rose-400 mb-6">
              🏠 Your listing is now live in <strong>My Properties</strong>. Guests can find and book it!
            </div>
          )}
          <button
            onClick={handleClose}
            className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold transition"
          >
            {isEdit ? 'Back to Properties' : 'View My Properties'}
          </button>
        </div>
      </div>
    );
  }

  // ─── Step Content ─────────────────────────────────────────────────
  let body: React.ReactNode;

  // Step 0 — Property Type
  if (step === 0) {
    body = (
      <div className="space-y-3">
        {errors.propertyType && <p className="text-red-500 text-sm">{errors.propertyType}</p>}
        <div className="grid grid-cols-2 gap-2">
          {PROPERTY_TYPES.map((pt) => (
            <button
              key={pt.id}
              onClick={() => { set('propertyType', pt.id); setErrors({}); }}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition ${
                form.propertyType === pt.id
                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/50 dark:border-rose-500'
                  : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
              }`}
            >
              <span className="text-2xl">{pt.emoji}</span>
              <span className="font-medium text-gray-900 dark:text-slate-100">{pt.label}</span>
              {form.propertyType === pt.id && (
                <Check className="w-4 h-4 text-rose-500 ml-auto flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 1 — Category
  if (step === 1) {
    body = (
      <div className="space-y-3">
        {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { set('category', cat.id); setErrors({}); }}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition ${
                form.category === cat.id
                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/50 dark:border-rose-500'
                  : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
              }`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-xs font-medium text-gray-800 dark:text-slate-200">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2 — Location
  if (step === 2) {
    body = (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            value={form.address}
            onChange={(e) => { set('address', e.target.value); setErrors({}); }}
            placeholder="e.g., 12 Baga Beach Road"
            className={inputClass(errors.address)}
          />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            value={form.city}
            onChange={(e) => { set('city', e.target.value); setErrors({}); }}
            placeholder="e.g., Goa, Mumbai, Jaipur..."
            className={inputClass(errors.city)}
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            State
          </label>
          <input
            value={form.state}
            onChange={(e) => set('state', e.target.value)}
            placeholder="e.g., Maharashtra, Rajasthan..."
            className={inputClass()}
          />
        </div>
      </div>
    );
  }

  // Step 3 — Details
  if (step === 3) {
    body = (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Listing title <span className="text-red-500">*</span>
          </label>
          <input
            value={form.title}
            onChange={(e) => { set('title', e.target.value); setErrors({}); }}
            placeholder="Give your place a catchy name..."
            className={inputClass(errors.title)}
          />
          <div className="flex justify-between mt-1">
            {errors.title
              ? <p className="text-red-500 text-xs">{errors.title}</p>
              : <span />}
            <span className="text-xs text-gray-400 dark:text-slate-500">{form.title.length}/100</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => { set('description', e.target.value); setErrors({}); }}
            placeholder="Describe your place — what makes it special, nearby attractions, what guests can expect..."
            rows={4}
            className={inputClass(errors.description) + ' resize-none'}
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {([
            { label: 'Max Guests', key: 'guests', min: 1, max: 20 },
            { label: 'Bedrooms',   key: 'bedrooms', min: 0, max: 20 },
            { label: 'Beds',       key: 'beds',     min: 1, max: 30 },
            { label: 'Bathrooms',  key: 'bathrooms', min: 1, max: 10 },
          ] as const).map(({ label, key, min, max }) => (
            <div key={key} className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">{label}</p>
              {counter(key, min, max)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Step 4 — Amenities
  if (step === 4) {
    body = (
      <div>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">
          Select all amenities your property offers
        </p>
        <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
          {AMENITY_OPTIONS.map((am) => {
            const selected = form.amenities.includes(am.id);
            return (
              <button
                key={am.id}
                onClick={() => toggleAmenity(am.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition ${
                  selected
                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/50 dark:border-rose-500'
                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                }`}
              >
                <span className="text-lg">{am.icon}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-slate-100 flex-1">{am.label}</span>
                {selected && <Check className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
          {form.amenities.length} amenities selected
        </p>
      </div>
    );
  }

  // Step 5 — Photos
  if (step === 5) {
    body = (
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Upload photos from your device. Add at least 1 photo (max 10).
        </p>

        {/* Drop zone / file picker */}
        <label
          className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition hover:border-rose-400 dark:hover:border-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 ${
            errors.image || errors.images
              ? 'border-red-400 dark:border-red-500'
              : 'border-gray-200 dark:border-slate-700'
          }`}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFileUpload(e.dataTransfer.files);
          }}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => { handleFileUpload(e.target.files); e.target.value = ''; }}
          />
          <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Upload className="w-7 h-7 text-rose-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">
            Click to browse or drag & drop
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            JPEG, PNG, WebP or GIF · Max 10 photos
          </p>
        </label>
        {errors.image && <p className="text-red-500 text-xs">{errors.image}</p>}
        {errors.images && <p className="text-red-500 text-xs">{errors.images}</p>}

        {/* Image preview grid */}
        {form.images.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">
              {form.images.length} photo{form.images.length !== 1 ? 's' : ''} added
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
              {form.images.map((url, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden aspect-video group">
                  <img
                    src={url}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      Cover
                    </span>
                  )}
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 6 — Pricing
  if (step === 6) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          <ModalHeader step={step} total={STEPS.length} title={STEPS[step].title} onClose={handleClose} isEdit={isEdit} />
          <ProgressBar step={step} total={STEPS.length} steps={STEPS} />
          <div className="p-6 overflow-y-auto flex-1">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Price per night (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 font-semibold">₹</span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => { set('price', e.target.value); setErrors({}); }}
                    placeholder="0"
                    min={500}
                    className={inputClass(errors.price) + ' pl-8'}
                  />
                </div>
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                  Similar properties in {form.city || 'your area'} charge ₹5,000–₹25,000/night
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Cleaning fee (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 font-semibold">₹</span>
                  <input
                    type="number"
                    value={form.cleaningFee}
                    onChange={(e) => set('cleaningFee', e.target.value)}
                    placeholder="0"
                    min={0}
                    className={inputClass() + ' pl-8'}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Service fee (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 font-semibold">₹</span>
                  <input
                    type="number"
                    value={form.serviceFee}
                    onChange={(e) => set('serviceFee', e.target.value)}
                    placeholder="0"
                    min={0}
                    className={inputClass() + ' pl-8'}
                  />
                </div>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-rose-700 dark:text-rose-400 mb-1">Estimated monthly earnings</p>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-300">
                  ₹{(Number(form.price || 0) * 15).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-1">Based on 15 nights/month avg occupancy</p>
              </div>
              <div className="space-y-3 pt-1">
                <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">House Rules</p>
                {[
                  { key: 'instantBook',   label: '⚡ Instant Book',    sub: 'Guests can book without waiting for approval' },
                  { key: 'petsAllowed',   label: '🐾 Pets Allowed',    sub: 'Allow guests to bring pets' },
                  { key: 'smokingAllowed', label: '🚬 Smoking Allowed', sub: 'Allow smoking on the property' },
                ].map(({ key, label, sub }) => (
                  <label key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{label}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{sub}</p>
                    </div>
                    <div
                      onClick={() => set(key as keyof FormData, !form[key as keyof FormData])}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        form[key as keyof FormData] ? 'bg-rose-500' : 'bg-gray-300 dark:bg-slate-600'
                      }`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        form[key as keyof FormData] ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-6 border-t border-gray-100 dark:border-slate-700">
            <button onClick={handleBack} className="text-sm font-medium underline text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 transition flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition"
            >
              Preview <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 7 — Preview
  if (step === 7) {
    const coverImg = form.images[0] || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80';
    const propType = PROPERTY_TYPES.find((p) => p.id === form.propertyType);
    const cat = CATEGORIES.find((c) => c.id === form.category);
    body = (
      <div className="space-y-4">
        <div className="rounded-xl overflow-hidden aspect-video">
          <img src={coverImg} alt="Cover" className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'; }} />
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mb-1">
            <span>{propType?.emoji} {propType?.label}</span>
            <span>·</span>
            <span>{cat?.emoji} {cat?.label}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">{form.title}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5" /> {form.address}, {form.city}, India
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'Guests',    val: form.guests },
            { label: 'Bedrooms',  val: form.bedrooms },
            { label: 'Beds',      val: form.beds },
            { label: 'Bathrooms', val: form.bathrooms },
          ].map(({ label, val }) => (
            <div key={label} className="bg-gray-50 dark:bg-slate-800 rounded-xl p-2">
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{val}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {form.amenities.slice(0, 8).map((id) => {
            const am = AMENITY_OPTIONS.find((a) => a.id === id);
            return am ? (
              <span key={id} className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-2 py-1 rounded-full">
                {am.icon} {am.label}
              </span>
            ) : null;
          })}
          {form.amenities.length > 8 && (
            <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-2 py-1 rounded-full">
              +{form.amenities.length - 8} more
            </span>
          )}
        </div>
        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              ₹{Number(form.price).toLocaleString('en-IN')}
              <span className="text-sm font-normal text-gray-500 dark:text-slate-400">/night</span>
            </p>
            {form.cleaningFee && (
              <p className="text-xs text-gray-500 dark:text-slate-400">
                + ₹{Number(form.cleaningFee).toLocaleString('en-IN')} cleaning fee
              </p>
            )}
          </div>
          <div className="flex gap-2 text-xs text-gray-500 dark:text-slate-400">
            {form.instantBook && <span className="bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-full">⚡ Instant</span>}
            {form.petsAllowed && <span className="bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">🐾 Pets OK</span>}
          </div>
        </div>
        {form.images.length > 1 && (
          <p className="text-xs text-gray-500 dark:text-slate-400">{form.images.length} photos added</p>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div
        className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader step={step} total={STEPS.length} title={STEPS[step].title} onClose={handleClose} isEdit={isEdit} />
        <ProgressBar step={step} total={STEPS.length} steps={STEPS} />

        <div className="p-6 overflow-y-auto flex-1">{body}</div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 dark:border-slate-700">
          <div className="flex-1">
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className={`text-sm font-medium underline text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 transition flex items-center gap-1 ${step === 0 ? 'invisible' : ''}`}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {errors.form && <p className="text-red-500 text-xs mt-2 font-medium">{errors.form}</p>}
          </div>

          {step === STEPS.length - 1 ? (
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition shadow-md shadow-rose-200 dark:shadow-rose-900/30 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Publishing...' : isEdit ? 'Save Changes' : 'Publish Listing'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition disabled:opacity-50"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ModalHeader({ step, total, title, onClose, isEdit }: {
  step: number; total: number; title: string; onClose: () => void; isEdit: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Home className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
            {isEdit ? 'Edit Listing' : 'List your property'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Step {step + 1} of {total} — {title}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition text-gray-500 dark:text-slate-400"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

function ProgressBar({ step, steps }: { step: number; total: number; steps: typeof STEPS }) {
  return (
    <div className="px-5 pt-3 flex-shrink-0">
      <div className="flex gap-1">
        {steps.map((s, i) => (
          <div key={s.label} className="flex-1">
            <div className={`h-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-rose-500' : 'bg-gray-100 dark:bg-slate-700'}`} />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1 mb-1">
        {steps.map((s, i) => (
          <span key={s.label} className={`text-xs font-medium hidden sm:block ${i === step ? 'text-rose-500' : 'text-gray-300 dark:text-slate-600'}`}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
