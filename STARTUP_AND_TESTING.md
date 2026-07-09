# STARTUP & TESTING GUIDE

## Part 1: BACKEND SETUP & VERIFICATION

### Step 1: Verify MongoDB Connection

```bash
cd backend
npm install
# Ensure .env has correct MONGODB_URI
cat .env | grep MONGODB

# Test connection
node test-db.js
# Expected output: "✅ Connected to MongoDB successfully"
```

### Step 2: Verify Backend Runs

```bash
npm start
# Expected output:
# 🚀 Server running in development mode on port 5000
# 📡 API Base URL: http://localhost:5000/api
# ❤️  Health Check: http://localhost:5000/health
```

### Step 3: Test Health Endpoint

```bash
curl http://localhost:5000/health
# Expected response:
# {
#   "success": true,
#   "message": "Home Rental API is running",
#   "environment": "development",
#   "timestamp": "2024-01-15T10:30:00.000Z"
# }
```

### Step 4: Verify API Routes

```bash
# List all registered routes
curl http://localhost:5000/api/listings

# Should return empty array (no listings yet)
# {
#   "success": true,
#   "data": {
#     "listings": [],
#     "pagination": { "currentPage": 1, "totalPages": 0 }
#   }
# }
```

### Step 5: Test Auth Flow (Manual)

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123"
  }'

# Expected response includes:
# "data": {
#   "user": { "_id": "...", "name": "Test User", "email": "..." },
#   "accessToken": "eyJhbGciOiJIUzI1NiIs..."
# }

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

---

## Part 2: FRONTEND SETUP & VERIFICATION

### Step 1: Install Dependencies

```bash
cd ..
npm install
```

### Step 2: Create .env File

```bash
# If .env doesn't exist
cp .env.example .env

# Verify it has:
# VITE_API_URL=http://localhost:5000/api
# VITE_BACKEND_URL=http://localhost:5000
```

### Step 3: Start Dev Server

```bash
npm run dev
# Expected output:
# ➜  Local:   http://localhost:5173/
# ➜  press h + enter to show help
```

### Step 4: Verify Frontend Loads

- Open <http://localhost:5173>
- Check browser console (F12) for errors
- Should show Airbnb clone UI

---

## Part 3: INTEGRATION TESTING

### Test 1: Automatic Listing Load

**Expected Behavior:** Page loads and fetches listings from API (currently will be empty)

**Steps:**

1. Open HomePage
2. Open DevTools Network tab
3. Look for `GET /listings`
4. Should see request to `http://localhost:5000/api/listings?limit=100&page=1`
5. Response should be `{ "success": true, "data": { "listings": [] } }`

**If Failed:**

- Check `src/store/useStore.ts` - loadListings method exists
- Check `src/services/api.ts` - getListings method exists
- Check browser console for errors
- Check backend logs for CORS issues

---

### Test 2: Authentication Flow

**Prerequisites:** Backend running, MongoDB connected

**Steps:**

1. Click "Sign in" button
2. Should open login modal (not implemented yet - fix in next step)
3. Enter email/password
4. Click "Sign in"
5. Should call `POST /api/auth/login`
6. User object should be stored in Zustand
7. Token should be in localStorage

**To Implement Login Button:**

```tsx
// src/components/common/AuthGate.tsx or LoginModal.tsx
import { api } from '../../services/api';
import { useStore } from '../../store/useStore';

const handleLogin = async (email, password) => {
  try {
    const response = await api.login(email, password);
    if (response.success) {
      const { user, accessToken } = response.data;
      useStore.getState().login(user, accessToken);
      useStore.getState().loadFavorites();
      useStore.getState().loadBookings();
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

---

### Test 3: Favorites Persistence

**Prerequisites:** User logged in

**Steps:**

1. Navigate to HomePage
2. Click heart icon on a listing
3. Check Network tab - should see `POST /wishlists/:id/listings/:listingId`
4. Open Favorites page
5. Listing should appear
6. Logout
7. Login again
8. Open Favorites page
9. Listing should still be there ✅

**Debug:**

- Check `toggleFavorite` in store called
- Check Wishlist API endpoint returns data
- Check MongoDB Wishlist collection has documents

---

### Test 4: Bookings Persistence

**Prerequisites:** User logged in, listing selected

**Steps:**

1. Click "Book" on a listing (not implemented yet)
2. Fill booking form
3. Click "Confirm Booking"
4. Should call `POST /api/bookings`
5. Go to Trips page
6. Booking should appear
7. Logout and login
8. Trips page should still have booking ✅

**To Implement:**

```tsx
// src/pages/ListingPage.tsx
const handleBooking = async (checkIn, checkOut, guests) => {
  const { createBooking } = useStore();
  const response = await api.createBooking(listingId, checkIn, checkOut, guests);
  if (response.success) {
    createBooking(response.data.booking);
  }
};
```

---

### Test 5: Rating/Data Consistency

**Prerequisites:** Listings in database with reviews

**Steps:**

1. Add sample listing and reviews to database:

```javascript
// MongoDB shell
use admin-airbnb-db
db.listings.insertOne({
  title: "Test Listing",
  description: "A test property",
  host: ObjectId("xxx"),
  location: { city: "Goa", country: "India", coordinates: { type: "Point", coordinates: [72.8, 15.5] } },
  pricePerNight: 5000,
  status: "active"
})

db.reviews.insertOne({
  listing: ObjectId("xxx"),
  reviewer: ObjectId("yyy"),
  host: ObjectId("xxx"),
  overallRating: 5,
  ratings: { cleanliness: 5, accuracy: 5, ... },
  comment: "Amazing property!"
})

// Run rating recalculation
db.listings.updateOne({ _id: ObjectId("xxx") }, { $set: { avgRating: 5 } })
```

1. Fetch listing from API:

```bash
curl http://localhost:5000/api/listings/xxx
```

1. Verify avgRating matches database (not mock data)

---

## Part 4: QUICK VERIFICATION CHECKLIST

### Backend

- [ ] MongoDB connected
- [ ] No console errors on startup
- [ ] Health check returns 200
- [ ] CORS enabled (frontend can call API)
- [ ] Auth registration creates user
- [ ] Auth login returns token
- [ ] Protected routes reject unsigned requests
- [ ] Wishlist created automatically on login

### Frontend  

- [ ] App loads without errors
- [ ] API URL configured in .env
- [ ] Zustand store initializes
- [ ] loadListings called on PageLoad
- [ ] Tokens stored in localStorage
- [ ] API calls include Bearer token
- [ ] Login/logout works
- [ ] Favorites sync with database
- [ ] Bookings sync with database

### Integration

- [ ] Write-Read Cycle: Add → Logout → Login → Verify Data Still There
- [ ] Concurrent Requests: Open 2 browser tabs, add favorite in one, verify in other
- [ ] Error Handling: Stop backend, try to load page, should gracefully degrade
- [ ] Performance: Listings load in <2 seconds

---

## Part 5: COMMON ISSUES & FIXES

### Issue: "CORS error" in browser console

**Cause:** Backend not allowing frontend origin
**Fix:**

```javascript
// backend/server.js
app.use(cors({
  origin: 'http://localhost:5173',  // Add frontend URL
  credentials: true,
}));
```

### Issue: "Cannot find module 'api'"

**Cause:** API service file not created
**Fix:**

```bash
# Ensure file exists at src/services/api.ts
ls -la src/services/api.ts
```

### Issue: Token not being sent to API

**Cause:** API client not using Bearer token
**Fix:** Check `src/services/api.ts` lines 35-45 - Bearer token must be added

### Issue: Favorites disappear after logout

**Cause:** useStore.logout() clearing state properly now
**Verify:**

- Wishlist document exists in MongoDB
- loadFavorites() called after login
- favoriteListingIds stored in Zustand persistence

### Issue: "Wishlist not found" error from API

**Cause:** Default wishlist not created
**Fix:** Ensure ensureDefaultWishlist() called in authController login/register

### Issue: Bookings empty after login

**Cause:** loadBookings() not called
**Fix:** Add to login handler or page mount

---

## Part 6: DATABASE SEED DATA (Optional)

```javascript
// backend/seed-db.js
const mongoose = require('mongoose');
const User = require('./models/User');
const Listing = require('./models/Listing');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Create test user (host)
    const host = await User.create({
      name: 'Arjun Verma',
      email: 'host@example.com',
      password: 'HostPassword123',
      isHost: true,
      isSuperhost: true,
    });

    // Create test listing
    const listing = await Listing.create({
      host: host._id,
      title: 'Luxury Beachfront Villa in Goa',
      description: 'Beautiful villa with ocean views',
      propertyType: 'villa',
      category: 'beach',
      location: {
        address: '123 Beach Road',
        city: 'Goa',
        country: 'India',
        coordinates: {
          type: 'Point',
          coordinates: [73.8, 15.5],
        },
      },
      maxGuests: 6,
      bedrooms: 3,
      beds: 4,
      bathrooms: 2,
      pricePerNight: 5000,
      cleaningFee: 500,
      serviceFee: 750,
      status: 'active',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
          publicId: 'test/image1',
          isPrimary: true,
        },
      ],
      amenities: ['wifi', 'pool', 'kitchen', 'ac'],
    });

    console.log('✅ Database seeded successfully');
    console.log(`Host ID: ${host._id}`);
    console.log(`Listing ID: ${listing._id}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
```

```bash
# Run seed
node backend/seed-db.js
```

---

## Part 7: PERFORMANCE TESTING

### Listing Load Time

```javascript
// Browser console
console.time('listings-load');
await useStore.getState().loadListings();
console.timeEnd('listings-load');
// Target: <1000ms for 100 listings
```

### API Response Time

```bash
# Test latency
time curl http://localhost:5000/api/listings
# Target: <200ms
```

### UI Render Performance

```bash
# DevTools → Performance tab
# Record page load
# Target: <3s Time to Interactive
```

---

## Part 8: ROLLBACK PROCEDURE

If issues arise after changes:

```bash
# Revert to last working commit
git log --oneline | head -10
git revert <commit-hash>

# Or full rollback
git reset --hard <commit-hash>

# Restart backend
cd backend
npm install  # in case deps changed
npm start

# Restart frontend
npm run dev
```

---

## SUCCESS CRITERIA

✅ All tests pass
✅ No console errors
✅ Favorites persist after logout
✅ Bookings persist after logout
✅ Listings load from API (not mock)
✅ Ratings calculated dynamically
✅ Authentication tokens managed
✅ <2s API response time
✅ Graceful fallback to mock data if API fails
