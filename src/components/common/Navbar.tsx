import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Menu, User, Home, Heart, Calendar,
  MessageSquare, BarChart2, Plus, LogOut, Moon, Sun,
  Map, List, Users,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsPanel from './NotificationsPanel';
import LanguagePanel from './LanguagePanel';
import toast from 'react-hot-toast';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user, logout,
    setSearchModal, setRentModal,
    setLoginModal, setRegisterModal,
    darkMode, toggleDarkMode,
    mapView, toggleMapView,
  } = useStore();

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [langOpen,   setLangOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);
  const isHome = location.pathname === '/';

  // Close user-menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Mutual-exclusion: only one panel open at a time
  const openNotif = () => { setNotifOpen(v => !v); setLangOpen(false); setMenuOpen(false); };
  const openLang  = () => { setLangOpen(v => !v);  setNotifOpen(false); setMenuOpen(false); };
  const openMenu  = () => { setMenuOpen(v => !v);  setNotifOpen(false); setLangOpen(false); };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?location=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-rose-200 dark:group-hover:shadow-rose-900 transition-shadow">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-gradient font-black text-xl hidden sm:block">HomeRental</span>
          </Link>

          {/* ── Desktop Search Bar ── */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:shadow-md transition-shadow overflow-hidden max-w-sm w-full mx-4"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations in India..."
              className="flex-1 px-4 py-2 text-sm outline-none bg-transparent text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
            />
            <button
              type="button"
              onClick={() => setSearchModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border-l border-gray-200 dark:border-slate-700 bg-rose-500 text-white hover:bg-rose-600 transition"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* ── Mobile Search Button ── */}
          <button
            onClick={() => setSearchModal(true)}
            className="md:hidden flex items-center gap-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition"
          >
            <Search className="w-4 h-4 text-gray-600 dark:text-slate-300" />
            <span className="text-sm text-gray-600 dark:text-slate-300">Search</span>
          </button>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1">

            {/* Map / List toggle (home page only) */}
            {isHome && (
              <button
                onClick={toggleMapView}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition"
                title={mapView ? 'Show list' : 'Show map'}
              >
                {mapView ? <List className="w-4 h-4" /> : <Map className="w-4 h-4" />}
                <span className="hidden lg:block">{mapView ? 'List' : 'Map'}</span>
              </button>
            )}

            {/* List your home */}
            <button
              onClick={() => setRentModal(true)}
              className="hidden md:flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden lg:block">List your home</span>
            </button>

            {/* ── Dark / Light Mode Toggle ── */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center
                ${darkMode
                  ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle dark mode"
            >
              <AnimatePresence mode="wait" initial={false}>
                {darkMode ? (
                  <motion.span
                    key="sun"
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                    className="flex"
                  >
                    <Sun className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="moon"
                    initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                    className="flex"
                  >
                    <Moon className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* ── Language / Currency Panel ── */}
            <LanguagePanel isOpen={langOpen} onClose={openLang} />

            {/* ── Notifications Panel ── */}
            <NotificationsPanel isOpen={notifOpen} onClose={openNotif} />

            {/* ── User Menu ── */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={openMenu}
                className={`flex items-center gap-2 border rounded-full p-1 pl-3 transition-all duration-200
                  ${menuOpen
                    ? 'border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/30 shadow-md'
                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md'
                  }`}
              >
                <Menu className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="User" className="w-8 h-8 rounded-full bg-gray-100" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 py-2 overflow-hidden z-50"
                  >
                    {user ? (
                      <>
                        {/* User info header */}
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.profileImage}
                              alt={user.firstName}
                              className="w-10 h-10 rounded-full object-cover bg-gray-100 dark:bg-slate-700"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{user.email}</p>
                              {user.isHost && (
                                <span className="inline-block mt-0.5 text-xs bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-medium px-1.5 py-0.5 rounded-full">
                                  Host
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Guest links */}
                        <div className="py-1">
                          <NavMenuItem icon={<Heart className="w-4 h-4" />}         label="Favourites" to="/favorites" onClick={() => setMenuOpen(false)} />
                          <NavMenuItem icon={<Calendar className="w-4 h-4" />}      label="My Trips"   to="/trips"    onClick={() => setMenuOpen(false)} />
                          <NavMenuItem icon={<MessageSquare className="w-4 h-4" />} label="Messages"   to="/messages" onClick={() => setMenuOpen(false)} />
                          <NavMenuItem icon={<Users className="w-4 h-4" />}          label="Travel Buddy" to="/travel-buddy" onClick={() => setMenuOpen(false)} />
                        </div>

                        {/* Host links */}
                        {user.isHost && (
                          <>
                            <div className="border-t border-gray-100 dark:border-slate-700 my-1" />
                            <div className="px-3 py-1">
                              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1 px-1">
                                Host
                              </p>
                              <NavMenuItem icon={<BarChart2 className="w-4 h-4" />} label="Host Dashboard" to="/host/dashboard" onClick={() => setMenuOpen(false)} />
                              <NavMenuItem icon={<Home className="w-4 h-4" />}      label="My Properties"  to="/properties"     onClick={() => setMenuOpen(false)} />
                            </div>
                          </>
                        )}

                        {/* Account */}
                        <div className="border-t border-gray-100 dark:border-slate-700 my-1" />
                        <NavMenuItem icon={<User className="w-4 h-4" />} label="Profile & Settings" to="/profile" onClick={() => setMenuOpen(false)} />

                        {/* Logout */}
                        <button
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition font-medium"
                          onClick={() => {
                            logout();
                            setMenuOpen(false);
                            navigate('/');
                            toast.success('Logged out successfully');
                          }}
                        >
                          <LogOut className="w-4 h-4" />
                          Log out
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Not logged in */}
                        <div className="p-3">
                          <p className="text-xs text-gray-500 dark:text-slate-400 text-center mb-3">
                            Sign in to book stays, save favourites & more
                          </p>
                          <button
                            className="w-full py-2.5 mb-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-semibold rounded-xl hover:from-rose-600 hover:to-pink-700 transition shadow-md"
                            onClick={() => {
                              setMenuOpen(false);
                              setLoginModal(true);
                            }}
                          >
                            Log in
                          </button>
                          <button
                            className="w-full py-2.5 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-500 dark:hover:text-rose-400 transition"
                            onClick={() => {
                              setMenuOpen(false);
                              setRegisterModal(true);
                            }}
                          >
                            Create account
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </nav>
  );
}

function NavMenuItem({ icon, label, to, onClick }: { icon: React.ReactNode; label: string; to: string; onClick: () => void }) {
  const navigate = useNavigate();
  return (
    <button
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
      onClick={() => { navigate(to); onClick(); }}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useStore();

  const items = [
    { icon: <Home className="w-5 h-5" />,     label: 'Explore', path: '/' },
    { icon: <Search className="w-5 h-5" />,   label: 'Search',  path: '/search' },
    { icon: <Heart className="w-5 h-5" />,    label: 'Saved',   path: '/favorites' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Trips',   path: '/trips' },
    { icon: <User className="w-5 h-5" />,     label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 pb-safe">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${
                active ? 'text-rose-500' : 'text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'
              }`}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
              {active && <span className="w-1 h-1 bg-rose-500 rounded-full" />}
            </button>
          );
        })}
        {/* Dark mode toggle in mobile nav */}
        <button
          onClick={toggleDarkMode}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${
            darkMode ? 'text-yellow-400' : 'text-gray-400 dark:text-slate-500'
          }`}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="text-xs font-medium">{darkMode ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </div>
  );
}
