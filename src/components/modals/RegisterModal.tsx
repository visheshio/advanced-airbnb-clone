import { useState } from 'react';
import { X, Eye, EyeOff, Home, Mail, Lock, User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  isHost: boolean;
  agreeTerms: boolean;
}

const EMPTY_FORM: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  isHost: false,
  agreeTerms: false,
};

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
    { label: 'Special character', ok: /[!@#$%^&*]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : 'bg-gray-200 dark:bg-slate-700'}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${score < 2 ? 'text-red-500' : score < 3 ? 'text-yellow-500' : 'text-green-500'}`}>
        {labels[score - 1] || 'Too weak'}
      </p>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-1">
            <CheckCircle2 className={`w-3 h-3 ${c.ok ? 'text-green-500' : 'text-gray-300 dark:text-slate-600'}`} />
            <span className={`text-xs ${c.ok ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'}`}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: Props) {
  const { login } = useStore();

  const [form, setForm]         = useState<FormData>(EMPTY_FORM);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [step, setStep]         = useState<1 | 2>(1);

  const update = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: value }));
    setError('');
  };

  const handleClose = () => {
    setForm(EMPTY_FORM); setError(''); setStep(1); setShowPass(false); setShowConf(false);
    onClose();
  };

  const validateStep1 = () => {
    if (!form.firstName.trim()) { setError('First name is required.'); return false; }
    if (!form.lastName.trim())  { setError('Last name is required.'); return false; }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      setError('Enter a valid email address.'); return false;
    }
    // Check if email already registered
    const registered = JSON.parse(localStorage.getItem('hr-registered-users') || '[]');
    if (registered.find((u: { email: string }) => u.email.toLowerCase() === form.email.toLowerCase())) {
      setError('An account with this email already exists.'); return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return false; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return false; }
    if (!form.agreeTerms) { setError('You must agree to the Terms & Privacy Policy.'); return false; }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) { setError(''); setStep(2); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));

    const newUser = {
      id: `user-${Date.now()}`,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      password: form.password, // In real app: hashed on backend
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.firstName}`,
      isHost: form.isHost,
      favoriteIds: [] as string[],
      currency: 'INR',
    };

    // Persist to localStorage (simulates backend DB)
    const registered = JSON.parse(localStorage.getItem('hr-registered-users') || '[]');
    registered.push(newUser);
    localStorage.setItem('hr-registered-users', JSON.stringify(registered));

    login(newUser as any);
    toast.success(`Welcome to HomeRental, ${newUser.firstName}! 🎉`);
    setLoading(false);
    handleClose();
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
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Create account</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Step {step} of 2</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-gray-100 dark:bg-slate-800">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-600"
                animate={{ width: step === 1 ? '50%' : '100%' }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-2 p-3 mb-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Step 1: Personal Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                          First name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                          <input
                            type="text" value={form.firstName} onChange={update('firstName')}
                            placeholder="Arjun"
                            className="w-full pl-9 pr-3 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-400 transition text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                          Last name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text" value={form.lastName} onChange={update('lastName')}
                          placeholder="Mehta"
                          className="w-full px-3 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-400 transition text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                        Email address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <input
                          type="email" value={form.email} onChange={update('email')}
                          placeholder="you@example.com"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-400 transition text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                        Phone number <span className="text-gray-400 dark:text-slate-500 font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <input
                          type="tel" value={form.phone} onChange={update('phone')}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-400 transition text-sm"
                        />
                      </div>
                    </div>

                    {/* Account type */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, isHost: false }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          !form.isHost
                            ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40'
                            : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="text-xl mb-1">🧳</div>
                        <div className={`text-sm font-semibold ${!form.isHost ? 'text-rose-600 dark:text-rose-400' : 'text-gray-700 dark:text-slate-300'}`}>Guest</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">Explore & book stays</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, isHost: true }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          form.isHost
                            ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40'
                            : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="text-xl mb-1">🏠</div>
                        <div className={`text-sm font-semibold ${form.isHost ? 'text-rose-600 dark:text-rose-400' : 'text-gray-700 dark:text-slate-300'}`}>Host</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">List your property</div>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all shadow-md"
                    >
                      Continue →
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="step2"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Step 2: Password */}
                    <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                      <p className="text-xs text-gray-500 dark:text-slate-400">Setting password for</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{form.firstName} {form.lastName} · {form.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={form.password} onChange={update('password')}
                          placeholder="Create a strong password"
                          className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-400 transition text-sm"
                        />
                        <button type="button" onClick={() => setShowPass(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition">
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <PasswordStrength password={form.password} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                        Confirm password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <input
                          type={showConf ? 'text' : 'password'}
                          value={form.confirmPassword} onChange={update('confirmPassword')}
                          placeholder="Repeat your password"
                          className={`w-full pl-10 pr-12 py-3 border rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-400 transition text-sm ${
                            form.confirmPassword && form.password !== form.confirmPassword
                              ? 'border-red-400 dark:border-red-600'
                              : form.confirmPassword && form.password === form.confirmPassword
                              ? 'border-green-400 dark:border-green-600'
                              : 'border-gray-200 dark:border-slate-700'
                          }`}
                        />
                        <button type="button" onClick={() => setShowConf(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition">
                          {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {form.confirmPassword && form.password !== form.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                      )}
                      {form.confirmPassword && form.password === form.confirmPassword && (
                        <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Passwords match
                        </p>
                      )}
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox" checked={form.agreeTerms} onChange={update('agreeTerms')}
                        className="mt-0.5 w-4 h-4 accent-rose-500 rounded"
                      />
                      <span className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                        I agree to the{' '}
                        <span className="text-rose-500 font-medium">Terms of Service</span>
                        {' '}and{' '}
                        <span className="text-rose-500 font-medium">Privacy Policy</span>
                      </span>
                    </label>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => { setStep(1); setError(''); }}
                        className="flex-1 py-3 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-semibold rounded-xl hover:border-gray-300 dark:hover:border-slate-600 transition"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-pink-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Creating...
                          </>
                        ) : 'Create Account'}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Switch to Login */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white dark:bg-slate-900 text-xs text-gray-400 dark:text-slate-500">
                    Already have an account?
                  </span>
                </div>
              </div>
              <button
                onClick={() => { handleClose(); onSwitchToLogin(); }}
                className="w-full py-3 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-semibold rounded-xl hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-500 dark:hover:text-rose-400 transition"
              >
                Log in instead
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
