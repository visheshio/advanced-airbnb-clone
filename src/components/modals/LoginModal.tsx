import { useState } from 'react';
import { X, Eye, EyeOff, Home, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';

// ── Demo accounts that always work ──────────────────────────────────────────
const DEMO_ACCOUNTS = [
  {
    email: 'host@demo.in',
    password: 'demo1234',
    user: {
      id: 'host-001',
      firstName: 'Arjun',
      lastName: 'Mehta',
      email: 'host@demo.in',
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
      isHost: true,
      favoriteIds: ['1', '4', '10'],
      currency: 'INR',
    },
  },
  {
    email: 'guest@demo.in',
    password: 'demo1234',
    user: {
      id: 'guest-001',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'guest@demo.in',
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
      isHost: false,
      favoriteIds: ['2', '7'],
      currency: 'INR',
    },
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: Props) {
  const { login } = useStore();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleClose = () => {
    setEmail(''); setPassword(''); setError(''); setShowPass(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password)     { setError('Please enter your password.');      return; }

    setLoading(true);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 900));

    // Check demo accounts
    const match = DEMO_ACCOUNTS.find(
      a => a.email.toLowerCase() === email.toLowerCase().trim() && a.password === password
    );

    if (match) {
      login(match.user as any);
      toast.success(`Welcome back, ${match.user.firstName}! 🏡`);
      handleClose();
    } else {
      // Check registered accounts in localStorage
      const registered = JSON.parse(localStorage.getItem('hr-registered-users') || '[]');
      const regMatch = registered.find(
        (u: { email: string; password: string }) =>
          u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
      );
      if (regMatch) {
        login(regMatch as any);
        toast.success(`Welcome back, ${regMatch.firstName}! 🏡`);
        handleClose();
      } else {
        setError('Invalid email or password. Try host@demo.in / demo1234');
      }
    }
    setLoading(false);
  };

  const fillDemo = (type: 'host' | 'guest') => {
    const acc = DEMO_ACCOUNTS.find(a => (type === 'host' ? a.user.isHost : !a.user.isHost));
    if (acc) { setEmail(acc.email); setPassword(acc.password); setError(''); }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Welcome back</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {/* Demo quick-fill buttons */}
              <div className="mb-5 p-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-100 dark:border-rose-900">
                <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-3 uppercase tracking-wide">
                  🚀 Quick Demo Login
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => fillDemo('host')}
                    className="py-2 px-3 text-xs font-semibold bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
                  >
                    Host Account
                  </button>
                  <button
                    onClick={() => fillDemo('guest')}
                    className="py-2 px-3 text-xs font-semibold bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 transition"
                  >
                    Guest Account
                  </button>
                </div>
                <p className="text-xs text-rose-500 dark:text-rose-500 mt-2 text-center">
                  Click above to auto-fill credentials, then hit Log In
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400"
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-400 dark:focus:ring-rose-600 transition text-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-400 dark:focus:ring-rose-600 transition text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot password */}
                <div className="text-right">
                  <button
                    type="button"
                    className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 font-medium transition"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-pink-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-rose-200 dark:hover:shadow-rose-900 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Logging in...
                    </>
                  ) : 'Log In'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white dark:bg-slate-900 text-xs text-gray-400 dark:text-slate-500">
                    Don't have an account?
                  </span>
                </div>
              </div>

              <button
                onClick={() => { handleClose(); onSwitchToRegister(); }}
                className="w-full py-3 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-semibold rounded-xl hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-500 dark:hover:text-rose-400 transition"
              >
                Create an account
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
