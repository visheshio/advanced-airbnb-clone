import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import SearchModal from './components/modals/SearchModal';
import RentModal from './components/modals/RentModal';
import LoginModal from './components/modals/LoginModal';
import RegisterModal from './components/modals/RegisterModal';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import ListingPage from './pages/ListingPage';
import TripsPage from './pages/TripsPage';
import FavoritesPage from './pages/FavoritesPage';
import SearchResultsPage from './pages/SearchResultsPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import PropertiesPage from './pages/PropertiesPage';
import HostDashboardPage from './pages/HostDashboardPage';
import TravelBuddyPage from './pages/TravelBuddyPage';
import { useStore } from './store/useStore';

function AppModals() {
  const {
    isSearchModalOpen, setSearchModal,
    isRentModalOpen, setRentModal,
    isLoginModalOpen, setLoginModal,
    isRegisterModalOpen, setRegisterModal,
  } = useStore();

  return (
    <>
      <SearchModal  isOpen={isSearchModalOpen}  onClose={() => setSearchModal(false)} />
      <RentModal    isOpen={isRentModalOpen}    onClose={() => setRentModal(false)} />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setLoginModal(false)}
        onSwitchToRegister={() => setRegisterModal(true)}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setRegisterModal(false)}
        onSwitchToLogin={() => setLoginModal(true)}
      />
    </>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <main className="flex-1 pt-16">
        <PageWrapper>{children}</PageWrapper>
      </main>
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '14px',
          },
        }}
      />
      <AppModals />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Layout><HomePage /></Layout>} />
        <Route path="/listings/:id" element={<Layout><ListingPage /></Layout>} />
        <Route path="/search" element={<Layout><SearchResultsPage /></Layout>} />
        <Route path="/trips" element={<Layout><TripsPage /></Layout>} />
        <Route path="/favorites" element={<Layout><FavoritesPage /></Layout>} />
        <Route path="/messages" element={<Layout><MessagesPage /></Layout>} />
        <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
        <Route path="/properties" element={<Layout><PropertiesPage /></Layout>} />
        <Route path="/host/dashboard" element={<Layout><HostDashboardPage /></Layout>} />
        <Route path="/travel-buddy" element={<Layout><TravelBuddyPage /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
