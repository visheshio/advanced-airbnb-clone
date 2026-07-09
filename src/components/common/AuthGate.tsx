import { LogIn, UserPlus, Home } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface Props {
  title?: string;
  subtitle?: string;
}

export default function AuthGate({
  title = 'Sign in to continue',
  subtitle = 'Create an account or log in to access this page.',
}: Props) {
  const { setLoginModal, setRegisterModal } = useStore();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        {/* Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-950/50 dark:to-pink-950/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Home className="w-10 h-10 text-rose-500 dark:text-rose-400" />
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          {title}
        </h2>
        <p className="text-gray-500 dark:text-slate-400 mb-8 leading-relaxed">
          {subtitle}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setLoginModal(true)}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all shadow-md hover:shadow-rose-200 dark:hover:shadow-rose-900"
          >
            <LogIn className="w-4 h-4" />
            Log In
          </button>
          <button
            onClick={() => setRegisterModal(true)}
            className="flex items-center justify-center gap-2 px-8 py-3 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-semibold rounded-xl hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-500 dark:hover:text-rose-400 transition"
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </button>
        </div>

        {/* Demo hint */}
        <p className="mt-6 text-xs text-gray-400 dark:text-slate-500">
          Demo: <span className="font-mono bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-slate-300">host@demo.in</span>
          {' '}or{' '}
          <span className="font-mono bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-slate-300">guest@demo.in</span>
          {' '}· password: <span className="font-mono bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-slate-300">demo1234</span>
        </p>
      </div>
    </div>
  );
}
