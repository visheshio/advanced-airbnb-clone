import { Home, Github, Twitter, Instagram, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 mt-12 pb-20 md:pb-0 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-gradient font-black text-xl">HomeRental</span>
            </div>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
              Discover unique stays across India — from Goa beaches to Himalayan retreats. Your perfect Indian getaway awaits.
            </p>
            <div className="space-y-2 text-sm text-gray-500 dark:text-slate-400 mb-4">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-500" /> Mumbai, Maharashtra, India</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-rose-500" /> +91 98765 43210</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-rose-500" /> support@homerental.in</div>
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-rose-100 hover:text-rose-500 dark:hover:bg-rose-950 transition">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-blue-100 hover:text-blue-500 dark:hover:bg-blue-950 transition">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-pink-100 hover:text-pink-500 dark:hover:bg-pink-950 transition">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 dark:text-slate-200 mb-4">Support</h3>
            <ul className="space-y-2.5 text-sm text-gray-500 dark:text-slate-400">
              {['Help Centre', 'Safety Information', 'Cancellation Policy', 'Report a Concern', 'COVID Guidelines'].map(item => (
                <li key={item}><a href="#" className="hover:text-rose-500 transition">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 dark:text-slate-200 mb-4">Community</h3>
            <ul className="space-y-2.5 text-sm text-gray-500 dark:text-slate-400">
              {['Refer a Friend', 'Gift Cards', 'Blog & Stories', 'Diversity & Belonging', 'Accessibility'].map(item => (
                <li key={item}><a href="#" className="hover:text-rose-500 transition">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 dark:text-slate-200 mb-4">Host with Us</h3>
            <ul className="space-y-2.5 text-sm text-gray-500 dark:text-slate-400">
              {['List Your Property', 'Host Resources', 'Community Forum', 'Host Dashboard', 'Superhost Program'].map(item => (
                <li key={item}><a href="#" className="hover:text-rose-500 transition">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            © 2024 HomeRental India Pvt. Ltd. · All rights reserved
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
            <span className="px-3 py-1 bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 rounded-full font-semibold text-xs">🇮🇳 Made in India</span>
            <a href="#" className="hover:text-rose-500 transition">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:text-rose-500 transition">Terms</a>
            <span>·</span>
            <a href="#" className="hover:text-rose-500 transition">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
