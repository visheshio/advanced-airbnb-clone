import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, Star, Calendar, ArrowUp, ArrowDown,
  BarChart2, Bell, Home, Eye,
  ChevronRight, CheckCircle, Clock, XCircle,
  Zap, Award, PieChart, Download, Edit3, Plus,
  TrendingUp, Users, Percent, Wallet
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Listing, Reservation } from '../data/mockData';

/* ─── Reusable UI ──────────────────────────────── */
function StatCard({ label, value, icon, change, positive, bg, color }: {
  label: string; value: string; icon: React.ReactNode;
  change: string; positive: boolean; bg: string; color: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${bg}`}>
        <span className={color}>{icon}</span>
      </div>
      <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">{value}</p>
      <div className={`flex items-center gap-1 text-xs font-semibold ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
        {positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
        {change}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
    pending:   'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
    cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
    completed: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300',
    active:    'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
    draft:     'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400',
  };
  const icons: Record<string, React.ReactNode> = {
    confirmed: <CheckCircle className="w-3 h-3" />,
    pending:   <Clock className="w-3 h-3" />,
    cancelled: <XCircle className="w-3 h-3" />,
    completed: <CheckCircle className="w-3 h-3" />,
    active:    <Zap className="w-3 h-3" />,
    draft:     <Edit3 className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${map[status] ?? 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
      {icons[status]}
      {status}
    </span>
  );
}

function SectionCard({ title, subtitle, action, onAction, children, className = '' }: {
  title: string; subtitle?: string; action?: string; onAction?: () => void;
  children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-700">
        <div>
          <h2 className="font-bold text-gray-900 dark:text-slate-100">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && (
          <button onClick={onAction} className="text-sm text-rose-500 font-medium hover:text-rose-600 flex items-center gap-1">
            {action} <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ─── Empty state for no listings ───────────────── */
function NoListingsState({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/40 rounded-full flex items-center justify-center mb-6">
        <Home className="w-10 h-10 text-rose-400 dark:text-rose-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">No listings yet</h2>
      <p className="text-gray-500 dark:text-slate-400 max-w-sm mb-6 text-sm">
        Add your first property to start seeing your hosting dashboard with real revenue, bookings, and analytics.
      </p>
      <button
        onClick={() => navigate('/properties')}
        className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition shadow-md shadow-rose-200 dark:shadow-rose-900/30"
      >
        <Plus className="w-5 h-5" /> Add your first listing
      </button>
      <div className="mt-10 grid grid-cols-3 gap-6 max-w-md text-center">
        {[
          { icon: '🏠', title: 'List for free', desc: 'No upfront costs' },
          { icon: '📅', title: 'You control dates', desc: 'Block any dates you want' },
          { icon: '💰', title: 'Earn more', desc: 'Set your own price' },
        ].map(({ icon, title, desc }) => (
          <div key={title}>
            <div className="text-3xl mb-2">{icon}</div>
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{title}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Overview Tab ───────────────────────────────── */
function OverviewTab({ myListings, reservations }: { myListings: Listing[]; reservations: Reservation[] }) {
  // Real metrics from actual store data
  const totalRevenue = reservations
    .filter(r => r.status === 'confirmed' || r.status === 'completed')
    .reduce((sum, r) => sum + r.totalPrice, 0);

  const confirmedBookings = reservations.filter(r => r.status === 'confirmed' || r.status === 'completed').length;
  const totalNights = reservations.reduce((sum, r) => sum + r.nights, 0);
  const avgRating = myListings.length
    ? (myListings.reduce((sum, l) => sum + l.averageRating, 0) / myListings.length)
    : 0;

  // Revenue per listing
  const listingRevenue = myListings.map(listing => {
    const rev = reservations
      .filter(r => r.listingId === listing.id && (r.status === 'confirmed' || r.status === 'completed'))
      .reduce((sum, r) => sum + r.totalPrice, 0);
    return { title: listing.title, city: listing.location.city, rev, price: listing.price };
  });

  const maxRev = Math.max(...listingRevenue.map(l => l.rev), 1);

  // Booking status breakdown
  const statusBreakdown = [
    { label: 'Confirmed', count: reservations.filter(r => r.status === 'confirmed').length, color: 'bg-emerald-500' },
    { label: 'Pending', count: reservations.filter(r => r.status === 'pending').length, color: 'bg-amber-500' },
    { label: 'Completed', count: reservations.filter(r => r.status === 'completed').length, color: 'bg-blue-500' },
    { label: 'Cancelled', count: reservations.filter(r => r.status === 'cancelled').length, color: 'bg-red-400' },
  ];
  const totalBookings = reservations.length;

  return (
    <div className="space-y-6">
      {/* KPI Cards — all real data */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={totalRevenue > 0 ? `₹${totalRevenue.toLocaleString('en-IN')}` : '₹0'}
          icon={<DollarSign className="w-5 h-5" />}
          change={totalRevenue > 0 ? 'From confirmed bookings' : 'No bookings yet'}
          positive={totalRevenue > 0}
          bg="bg-emerald-50 dark:bg-emerald-900/30"
          color="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Total Bookings"
          value={String(confirmedBookings)}
          icon={<Calendar className="w-5 h-5" />}
          change={confirmedBookings > 0 ? `${totalNights} total nights` : 'No bookings yet'}
          positive={confirmedBookings > 0}
          bg="bg-blue-50 dark:bg-blue-900/30"
          color="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Active Listings"
          value={String(myListings.length)}
          icon={<Home className="w-5 h-5" />}
          change={myListings.length > 0 ? 'Published & live' : 'Add a listing to start'}
          positive={myListings.length > 0}
          bg="bg-violet-50 dark:bg-violet-900/30"
          color="text-violet-600 dark:text-violet-400"
        />
        <StatCard
          label="Avg Rating"
          value={avgRating > 0 ? `${avgRating.toFixed(2)}★` : 'N/A'}
          icon={<Star className="w-5 h-5" />}
          change={avgRating > 0 ? 'Across all listings' : 'No reviews yet'}
          positive={avgRating >= 4}
          bg="bg-amber-50 dark:bg-amber-900/30"
          color="text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Listing */}
        <SectionCard title="Revenue by Listing" subtitle="Earnings from confirmed bookings">
          {listingRevenue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Wallet className="w-8 h-8 text-gray-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-slate-400">No revenue data yet</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Confirmed bookings will show revenue here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {listingRevenue.map((l, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-slate-300 truncate">{l.title}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500">{l.city} · ₹{l.price.toLocaleString('en-IN')}/night</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-slate-100 ml-3 flex-shrink-0">
                      ₹{l.rev.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full"
                      style={{ width: `${(l.rev / maxRev) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Booking Status Breakdown */}
        <SectionCard title="Booking Status" subtitle="Overview of all booking statuses">
          {totalBookings === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Calendar className="w-8 h-8 text-gray-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-slate-400">No bookings yet</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Bookings from guests will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {statusBreakdown.map((s) => (
                <div key={s.label} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-slate-300 w-20 flex-shrink-0">{s.label}</span>
                  <div className="flex-1 h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${s.color} rounded-full`}
                      style={{ width: totalBookings > 0 ? `${(s.count / totalBookings) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-slate-100 w-8 text-right">{s.count}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-100 dark:border-slate-700 flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Total bookings</span>
                <span className="font-bold text-gray-900 dark:text-slate-100">{totalBookings}</span>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Listing Performance Cards */}
      {myListings.length > 0 && (
        <SectionCard title="Listing Performance" subtitle="Key metrics for each of your properties">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {myListings.map((listing) => {
              const listingBookings = reservations.filter(r => r.listingId === listing.id);
              const listingRevenue = listingBookings
                .filter(r => r.status === 'confirmed' || r.status === 'completed')
                .reduce((sum, r) => sum + r.totalPrice, 0);
              const listingNights = listingBookings.reduce((sum, r) => sum + r.nights, 0);

              return (
                <div key={listing.id} className="border border-gray-100 dark:border-slate-700 rounded-xl overflow-hidden hover:border-rose-200 dark:hover:border-rose-800 transition-colors">
                  <div className="h-28 overflow-hidden relative">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=60'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold line-clamp-1">{listing.title}</p>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-slate-400">Revenue</span>
                      <span className="font-bold text-gray-900 dark:text-slate-100">₹{listingRevenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-slate-400">Bookings</span>
                      <span className="font-bold text-gray-900 dark:text-slate-100">{listingBookings.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-slate-400">Total nights</span>
                      <span className="font-bold text-gray-900 dark:text-slate-100">{listingNights}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-slate-400">Price/night</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">₹{listing.price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

/* ─── Bookings Tab ───────────────────────────────── */
function BookingsTab({ reservations }: { reservations: Reservation[] }) {
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'>('all');

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter);

  const totalRevenue = reservations
    .filter(r => r.status === 'confirmed' || r.status === 'completed')
    .reduce((sum, r) => sum + r.totalPrice, 0);

  const upcoming = reservations.filter(r => r.status === 'confirmed' && new Date(r.checkIn) > new Date()).length;
  const pending = reservations.filter(r => r.status === 'pending').length;

  if (reservations.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl p-12 text-center shadow-sm">
        <Calendar className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">No bookings yet</h3>
        <p className="text-gray-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
          When guests book your properties, all booking details will appear here with full management controls.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Upcoming', value: String(upcoming), icon: <Calendar className="w-4 h-4" />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
          { label: 'Pending', value: String(pending), icon: <Clock className="w-4 h-4" />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
          { label: 'Total Bookings', value: String(reservations.length), icon: <Users className="w-4 h-4" />, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/30' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: <DollarSign className="w-4 h-4" />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} ${s.color} flex-shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-400 dark:text-slate-500">{s.label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex gap-1 p-3 border-b border-gray-100 dark:border-slate-700 overflow-x-auto">
          {(['all', 'confirmed', 'pending', 'completed', 'cancelled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition flex-shrink-0 ${
                filter === f
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              {f} {f !== 'all' && `(${reservations.filter(r => r.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="divide-y divide-gray-50 dark:divide-slate-800">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400 dark:text-slate-500">
              No {filter} bookings found
            </div>
          ) : (
            filtered.map((res) => (
              <div key={res.id} className="p-5 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Listing image */}
                  <img
                    src={res.listing.images[0]}
                    alt={res.listing.title}
                    className="w-16 h-16 rounded-xl object-cover bg-gray-100 dark:bg-slate-700 flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&q=60'; }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm line-clamp-1">{res.listing.title}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {res.listing.location.city}, {res.listing.location.country}
                        </p>
                      </div>
                      <StatusBadge status={res.status} />
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {res.checkIn} → {res.checkOut}
                      </span>
                      <span>{res.nights} night{res.nights !== 1 ? 's' : ''}</span>
                      <span>{res.adults} guest{res.adults !== 1 ? 's' : ''}</span>
                      <span className="font-bold text-gray-900 dark:text-slate-100">
                        ₹{res.totalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Properties Tab ─────────────────────────────── */
function PropertiesTab({ myListings, navigate }: { myListings: Listing[]; navigate: ReturnType<typeof useNavigate> }) {
  if (myListings.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl p-12 text-center shadow-sm">
        <Home className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">No properties yet</h3>
        <p className="text-gray-500 dark:text-slate-400 text-sm mb-5 max-w-sm mx-auto">
          Add your first listing to manage your properties from here.
        </p>
        <button
          onClick={() => navigate('/properties')}
          className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition mx-auto"
        >
          <Plus className="w-4 h-4" /> Add a listing
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-slate-400">{myListings.length} listing{myListings.length !== 1 ? 's' : ''} managed by you</p>
        <button
          onClick={() => navigate('/properties')}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition"
        >
          <Plus className="w-4 h-4" /> Add listing
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myListings.map((listing) => (
          <div key={listing.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
            <div className="h-40 overflow-hidden relative">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=60'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-2 left-2">
                <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">● Active</span>
              </div>
              {listing.instantBook && (
                <div className="absolute top-2 right-2">
                  <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Instant
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm line-clamp-1 mb-0.5">{listing.title}</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
                📍 {listing.location.address}, {listing.location.city}
              </p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center bg-gray-50 dark:bg-slate-800 rounded-lg p-2">
                  <p className="text-xs text-gray-400 dark:text-slate-500">Price</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-slate-100">₹{listing.price.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-center bg-gray-50 dark:bg-slate-800 rounded-lg p-2">
                  <p className="text-xs text-gray-400 dark:text-slate-500">Rating</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-slate-100">
                    {listing.averageRating > 0 ? listing.averageRating.toFixed(2) : 'New'}
                  </p>
                </div>
                <div className="text-center bg-gray-50 dark:bg-slate-800 rounded-lg p-2">
                  <p className="text-xs text-gray-400 dark:text-slate-500">Guests</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-slate-100">{listing.guestCount}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/listings/${listing.id}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <button
                  onClick={() => navigate('/properties')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Reviews Tab ────────────────────────────────── */
function ReviewsTab({ myListings }: { myListings: Listing[] }) {
  const totalReviews = myListings.reduce((sum, l) => sum + l.reviewCount, 0);
  const avgRating = myListings.length
    ? myListings.reduce((sum, l) => sum + l.averageRating, 0) / myListings.length
    : 0;

  if (myListings.length === 0 || totalReviews === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl p-12 text-center shadow-sm">
        <Star className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">No reviews yet</h3>
        <p className="text-gray-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
          Reviews from guests will appear here after their completed stays. Encourage guests to leave reviews!
        </p>
      </div>
    );
  }

  const ratingCategories = { cleanliness: 4.9, accuracy: 4.8, checkIn: 4.9, communication: 5.0, location: 4.7, value: 4.8 };

  return (
    <div className="space-y-6">
      {/* Overall rating */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center gap-3">
          <p className="text-6xl font-black text-gray-900 dark:text-slate-100">{avgRating.toFixed(2)}</p>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`w-6 h-6 ${s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-slate-600'}`} />
            ))}
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-sm">Overall rating</p>
          <p className="text-xs text-gray-400 dark:text-slate-500">{totalReviews} review{totalReviews !== 1 ? 's' : ''} across {myListings.length} listing{myListings.length !== 1 ? 's' : ''}</p>
          {avgRating >= 4.8 && (
            <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl px-4 py-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Superhost eligible</span>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-5">Rating Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(ratingCategories).map(([key, val]) => (
              <div key={key} className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-slate-300 capitalize w-32">{key}</span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(val / 5) * 100}%` }} />
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-slate-100 w-8">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-listing ratings */}
      <SectionCard title="Listings Reviews" subtitle="Review count and rating per property">
        <div className="space-y-4">
          {myListings.filter(l => l.reviewCount > 0).map((listing) => (
            <div key={listing.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-12 h-12 rounded-xl object-cover bg-gray-100 dark:bg-slate-700 flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&q=60'; }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate">{listing.title}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{listing.reviewCount} review{listing.reviewCount !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                {listing.averageRating.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* ─── Analytics Tab ──────────────────────────────── */
function AnalyticsTab({ myListings, reservations }: {
  myListings: Listing[];
  reservations: Reservation[];
}) {
  // Real conversion data
  const totalListings = myListings.length;
  const totalReservations = reservations.length;
  const confirmedBookings = reservations.filter(r => r.status === 'confirmed' || r.status === 'completed').length;
  const totalRevenue = reservations
    .filter(r => r.status === 'confirmed' || r.status === 'completed')
    .reduce((sum, r) => sum + r.totalPrice, 0);
  const avgNightlyRate = myListings.length
    ? myListings.reduce((sum, l) => sum + l.price, 0) / myListings.length
    : 0;

  // Potential earnings calculator
  const potentialMonthly = avgNightlyRate * 15; // 50% occupancy
  const potentialYearly = potentialMonthly * 12;

  if (myListings.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl p-12 text-center shadow-sm">
        <PieChart className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">No analytics yet</h3>
        <p className="text-gray-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
          Add listings and receive bookings to unlock real analytics and insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Listings', value: totalListings, suffix: '', icon: Home, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
          { label: 'Total Reservations', value: totalReservations, suffix: '', icon: Calendar, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/30' },
          { label: 'Confirmed', value: confirmedBookings, suffix: '', icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, suffix: '', icon: TrendingUp, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/30' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">{label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <SectionCard title="Booking Conversion" subtitle="Your booking performance metrics">
          <div className="space-y-4">
            {[
              { label: 'Total Listings', value: totalListings, pct: 100, color: 'bg-blue-400' },
              { label: 'Reservations received', value: totalReservations, pct: totalListings > 0 ? Math.min(100, (totalReservations / totalListings) * 100) : 0, color: 'bg-violet-400' },
              { label: 'Confirmed bookings', value: confirmedBookings, pct: totalReservations > 0 ? (confirmedBookings / totalReservations) * 100 : 0, color: 'bg-emerald-400' },
            ].map((d) => (
              <div key={d.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600 dark:text-slate-300">{d.label}</span>
                  <span className="font-bold text-gray-900 dark:text-slate-100">{d.value}</span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
            {totalReservations > 0 && (
              <div className="pt-3 border-t border-gray-100 dark:border-slate-700 flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5" /> Conversion rate
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {((confirmedBookings / totalReservations) * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Earnings Potential */}
        <SectionCard title="Earnings Potential" subtitle="Estimated based on your listings">
          <div className="space-y-4">
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800 rounded-xl p-4">
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mb-1">Avg. nightly rate</p>
              <p className="text-3xl font-black text-rose-600 dark:text-rose-300">₹{avgNightlyRate.toLocaleString('en-IN')}</p>
              <p className="text-xs text-rose-500/70 dark:text-rose-400/70 mt-1">Average across {myListings.length} listing{myListings.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Monthly (50% occ.)</p>
                <p className="text-xl font-bold text-gray-900 dark:text-slate-100">₹{potentialMonthly.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Yearly (50% occ.)</p>
                <p className="text-xl font-bold text-gray-900 dark:text-slate-100">₹{potentialYearly.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-xl p-3">
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                💡 <strong>Tip:</strong> Properties with 5+ amenities earn 30% more on average. Consider adding more to your listings.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Listing Breakdown Table */}
      <SectionCard title="Listing Analytics" subtitle="Detailed breakdown of each property">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700">
                {['Property', 'Price/night', 'Amenities', 'Rating', 'Reviews', 'Est. Monthly'].map(h => (
                  <th key={h} className="text-left pb-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {myListings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3.5 pr-4">
                    <p className="font-medium text-gray-900 dark:text-slate-100 line-clamp-1 max-w-[160px]">{listing.title}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{listing.location.city}</p>
                  </td>
                  <td className="py-3.5 pr-4 font-semibold text-gray-900 dark:text-slate-100">₹{listing.price.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 pr-4 text-gray-600 dark:text-slate-300">{listing.amenities.length}</td>
                  <td className="py-3.5 pr-4">
                    {listing.averageRating > 0 ? (
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />{listing.averageRating.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-slate-500">New</span>
                    )}
                  </td>
                  <td className="py-3.5 pr-4 text-gray-600 dark:text-slate-300">{listing.reviewCount}</td>
                  <td className="py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{(listing.price * 15).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────── */
const TABS = [
  { id: 'overview',    label: 'Overview',    icon: BarChart2 },
  { id: 'bookings',   label: 'Bookings',    icon: Calendar },
  { id: 'properties', label: 'Properties',  icon: Home },
  { id: 'reviews',    label: 'Reviews',     icon: Star },
  { id: 'analytics',  label: 'Analytics',   icon: PieChart },
];

export default function HostDashboardPage() {
  const navigate = useNavigate();
  const { user, myListings, reservations } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'properties' | 'reviews' | 'analytics'>('overview');

  const pendingCount = reservations.filter(r => r.status === 'pending').length;
  const totalRevenue = reservations
    .filter(r => r.status === 'confirmed' || r.status === 'completed')
    .reduce((sum, r) => sum + r.totalPrice, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-rose-200 dark:ring-rose-800 flex-shrink-0">
              {user?.profileImage
                ? <img src={user.profileImage} alt="Host" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center text-rose-500 font-bold text-xl">
                    {user?.firstName?.[0]}
                  </div>
              }
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100">
                Welcome back, {user?.firstName ?? 'Host'}! 👋
              </h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {myListings.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-full">
                    <Award className="w-3.5 h-3.5" /> Superhost
                  </span>
                )}
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  {myListings.length} listing{myListings.length !== 1 ? 's' : ''} · {reservations.length} reservation{reservations.length !== 1 ? 's' : ''}
                  {totalRevenue > 0 && ` · ₹${totalRevenue.toLocaleString('en-IN')} earned`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm">
              <Download className="w-4 h-4" /> Export
            </button>
            <button
              onClick={() => navigate('/properties')}
              className="flex items-center gap-2 px-3 py-2 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Listing
            </button>
          </div>
        </div>

        {/* ── Alert Banner for pending bookings ── */}
        {pendingCount > 0 && (
          <div className="mb-6 flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4">
            <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                You have {pendingCount} booking request{pendingCount > 1 ? 's' : ''} awaiting response
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">Respond within 24 hours to maintain your response rate</p>
            </div>
            <button
              onClick={() => setActiveTab('bookings')}
              className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition flex-shrink-0"
            >
              Review Now
            </button>
          </div>
        )}

        {/* ── No listings at all ── */}
        {myListings.length === 0 && activeTab === 'overview' ? (
          <NoListingsState navigate={navigate} />
        ) : (
          <>
            {/* ── Tab Navigation ── */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl p-1.5 shadow-sm mb-8 overflow-x-auto scrollbar-hide">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition whitespace-nowrap flex-shrink-0 ${
                    activeTab === id
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {id === 'bookings' && pendingCount > 0 && (
                    <span className="w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Tab Content ── */}
            {activeTab === 'overview' && <OverviewTab myListings={myListings} reservations={reservations} />}
            {activeTab === 'bookings' && <BookingsTab reservations={reservations} />}
            {activeTab === 'properties' && <PropertiesTab myListings={myListings} navigate={navigate} />}
            {activeTab === 'reviews' && <ReviewsTab myListings={myListings} />}
            {activeTab === 'analytics' && <AnalyticsTab myListings={myListings} reservations={reservations} />}
          </>
        )}

        {/* Show tabs even with no listings if not on overview */}
        {myListings.length === 0 && activeTab !== 'overview' && (
          <>
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl p-1.5 shadow-sm mb-8 overflow-x-auto scrollbar-hide">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition whitespace-nowrap flex-shrink-0 ${
                    activeTab === id
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
            {activeTab === 'bookings' && <BookingsTab reservations={reservations} />}
            {activeTab === 'properties' && <PropertiesTab myListings={myListings} navigate={navigate} />}
            {activeTab === 'reviews' && <ReviewsTab myListings={myListings} />}
            {activeTab === 'analytics' && <AnalyticsTab myListings={myListings} reservations={reservations} />}
          </>
        )}

      </div>
    </div>
  );
}
