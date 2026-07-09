import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Listing, Review, Reservation, MOCK_LISTINGS, MOCK_REVIEWS } from '../data/mockData';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  isHost: boolean;
  favoriteIds: string[];
  currency: string;
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
  label: string;
  flag: string;
  rate: number; // conversion rate from INR
}

export interface LanguageInfo {
  code: string;
  label: string;
  native: string;
  flag: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'INR', symbol: '₹',   label: 'Indian Rupee',    flag: '🇮🇳', rate: 1       },
  { code: 'USD', symbol: '$',   label: 'US Dollar',       flag: '🇺🇸', rate: 0.012   },
  { code: 'EUR', symbol: '€',   label: 'Euro',            flag: '🇪🇺', rate: 0.011   },
  { code: 'GBP', symbol: '£',   label: 'British Pound',   flag: '🇬🇧', rate: 0.0095  },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham',      flag: '🇦🇪', rate: 0.044   },
  { code: 'SGD', symbol: 'S$',  label: 'Singapore Dollar',flag: '🇸🇬', rate: 0.016   },
  { code: 'AUD', symbol: 'A$',  label: 'Australian Dollar',flag: '🇦🇺',rate: 0.018   },
  { code: 'JPY', symbol: '¥',   label: 'Japanese Yen',    flag: '🇯🇵', rate: 1.78    },
];

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
];

interface SearchFilters {
  location: string;
  startDate: string | null;
  endDate: string | null;
  guestCount: number;
  bedroomCount: number;
  bathroomCount: number;
  minPrice: number;
  maxPrice: number;
  category: string;
  amenities: string[];
  propertyType: string;
  instantBook: boolean;
  superhost: boolean;
  minRating: number;
  remoteWorkReady: boolean;
}

interface AppState {
  // Auth
  user: User | null;
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  isSearchModalOpen: boolean;
  isRentModalOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Theme
  darkMode: boolean;

  // Language & Currency
  selectedCurrency: string;   // currency code e.g. 'INR'
  selectedLanguage: string;   // language code e.g. 'en'

  // View
  mapView: boolean;

  // Listings
  listings: Listing[];
  filteredListings: Listing[];
  selectedCategory: string;

  // Reservations
  reservations: Reservation[];

  // My listings (user-created)
  myListings: Listing[];

  // Favorites (wishlist IDs)
  favoriteListingIds: string[];

  // Reviews
  reviews: Review[];

  // Search
  searchFilters: SearchFilters;

  // Actions
  login: (user: User) => void;
  localLogin: (email: string, password: string) => void;
  localRegister: (firstName: string, lastName: string, email: string, password: string) => void;
  logout: () => void;
  setLoginModal: (open: boolean) => void;
  setRegisterModal: (open: boolean) => void;
  setSearchModal: (open: boolean) => void;
  setRentModal: (open: boolean) => void;
  toggleDarkMode: () => void;
  toggleMapView: () => void;
  setCurrency: (code: string) => void;
  setLanguage: (code: string) => void;
  setSelectedCategory: (category: string) => void;
  toggleFavorite: (listingId: string) => void;
  addReservation: (reservation: Reservation) => void;
  cancelReservation: (reservationId: string) => void;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  filterListings: () => void;
  clearFilters: () => void;

  // Listing CRUD (pure local)
  addListing: (listing: Listing) => void;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  deleteListing: (id: string) => void;

  // Reviews
  addReview: (review: Review) => void;
  getListingReviews: (listingId: string) => Review[];

  // Local data
  loadListings: () => void;
  setError: (error: string | null) => void;
}


const defaultFilters: SearchFilters = {
  location: '',
  startDate: null,
  endDate: null,
  guestCount: 1,
  bedroomCount: 0,
  bathroomCount: 0,
  minPrice: 0,
  maxPrice: 100000,
  category: '',
  amenities: [],
  propertyType: '',
  instantBook: false,
  superhost: false,
  minRating: 0,
  remoteWorkReady: false,
};

/** Apply or remove the `dark` class on <html> */
function applyDarkMode(enabled: boolean) {
  if (enabled) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoginModalOpen: false,
      isRegisterModalOpen: false,
      isSearchModalOpen: false,
      isRentModalOpen: false,
      isLoading: false,
      error: null,
      darkMode: false,
      selectedCurrency: 'INR',
      selectedLanguage: 'en',
      mapView: false,
      listings: MOCK_LISTINGS,
      filteredListings: MOCK_LISTINGS,
      selectedCategory: '',
      reservations: [],
      myListings: [],
      favoriteListingIds: [],
      reviews: MOCK_REVIEWS,
      searchFilters: defaultFilters,

      setError: (error) => set({ error }),

      // ── Auth (pure local) ────────────────────────────────
      login: (user) => {
        const state = get();
        let demoListings = state.myListings;
        let demoReservations = state.reservations;

        // Auto-populate demo host data if none exists
        if (user.isHost && demoListings.length === 0) {
          demoListings = MOCK_LISTINGS.slice(0, 3).map(l => ({ ...l, owner: { ...l.owner, id: user.id } }));
          demoReservations = [
            {
              id: 'res-demo-1',
              listingId: demoListings[0].id,
              guestId: 'guest-999',
              guestName: 'Rahul Verma',
              guestImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
              checkIn: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
              checkOut: new Date(Date.now() + 86400000 * 9).toISOString().split('T')[0],
              nights: 4, adults: 2, children: 0, infants: 0, pets: 0, guests: 2,
              totalPrice: demoListings[0].price * 4,
              status: 'confirmed',
              createdAt: new Date().toISOString(),
              listing: demoListings[0],
            },
            {
              id: 'res-demo-2',
              listingId: demoListings[1].id,
              guestId: 'guest-888',
              guestName: 'Priya Mehta',
              guestImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
              checkIn: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
              checkOut: new Date(Date.now() + 86400000 * 18).toISOString().split('T')[0],
              nights: 3, adults: 1, children: 0, infants: 0, pets: 0, guests: 1,
              totalPrice: demoListings[1].price * 3,
              status: 'pending',
              createdAt: new Date().toISOString(),
              listing: demoListings[1],
            }
          ];
        }

        set({ 
          user, 
          ...(user.isHost && demoListings.length > 0 ? { myListings: demoListings, reservations: [...state.reservations, ...demoReservations] } : {}),
          isLoginModalOpen: false, 
          isRegisterModalOpen: false,
          error: null,
        });
      },

      localLogin: (email, _password) => {
        // Create a mock user from email
        const firstName = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
        const user: User = {
          id: `user-${Date.now()}`,
          firstName,
          lastName: '',
          email,
          profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
          isHost: false,
          favoriteIds: [],
          currency: 'INR',
        };
        set({ 
          user, 
          isLoginModalOpen: false, 
          isRegisterModalOpen: false, 
          error: null 
        });
      },

      localRegister: (firstName, lastName, email, _password) => {
        const user: User = {
          id: `user-${Date.now()}`,
          firstName,
          lastName,
          email,
          profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
          isHost: false,
          favoriteIds: [],
          currency: 'INR',
        };
        set({ 
          user, 
          isLoginModalOpen: false, 
          isRegisterModalOpen: false, 
          error: null 
        });
      },

      logout: () => {
        set({
          user: null,
          reservations: [],
          myListings: [],
          favoriteListingIds: [],
          selectedCategory: '',
          searchFilters: defaultFilters,
          error: null,
        });
      },

      setLoginModal: (open) => set({ isLoginModalOpen: open, isRegisterModalOpen: false }),
      setRegisterModal: (open) => set({ isRegisterModalOpen: open, isLoginModalOpen: false }),
      setSearchModal: (open) => set({ isSearchModalOpen: open }),
      setRentModal: (open) => set({ isRentModalOpen: open }),

      toggleDarkMode: () => {
        const next = !get().darkMode;
        set({ darkMode: next });
        applyDarkMode(next);
      },

      toggleMapView: () => set((s) => ({ mapView: !s.mapView })),

      setCurrency: (code) => set({ selectedCurrency: code }),
      setLanguage: (code) => set({ selectedLanguage: code }),

      setSelectedCategory: (category) => {
        set({ selectedCategory: category });
        setTimeout(() => get().filterListings(), 0);
      },

      // ── Load listings (merge mock + user-created) ────────
      loadListings: () => {
        const { myListings } = get();
        // Merge mock listings with user-created ones (deduplicate by id)
        const userIds = new Set(myListings.map(l => l.id));
        const mergedListings = [
          ...myListings,
          ...MOCK_LISTINGS.filter(l => !userIds.has(l.id)),
        ];
        set({ listings: mergedListings, filteredListings: mergedListings });
      },

      // ── Favorites (pure local) ──────────────────────────
      toggleFavorite: (listingId) => {
        const { user, favoriteListingIds } = get();
        if (!user) {
          set({ isLoginModalOpen: true });
          return;
        }
        const isFav = favoriteListingIds.includes(listingId);
        set({
          favoriteListingIds: isFav
            ? favoriteListingIds.filter(id => id !== listingId)
            : [...favoriteListingIds, listingId],
        });
      },

      addReservation: (reservation) => {
        set((state) => ({ reservations: [...state.reservations, reservation] }));
      },

      cancelReservation: (reservationId) => {
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === reservationId ? { ...r, status: 'cancelled' as const } : r
          ),
        }));
      },

      setSearchFilters: (filters) => {
        set((state) => ({ searchFilters: { ...state.searchFilters, ...filters } }));
      },

      clearFilters: () => {
        set({ searchFilters: defaultFilters, selectedCategory: '' });
        setTimeout(() => get().filterListings(), 0);
      },

      // ── Listing CRUD (pure local, synchronous) ──────────
      addListing: (listing) => {
        set((state) => ({
          myListings: [listing, ...state.myListings],
          listings: [listing, ...state.listings],
          filteredListings: [listing, ...state.filteredListings],
        }));
      },

      updateListing: (id, updates) => {
        set((state) => ({
          myListings: state.myListings.map((l) => l.id === id ? { ...l, ...updates } : l),
          listings: state.listings.map((l) => l.id === id ? { ...l, ...updates } : l),
          filteredListings: state.filteredListings.map((l) => l.id === id ? { ...l, ...updates } : l),
        }));
      },

      deleteListing: (id) => {
        set((state) => ({
          myListings: state.myListings.filter((l) => l.id !== id),
          listings: state.listings.filter((l) => l.id !== id),
          filteredListings: state.filteredListings.filter((l) => l.id !== id),
        }));
      },

      // ── Reviews ─────────────────────────────────────────
      addReview: (review) => {
        set((state) => ({ reviews: [...state.reviews, review] }));
      },

      getListingReviews: (listingId) => {
        return get().reviews.filter((r) => r.listingId === listingId);
      },

      // ── Filter Listings ─────────────────────────────────
      filterListings: () => {
        const { listings, selectedCategory, searchFilters } = get();
        let filtered = [...listings];

        if (selectedCategory) {
          filtered = filtered.filter((l) => l.category === selectedCategory);
        }
        if (searchFilters.location) {
          const loc = searchFilters.location.toLowerCase();
          filtered = filtered.filter(
            (l) =>
              l.location.city.toLowerCase().includes(loc) ||
              l.location.country.toLowerCase().includes(loc) ||
              l.location.state.toLowerCase().includes(loc)
          );
        }
        if (searchFilters.guestCount > 1) {
          filtered = filtered.filter((l) => l.guestCount >= searchFilters.guestCount);
        }
        if (searchFilters.bedroomCount > 0) {
          filtered = filtered.filter((l) => l.bedroomCount >= searchFilters.bedroomCount);
        }
        if (searchFilters.bathroomCount > 0) {
          filtered = filtered.filter((l) => l.bathroomCount >= searchFilters.bathroomCount);
        }
        if (searchFilters.minPrice > 0) {
          filtered = filtered.filter((l) => l.price >= searchFilters.minPrice);
        }
        if (searchFilters.maxPrice < 100000) {
          filtered = filtered.filter((l) => l.price <= searchFilters.maxPrice);
        }
        if (searchFilters.amenities.length > 0) {
          filtered = filtered.filter((l) =>
            searchFilters.amenities.every((a) => l.amenities.includes(a))
          );
        }
        if (searchFilters.propertyType) {
          filtered = filtered.filter((l) => l.propertyType === searchFilters.propertyType);
        }
        if (searchFilters.instantBook) {
          filtered = filtered.filter((l) => l.instantBook);
        }
        if (searchFilters.superhost) {
          filtered = filtered.filter((l) => l.owner.isSuperhost);
        }
        if (searchFilters.minRating > 0) {
          filtered = filtered.filter((l) => l.averageRating >= searchFilters.minRating);
        }
        if (searchFilters.remoteWorkReady) {
          filtered = filtered.filter((l) => l.remoteWorkReady === true);
        }

        set({ filteredListings: filtered });
      },
    }),
    {
      name: 'home-rental-store',
      partialize: (state) => ({
        user: state.user,
        reservations: state.reservations,
        myListings: state.myListings,
        favoriteListingIds: state.favoriteListingIds,
        darkMode: state.darkMode,
        selectedCurrency: state.selectedCurrency,
        selectedLanguage: state.selectedLanguage,
        reviews: state.reviews,
      }),
      // After zustand rehydrates from localStorage, sync the dark class + merge listings
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyDarkMode(state.darkMode);
          // Merge persisted user listings with mock data
          const userIds = new Set(state.myListings.map(l => l.id));
          const merged = [
            ...state.myListings,
            ...MOCK_LISTINGS.filter(l => !userIds.has(l.id)),
          ];
          // We need to set this after rehydration via a timeout
          setTimeout(() => {
            useStore.setState({ listings: merged, filteredListings: merged });
          }, 0);
        }
      },
    }
  )
);
