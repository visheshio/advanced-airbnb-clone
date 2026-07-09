import { useState } from 'react';
import AuthGate from '../components/common/AuthGate';
import {
  User, Mail, Phone, Shield, Bell, CreditCard,
  ChevronRight, Check, Star, Award, Camera, Edit3,
  Lock, Eye, EyeOff, Smartphone, Globe, AlertCircle,
  CheckCircle, Clock, Home, Calendar, Heart
} from 'lucide-react';
import { useStore } from '../store/useStore';

const TABS = [
  { id: 'personal', label: 'Personal info', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'payments', label: 'Payments', icon: CreditCard },
];

export default function ProfilePage() {
  const { user, login, myListings, reservations } = useStore();

  if (!user) return <AuthGate title="Sign in to view your profile" subtitle="Log in to manage your personal details, preferences, and account settings." />;
  const [activeTab, setActiveTab] = useState('personal');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  // Personal info form — pre-filled from real user store
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    city: 'Mumbai',
    country: 'India',
  });

  // Security form
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

  // Notifications toggles — real state, persisted to user actions
  const [notifs, setNotifs] = useState({
    emailBooking: true,
    emailMessages: true,
    emailReviews: true,
    pushBooking: true,
    pushMessages: true,
    pushReviews: false,
    smsBooking: false,
    smsMessages: false,
  });

  if (!user) return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
      <p className="text-gray-500 dark:text-slate-400">Please log in to view your profile.</p>
    </div>
  );

  // Real stats derived from actual store data
  const totalTrips = reservations.length;
  const completedTrips = reservations.filter(r => r.status === 'completed').length;
  const totalListings = myListings.length;
  const memberSince = '2024'; // default for demo user

  const handleSavePersonal = async () => {
    if (!form.firstName.trim() || !form.email.trim()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 800)); // simulate save
    // Update store user with new name/email
    login({ ...user, firstName: form.firstName, lastName: form.lastName, email: form.email }, 'dummy-token');
    setSaving(false);
    setSaved(true);
    setEditingField(null);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSavePassword = () => {
    setPwError('');
    if (!pwForm.current) { setPwError('Enter your current password'); return; }
    if (pwForm.newPw.length < 8) { setPwError('New password must be at least 8 characters'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match'); return; }
    setPwSaved(true);
    setPwForm({ current: '', newPw: '', confirm: '' });
    setTimeout(() => setPwSaved(false), 3000);
  };

  const inputClass = (editing?: boolean) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-rose-300
    ${editing
      ? 'border-rose-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100'
      : 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-slate-100'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">

        {/* ── Page Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Account</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            {user.firstName} {user.lastName} · {user.email}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar ── */}
          <div className="lg:w-72 flex-shrink-0 space-y-4">

            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-5">
                <div className="relative mb-3">
                  <img
                    src={user.profileImage}
                    alt={user.firstName}
                    className="w-20 h-20 rounded-full object-cover bg-gray-100 dark:bg-slate-800 ring-4 ring-rose-100 dark:ring-rose-900/40"
                  />
                  <button className="absolute bottom-0 right-0 w-7 h-7 bg-gray-900 dark:bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-rose-500 transition shadow-md">
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  {user.firstName} {user.lastName}
                </h2>
                {user.isHost && (
                  <div className="flex items-center gap-1 text-rose-500 text-xs font-semibold mt-1">
                    <Award className="w-3.5 h-3.5" /> Superhost
                  </div>
                )}
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                  Member since {memberSince}
                </p>
              </div>

              {/* Real Stats from store */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { label: 'Trips', value: totalTrips, icon: Calendar },
                  { label: 'Properties', value: totalListings, icon: Home },
                  { label: 'Reviews', value: completedTrips, icon: Star },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="text-center bg-gray-50 dark:bg-slate-800 rounded-xl p-2.5">
                    <Icon className="w-4 h-4 text-gray-400 dark:text-slate-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{value}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{label}</p>
                  </div>
                ))}
              </div>

              {/* Verification Status */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Verifications
                </p>
                {[
                  { label: 'Email address', verified: true, icon: Mail },
                  { label: 'Phone number', verified: false, icon: Phone },
                  { label: 'Government ID', verified: false, icon: Shield },
                ].map(({ label, verified, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                      <Icon className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                      {label}
                    </div>
                    {verified ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : (
                      <button className="text-xs text-rose-500 hover:text-rose-600 font-medium underline transition">
                        Add
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium transition border-b border-gray-50 dark:border-slate-800 last:border-0
                    ${activeTab === id
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    {label}
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              ))}
            </div>

            {/* Host CTA */}
            {!user.isHost && (
              <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-5 text-white">
                <Home className="w-8 h-8 mb-3 opacity-80" />
                <h3 className="font-bold mb-1">Become a Host</h3>
                <p className="text-xs opacity-80 mb-3">
                  List your property and start earning with HomeRental
                </p>
                <button className="w-full py-2 bg-white text-rose-600 rounded-xl text-sm font-semibold hover:bg-rose-50 transition">
                  Get started
                </button>
              </div>
            )}
          </div>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">

            {/* ── Personal Info Tab ── */}
            {activeTab === 'personal' && (
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Personal Information</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                      Update your name, email, and other personal details
                    </p>
                  </div>
                  {saved && (
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-4 h-4" /> Saved!
                    </span>
                  )}
                </div>

                <div className="space-y-5">
                  {/* Name Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">First name</label>
                        <button
                          onClick={() => setEditingField(editingField === 'firstName' ? null : 'firstName')}
                          className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          {editingField === 'firstName' ? 'Cancel' : 'Edit'}
                        </button>
                      </div>
                      <input
                        value={form.firstName}
                        onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                        readOnly={editingField !== 'firstName'}
                        className={inputClass(editingField === 'firstName')}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Last name</label>
                        <button
                          onClick={() => setEditingField(editingField === 'lastName' ? null : 'lastName')}
                          className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          {editingField === 'lastName' ? 'Cancel' : 'Edit'}
                        </button>
                      </div>
                      <input
                        value={form.lastName}
                        onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                        readOnly={editingField !== 'lastName'}
                        className={inputClass(editingField === 'lastName')}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Email address</label>
                      <button
                        onClick={() => setEditingField(editingField === 'email' ? null : 'email')}
                        className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        {editingField === 'email' ? 'Cancel' : 'Edit'}
                      </button>
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                        readOnly={editingField !== 'email'}
                        className={inputClass(editingField === 'email') + ' pl-10'}
                      />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                      ✓ Verified — used for booking confirmations and account notifications
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Phone number</label>
                      <button
                        onClick={() => setEditingField(editingField === 'phone' ? null : 'phone')}
                        className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        {editingField === 'phone' ? 'Cancel' : 'Add'}
                      </button>
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                        readOnly={editingField !== 'phone'}
                        placeholder="Add your phone number"
                        className={inputClass(editingField === 'phone') + ' pl-10'}
                      />
                    </div>
                    {!form.phone && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Add a phone number to improve account security
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">City</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <input
                          value={form.city}
                          onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                          placeholder="Your city"
                          className={inputClass(true) + ' pl-10'}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Country</label>
                      <select
                        value={form.country}
                        onChange={(e) => setForm(f => ({ ...f, country: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-300"
                      >
                        <option value="India">India</option>
                        <option value="UAE">UAE</option>
                        <option value="Singapore">Singapore</option>
                        <option value="UK">United Kingdom</option>
                        <option value="USA">United States</option>
                      </select>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">About me</label>
                    <textarea
                      rows={3}
                      value={form.bio}
                      onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                      placeholder="Tell hosts and guests a little about yourself — your interests, travel style, what you love about India..."
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none transition"
                    />
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{form.bio.length}/500 characters</p>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleSavePersonal}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition disabled:opacity-60"
                    >
                      {saving ? (
                        <><Clock className="w-4 h-4 animate-spin" /> Saving...</>
                      ) : saved ? (
                        <><Check className="w-4 h-4" /> Saved!</>
                      ) : (
                        'Save changes'
                      )}
                    </button>
                    <p className="text-xs text-gray-400 dark:text-slate-500">
                      Changes will update your profile across all listings
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Security Tab ── */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                {/* Change Password */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-1">Change Password</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
                    Use a strong password with at least 8 characters
                  </p>

                  {pwSaved && (
                    <div className="mb-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3 rounded-xl text-sm font-medium">
                      <CheckCircle className="w-4 h-4" /> Password updated successfully!
                    </div>
                  )}
                  {pwError && (
                    <div className="mb-4 flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-4 py-3 rounded-xl text-sm">
                      <AlertCircle className="w-4 h-4" /> {pwError}
                    </div>
                  )}

                  <div className="space-y-4">
                    {[
                      { key: 'current', label: 'Current password', placeholder: 'Enter current password' },
                      { key: 'newPw', label: 'New password', placeholder: 'Enter new password (8+ chars)' },
                      { key: 'confirm', label: 'Confirm new password', placeholder: 'Re-enter new password' },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{label}</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={pwForm[key as keyof typeof pwForm]}
                            onChange={(e) => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                            placeholder={placeholder}
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-300 transition"
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={handleSavePassword}
                      className="px-6 py-2.5 bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:bg-gray-700 dark:hover:bg-white transition"
                    >
                      Update password
                    </button>
                  </div>
                </div>

                {/* 2FA & Sessions */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-5">Security Settings</h2>
                  <div className="space-y-3">
                    {[
                      {
                        icon: Smartphone,
                        iconBg: 'bg-blue-50 dark:bg-blue-900/30',
                        iconColor: 'text-blue-600 dark:text-blue-400',
                        title: 'Two-factor authentication',
                        sub: 'Add extra security — require a code when signing in',
                        action: 'Enable',
                        actionStyle: 'text-rose-500 hover:text-rose-600',
                      },
                      {
                        icon: Globe,
                        iconBg: 'bg-purple-50 dark:bg-purple-900/30',
                        iconColor: 'text-purple-600 dark:text-purple-400',
                        title: 'Active sessions',
                        sub: 'Signed in on this device. No other active sessions.',
                        action: 'View all',
                        actionStyle: 'text-rose-500 hover:text-rose-600',
                      },
                      {
                        icon: Shield,
                        iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
                        iconColor: 'text-emerald-600 dark:text-emerald-400',
                        title: 'Account privacy',
                        sub: 'Control who can see your profile and listings',
                        action: 'Manage',
                        actionStyle: 'text-rose-500 hover:text-rose-600',
                      },
                    ].map(({ icon: Icon, iconBg, iconColor, title, sub, action, actionStyle }) => (
                      <div key={title} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${iconColor}`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-slate-100">{title}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{sub}</p>
                          </div>
                        </div>
                        <button className={`text-sm font-medium hover:underline transition ${actionStyle}`}>{action}</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">Danger Zone</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                    Once you delete your account, there is no going back. All your data, listings, and bookings will be permanently removed.
                  </p>
                  <button className="px-5 py-2.5 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 transition">
                    Delete my account
                  </button>
                </div>
              </div>
            )}

            {/* ── Notifications Tab ── */}
            {activeTab === 'notifications' && (
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-1">Notification Preferences</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                  Choose how and when you want to be notified
                </p>

                {[
                  {
                    category: 'Email Notifications',
                    icon: Mail,
                    items: [
                      { key: 'emailBooking', label: 'Booking confirmations', sub: 'When a booking is confirmed or cancelled' },
                      { key: 'emailMessages', label: 'New messages', sub: 'When a host or guest sends you a message' },
                      { key: 'emailReviews', label: 'Reviews & ratings', sub: 'When someone leaves you a review' },
                    ],
                  },
                  {
                    category: 'Push Notifications',
                    icon: Bell,
                    items: [
                      { key: 'pushBooking', label: 'Booking alerts', sub: 'Instant alerts for new bookings' },
                      { key: 'pushMessages', label: 'Message alerts', sub: 'Instant alerts for new messages' },
                      { key: 'pushReviews', label: 'Review alerts', sub: 'When you receive a new review' },
                    ],
                  },
                  {
                    category: 'SMS Notifications',
                    icon: Smartphone,
                    items: [
                      { key: 'smsBooking', label: 'Booking SMS', sub: 'Text message for important booking updates' },
                      { key: 'smsMessages', label: 'Message SMS', sub: 'Text message when you receive a new message' },
                    ],
                  },
                ].map(({ category, icon: Icon, items }) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">{category}</h3>
                    </div>
                    <div className="space-y-2">
                      {items.map(({ key, label, sub }) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{label}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{sub}</p>
                          </div>
                          <button
                            onClick={() => setNotifs(n => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                            className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                              notifs[key as keyof typeof notifs] ? 'bg-rose-500' : 'bg-gray-200 dark:bg-slate-600'
                            }`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                              notifs[key as keyof typeof notifs] ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <button className="mt-2 px-6 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition">
                  Save preferences
                </button>
              </div>
            )}

            {/* ── Payments Tab ── */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                {/* Payment Methods */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-1">Payment Methods</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
                    Manage your saved payment methods for bookings
                  </p>

                  {/* No saved payments for new users — real empty state */}
                  <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl mb-4">
                    <CreditCard className="w-10 h-10 text-gray-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">No payment methods saved yet</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 mb-4">
                      Add a card to make booking faster and easier
                    </p>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition">
                      + Add payment method
                    </button>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">🔒 Secure payments</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      We use industry-standard encryption. Your payment details are never stored on our servers.
                    </p>
                  </div>
                </div>

                {/* Payout Methods (for hosts) */}
                {user.isHost && (
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-1">Payout Methods</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
                      Add a bank account or UPI ID to receive your hosting earnings
                    </p>

                    <div className="space-y-3 mb-4">
                      {[
                        { label: 'Bank Transfer (NEFT/IMPS)', desc: 'Direct transfer to your Indian bank account', icon: '🏦' },
                        { label: 'UPI', desc: 'Instant transfer via UPI ID (PhonePe, GPay, Paytm)', icon: '📱' },
                        { label: 'PayPal', desc: 'For international payouts', icon: '💳' },
                      ].map(({ label, desc, icon }) => (
                        <button
                          key={label}
                          className="w-full flex items-center gap-4 p-4 border border-gray-200 dark:border-slate-600 rounded-xl hover:border-rose-300 dark:hover:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition text-left"
                        >
                          <span className="text-2xl">{icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900 dark:text-slate-100">{label}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{desc}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        </button>
                      ))}
                    </div>

                    {/* Earnings summary from real data */}
                    {myListings.length > 0 && (
                      <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-xl p-4">
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                          💰 Your earnings potential
                        </p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">
                          ₹{myListings.reduce((sum, l) => sum + l.price * 15, 0).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                          Estimated monthly earnings across {myListings.length} listing{myListings.length > 1 ? 's' : ''} (at 50% occupancy)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Transaction History */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-1">Transaction History</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">Your booking payments and payouts</p>

                  {reservations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Heart className="w-8 h-8 text-gray-300 dark:text-slate-600 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-slate-400">No transactions yet</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                        Your booking payments will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reservations.map((res) => (
                        <div key={res.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700 last:border-0">
                          <div className="flex items-center gap-3">
                            <img
                              src={res.listing.images[0]}
                              alt={res.listing.title}
                              className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-slate-700"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-slate-100 line-clamp-1">
                                {res.listing.title}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-slate-500">
                                {res.checkIn} → {res.checkOut}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900 dark:text-slate-100">
                              ₹{res.totalPrice.toLocaleString('en-IN')}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              res.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                              : res.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                            }`}>
                              {res.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
