export const CATEGORIES = [
  { id: 'trending', label: 'Trending', icon: '🔥' },
  { id: 'beach', label: 'Beach', icon: '🏖️' },
  { id: 'modern', label: 'Modern', icon: '🏙️' },
  { id: 'countryside', label: 'Countryside', icon: '🌄' },
  { id: 'pools', label: 'Pools', icon: '🏊' },
  { id: 'islands', label: 'Islands', icon: '🏝️' },
  { id: 'lake', label: 'Lake', icon: '🏞️' },
  { id: 'skiing', label: 'Skiing', icon: '⛷️' },
  { id: 'castles', label: 'Palaces', icon: '🏰' },
  { id: 'caves', label: 'Caves', icon: '🪨' },
  { id: 'camping', label: 'Camping', icon: '⛺' },
  { id: 'arctic', label: 'Hills', icon: '🏔️' },
  { id: 'desert', label: 'Desert', icon: '🏜️' },
  { id: 'luxury', label: 'Luxury', icon: '💎' },
  { id: 'remote-work', label: 'Remote Work', icon: '💻' },
  { id: 'heritage', label: 'Heritage', icon: '🕌' },
  { id: 'houseboat', label: 'Houseboat', icon: '🚢' },
  { id: 'backpacking', label: 'Backpacking', icon: '🎒' },
];

// ─── Area Intelligence ────────────────────────────────────────────
export interface AreaIntelligence {
  walkabilityScore: number; // 0-100
  noiseLevel: { day: string; night: string };
  nearbyHospital: { name: string; distance: string };
  nearbyPharmacy: { name: string; distance: string };
  nearbyGrocery: { name: string; distance: string };
  safetyRating: number; // 1-5
  publicTransport: string[];
  communityRatings: { aspect: string; score: number }[];
}

// ─── Local Experiences ────────────────────────────────────────────
export interface LocalExperience {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  icon: string;
  hostName: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  category: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  images: string[];
  guestCount: number;
  bedroomCount: number;
  bedCount: number;
  bathroomCount: number;
  price: number;
  cleaningFee: number;
  serviceFee: number;
  amenities: string[];
  averageRating: number;
  reviewCount: number;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    isSuperhost: boolean;
    hostSince: string;
    responseRate: number;
    responseTime: string;
  };
  houseRules: {
    checkInTime: string;
    checkOutTime: string;
    petsAllowed: boolean;
    smokingAllowed: boolean;
    partiesAllowed: boolean;
  };
  cancellationPolicy: string;
  instantBook: boolean;

  // ── True Total Price ──────────────────────────────────
  taxRate?: number;  // e.g. 0.18 for 18% GST

  // ── Work From Home Mode ───────────────────────────────
  remoteWorkReady?: boolean;
  internetSpeedMbps?: number;
  hasDedicatedDesk?: boolean;
  hasErgonomicChair?: boolean;
  hasMultipleMonitors?: boolean;
  quietHoursGuarantee?: boolean;

  // ── Host Health Score ─────────────────────────────────
  hostHealthScore?: number;       // 0-100
  cancellationHistory?: number;   // times host cancelled

  // ── Area Intelligence ─────────────────────────────────
  areaIntelligence?: AreaIntelligence;

  // ── Tenant Mode ───────────────────────────────────────
  tenantModeAvailable?: boolean;
  monthlyDiscount?: number;       // percentage off for 28+ nights
  utilityIncluded?: boolean;

  // ── Local Experiences ─────────────────────────────────
  localExperiences?: LocalExperience[];
}

export interface Review {
  id: string;
  listingId: string;
  guestId: string;
  reviewer: { firstName: string; lastName: string; profileImage: string };
  overallRating: number;
  comment: string;
  ratings: { cleanliness: number; accuracy: number; checkIn: number; communication: number; location: number; value: number };
  createdAt: string;
  // ── Blind Review System ───────────────────────────────
  hostReview?: {
    responsibility: number;
    communication: number;
    cleanliness: number;
    comment: string;
  };
  revealedAt?: string | null; // null = not yet revealed (waiting for other party)
}

// ─── Travel Buddy ────────────────────────────────────────────────
export interface TravelBuddy {
  id: string;
  userId: string;
  name: string;
  age: number;
  profileImage: string;
  destination: string;
  dateRange: { start: string; end: string };
  interests: string[];
  bio: string;
  budget: string;
  verified: boolean;
  gender: string;
  languages: string[];
}

export const MOCK_TRAVEL_BUDDIES: TravelBuddy[] = [
  {
    id: 'tb1', userId: 'tu1', name: 'Aarav Kapoor', age: 27,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav',
    destination: 'Goa', dateRange: { start: '2026-05-10', end: '2026-05-17' },
    interests: ['surfing', 'photography', 'nightlife', 'food'],
    bio: 'Software engineer looking for beach vibes and great company. Love meeting new people over sunset drinks!',
    budget: '₹8,000–12,000/night', verified: true, gender: 'Male', languages: ['English', 'Hindi'],
  },
  {
    id: 'tb2', userId: 'tu2', name: 'Sneha Rao', age: 25,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha',
    destination: 'Manali', dateRange: { start: '2026-05-15', end: '2026-05-22' },
    interests: ['trekking', 'yoga', 'meditation', 'photography'],
    bio: 'Solo traveler and yoga instructor. Looking for like-minded souls to share a cozy mountain cabin.',
    budget: '₹5,000–8,000/night', verified: true, gender: 'Female', languages: ['English', 'Hindi', 'Kannada'],
  },
  {
    id: 'tb3', userId: 'tu3', name: 'Rohan Mehta', age: 30,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RohanM',
    destination: 'Rishikesh', dateRange: { start: '2026-06-01', end: '2026-06-15' },
    interests: ['remote-work', 'rafting', 'meditation', 'digital-nomad'],
    bio: 'Digital nomad on a workation. Looking for someone to split a riverside co-working space in Rishikesh.',
    budget: '₹4,000–7,000/night', verified: true, gender: 'Male', languages: ['English', 'Hindi', 'Gujarati'],
  },
  {
    id: 'tb4', userId: 'tu4', name: 'Priya Nambiar', age: 28,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaN',
    destination: 'Kerala', dateRange: { start: '2026-05-20', end: '2026-05-30' },
    interests: ['ayurveda', 'cooking', 'backwaters', 'nature'],
    bio: 'Food blogger exploring Kerala cuisine. Would love a travel buddy for houseboat stays and cooking classes!',
    budget: '₹6,000–10,000/night', verified: true, gender: 'Female', languages: ['English', 'Malayalam', 'Tamil'],
  },
  {
    id: 'tb5', userId: 'tu5', name: 'Arjun Das', age: 32,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunD',
    destination: 'Ladakh', dateRange: { start: '2026-07-01', end: '2026-07-14' },
    interests: ['motorcycling', 'photography', 'adventure', 'camping'],
    bio: 'Planning a Leh-Ladakh road trip. Looking for co-riders to share the epic journey and accommodation costs.',
    budget: '₹5,000–9,000/night', verified: true, gender: 'Male', languages: ['English', 'Hindi', 'Bengali'],
  },
  {
    id: 'tb6', userId: 'tu6', name: 'Meera Joshi', age: 24,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MeeraJ',
    destination: 'Gokarna', dateRange: { start: '2026-05-25', end: '2026-06-01' },
    interests: ['beach', 'yoga', 'reading', 'budget-travel'],
    bio: 'Fresh grad taking a gap month. Looking for chill beach companions to split a beachside cottage.',
    budget: '₹3,000–5,000/night', verified: true, gender: 'Female', languages: ['English', 'Hindi', 'Marathi'],
  },
  {
    id: 'tb7', userId: 'tu7', name: 'Vikash Sharma', age: 29,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VikashS',
    destination: 'Bangalore', dateRange: { start: '2026-05-05', end: '2026-05-20' },
    interests: ['startups', 'remote-work', 'coffee', 'networking'],
    bio: 'Startup founder based in Delhi, spending 2 weeks in Bangalore. Looking for a co-living buddy to share a premium workspace apartment.',
    budget: '₹8,000–15,000/night', verified: true, gender: 'Male', languages: ['English', 'Hindi'],
  },
  {
    id: 'tb8', userId: 'tu8', name: 'Ananya Reddy', age: 26,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaR',
    destination: 'Hampi', dateRange: { start: '2026-06-10', end: '2026-06-17' },
    interests: ['history', 'photography', 'cycling', 'heritage'],
    bio: 'Architect and history nerd. Would love to explore Hampi ruins with a fellow heritage enthusiast!',
    budget: '₹3,000–6,000/night', verified: true, gender: 'Female', languages: ['English', 'Hindi', 'Telugu'],
  },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1', listingId: '1', guestId: 'guest1',
    reviewer: { firstName: 'Priya', lastName: 'S.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
    overallRating: 5, comment: 'Absolutely stunning beachfront villa! The Arabian Sea views were breathtaking and the host was incredibly responsive. Will definitely come back to Goa!',
    ratings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 4 },
    createdAt: '2024-11-15',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 5, comment: 'Wonderful guest, left the place spotless!' },
    revealedAt: '2024-11-17',
  },
  {
    id: 'r2', listingId: '1', guestId: 'guest2',
    reviewer: { firstName: 'Rahul', lastName: 'M.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul' },
    overallRating: 5, comment: 'Perfect Goa escape. Amenities were top-notch and the beach access is unbeatable. Highly recommend!',
    ratings: { cleanliness: 5, accuracy: 5, checkIn: 4, communication: 5, location: 5, value: 5 },
    createdAt: '2024-10-22',
    hostReview: { responsibility: 5, communication: 4, cleanliness: 5, comment: 'Great guests, very respectful.' },
    revealedAt: '2024-10-24',
  },
  {
    id: 'r3', listingId: '2', guestId: 'guest3',
    reviewer: { firstName: 'Ananya', lastName: 'K.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya' },
    overallRating: 4, comment: 'Lovely Himalayan retreat. Cozy and well-equipped. The views from the deck at sunrise are incredible.',
    ratings: { cleanliness: 4, accuracy: 4, checkIn: 5, communication: 4, location: 5, value: 4 },
    createdAt: '2024-11-01',
    hostReview: { responsibility: 4, communication: 5, cleanliness: 4, comment: 'Pleasant stay, would host again.' },
    revealedAt: '2024-11-03',
  },
  {
    id: 'r4', listingId: '3', guestId: 'guest4',
    reviewer: { firstName: 'Vikram', lastName: 'R.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram' },
    overallRating: 5, comment: 'The most luxurious villa I have ever stayed in. The private pool is amazing and the Kerala backwater views are stunning.',
    ratings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 4 },
    createdAt: '2024-10-10',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 5, comment: 'Perfect guests!' },
    revealedAt: '2024-10-12',
  },
  {
    id: 'r5', listingId: '4', guestId: 'guest5',
    reviewer: { firstName: 'Nisha', lastName: 'P.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nisha' },
    overallRating: 5, comment: 'Unforgettable experience! The glass floor panels and direct sea access made this truly magical. Worth every rupee.',
    ratings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
    createdAt: '2024-09-18',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 5, comment: 'Dream guests, so respectful of the property.' },
    revealedAt: '2024-09-20',
  },
  {
    id: 'r6', listingId: '7', guestId: 'guest6',
    reviewer: { firstName: 'Kabir', lastName: 'D.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kabir' },
    overallRating: 5, comment: 'The houseboat experience on Dal Lake was surreal. Shikara rides at sunset, kayaking in the morning — pure bliss!',
    ratings: { cleanliness: 4, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
    createdAt: '2024-08-30',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 4, comment: 'Great experience hosting them.' },
    revealedAt: '2024-09-01',
  },
  {
    id: 'r7', listingId: '8', guestId: 'guest7',
    reviewer: { firstName: 'Sanya', lastName: 'G.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sanya' },
    overallRating: 5, comment: 'Sleeping under the desert stars was an otherworldly experience. The camel rides and traditional dinner were unforgettable.',
    ratings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
    createdAt: '2024-10-05',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 5, comment: 'Lovely couple, hope to see them again!' },
    revealedAt: '2024-10-07',
  },
  {
    id: 'r8', listingId: '9', guestId: 'guest8',
    reviewer: { firstName: 'Amit', lastName: 'T.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit' },
    overallRating: 4, comment: 'Stunning views from the penthouse! Great location for business travel. The workspace setup is excellent for remote work.',
    ratings: { cleanliness: 5, accuracy: 4, checkIn: 4, communication: 4, location: 5, value: 4 },
    createdAt: '2024-11-20',
    hostReview: { responsibility: 4, communication: 4, cleanliness: 5, comment: 'Clean and tidy guests.' },
    revealedAt: '2024-11-22',
  },
  {
    id: 'r9', listingId: '10', guestId: 'guest9',
    reviewer: { firstName: 'Riya', lastName: 'B.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riya' },
    overallRating: 5, comment: 'Munnar is magical and this tea estate bungalow made it even more special. Waking up to misty tea gardens is a dream.',
    ratings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
    createdAt: '2024-12-01',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 5, comment: 'Perfect guests!' },
    revealedAt: '2024-12-03',
  },
  {
    id: 'r10', listingId: '11', guestId: 'guest10',
    reviewer: { firstName: 'Dev', lastName: 'S.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev' },
    overallRating: 5, comment: 'The cliff suite in Varkala is truly one of a kind. Watching the sunset from the private plunge pool was the highlight of our trip.',
    ratings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 4 },
    createdAt: '2024-11-10',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 5, comment: 'Wonderful guests, left everything in perfect condition.' },
    revealedAt: '2024-11-12',
  },
  {
    id: 'r11', listingId: '13', guestId: 'guest11',
    reviewer: { firstName: 'Tara', lastName: 'M.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tara' },
    overallRating: 5, comment: 'The internet speed was incredible — 200 Mbps! Perfect for my remote work stint. The dedicated workspace made all the difference.',
    ratings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 4, value: 5 },
    createdAt: '2024-12-15',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 5, comment: 'Professional and quiet guest.' },
    revealedAt: '2024-12-17',
  },
  {
    id: 'r12', listingId: '15', guestId: 'guest12',
    reviewer: { firstName: 'Karan', lastName: 'V.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karan' },
    overallRating: 5, comment: 'Pondicherry French Quarter charm at its finest. The colonial architecture and café culture made our workation unforgettable.',
    ratings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
    createdAt: '2024-11-25',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 5, comment: 'Fantastic guests!' },
    revealedAt: '2024-11-27',
  },
  {
    id: 'r13', listingId: '18', guestId: 'guest13',
    reviewer: { firstName: 'Meghna', lastName: 'R.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meghna' },
    overallRating: 5, comment: 'Leh was absolutely breathtaking and this property captured the essence perfectly. The mountain views from every window were incredible.',
    ratings: { cleanliness: 5, accuracy: 5, checkIn: 4, communication: 5, location: 5, value: 5 },
    createdAt: '2024-09-10',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 5, comment: 'Great guests, very adventurous spirit!' },
    revealedAt: '2024-09-12',
  },
  {
    id: 'r14', listingId: '19', guestId: 'guest14',
    reviewer: { firstName: 'Arun', lastName: 'K.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arun' },
    overallRating: 5, comment: 'The colonial bungalow in Ooty is a gem! Perfect blend of heritage charm and modern comforts. Tea garden walks every morning were sublime.',
    ratings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
    createdAt: '2024-10-20',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 5, comment: 'Absolutely wonderful guests.' },
    revealedAt: '2024-10-22',
  },
  // ── New Reviews for new listings ──────────────────────────────────
  {
    id: 'r15', listingId: '21', guestId: 'guest15',
    reviewer: { firstName: 'Ishaan', lastName: 'G.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ishaan' },
    overallRating: 5, comment: 'Hampi is pure magic and this cottage captures it perfectly. Watching sunrise over the boulders from the rooftop was unforgettable.',
    ratings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
    createdAt: '2025-01-05',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 5, comment: 'Wonderful guests who truly appreciated the heritage!' },
    revealedAt: '2025-01-07',
  },
  {
    id: 'r16', listingId: '22', guestId: 'guest16',
    reviewer: { firstName: 'Simran', lastName: 'P.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Simran' },
    overallRating: 5, comment: 'The living root bridges of Meghalaya are surreal. This bamboo lodge is eco-conscious and absolutely beautiful. Highly recommend!',
    ratings: { cleanliness: 4, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
    createdAt: '2025-01-12',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 4, comment: 'Great eco-conscious travelers.' },
    revealedAt: '2025-01-14',
  },
  {
    id: 'r17', listingId: '23', guestId: 'guest17',
    reviewer: { firstName: 'Neel', lastName: 'D.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neel' },
    overallRating: 5, comment: 'The Alleppey houseboat exceeded all expectations. Private chef cooked incredible Kerala meals. Sunset on the backwaters is pure bliss.',
    ratings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
    createdAt: '2025-02-01',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 5, comment: 'Dream couple, so easy to host!' },
    revealedAt: '2025-02-03',
  },
  {
    id: 'r18', listingId: '24', guestId: 'guest18',
    reviewer: { firstName: 'Aditi', lastName: 'R.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditi' },
    overallRating: 5, comment: 'Gokarna is the anti-Goa we needed. This cliff cottage with the secret beach access was perfect. Could hear the waves all night.',
    ratings: { cleanliness: 5, accuracy: 5, checkIn: 4, communication: 5, location: 5, value: 5 },
    createdAt: '2025-01-20',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 5, comment: 'Lovely solo traveler, very respectful.' },
    revealedAt: '2025-01-22',
  },
  {
    id: 'r19', listingId: '25', guestId: 'guest19',
    reviewer: { firstName: 'Sahil', lastName: 'K.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sahil' },
    overallRating: 4, comment: 'Great workspace setup and incredible views. 500 Mbps internet is no joke — best workation setup in India. The espresso machine was a nice touch!',
    ratings: { cleanliness: 5, accuracy: 4, checkIn: 5, communication: 4, location: 5, value: 4 },
    createdAt: '2025-02-10',
    hostReview: { responsibility: 4, communication: 4, cleanliness: 5, comment: 'Professional guest, left everything spotless.' },
    revealedAt: '2025-02-12',
  },
  {
    id: 'r20', listingId: '26', guestId: 'guest20',
    reviewer: { firstName: 'Kavitha', lastName: 'S.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavitha' },
    overallRating: 5, comment: 'Auli in winter is a dream! The ski-in/ski-out lodge made everything so easy. Hot chocolate by the fireplace after a day on the slopes — perfection.',
    ratings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
    createdAt: '2025-01-30',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 5, comment: 'Wonderful family, great with the kids too!' },
    revealedAt: '2025-02-01',
  },
  {
    id: 'r21', listingId: '27', guestId: 'guest21',
    reviewer: { firstName: 'Rajat', lastName: 'V.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajat' },
    overallRating: 5, comment: 'The Rann of Kutch white desert at full moon is otherworldly. This luxury tent with the stargazing deck was the cherry on top.',
    ratings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
    createdAt: '2025-02-15',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 5, comment: 'Adventurous guests who loved the experience!' },
    revealedAt: '2025-02-17',
  },
  {
    id: 'r22', listingId: '28', guestId: 'guest22',
    reviewer: { firstName: 'Tanvi', lastName: 'M.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvi' },
    overallRating: 5, comment: 'Found my dream relocation spot! Spent a month here and fell in love with Kasol. The host helped us connect with locals and understand the community.',
    ratings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
    createdAt: '2025-03-01',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 5, comment: 'Long-term guest, treated the place like home.' },
    revealedAt: '2025-03-03',
  },
  {
    id: 'r23', listingId: '29', guestId: 'guest23',
    reviewer: { firstName: 'Deepak', lastName: 'N.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Deepak' },
    overallRating: 5, comment: 'Chennai Marina Beach penthouse is incredible. The rooftop infinity pool overlooking the Bay of Bengal at sunset is something else.',
    ratings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 4 },
    createdAt: '2025-02-20',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 5, comment: 'Professional travelers, would host again!' },
    revealedAt: '2025-02-22',
  },
  {
    id: 'r24', listingId: '30', guestId: 'guest24',
    reviewer: { firstName: 'Zara', lastName: 'H.', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zara' },
    overallRating: 5, comment: 'Mussoorie clouds rolling in through the windows at dawn — pure magic. This colonial manor feels like stepping into a Ruskin Bond novel.',
    ratings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
    createdAt: '2025-03-10',
    hostReview: { responsibility: 5, communication: 5, cleanliness: 5, comment: 'Charming couple, left a lovely review in the guestbook!' },
    revealedAt: '2025-03-12',
  },
];

export const MOCK_LISTINGS: Listing[] = [
  // ── 1. Goa Beach Villa ────────────────────────────────
  {
    id: '1',
    title: 'Stunning Beachfront Villa with Private Pool in Goa',
    description: 'Wake up to the sound of Arabian Sea waves in this luxurious beachfront villa. Featuring panoramic ocean views, a private infinity pool, and direct beach access. The open-concept living area is perfect for families or groups. Fully equipped gourmet kitchen, outdoor BBQ, and multiple terraces to soak in the Goan sunset.',
    propertyType: 'villa',
    category: 'beach',
    location: { address: '12 Baga Beach Road', city: 'Goa', state: 'Goa', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80',
      'https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d?w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    ],
    guestCount: 10, bedroomCount: 5, bedCount: 7, bathroomCount: 4,
    price: 28000, cleaningFee: 3500, serviceFee: 4200,
    amenities: ['wifi', 'pool', 'kitchen', 'parking', 'ac', 'washer', 'dryer', 'bbqGrill', 'beachfront', 'oceanView', 'balcony'],
    averageRating: 4.97, reviewCount: 48,
    owner: { id: 'u1', firstName: 'Anjali', lastName: 'Sharma', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali', isSuperhost: true, hostSince: '2019', responseRate: 99, responseTime: 'within an hour' },
    houseRules: { checkInTime: '15:00', checkOutTime: '11:00', petsAllowed: false, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'moderate', instantBook: true,
    taxRate: 0.18, hostHealthScore: 97, cancellationHistory: 0,
    remoteWorkReady: true, internetSpeedMbps: 100, hasDedicatedDesk: true, hasErgonomicChair: false, hasMultipleMonitors: false, quietHoursGuarantee: false,
    tenantModeAvailable: true, monthlyDiscount: 25, utilityIncluded: true,
    areaIntelligence: {
      walkabilityScore: 72,
      noiseLevel: { day: 'Moderate (beach crowds)', night: 'Quiet' },
      nearbyHospital: { name: 'Goa Medical College', distance: '8 km' },
      nearbyPharmacy: { name: 'Apollo Pharmacy', distance: '1.2 km' },
      nearbyGrocery: { name: 'Delfinos Supermarket', distance: '0.8 km' },
      safetyRating: 4,
      publicTransport: ['Local bus stop — 500m', 'Goa Airport — 40 min'],
      communityRatings: [
        { aspect: 'Beach Access', score: 5 },
        { aspect: 'Nightlife', score: 4 },
        { aspect: 'Family Friendly', score: 3 },
        { aspect: 'Local Food', score: 5 },
      ],
    },
    localExperiences: [
      { id: 'le1', title: 'Goan Fish Curry Masterclass', description: 'Learn authentic Goan fish curry with Anjali', price: 2500, duration: '3 hours', icon: '🍛', hostName: 'Anjali' },
      { id: 'le2', title: 'Sunrise Dolphin Tour', description: 'Spot dolphins on a traditional fishing boat', price: 1500, duration: '2 hours', icon: '🐬', hostName: 'Anjali' },
    ],
  },
  // ── 2. Manali Cottage ─────────────────────────────────
  {
    id: '2',
    title: 'Cozy Himalayan Cottage with Panoramic Valley Views',
    description: 'Escape to this charming cottage nestled in the heart of the Himalayas near Manali. Featuring a stone fireplace, wraparound deck with stunning valley views, and all the comforts of home. Perfect for couples or small families. Trekking trails start right from the property.',
    propertyType: 'cabin',
    category: 'countryside',
    location: { address: '456 Solang Valley Road', city: 'Manali', state: 'Himachal Pradesh', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80',
      'https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=800&q=80',
      'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80',
    ],
    guestCount: 6, bedroomCount: 3, bedCount: 4, bathroomCount: 2,
    price: 9500, cleaningFee: 1800, serviceFee: 1400,
    amenities: ['wifi', 'kitchen', 'fireplace', 'parking', 'heating', 'washer', 'mountainView', 'balcony', 'bbqGrill'],
    averageRating: 4.89, reviewCount: 72,
    owner: { id: 'u2', firstName: 'Arjun', lastName: 'Verma', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun', isSuperhost: true, hostSince: '2017', responseRate: 98, responseTime: 'within a few hours' },
    houseRules: { checkInTime: '16:00', checkOutTime: '10:00', petsAllowed: true, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'flexible', instantBook: true,
    taxRate: 0.12, hostHealthScore: 95, cancellationHistory: 0,
    tenantModeAvailable: true, monthlyDiscount: 30, utilityIncluded: false,
    areaIntelligence: {
      walkabilityScore: 45,
      noiseLevel: { day: 'Very Quiet', night: 'Silent' },
      nearbyHospital: { name: 'Lady Willingdon Hospital', distance: '6 km' },
      nearbyPharmacy: { name: 'Jan Aushadhi', distance: '3 km' },
      nearbyGrocery: { name: 'Local Market', distance: '2 km' },
      safetyRating: 5,
      publicTransport: ['Bus stand — 4 km', 'Bhuntar Airport — 50 km'],
      communityRatings: [
        { aspect: 'Trekking', score: 5 },
        { aspect: 'Snow Activities', score: 4 },
        { aspect: 'Peace & Quiet', score: 5 },
        { aspect: 'Local Culture', score: 4 },
      ],
    },
    localExperiences: [
      { id: 'le3', title: 'Guided Solang Valley Trek', description: 'Full-day trek with packed lunch', price: 2000, duration: '6 hours', icon: '🥾', hostName: 'Arjun' },
    ],
  },
  // ── 3. Kerala Luxury Villa ────────────────────────────
  {
    id: '3',
    title: 'Luxury Kerala Backwater Villa with Private Pool',
    description: 'Experience ultimate luxury in this contemporary villa overlooking the serene Kerala backwaters. Features a private heated pool, outdoor jacuzzi, and full Ayurvedic spa. The minimalist interior with floor-to-ceiling windows creates seamless indoor-outdoor living. Private chef available upon request.',
    propertyType: 'villa',
    category: 'luxury',
    location: { address: '789 Kumarakom Lake Road', city: 'Kumarakom', state: 'Kerala', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63329026?w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
    ],
    guestCount: 8, bedroomCount: 4, bedCount: 5, bathroomCount: 4,
    price: 42000, cleaningFee: 5500, serviceFee: 6300,
    amenities: ['wifi', 'pool', 'hotTub', 'kitchen', 'gym', 'parking', 'ac', 'heating', 'washer', 'dryer', 'workspace', 'lakeView', 'balcony', 'garden'],
    averageRating: 4.95, reviewCount: 29,
    owner: { id: 'u3', firstName: 'Meera', lastName: 'Nair', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meera', isSuperhost: true, hostSince: '2020', responseRate: 100, responseTime: 'within an hour' },
    houseRules: { checkInTime: '14:00', checkOutTime: '12:00', petsAllowed: false, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'strict', instantBook: false,
    taxRate: 0.18, hostHealthScore: 99, cancellationHistory: 0,
    remoteWorkReady: true, internetSpeedMbps: 150, hasDedicatedDesk: true, hasErgonomicChair: true, hasMultipleMonitors: true, quietHoursGuarantee: true,
    areaIntelligence: {
      walkabilityScore: 35,
      noiseLevel: { day: 'Peaceful', night: 'Very Quiet' },
      nearbyHospital: { name: 'Kottayam Medical College', distance: '15 km' },
      nearbyPharmacy: { name: 'Medplus', distance: '5 km' },
      nearbyGrocery: { name: 'Kumarakom Market', distance: '3 km' },
      safetyRating: 5,
      publicTransport: ['Ferry — 1 km', 'Kottayam Railway — 16 km'],
      communityRatings: [
        { aspect: 'Backwater Views', score: 5 },
        { aspect: 'Privacy', score: 5 },
        { aspect: 'Ayurveda Access', score: 5 },
        { aspect: 'Bird Watching', score: 4 },
      ],
    },
    localExperiences: [
      { id: 'le4', title: 'Ayurvedic Spa Day', description: 'Full-day Ayurvedic treatment with a certified therapist', price: 8000, duration: 'Full day', icon: '💆', hostName: 'Meera' },
      { id: 'le5', title: 'Kerala Cooking Class', description: 'Learn to cook traditional Sadya with 12 dishes', price: 3000, duration: '4 hours', icon: '🍳', hostName: 'Meera' },
    ],
  },
  // ── 4. Andaman Island ─────────────────────────────────
  {
    id: '4',
    title: 'Andaman Island Overwater Bungalow',
    description: 'Live your dream in this iconic bungalow nestled over the crystal-clear waters of the Andaman Sea. With glass floor panels to observe marine life, direct ladder access to the sea, and a private terrace for stargazing — this is the ultimate island escape in India.',
    propertyType: 'house',
    category: 'islands',
    location: { address: 'Havelock Island Resort', city: 'Havelock Island', state: 'Andaman & Nicobar', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80',
      'https://images.unsplash.com/photo-1573843981267-be1480125de9?w=800&q=80',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80',
      'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=800&q=80',
    ],
    guestCount: 2, bedroomCount: 1, bedCount: 1, bathroomCount: 1,
    price: 32000, cleaningFee: 2800, serviceFee: 4800,
    amenities: ['wifi', 'ac', 'breakfast', 'oceanView', 'waterfront', 'balcony'],
    averageRating: 4.99, reviewCount: 118,
    owner: { id: 'u4', firstName: 'Suresh', lastName: 'Pillai', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh', isSuperhost: true, hostSince: '2016', responseRate: 99, responseTime: 'within an hour' },
    houseRules: { checkInTime: '14:00', checkOutTime: '12:00', petsAllowed: false, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'moderate', instantBook: true,
    taxRate: 0.12, hostHealthScore: 98, cancellationHistory: 0,
    areaIntelligence: {
      walkabilityScore: 55,
      noiseLevel: { day: 'Gentle waves', night: 'Ocean sounds' },
      nearbyHospital: { name: 'PHC Havelock', distance: '4 km' },
      nearbyPharmacy: { name: 'Island Pharma', distance: '2 km' },
      nearbyGrocery: { name: 'Havelock Market', distance: '3 km' },
      safetyRating: 4,
      publicTransport: ['Ferry terminal — 3 km', 'Port Blair Airport — ferry + 30 min'],
      communityRatings: [
        { aspect: 'Snorkeling', score: 5 },
        { aspect: 'Beaches', score: 5 },
        { aspect: 'Solitude', score: 5 },
        { aspect: 'Stargazing', score: 5 },
      ],
    },
  },
  // ── 6. Jodhpur Palace ─────────────────────────────────
  {
    id: '6',
    title: 'Heritage Palace Stay in Rajasthan',
    description: 'Experience a once-in-a-lifetime stay in a 16th century Rajput palace. Surrounded by 50 acres of private estate in Jodhpur, this remarkable property features original period furnishings, a grand durbar hall, and breathtaking desert scenery. Royal cuisine and camel safaris available.',
    propertyType: 'house',
    category: 'castles',
    location: { address: 'Mehrangarh Heritage Estate', city: 'Jodhpur', state: 'Rajasthan', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1584132905271-512c958d674a?w=800&q=80',
      'https://images.unsplash.com/photo-1570122828-c93b95e6c17d?w=800&q=80',
      'https://images.unsplash.com/photo-1599598425947-5202edd56fdb?w=800&q=80',
    ],
    guestCount: 16, bedroomCount: 8, bedCount: 12, bathroomCount: 6,
    price: 75000, cleaningFee: 9500, serviceFee: 11000,
    amenities: ['wifi', 'kitchen', 'parking', 'heating', 'fireplace', 'garden', 'petsAllowed', 'pool'],
    averageRating: 4.88, reviewCount: 22,
    owner: { id: 'u6', firstName: 'Maharaj', lastName: 'Singh', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maharaj', isSuperhost: false, hostSince: '2022', responseRate: 92, responseTime: 'within a day' },
    houseRules: { checkInTime: '15:00', checkOutTime: '11:00', petsAllowed: true, smokingAllowed: false, partiesAllowed: true },
    cancellationPolicy: 'strict', instantBook: false,
    taxRate: 0.18, hostHealthScore: 78, cancellationHistory: 2,
    localExperiences: [
      { id: 'le6', title: 'Royal Rajasthani Dinner', description: 'Multi-course traditional Rajasthani thali in the durbar hall', price: 5000, duration: '3 hours', icon: '👑', hostName: 'Maharaj' },
      { id: 'le7', title: 'Sunrise Camel Safari', description: 'Guided camel ride through the Thar desert', price: 3500, duration: '4 hours', icon: '🐪', hostName: 'Maharaj' },
    ],
  },
  // ── 7. Srinagar Houseboat ─────────────────────────────
  {
    id: '7',
    title: 'Dal Lake Houseboat with Shikara & Kayaks',
    description: 'Spend your days gliding through the world-famous Dal Lake on a shikara and your evenings watching spectacular Himalayan sunsets from the private deck. This charming houseboat comes with kayaks, paddleboards, and a shikara for exploring the lake. Fish from the deck or swim in the serene waters.',
    propertyType: 'cottage',
    category: 'lake',
    location: { address: '7 Boulevard Road, Dal Lake', city: 'Srinagar', state: 'Jammu & Kashmir', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80',
      'https://images.unsplash.com/photo-1467226632440-65f0b4957563?w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&q=80',
    ],
    guestCount: 8, bedroomCount: 4, bedCount: 5, bathroomCount: 2,
    price: 14500, cleaningFee: 2200, serviceFee: 2100,
    amenities: ['wifi', 'kitchen', 'heating', 'washer', 'dryer', 'bbqGrill', 'waterfront', 'lakeView', 'balcony', 'petsAllowed', 'breakfast'],
    averageRating: 4.92, reviewCount: 65,
    owner: { id: 'u7', firstName: 'Farida', lastName: 'Khan', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Farida', isSuperhost: true, hostSince: '2018', responseRate: 97, responseTime: 'within a few hours' },
    houseRules: { checkInTime: '15:00', checkOutTime: '10:00', petsAllowed: true, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'moderate', instantBook: true,
    taxRate: 0.12, hostHealthScore: 94, cancellationHistory: 0,
    areaIntelligence: {
      walkabilityScore: 30,
      noiseLevel: { day: 'Water sounds only', night: 'Serene silence' },
      nearbyHospital: { name: 'SKIMS', distance: '10 km' },
      nearbyPharmacy: { name: 'Boulevard Pharmacy', distance: '2 km (by shikara)' },
      nearbyGrocery: { name: 'Floating Market', distance: '1 km (by shikara)' },
      safetyRating: 4,
      publicTransport: ['Shikara taxi — on call', 'Srinagar Airport — 18 km'],
      communityRatings: [
        { aspect: 'Scenic Beauty', score: 5 },
        { aspect: 'Photography', score: 5 },
        { aspect: 'Cultural Experience', score: 5 },
        { aspect: 'Adventure', score: 4 },
      ],
    },
  },
  // ── 8. Jaisalmer Desert Glamping ──────────────────────
  {
    id: '8',
    title: 'Desert Glamping Under the Stars in Thar Desert',
    description: 'An extraordinary Rajasthani desert experience. Luxury tents set up beneath the vast Thar sky, with private butler service, sunset camel rides, and traditional Rajasthani cuisine prepared over open fires. Fall asleep to silence and wake to a golden sunrise over the dunes of Jaisalmer.',
    propertyType: 'camper',
    category: 'desert',
    location: { address: 'Sam Sand Dunes', city: 'Jaisalmer', state: 'Rajasthan', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80',
      'https://images.unsplash.com/photo-1548813831-8d6f61e84f18?w=800&q=80',
      'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=80',
      'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=800&q=80',
    ],
    guestCount: 2, bedroomCount: 1, bedCount: 1, bathroomCount: 1,
    price: 8500, cleaningFee: 1200, serviceFee: 1250,
    amenities: ['breakfast', 'ac', 'heating'],
    averageRating: 4.96, reviewCount: 84,
    owner: { id: 'u8', firstName: 'Ramesh', lastName: 'Bhati', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh', isSuperhost: true, hostSince: '2019', responseRate: 98, responseTime: 'within an hour' },
    houseRules: { checkInTime: '15:00', checkOutTime: '10:00', petsAllowed: false, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'flexible', instantBook: true,
    taxRate: 0.12, hostHealthScore: 96, cancellationHistory: 0,
  },
  // ── 9. Mumbai Penthouse ───────────────────────────────
  {
    id: '9',
    title: 'Sleek Mumbai Penthouse with Skyline Views',
    description: 'Live in the heart of the financial capital in this stunning penthouse apartment. Floor-to-ceiling windows offer jaw-dropping 360° views of the Mumbai skyline and Arabian Sea. The rooftop terrace is perfect for cocktail evenings. Walking distance to top restaurants, galleries, and entertainment.',
    propertyType: 'apartment',
    category: 'modern',
    location: { address: '100 Bandra Kurla Complex', city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    ],
    guestCount: 4, bedroomCount: 2, bedCount: 2, bathroomCount: 2,
    price: 18500, cleaningFee: 3000, serviceFee: 2800,
    amenities: ['wifi', 'kitchen', 'gym', 'elevator', 'ac', 'heating', 'washer', 'dryer', 'workspace', 'cityView', 'balcony'],
    averageRating: 4.85, reviewCount: 93,
    owner: { id: 'u9', firstName: 'Deepa', lastName: 'Mehta', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Deepa', isSuperhost: false, hostSince: '2020', responseRate: 94, responseTime: 'within a few hours' },
    houseRules: { checkInTime: '15:00', checkOutTime: '11:00', petsAllowed: false, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'moderate', instantBook: true,
    taxRate: 0.18, hostHealthScore: 85, cancellationHistory: 1,
    remoteWorkReady: true, internetSpeedMbps: 300, hasDedicatedDesk: true, hasErgonomicChair: true, hasMultipleMonitors: true, quietHoursGuarantee: true,
    tenantModeAvailable: true, monthlyDiscount: 20, utilityIncluded: true,
    areaIntelligence: {
      walkabilityScore: 85,
      noiseLevel: { day: 'Urban buzz', night: 'Moderate' },
      nearbyHospital: { name: 'Lilavati Hospital', distance: '3 km' },
      nearbyPharmacy: { name: 'MedPlus', distance: '200m' },
      nearbyGrocery: { name: 'Nature\'s Basket', distance: '500m' },
      safetyRating: 4,
      publicTransport: ['Metro — 800m', 'Mumbai Airport — 20 min', 'Local train — 2 km'],
      communityRatings: [
        { aspect: 'Dining & Nightlife', score: 5 },
        { aspect: 'Business Access', score: 5 },
        { aspect: 'Shopping', score: 5 },
        { aspect: 'Peace & Quiet', score: 2 },
      ],
    },
  },
  // ── 10. Munnar Tea Estate ─────────────────────────────
  {
    id: '10',
    title: 'Misty Munnar Tea Estate Bungalow with Valley Views',
    description: 'Witness breathtaking mist-covered tea gardens from the warmth of your colonial bungalow in Munnar. Built amidst rolling green hills with special views that keep you comfortable while providing unobstructed vistas of the Western Ghats. Guided tea estate walks and elephant sanctuaries nearby.',
    propertyType: 'house',
    category: 'arctic',
    location: { address: 'Kolukkumalai Tea Estate', city: 'Munnar', state: 'Kerala', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80',
      'https://images.unsplash.com/photo-1520769945061-0a448c463865?w=800&q=80',
      'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=800&q=80',
      'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&q=80',
    ],
    guestCount: 2, bedroomCount: 1, bedCount: 1, bathroomCount: 1,
    price: 12500, cleaningFee: 1800, serviceFee: 1900,
    amenities: ['wifi', 'heating', 'breakfast', 'hotTub', 'mountainView', 'garden'],
    averageRating: 4.98, reviewCount: 156,
    owner: { id: 'u10', firstName: 'Leela', lastName: 'Thomas', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leela', isSuperhost: true, hostSince: '2015', responseRate: 100, responseTime: 'within an hour' },
    houseRules: { checkInTime: '14:00', checkOutTime: '12:00', petsAllowed: false, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'moderate', instantBook: true,
    taxRate: 0.12, hostHealthScore: 100, cancellationHistory: 0,
  },
  // ── 11. Varkala Cave Suite ────────────────────────────
  {
    id: '11',
    title: 'Cliffside Cave Suite with Arabian Sea Views in Varkala',
    description: 'A truly unique accommodation carved into the red laterite cliffs of Varkala. This cave suite features traditional Kerala architecture, a private terrace with a plunge pool overlooking the Arabian Sea, and breathtaking views of the famous Varkala cliff sunset.',
    propertyType: 'guesthouse',
    category: 'caves',
    location: { address: 'North Cliff, Varkala', city: 'Varkala', state: 'Kerala', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
      'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
      'https://images.unsplash.com/photo-1601066913291-d05d898d20e2?w=800&q=80',
      'https://images.unsplash.com/photo-1549314386-3d46b36c43c1?w=800&q=80',
    ],
    guestCount: 2, bedroomCount: 1, bedCount: 1, bathroomCount: 1,
    price: 11500, cleaningFee: 1600, serviceFee: 1700,
    amenities: ['wifi', 'pool', 'ac', 'heating', 'breakfast', 'oceanView', 'balcony'],
    averageRating: 4.97, reviewCount: 203,
    owner: { id: 'u11', firstName: 'Anish', lastName: 'Kumar', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anish', isSuperhost: true, hostSince: '2014', responseRate: 99, responseTime: 'within an hour' },
    houseRules: { checkInTime: '15:00', checkOutTime: '11:00', petsAllowed: false, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'strict', instantBook: false,
    taxRate: 0.12, hostHealthScore: 99, cancellationHistory: 0,
  },
  // ── 12. Wayanad Treehouse ─────────────────────────────
  {
    id: '12',
    title: 'Rustic Treehouse Glamping in Wayanad Rainforest',
    description: 'Perched high among ancient rainforest trees in Wayanad, this architectural treehouse offers an immersive jungle experience with all the comforts of a luxury stay. Wildlife viewing from the deck, guided forest walks, and bioluminescent river tours available.',
    propertyType: 'treehouse',
    category: 'camping',
    location: { address: 'Vythiri Forest Reserve', city: 'Wayanad', state: 'Kerala', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1488462237308-ecaa28b729d7?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      'https://images.unsplash.com/photo-1518602164578-cd0074062767?w=800&q=80',
    ],
    guestCount: 4, bedroomCount: 2, bedCount: 2, bathroomCount: 1,
    price: 9800, cleaningFee: 1600, serviceFee: 1450,
    amenities: ['wifi', 'kitchen', 'ac', 'heating', 'breakfast', 'balcony', 'garden', 'petsAllowed'],
    averageRating: 4.91, reviewCount: 77,
    owner: { id: 'u12', firstName: 'Divya', lastName: 'Krishnan', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Divya', isSuperhost: true, hostSince: '2018', responseRate: 96, responseTime: 'within a few hours' },
    houseRules: { checkInTime: '15:00', checkOutTime: '11:00', petsAllowed: true, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'flexible', instantBook: true,
    taxRate: 0.12, hostHealthScore: 93, cancellationHistory: 0,
  },

  // ═══════════════════════════════════════════════════════
  // ──────────────── PREVIOUS 8 LISTINGS ────────────────
  // ═══════════════════════════════════════════════════════

  // ── 13. Rishikesh Yoga Retreat (Remote Work) ──────────
  {
    id: '13',
    title: 'Riverside Yoga Retreat & Co-Working Space in Rishikesh',
    description: 'A stunning riverside property where productivity meets peace. This architect-designed retreat sits on the banks of the Ganges with a dedicated co-working space, high-speed fiber internet (200 Mbps tested monthly), ergonomic workstations, and a yoga studio. Morning meditation sessions and evening aarti ceremonies included. Perfect for digital nomads seeking the ultimate workation.',
    propertyType: 'house',
    category: 'remote-work',
    location: { address: 'Laxman Jhula Road', city: 'Rishikesh', state: 'Uttarakhand', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    ],
    guestCount: 6, bedroomCount: 3, bedCount: 4, bathroomCount: 2,
    price: 7500, cleaningFee: 1200, serviceFee: 1100,
    amenities: ['wifi', 'kitchen', 'workspace', 'parking', 'ac', 'washer', 'mountainView', 'balcony', 'garden', 'breakfast'],
    averageRating: 4.94, reviewCount: 89,
    owner: { id: 'u13', firstName: 'Swami', lastName: 'Prakash', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Swami', isSuperhost: true, hostSince: '2018', responseRate: 99, responseTime: 'within an hour' },
    houseRules: { checkInTime: '14:00', checkOutTime: '11:00', petsAllowed: false, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'moderate', instantBook: true,
    taxRate: 0.12, hostHealthScore: 96, cancellationHistory: 0,
    remoteWorkReady: true, internetSpeedMbps: 200, hasDedicatedDesk: true, hasErgonomicChair: true, hasMultipleMonitors: true, quietHoursGuarantee: true,
    tenantModeAvailable: true, monthlyDiscount: 35, utilityIncluded: true,
    areaIntelligence: {
      walkabilityScore: 65,
      noiseLevel: { day: 'Temple bells & River sounds', night: 'Very Quiet' },
      nearbyHospital: { name: 'AIIMS Rishikesh', distance: '8 km' },
      nearbyPharmacy: { name: 'Rishikesh Pharma', distance: '1 km' },
      nearbyGrocery: { name: 'Ram Jhula Market', distance: '0.5 km' },
      safetyRating: 5,
      publicTransport: ['Auto-rickshaw — on call', 'Jolly Grant Airport — 35 km'],
      communityRatings: [
        { aspect: 'Yoga & Wellness', score: 5 },
        { aspect: 'Digital Nomad Community', score: 5 },
        { aspect: 'Spiritual Vibe', score: 5 },
        { aspect: 'Adventure Sports', score: 4 },
      ],
    },
    localExperiences: [
      { id: 'le8', title: 'Morning Yoga by the Ganges', description: 'Sunrise yoga session with a certified instructor', price: 800, duration: '1.5 hours', icon: '🧘', hostName: 'Swami' },
      { id: 'le9', title: 'White Water Rafting', description: 'Grade 3-4 rapids on the Ganges', price: 2500, duration: '3 hours', icon: '🚣', hostName: 'Swami' },
    ],
  },
  // ── 14. Darjeeling Colonial Estate ────────────────────
  {
    id: '14',
    title: 'Colonial Tea Estate Bungalow with Kanchenjunga Views',
    description: 'Wake up to views of the majestic Kanchenjunga from this lovingly restored 1890s colonial bungalow in Darjeeling. Set within a working tea estate, enjoy private tea tasting sessions, heritage walks, and the famous toy train ride. Original teak wood interiors, a library, and a grand fireplace create an atmosphere of timeless elegance.',
    propertyType: 'house',
    category: 'countryside',
    location: { address: 'Happy Valley Tea Estate', city: 'Darjeeling', state: 'West Bengal', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&q=80',
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80',
      'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80',
      'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&q=80',
    ],
    guestCount: 8, bedroomCount: 4, bedCount: 6, bathroomCount: 3,
    price: 15000, cleaningFee: 2500, serviceFee: 2200,
    amenities: ['wifi', 'kitchen', 'fireplace', 'parking', 'heating', 'garden', 'mountainView', 'breakfast'],
    averageRating: 4.93, reviewCount: 45,
    owner: { id: 'u14', firstName: 'Bharat', lastName: 'Pradhan', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bharat', isSuperhost: true, hostSince: '2016', responseRate: 97, responseTime: 'within a few hours' },
    houseRules: { checkInTime: '14:00', checkOutTime: '11:00', petsAllowed: true, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'moderate', instantBook: true,
    taxRate: 0.12, hostHealthScore: 95, cancellationHistory: 0,
  },
  // ── 15. Pondicherry French Quarter ────────────────────
  {
    id: '15',
    title: 'Chic French Quarter Studio with Rooftop Café in Pondicherry',
    description: 'Live like a local in the heart of Pondicherry\'s vibrant French Quarter. This beautifully restored Franco-Tamil studio features original vintage tiles, a private rooftop café with Bay of Bengal views, and a curated library. Steps away from Promenade Beach, Auroville, and the best cafés in town. High-speed WiFi and a designer workspace make this ideal for creative professionals.',
    propertyType: 'apartment',
    category: 'trending',
    location: { address: '33 Rue Suffren, White Town', city: 'Pondicherry', state: 'Puducherry', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    ],
    guestCount: 2, bedroomCount: 1, bedCount: 1, bathroomCount: 1,
    price: 5500, cleaningFee: 800, serviceFee: 800,
    amenities: ['wifi', 'kitchen', 'ac', 'workspace', 'oceanView', 'balcony', 'breakfast'],
    averageRating: 4.96, reviewCount: 134,
    owner: { id: 'u15', firstName: 'Claire', lastName: 'Dubois', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Claire', isSuperhost: true, hostSince: '2017', responseRate: 100, responseTime: 'within an hour' },
    houseRules: { checkInTime: '14:00', checkOutTime: '11:00', petsAllowed: false, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'flexible', instantBook: true,
    taxRate: 0.12, hostHealthScore: 100, cancellationHistory: 0,
    remoteWorkReady: true, internetSpeedMbps: 100, hasDedicatedDesk: true, hasErgonomicChair: false, hasMultipleMonitors: false, quietHoursGuarantee: true,
    tenantModeAvailable: true, monthlyDiscount: 40, utilityIncluded: true,
  },
  // ── 16. Shimla Heritage Mansion ───────────────────────
  {
    id: '16',
    title: 'Grand Shimla Heritage Mansion with Snow Views',
    description: 'Step back in time in this magnificent British-era mansion perched on Shimla Ridge. Featuring 12-foot ceilings, original stained-glass windows, a billiards room, and a sprawling garden with panoramic snow-capped mountain views. The grand fireplace, vintage furniture, and curated art collection create an unforgettable atmosphere.',
    propertyType: 'house',
    category: 'skiing',
    location: { address: 'The Ridge, Mall Road', city: 'Shimla', state: 'Himachal Pradesh', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
      'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    ],
    guestCount: 12, bedroomCount: 6, bedCount: 8, bathroomCount: 4,
    price: 22000, cleaningFee: 3500, serviceFee: 3300,
    amenities: ['wifi', 'kitchen', 'fireplace', 'parking', 'heating', 'garden', 'mountainView', 'balcony', 'washer'],
    averageRating: 4.87, reviewCount: 38,
    owner: { id: 'u16', firstName: 'Vikrant', lastName: 'Thakur', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikrant', isSuperhost: false, hostSince: '2021', responseRate: 93, responseTime: 'within a few hours' },
    houseRules: { checkInTime: '15:00', checkOutTime: '11:00', petsAllowed: false, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'strict', instantBook: false,
    taxRate: 0.18, hostHealthScore: 82, cancellationHistory: 1,
  },
  // ── 17. Coorg Coffee Plantation ───────────────────────
  {
    id: '17',
    title: 'Private Coffee Plantation Estate in Coorg',
    description: 'Immerse yourself in the intoxicating aroma of coffee on this 50-acre estate in the misty hills of Coorg. The plantation bungalow features a private infinity pool overlooking endless coffee and pepper plantations, naturalist-guided walks, coffee roasting workshops, and farm-to-table dining. One of India\'s most romantic getaways.',
    propertyType: 'villa',
    category: 'pools',
    location: { address: 'Madikeri Coffee Estate', city: 'Coorg', state: 'Karnataka', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63329026?w=800&q=80',
      'https://images.unsplash.com/photo-1488462237308-ecaa28b729d7?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    ],
    guestCount: 6, bedroomCount: 3, bedCount: 4, bathroomCount: 3,
    price: 19500, cleaningFee: 2800, serviceFee: 2900,
    amenities: ['wifi', 'pool', 'kitchen', 'parking', 'ac', 'garden', 'mountainView', 'balcony', 'bbqGrill', 'breakfast'],
    averageRating: 4.94, reviewCount: 67,
    owner: { id: 'u17', firstName: 'Kavya', lastName: 'Shetty', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya', isSuperhost: true, hostSince: '2019', responseRate: 98, responseTime: 'within an hour' },
    houseRules: { checkInTime: '14:00', checkOutTime: '12:00', petsAllowed: true, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'moderate', instantBook: true,
    taxRate: 0.12, hostHealthScore: 96, cancellationHistory: 0,
    localExperiences: [
      { id: 'le10', title: 'Coffee Roasting Workshop', description: 'Learn to roast, grind, and brew Coorg coffee', price: 1500, duration: '2 hours', icon: '☕', hostName: 'Kavya' },
    ],
  },
  // ── 18. Leh-Ladakh Mountain Lodge ─────────────────────
  {
    id: '18',
    title: 'Himalayan Mountain Lodge with Stargazing Deck in Leh',
    description: 'At 11,500 feet, this contemporary mountain lodge in Leh offers an otherworldly experience. The transparent stargazing dome on the rooftop provides unparalleled views of the Milky Way. During the day, explore Pangong Lake, Nubra Valley, and ancient monasteries. Heated floors, traditional Ladakhi cuisine, and oxygen-enriched rooms ensure comfort at altitude.',
    propertyType: 'cabin',
    category: 'arctic',
    location: { address: 'Changspa Road', city: 'Leh', state: 'Ladakh', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80',
      'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&q=80',
    ],
    guestCount: 4, bedroomCount: 2, bedCount: 3, bathroomCount: 2,
    price: 11000, cleaningFee: 1800, serviceFee: 1600,
    amenities: ['wifi', 'kitchen', 'heating', 'parking', 'mountainView', 'breakfast', 'garden'],
    averageRating: 4.92, reviewCount: 54,
    owner: { id: 'u18', firstName: 'Tenzin', lastName: 'Norbu', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tenzin', isSuperhost: true, hostSince: '2017', responseRate: 96, responseTime: 'within a few hours' },
    houseRules: { checkInTime: '14:00', checkOutTime: '11:00', petsAllowed: false, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'moderate', instantBook: true,
    taxRate: 0.05, hostHealthScore: 94, cancellationHistory: 0,
  },
  // ── 19. Ooty Colonial Bungalow ────────────────────────
  {
    id: '19',
    title: 'Heritage Colonial Bungalow amidst Ooty Tea Gardens',
    description: 'A magnificent 1880s colonial bungalow set within 20 acres of Ooty\'s finest tea gardens. Features original Burma teak interiors, a grand piano in the drawing room, manicured English gardens, and a private chef specializing in Anglo-Indian cuisine. The wrap-around veranda offers stunning views of the Nilgiri Mountains. Perfect for a luxurious hill station retreat.',
    propertyType: 'house',
    category: 'luxury',
    location: { address: 'Fernhill Estate', city: 'Ooty', state: 'Tamil Nadu', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
      'https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d?w=800&q=80',
    ],
    guestCount: 10, bedroomCount: 5, bedCount: 7, bathroomCount: 4,
    price: 35000, cleaningFee: 4500, serviceFee: 5200,
    amenities: ['wifi', 'kitchen', 'fireplace', 'parking', 'heating', 'garden', 'mountainView', 'balcony', 'washer', 'dryer', 'bbqGrill', 'breakfast'],
    averageRating: 4.96, reviewCount: 31,
    owner: { id: 'u19', firstName: 'Reginald', lastName: 'Oakes', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Reginald', isSuperhost: true, hostSince: '2015', responseRate: 100, responseTime: 'within an hour' },
    houseRules: { checkInTime: '14:00', checkOutTime: '12:00', petsAllowed: true, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'strict', instantBook: false,
    taxRate: 0.18, hostHealthScore: 100, cancellationHistory: 0,
  },
  // ── 20. Udaipur Lake Palace ───────────────────────────
  {
    id: '20',
    title: 'Royal Lake Palace Suite with Lake Pichola Views in Udaipur',
    description: 'Live like royalty in this exquisite suite overlooking the shimmering Lake Pichola. This converted haveli features marble interiors, hand-painted frescoes, a private rooftop dining area, and a heritage spa. Watch the sunset paint the City Palace in gold from your private jharokha window. Cultural performances and royal Rajasthani thali dinners arranged on request.',
    propertyType: 'house',
    category: 'castles',
    location: { address: 'Gangaur Ghat, Old City', city: 'Udaipur', state: 'Rajasthan', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1584132905271-512c958d674a?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1570122828-c93b95e6c17d?w=800&q=80',
      'https://images.unsplash.com/photo-1599598425947-5202edd56fdb?w=800&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    ],
    guestCount: 4, bedroomCount: 2, bedCount: 2, bathroomCount: 2,
    price: 28000, cleaningFee: 3500, serviceFee: 4200,
    amenities: ['wifi', 'kitchen', 'ac', 'parking', 'lakeView', 'balcony', 'garden', 'pool', 'breakfast'],
    averageRating: 4.98, reviewCount: 41,
    owner: { id: 'u20', firstName: 'Padmini', lastName: 'Devi', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Padmini', isSuperhost: true, hostSince: '2018', responseRate: 99, responseTime: 'within an hour' },
    houseRules: { checkInTime: '14:00', checkOutTime: '12:00', petsAllowed: false, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'strict', instantBook: false,
    taxRate: 0.18, hostHealthScore: 98, cancellationHistory: 0,
  },

  // ═══════════════════════════════════════════════════════
  // ──────────────── 10 NEW LISTINGS ────────────────────
  // ═══════════════════════════════════════════════════════

  // ── 21. Hampi Heritage Cottage ────────────────────────
  {
    id: '21',
    title: 'Boulder-top Heritage Cottage in Ancient Hampi',
    description: 'Perched atop the iconic granite boulders of Hampi, this heritage cottage offers 360° views of the UNESCO World Heritage site. Watch sunrise over the Virupaksha Temple from your private terrace. Original stone construction with modern amenities. Bicycle provided for exploring the ruins. The host is a certified archaeologist who leads private heritage walks.',
    propertyType: 'cottage',
    category: 'heritage',
    location: { address: 'Hippie Island Road', city: 'Hampi', state: 'Karnataka', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1570122828-c93b95e6c17d?w=800&q=80',
      'https://images.unsplash.com/photo-1599598425947-5202edd56fdb?w=800&q=80',
      'https://images.unsplash.com/photo-1584132905271-512c958d674a?w=800&q=80',
    ],
    guestCount: 4, bedroomCount: 2, bedCount: 2, bathroomCount: 1,
    price: 4500, cleaningFee: 600, serviceFee: 650,
    amenities: ['wifi', 'breakfast', 'mountainView', 'balcony', 'garden', 'parking'],
    averageRating: 4.93, reviewCount: 112,
    owner: { id: 'u21', firstName: 'Girish', lastName: 'Rao', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Girish', isSuperhost: true, hostSince: '2016', responseRate: 98, responseTime: 'within an hour' },
    houseRules: { checkInTime: '14:00', checkOutTime: '11:00', petsAllowed: false, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'flexible', instantBook: true,
    taxRate: 0.12, hostHealthScore: 96, cancellationHistory: 0,
    tenantModeAvailable: true, monthlyDiscount: 45, utilityIncluded: true,
    areaIntelligence: {
      walkabilityScore: 80,
      noiseLevel: { day: 'Temple bells', night: 'Silent' },
      nearbyHospital: { name: 'Hospet District Hospital', distance: '13 km' },
      nearbyPharmacy: { name: 'Hampi Pharmacy', distance: '2 km' },
      nearbyGrocery: { name: 'Hampi Bazaar', distance: '1 km' },
      safetyRating: 5,
      publicTransport: ['Auto to Hospet — 13 km', 'Hubli Airport — 140 km'],
      communityRatings: [
        { aspect: 'Heritage & History', score: 5 },
        { aspect: 'Photography', score: 5 },
        { aspect: 'Budget Friendly', score: 5 },
        { aspect: 'Cycling', score: 5 },
      ],
    },
    localExperiences: [
      { id: 'le11', title: 'Private Heritage Walk', description: 'Archaeologist-led tour of Hampi\'s hidden ruins', price: 2000, duration: '4 hours', icon: '🏛️', hostName: 'Girish' },
      { id: 'le12', title: 'Sunrise Coracle Ride', description: 'Traditional coracle boat on Tungabhadra River', price: 500, duration: '1 hour', icon: '🛶', hostName: 'Girish' },
    ],
  },
  // ── 22. Shillong Bamboo Lodge ─────────────────────────
  {
    id: '22',
    title: 'Eco Bamboo Lodge in Meghalaya Living Root Bridges',
    description: 'An award-winning eco-resort built entirely from locally-sourced bamboo near the famous living root bridges of Meghalaya. Wake to birdsong and mist rolling through sacred forests. Solar-powered, rainwater-harvested, and zero waste. Guided treks to the double-decker root bridge and crystal-clear natural pools. A masterclass in sustainable luxury.',
    propertyType: 'guesthouse',
    category: 'camping',
    location: { address: 'Nongriat Trek Base', city: 'Shillong', state: 'Meghalaya', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1488462237308-ecaa28b729d7?w=800&q=80',
      'https://images.unsplash.com/photo-1518602164578-cd0074062767?w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&q=80',
    ],
    guestCount: 6, bedroomCount: 3, bedCount: 4, bathroomCount: 2,
    price: 5800, cleaningFee: 800, serviceFee: 850,
    amenities: ['wifi', 'breakfast', 'mountainView', 'garden', 'balcony', 'heating'],
    averageRating: 4.95, reviewCount: 67,
    owner: { id: 'u22', firstName: 'Bah', lastName: 'Kynmaw', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BahK', isSuperhost: true, hostSince: '2019', responseRate: 97, responseTime: 'within a few hours' },
    houseRules: { checkInTime: '14:00', checkOutTime: '10:00', petsAllowed: false, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'moderate', instantBook: true,
    taxRate: 0.05, hostHealthScore: 97, cancellationHistory: 0,
    areaIntelligence: {
      walkabilityScore: 55,
      noiseLevel: { day: 'Birdsong & waterfalls', night: 'Forest sounds' },
      nearbyHospital: { name: 'Cherrapunjee CHC', distance: '12 km' },
      nearbyPharmacy: { name: 'Local Clinic', distance: '5 km' },
      nearbyGrocery: { name: 'Village Market', distance: '3 km' },
      safetyRating: 5,
      publicTransport: ['Shared taxi to Shillong — 80 km', 'Shillong Airport — 90 km'],
      communityRatings: [
        { aspect: 'Nature Immersion', score: 5 },
        { aspect: 'Trekking', score: 5 },
        { aspect: 'Eco Experience', score: 5 },
        { aspect: 'Cultural Exchange', score: 5 },
      ],
    },
  },
  // ── 23. Alleppey Luxury Houseboat ─────────────────────
  {
    id: '23',
    title: 'Premium Kerala Houseboat with Private Chef on Backwaters',
    description: 'Drift through the enchanting Alleppey backwaters on this luxury houseboat (Kettuvallam). Features an air-conditioned bedroom, sundeck with loungers, and a private chef preparing fresh-caught seafood and traditional Kerala meals. Watch paddy fields, coconut groves, and village life drift past. Includes kayak and fishing gear.',
    propertyType: 'cottage',
    category: 'houseboat',
    location: { address: 'Alleppey Backwater Dock', city: 'Alleppey', state: 'Kerala', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80',
      'https://images.unsplash.com/photo-1467226632440-65f0b4957563?w=800&q=80',
      'https://images.unsplash.com/photo-1573843981267-be1480125de9?w=800&q=80',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80',
    ],
    guestCount: 4, bedroomCount: 2, bedCount: 2, bathroomCount: 2,
    price: 18000, cleaningFee: 2500, serviceFee: 2700,
    amenities: ['wifi', 'ac', 'breakfast', 'waterfront', 'lakeView', 'balcony', 'kitchen'],
    averageRating: 4.97, reviewCount: 89,
    owner: { id: 'u23', firstName: 'Joseph', lastName: 'Kurian', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joseph', isSuperhost: true, hostSince: '2017', responseRate: 100, responseTime: 'within an hour' },
    houseRules: { checkInTime: '12:00', checkOutTime: '10:00', petsAllowed: false, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'moderate', instantBook: true,
    taxRate: 0.12, hostHealthScore: 99, cancellationHistory: 0,
    localExperiences: [
      { id: 'le13', title: 'Toddy Tapping Tour', description: 'Learn the traditional art of toddy tapping with locals', price: 800, duration: '2 hours', icon: '🌴', hostName: 'Joseph' },
      { id: 'le14', title: 'Kerala Fish Curry Cookoff', description: 'Catch your own fish and cook authentic meen curry', price: 2000, duration: '3 hours', icon: '🐟', hostName: 'Joseph' },
    ],
  },
  // ── 24. Gokarna Cliff Cottage ─────────────────────────
  {
    id: '24',
    title: 'Secret Beach Cliff Cottage in Gokarna',
    description: 'Hidden away on the cliffs between Half Moon and Paradise beaches in Gokarna, this bohemian cottage is the ultimate anti-Goa beach escape. Hammocks, sea views, beach bonfires, and complete digital detox. A secret path leads to a private cove. Solar-powered with outdoor showers. For the true free spirit.',
    propertyType: 'cottage',
    category: 'beach',
    location: { address: 'Between Half Moon & Paradise Beach', city: 'Gokarna', state: 'Karnataka', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
      'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=800&q=80',
      'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
    ],
    guestCount: 2, bedroomCount: 1, bedCount: 1, bathroomCount: 1,
    price: 3200, cleaningFee: 400, serviceFee: 470,
    amenities: ['breakfast', 'oceanView', 'balcony', 'beachfront'],
    averageRating: 4.91, reviewCount: 156,
    owner: { id: 'u24', firstName: 'Sunita', lastName: 'Hegde', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita', isSuperhost: true, hostSince: '2018', responseRate: 95, responseTime: 'within a few hours' },
    houseRules: { checkInTime: '14:00', checkOutTime: '11:00', petsAllowed: true, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'flexible', instantBook: true,
    taxRate: 0.12, hostHealthScore: 92, cancellationHistory: 0,
    tenantModeAvailable: true, monthlyDiscount: 50, utilityIncluded: true,
    areaIntelligence: {
      walkabilityScore: 40,
      noiseLevel: { day: 'Waves only', night: 'Ocean sounds' },
      nearbyHospital: { name: 'Gokarna PHC', distance: '5 km' },
      nearbyPharmacy: { name: 'Town Pharmacy', distance: '4 km' },
      nearbyGrocery: { name: 'Beach shack', distance: '1 km walk' },
      safetyRating: 4,
      publicTransport: ['Auto to town — 4 km', 'Goa Airport — 140 km'],
      communityRatings: [
        { aspect: 'Beach Quality', score: 5 },
        { aspect: 'Budget Value', score: 5 },
        { aspect: 'Solitude', score: 5 },
        { aspect: 'Backpacker Vibe', score: 5 },
      ],
    },
  },
  // ── 25. Bangalore Tech Hub Studio ─────────────────────
  {
    id: '25',
    title: 'Ultra-Fast 500 Mbps Tech Hub Studio in Koramangala',
    description: 'The ultimate digital nomad hub in India\'s Silicon Valley. This minimalist studio features a Herman Miller Aeron chair, dual 4K monitors, standing desk, ring light for video calls, podcast recording corner, and 500 Mbps symmetric fiber internet. Rooftop terrace with city views. Walking distance to 50+ cafés and co-working spaces. Smart home with Alexa integration.',
    propertyType: 'apartment',
    category: 'remote-work',
    location: { address: 'Koramangala 5th Block', city: 'Bangalore', state: 'Karnataka', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
    ],
    guestCount: 2, bedroomCount: 1, bedCount: 1, bathroomCount: 1,
    price: 6500, cleaningFee: 1000, serviceFee: 950,
    amenities: ['wifi', 'kitchen', 'ac', 'workspace', 'cityView', 'balcony', 'gym', 'elevator', 'washer'],
    averageRating: 4.88, reviewCount: 203,
    owner: { id: 'u25', firstName: 'Nikhil', lastName: 'Desai', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nikhil', isSuperhost: true, hostSince: '2020', responseRate: 99, responseTime: 'within an hour' },
    houseRules: { checkInTime: '14:00', checkOutTime: '11:00', petsAllowed: false, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'flexible', instantBook: true,
    taxRate: 0.18, hostHealthScore: 94, cancellationHistory: 0,
    remoteWorkReady: true, internetSpeedMbps: 500, hasDedicatedDesk: true, hasErgonomicChair: true, hasMultipleMonitors: true, quietHoursGuarantee: true,
    tenantModeAvailable: true, monthlyDiscount: 30, utilityIncluded: true,
    areaIntelligence: {
      walkabilityScore: 90,
      noiseLevel: { day: 'Urban moderate', night: 'Quiet residential' },
      nearbyHospital: { name: 'Fortis Hospital', distance: '2 km' },
      nearbyPharmacy: { name: 'Apollo Pharmacy', distance: '100m' },
      nearbyGrocery: { name: 'BigBasket Express', distance: '300m' },
      safetyRating: 5,
      publicTransport: ['Metro — 500m', 'Bangalore Airport — 45 min', 'BMTC bus — 200m'],
      communityRatings: [
        { aspect: 'Startup Ecosystem', score: 5 },
        { aspect: 'Café Culture', score: 5 },
        { aspect: 'Nightlife', score: 4 },
        { aspect: 'Green Spaces', score: 3 },
      ],
    },
  },
  // ── 26. Auli Ski Lodge ────────────────────────────────
  {
    id: '26',
    title: 'Ski-in/Ski-out Alpine Lodge in Auli with Nanda Devi Views',
    description: 'India\'s premier skiing destination at your doorstep. This Nordic-inspired lodge sits right on the Auli ski slope with direct ski-in/ski-out access. Features a stone fireplace, hot chocolate station, boot warmer room, and panoramic views of the Nanda Devi and other Himalayan peaks. Ski equipment rental and instructor included.',
    propertyType: 'cabin',
    category: 'skiing',
    location: { address: 'Near Auli Ropeway Station', city: 'Auli', state: 'Uttarakhand', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80',
    ],
    guestCount: 8, bedroomCount: 4, bedCount: 6, bathroomCount: 3,
    price: 16500, cleaningFee: 2500, serviceFee: 2400,
    amenities: ['wifi', 'kitchen', 'fireplace', 'heating', 'parking', 'mountainView', 'balcony', 'skiInOut', 'breakfast', 'hotTub'],
    averageRating: 4.94, reviewCount: 34,
    owner: { id: 'u26', firstName: 'Rajendra', lastName: 'Rawat', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajendra', isSuperhost: true, hostSince: '2018', responseRate: 97, responseTime: 'within a few hours' },
    houseRules: { checkInTime: '15:00', checkOutTime: '11:00', petsAllowed: false, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'moderate', instantBook: true,
    taxRate: 0.12, hostHealthScore: 95, cancellationHistory: 0,
    areaIntelligence: {
      walkabilityScore: 30,
      noiseLevel: { day: 'Wind and snow', night: 'Mountain silence' },
      nearbyHospital: { name: 'Joshimath Hospital', distance: '16 km' },
      nearbyPharmacy: { name: 'Joshimath Pharmacy', distance: '14 km' },
      nearbyGrocery: { name: 'Auli Resort Shop', distance: '1 km' },
      safetyRating: 4,
      publicTransport: ['Cable car — on-site', 'Jolly Grant Airport — 270 km'],
      communityRatings: [
        { aspect: 'Skiing', score: 5 },
        { aspect: 'Mountain Views', score: 5 },
        { aspect: 'Winter Sports', score: 5 },
        { aspect: 'Adventure', score: 5 },
      ],
    },
    localExperiences: [
      { id: 'le15', title: 'Ski Lesson Package', description: '3-day beginner to intermediate ski course', price: 8000, duration: '3 days', icon: '⛷️', hostName: 'Rajendra' },
    ],
  },
  // ── 27. Rann of Kutch ─────────────────────────────────
  {
    id: '27',
    title: 'White Desert Luxury Tent at Rann of Kutch',
    description: 'Witness the surreal beauty of the world\'s largest salt desert — the Great Rann of Kutch. This luxury tent features hand-embroidered Kutchi textiles, a stargazing deck, and front-row seats to the famous Rann Utsav. Full-moon nights transform the white salt flats into a silver landscape. Traditional Kutchi dinner with folk performances included.',
    propertyType: 'camper',
    category: 'desert',
    location: { address: 'Dhordo Village', city: 'Kutch', state: 'Gujarat', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80',
      'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=80',
      'https://images.unsplash.com/photo-1548813831-8d6f61e84f18?w=800&q=80',
      'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=800&q=80',
    ],
    guestCount: 4, bedroomCount: 2, bedCount: 2, bathroomCount: 2,
    price: 12000, cleaningFee: 1800, serviceFee: 1750,
    amenities: ['wifi', 'breakfast', 'ac', 'parking', 'garden'],
    averageRating: 4.96, reviewCount: 78,
    owner: { id: 'u27', firstName: 'Dhruvika', lastName: 'Patel', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruvika', isSuperhost: true, hostSince: '2019', responseRate: 98, responseTime: 'within an hour' },
    houseRules: { checkInTime: '15:00', checkOutTime: '10:00', petsAllowed: false, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'moderate', instantBook: true,
    taxRate: 0.12, hostHealthScore: 97, cancellationHistory: 0,
    localExperiences: [
      { id: 'le16', title: 'Kutchi Craft Workshop', description: 'Learn Rogan art & mirror embroidery from artisans', price: 1500, duration: '3 hours', icon: '🎨', hostName: 'Dhruvika' },
      { id: 'le17', title: 'Full Moon Salt Flat Walk', description: 'Guided night walk on the silver-lit white desert', price: 1000, duration: '2 hours', icon: '🌕', hostName: 'Dhruvika' },
    ],
  },
  // ── 28. Kasol Mountain Cabin ──────────────────────────
  {
    id: '28',
    title: 'Parvati Valley Wooden Cabin with River Views in Kasol',
    description: 'A cozy A-frame wooden cabin overlooking the Parvati River in the heart of Kasol. The perfect base for treks to Kheerganga, Malana, and Tosh. Features a loft bedroom, reading nook, bonfire pit, and a hammock garden. The host is a certified mountain guide who organizes treks and stargazing tours. Ideal for the "Rent Before You Relocate" experience.',
    propertyType: 'cabin',
    category: 'backpacking',
    location: { address: 'Riverside, Main Kasol', city: 'Kasol', state: 'Himachal Pradesh', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
      'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80',
      'https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=800&q=80',
    ],
    guestCount: 4, bedroomCount: 2, bedCount: 3, bathroomCount: 1,
    price: 3800, cleaningFee: 500, serviceFee: 550,
    amenities: ['wifi', 'kitchen', 'heating', 'fireplace', 'mountainView', 'balcony', 'garden', 'petsAllowed'],
    averageRating: 4.92, reviewCount: 234,
    owner: { id: 'u28', firstName: 'Himanshu', lastName: 'Thakur', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Himanshu', isSuperhost: true, hostSince: '2017', responseRate: 96, responseTime: 'within a few hours' },
    houseRules: { checkInTime: '14:00', checkOutTime: '11:00', petsAllowed: true, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'flexible', instantBook: true,
    taxRate: 0.05, hostHealthScore: 94, cancellationHistory: 0,
    tenantModeAvailable: true, monthlyDiscount: 50, utilityIncluded: true,
    areaIntelligence: {
      walkabilityScore: 60,
      noiseLevel: { day: 'River sounds', night: 'Very quiet' },
      nearbyHospital: { name: 'Bhuntar Hospital', distance: '30 km' },
      nearbyPharmacy: { name: 'Kasol Medical Store', distance: '0.5 km' },
      nearbyGrocery: { name: 'Kasol Market', distance: '0.3 km' },
      safetyRating: 4,
      publicTransport: ['Bus to Bhuntar — 30 km', 'Bhuntar Airport — 31 km'],
      communityRatings: [
        { aspect: 'Backpacker Scene', score: 5 },
        { aspect: 'Trekking Access', score: 5 },
        { aspect: 'Café Culture', score: 5 },
        { aspect: 'Relocation Vibes', score: 5 },
      ],
    },
    localExperiences: [
      { id: 'le18', title: 'Kheerganga Hot Springs Trek', description: '2-day guided trek to natural hot springs at 13,000 ft', price: 3000, duration: '2 days', icon: '🥾', hostName: 'Himanshu' },
      { id: 'le19', title: 'Relocation Neighborhood Tour', description: 'Meet locals, visit schools, understand the community', price: 1000, duration: '3 hours', icon: '🏘️', hostName: 'Himanshu' },
    ],
  },
  // ── 29. Chennai Marina Penthouse ──────────────────────
  {
    id: '29',
    title: 'Marina Beach Penthouse with Rooftop Infinity Pool in Chennai',
    description: 'A stunning contemporary penthouse overlooking Asia\'s longest beach — Marina Beach. Features a rooftop infinity pool, Italian marble interiors, a fully equipped gym, and a home theater. The smart home system controls everything from lighting to music. Private rooftop BBQ area with Bay of Bengal sunset views. Walking distance to Mylapore temples and silk saree shopping.',
    propertyType: 'apartment',
    category: 'modern',
    location: { address: 'Raja Annamalai Road, Mylapore', city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    ],
    guestCount: 6, bedroomCount: 3, bedCount: 3, bathroomCount: 3,
    price: 22000, cleaningFee: 3500, serviceFee: 3300,
    amenities: ['wifi', 'pool', 'kitchen', 'gym', 'ac', 'elevator', 'washer', 'dryer', 'workspace', 'oceanView', 'balcony', 'bbqGrill'],
    averageRating: 4.90, reviewCount: 56,
    owner: { id: 'u29', firstName: 'Lakshmi', lastName: 'Iyer', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lakshmi', isSuperhost: true, hostSince: '2020', responseRate: 99, responseTime: 'within an hour' },
    houseRules: { checkInTime: '14:00', checkOutTime: '12:00', petsAllowed: false, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'moderate', instantBook: true,
    taxRate: 0.18, hostHealthScore: 96, cancellationHistory: 0,
    remoteWorkReady: true, internetSpeedMbps: 200, hasDedicatedDesk: true, hasErgonomicChair: true, hasMultipleMonitors: false, quietHoursGuarantee: true,
    tenantModeAvailable: true, monthlyDiscount: 20, utilityIncluded: true,
    areaIntelligence: {
      walkabilityScore: 78,
      noiseLevel: { day: 'Moderate urban', night: 'Quiet residential' },
      nearbyHospital: { name: 'Apollo Hospital', distance: '3 km' },
      nearbyPharmacy: { name: 'MedPlus', distance: '200m' },
      nearbyGrocery: { name: 'Spencer\'s Daily', distance: '400m' },
      safetyRating: 4,
      publicTransport: ['Metro — 1 km', 'Chennai Airport — 25 min', 'Local bus — 200m'],
      communityRatings: [
        { aspect: 'Culture & Temples', score: 5 },
        { aspect: 'Food Scene', score: 5 },
        { aspect: 'Beach Access', score: 5 },
        { aspect: 'IT Hub Access', score: 4 },
      ],
    },
  },
  // ── 30. Mussoorie Cloud Manor ─────────────────────────
  {
    id: '30',
    title: 'Cloud Manor — Heritage Estate with Doon Valley Panorama',
    description: 'A magnificent 1890s colonial estate perched on the edge of Mussoorie with sweeping views of the Doon Valley and snow-capped Himalayas. Features a Victorian library, grand piano, terraced gardens, croquet lawn, and an antique-laden drawing room. The manor has been lovingly restored with modern plumbing and heating while preserving its original character. Walk to Mall Road for shopping and the famous Mussoorie cafés.',
    propertyType: 'house',
    category: 'countryside',
    location: { address: 'Library Road, Landour', city: 'Mussoorie', state: 'Uttarakhand', country: 'India' },
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&q=80',
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
      'https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d?w=800&q=80',
    ],
    guestCount: 10, bedroomCount: 5, bedCount: 7, bathroomCount: 4,
    price: 25000, cleaningFee: 3500, serviceFee: 3700,
    amenities: ['wifi', 'kitchen', 'fireplace', 'parking', 'heating', 'garden', 'mountainView', 'balcony', 'washer', 'dryer', 'breakfast'],
    averageRating: 4.95, reviewCount: 42,
    owner: { id: 'u30', firstName: 'Rustom', lastName: 'Cama', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rustom', isSuperhost: true, hostSince: '2016', responseRate: 100, responseTime: 'within an hour' },
    houseRules: { checkInTime: '14:00', checkOutTime: '12:00', petsAllowed: true, smokingAllowed: false, partiesAllowed: false },
    cancellationPolicy: 'strict', instantBook: false,
    taxRate: 0.18, hostHealthScore: 100, cancellationHistory: 0,
    areaIntelligence: {
      walkabilityScore: 65,
      noiseLevel: { day: 'Bird calls and breeze', night: 'Complete silence' },
      nearbyHospital: { name: 'Landour Community Hospital', distance: '2 km' },
      nearbyPharmacy: { name: 'Mall Road Pharmacy', distance: '1.5 km' },
      nearbyGrocery: { name: 'Prakash Store', distance: '1 km' },
      safetyRating: 5,
      publicTransport: ['Shared taxi — on call', 'Jolly Grant Airport — 60 km'],
      communityRatings: [
        { aspect: 'Heritage Charm', score: 5 },
        { aspect: 'Mountain Views', score: 5 },
        { aspect: 'Literary History', score: 5 },
        { aspect: 'Walking Trails', score: 5 },
      ],
    },
    localExperiences: [
      { id: 'le20', title: 'Ruskin Bond\'s Mussoorie Walk', description: 'Literary walking tour covering Ruskin Bond\'s favorite haunts', price: 1500, duration: '3 hours', icon: '📚', hostName: 'Rustom' },
    ],
  },
];

export interface Reservation {
  id: string;
  listingId: string;
  listing: Listing;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: string;
}

export const AMENITY_LABELS: Record<string, { label: string; icon: string }> = {
  wifi: { label: 'Wifi', icon: '📶' },
  tv: { label: 'TV', icon: '📺' },
  kitchen: { label: 'Kitchen', icon: '🍳' },
  washer: { label: 'Washer', icon: '🫧' },
  dryer: { label: 'Dryer', icon: '🌀' },
  parking: { label: 'Free parking', icon: '🅿️' },
  ac: { label: 'Air conditioning', icon: '❄️' },
  heating: { label: 'Heating', icon: '🔥' },
  pool: { label: 'Pool', icon: '🏊' },
  hotTub: { label: 'Hot tub', icon: '🛁' },
  gym: { label: 'Gym', icon: '💪' },
  elevator: { label: 'Elevator', icon: '🛗' },
  fireplace: { label: 'Fireplace', icon: '🔥' },
  workspace: { label: 'Workspace', icon: '💻' },
  breakfast: { label: 'Breakfast', icon: '🥐' },
  smokeAlarm: { label: 'Smoke alarm', icon: '🚨' },
  firstAidKit: { label: 'First aid kit', icon: '🩺' },
  fireExtinguisher: { label: 'Fire extinguisher', icon: '🧯' },
  petsAllowed: { label: 'Pets allowed', icon: '🐾' },
  beachfront: { label: 'Beachfront', icon: '🏖️' },
  waterfront: { label: 'Waterfront', icon: '🌊' },
  skiInOut: { label: 'Ski-in/Ski-out', icon: '⛷️' },
  bbqGrill: { label: 'BBQ grill', icon: '🍖' },
  outdoorDining: { label: 'Outdoor dining', icon: '🍽️' },
  balcony: { label: 'Balcony', icon: '🌅' },
  garden: { label: 'Garden', icon: '🌿' },
  cityView: { label: 'City view', icon: '🏙️' },
  mountainView: { label: 'Mountain view', icon: '⛰️' },
  lakeView: { label: 'Lake view', icon: '🏞️' },
  oceanView: { label: 'Ocean view', icon: '🌊' },
};
