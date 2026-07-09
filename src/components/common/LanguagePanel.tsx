import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, X, ChevronDown } from 'lucide-react';
import { useStore, CURRENCIES } from '../../store/useStore';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LanguagePanel({ isOpen, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { selectedCurrency, setCurrency } = useStore();
  const [draftCurrency, setDraftCurrency] = useState(selectedCurrency);

  /* Sync draft whenever panel opens */
  useEffect(() => {
    if (isOpen) setDraftCurrency(selectedCurrency);
  }, [isOpen, selectedCurrency]);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  const hasChanges = draftCurrency !== selectedCurrency;

  const handleSave = () => {
    if (!hasChanges) {
      toast('No changes made.', { icon: 'ℹ️' });
      onClose();
      return;
    }
    const info = CURRENCIES.find((c) => c.code === draftCurrency);
    setCurrency(draftCurrency);
    toast.success(`Currency changed to ${info?.flag} ${info?.symbol} ${info?.code}`, {
      duration: 3000,
    });
    onClose();
  };

  const activeCurrency = CURRENCIES.find((c) => c.code === selectedCurrency);
  const draftInfo      = CURRENCIES.find((c) => c.code === draftCurrency);

  return (
    <div className="relative" ref={ref}>
      {/* Globe trigger button */}
      <button
        onClick={onClose}
        className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all duration-200
          ${isOpen
            ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-800 text-rose-500'
            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-sm'
          }`}
        title="Select Currency"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-semibold">{activeCurrency?.symbol}</span>
        <span className="text-xs text-gray-400 dark:text-slate-500">{activeCurrency?.code}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-14 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm">
                  Select Currency
                </h3>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                  Prices shown in selected currency
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active currency pill */}
            <div className="px-5 py-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">Current:</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-600 text-xs font-semibold text-gray-700 dark:text-slate-200">
                <span>{activeCurrency?.flag}</span>
                <span>{activeCurrency?.symbol} {activeCurrency?.code}</span>
              </div>
              {hasChanges && (
                <>
                  <span className="text-xs text-gray-400 dark:text-slate-500">→</span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 rounded-full border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    <span>{draftInfo?.flag}</span>
                    <span>{draftInfo?.symbol} {draftInfo?.code}</span>
                  </div>
                </>
              )}
            </div>

            {/* Currency list */}
            <div className="max-h-64 overflow-y-auto py-1.5">
              {CURRENCIES.map((currency) => {
                const isSelected = draftCurrency === currency.code;
                const isSaved    = selectedCurrency === currency.code;

                return (
                  <button
                    key={currency.code}
                    onClick={() => setDraftCurrency(currency.code)}
                    className={`w-full flex items-center justify-between px-5 py-3 text-sm transition-colors duration-150
                      ${isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/30'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                  >
                    {/* Left: flag + name */}
                    <div className="flex items-center gap-3">
                      <span className="text-xl leading-none">{currency.flag}</span>
                      <div className="text-left">
                        <p className={`font-semibold leading-tight ${
                          isSelected
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-gray-800 dark:text-slate-200'
                        }`}>
                          {currency.label}
                        </p>
                        <p className={`text-xs leading-tight mt-0.5 ${
                          isSelected
                            ? 'text-rose-400 dark:text-rose-500'
                            : 'text-gray-400 dark:text-slate-500'
                        }`}>
                          {currency.code} · {currency.symbol}
                          {currency.code !== 'INR' && (
                            <span className="ml-1 opacity-75">
                              · 1 INR ={' '}
                              {currency.rate < 1
                                ? currency.rate.toFixed(4)
                                : currency.rate.toFixed(2)}{' '}
                              {currency.code}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Right: saved label or checkmark */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {isSaved && !isSelected && (
                        <span className="text-xs text-gray-400 dark:text-slate-500 italic">
                          active
                        </span>
                      )}
                      {isSelected && (
                        <span className="flex items-center justify-center w-5 h-5 bg-rose-500 rounded-full">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/30 flex gap-2.5">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition
                  ${hasChanges
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200 dark:shadow-rose-900/30'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                  }`}
              >
                {hasChanges ? '✓ Apply' : 'No Changes'}
              </button>
            </div>

            {/* Footer note */}
            <div className="px-5 pb-3 text-center">
              <p className="text-xs text-gray-400 dark:text-slate-600">
                🌐 Language: English (only)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
