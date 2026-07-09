import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useMemo } from 'react';
import { Search, Shield, Wallet, Zap, Star, ChevronRight, MapPin, ArrowRight } from 'lucide-react';
import { MOCK_LISTINGS, MOCK_REVIEWS } from '../data/mockData';

/* ─── Easing & Animation Config ──────────────────────────────── */
const APPLE_EASE = [0.2, 0.8, 0.2, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: APPLE_EASE },
  }),
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

/* ─── Featured listing IDs ───────────────────────────────────── */
const FEATURED_IDS = ['1', '2', '3']; // Goa Villa, Manali Cottage, Kerala Villa

export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  /* ─── Computed stats from actual data ─────────────────────── */
  const stats = useMemo(() => {
    const totalListings = MOCK_LISTINGS.length;
    const uniqueCities = new Set(MOCK_LISTINGS.map(l => l.location.city)).size;
    const avgRating = (MOCK_LISTINGS.reduce((sum, l) => sum + l.averageRating, 0) / totalListings).toFixed(2);
    const totalReviews = MOCK_LISTINGS.reduce((sum, l) => sum + l.reviewCount, 0);
    return [
      { value: `${totalListings}`, label: 'Curated Stays' },
      { value: `${uniqueCities}+`, label: 'Indian Cities' },
      { value: avgRating, label: 'Avg Rating' },
      { value: `${totalReviews.toLocaleString('en-IN')}+`, label: '5-Star Reviews' },
    ];
  }, []);

  const featured = useMemo(() => MOCK_LISTINGS.filter(l => FEATURED_IDS.includes(l.id)), []);
  const reviews = useMemo(() => MOCK_REVIEWS.slice(0, 2), []);

  const goExplore = () => navigate('/home');

  return (
    <div className="landing-page">

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1 · HERO
      ═══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="landing-hero">
        {/* Parallax background */}
        <motion.div className="landing-hero-bg" style={{ y: heroY }}>
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85"
            alt="Himalayan Mountains"
            className="landing-hero-img"
          />
          <div className="landing-hero-overlay" />
        </motion.div>

        <motion.div className="landing-hero-content" style={{ opacity: heroOpacity }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: APPLE_EASE }}
            className="landing-hero-tag"
          >
            Discover India
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: APPLE_EASE }}
            className="landing-hero-title"
          >
            Your Next<br />
            <span className="landing-gradient-text">Extraordinary Stay</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: APPLE_EASE }}
            className="landing-hero-subtitle"
          >
            Discover handpicked homes across India — from Goan beaches to Himalayan retreats
          </motion.p>

          {/* Glassmorphism Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.65, duration: 0.7, ease: APPLE_EASE }}
            className="landing-glass landing-search-bar"
          >
            <div className="landing-search-field">
              <MapPin className="w-4 h-4 text-rose-400" />
              <div>
                <p className="landing-search-label">Location</p>
                <p className="landing-search-value">Where to?</p>
              </div>
            </div>
            <div className="landing-search-divider" />
            <div className="landing-search-field">
              <div>
                <p className="landing-search-label">Check in</p>
                <p className="landing-search-value">Add dates</p>
              </div>
            </div>
            <div className="landing-search-divider" />
            <div className="landing-search-field">
              <div>
                <p className="landing-search-label">Guests</p>
                <p className="landing-search-value">Add guests</p>
              </div>
            </div>
            <button onClick={goExplore} className="landing-gradient-btn landing-search-btn">
              <Search className="w-5 h-5" />
              <span>Start Exploring</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="landing-scroll-indicator"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronRight className="w-5 h-5 rotate-90 text-white/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2 · STATS BAR
      ═══════════════════════════════════════════════════════════ */}
      <section className="landing-stats">
        <motion.div
          className="landing-stats-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          {stats.map((stat, i) => (
            <motion.div key={stat.label} custom={i} variants={fadeUp} className="landing-stat">
              <p className="landing-stat-value">{stat.value}</p>
              <p className="landing-stat-label">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3 · WHY CHOOSE US
      ═══════════════════════════════════════════════════════════ */}
      <section className="landing-section landing-features-section">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="landing-container"
        >
          <motion.p custom={0} variants={fadeUp} className="landing-section-tag">Why Choose Us</motion.p>
          <motion.h2 custom={1} variants={fadeUp} className="landing-section-title">
            Crafted for the discerning traveller
          </motion.h2>

          <div className="landing-features-grid">
            {[
              {
                icon: <Shield className="w-7 h-7" />,
                title: 'Verified Superhosts',
                desc: 'Every host is personally vetted for quality. Stay with confidence knowing your host has a track record of 5-star hospitality.',
              },
              {
                icon: <Wallet className="w-7 h-7" />,
                title: 'Best Price Guarantee',
                desc: 'Transparent pricing with no hidden fees. What you see is what you pay — cleaning fees and taxes included upfront.',
              },
              {
                icon: <Zap className="w-7 h-7" />,
                title: 'Instant Booking',
                desc: 'Book your dream stay in under 60 seconds. No waiting for host approval — just find, book, and go.',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i + 2}
                variants={fadeUp}
                className="landing-glass landing-feature-card"
              >
                <div className="landing-feature-icon">{feature.icon}</div>
                <h3 className="landing-feature-title">{feature.title}</h3>
                <p className="landing-feature-desc">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4 · FEATURED STAYS
      ═══════════════════════════════════════════════════════════ */}
      <section className="landing-section landing-stays-section">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="landing-container"
        >
          <motion.p custom={0} variants={fadeUp} className="landing-section-tag">Featured Stays</motion.p>
          <motion.h2 custom={1} variants={fadeUp} className="landing-section-title">
            Handpicked for you
          </motion.h2>

          <div className="landing-stays-grid">
            {featured.map((listing, i) => (
              <motion.div
                key={listing.id}
                custom={i + 2}
                variants={fadeUp}
                className="landing-stay-card"
                whileHover={{ y: -8, transition: { duration: 0.3, ease: APPLE_EASE } }}
                onClick={() => navigate(`/listings/${listing.id}`)}
              >
                <div className="landing-stay-img-wrap">
                  <img src={listing.images[0]} alt={listing.title} className="landing-stay-img" />
                  <div className="landing-stay-img-overlay" />
                  {listing.owner.isSuperhost && (
                    <span className="landing-stay-badge">Superhost</span>
                  )}
                </div>
                <div className="landing-stay-info">
                  <div className="landing-stay-top">
                    <h3 className="landing-stay-title">{listing.title}</h3>
                    <div className="landing-stay-rating">
                      <Star className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                      <span>{listing.averageRating}</span>
                      <span className="landing-stay-reviews">({listing.reviewCount})</span>
                    </div>
                  </div>
                  <p className="landing-stay-location">
                    <MapPin className="w-3.5 h-3.5" />
                    {listing.location.city}, {listing.location.state}
                  </p>
                  <div className="landing-stay-bottom">
                    <p className="landing-stay-price">
                      ₹{listing.price.toLocaleString('en-IN')}
                      <span className="landing-stay-per">/night</span>
                    </p>
                    <span className="landing-stay-details">
                      {listing.bedroomCount} bed · {listing.bathroomCount} bath · {listing.guestCount} guests
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div custom={5} variants={fadeUp} className="landing-center">
            <button onClick={goExplore} className="landing-ghost-btn">
              View all {MOCK_LISTINGS.length} stays
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5 · TESTIMONIALS
      ═══════════════════════════════════════════════════════════ */}
      <section className="landing-section landing-testimonials-section">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="landing-container"
        >
          <motion.p custom={0} variants={fadeUp} className="landing-section-tag">What Guests Say</motion.p>
          <motion.h2 custom={1} variants={fadeUp} className="landing-section-title">
            Stories from our travellers
          </motion.h2>

          <div className="landing-testimonials-grid">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                custom={i + 2}
                variants={fadeUp}
                className="landing-glass landing-testimonial-card"
              >
                <div className="landing-testimonial-stars">
                  {Array.from({ length: review.overallRating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-rose-400 text-rose-400" />
                  ))}
                </div>
                <p className="landing-testimonial-quote">"{review.comment}"</p>
                <div className="landing-testimonial-author">
                  <img
                    src={review.reviewer.profileImage}
                    alt={review.reviewer.firstName}
                    className="landing-testimonial-avatar"
                  />
                  <div>
                    <p className="landing-testimonial-name">
                      {review.reviewer.firstName} {review.reviewer.lastName}
                    </p>
                    <p className="landing-testimonial-date">{review.createdAt}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 6 · CTA FOOTER
      ═══════════════════════════════════════════════════════════ */}
      <section className="landing-cta">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="landing-cta-inner"
        >
          <motion.h2 custom={0} variants={fadeUp} className="landing-cta-title">
            Ready to find your perfect<br />
            <span className="landing-gradient-text">Indian getaway?</span>
          </motion.h2>
          <motion.p custom={1} variants={fadeUp} className="landing-cta-sub">
            {MOCK_LISTINGS.length} handpicked stays across {new Set(MOCK_LISTINGS.map(l => l.location.city)).size}+ cities. Your next adventure starts here.
          </motion.p>
          <motion.div custom={2} variants={fadeUp}>
            <button onClick={goExplore} className="landing-gradient-btn landing-cta-btn">
              Explore All Stays
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Mini footer */}
      <footer className="landing-footer">
        <p>© 2026 StayIndia · Handpicked Indian Getaways</p>
      </footer>
    </div>
  );
}
