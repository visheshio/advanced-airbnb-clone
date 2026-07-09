import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, BellOff } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ isOpen, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={onClose}
        className={`relative p-2 rounded-full transition-all duration-200 hidden md:flex items-center justify-center
          ${isOpen
            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500'
            : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-slate-100 text-base">
                Notifications
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <BellOff className="w-7 h-7 text-gray-400 dark:text-slate-500" />
              </div>
              <p className="text-gray-800 dark:text-slate-200 font-semibold text-sm mb-1">
                No notifications yet
              </p>
              <p className="text-gray-400 dark:text-slate-500 text-xs leading-relaxed">
                When you get booking requests, messages, or reviews — they'll show up here.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
