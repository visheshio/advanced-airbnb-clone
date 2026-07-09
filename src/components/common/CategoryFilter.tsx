import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../../data/mockData';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';

export default function CategoryFilter() {
  const { selectedCategory, setSelectedCategory, filterListings } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    setCanScrollLeft(scrollRef.current.scrollLeft > 0);
    setCanScrollRight(
      scrollRef.current.scrollLeft < scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 1
    );
  };

  useEffect(() => { checkScroll(); }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  const handleCategory = (id: string) => {
    const newCat = selectedCategory === id ? '' : id;
    setSelectedCategory(newCat);
    filterListings();
  };

  return (
    <div className="relative flex items-center bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-full p-1.5 shadow-md hover:shadow-lg transition ml-2"
        >
          <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-slate-300" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-8 py-2 w-full"
      >
        <CategoryBtn
          icon="🌏"
          label="All"
          active={selectedCategory === ''}
          onClick={() => { setSelectedCategory(''); filterListings(); }}
        />
        {CATEGORIES.map((cat) => (
          <CategoryBtn
            key={cat.id}
            icon={cat.icon}
            label={cat.label}
            active={selectedCategory === cat.id}
            onClick={() => handleCategory(cat.id)}
          />
        ))}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-full p-1.5 shadow-md hover:shadow-lg transition mr-2"
        >
          <ChevronRight className="w-4 h-4 text-gray-700 dark:text-slate-300" />
        </button>
      )}
    </div>
  );
}

function CategoryBtn({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex-shrink-0 group`}
    >
      <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
      <span className={`text-xs font-semibold transition-colors ${
        active ? 'text-gray-900 dark:text-slate-100' : 'text-gray-500 dark:text-slate-400 group-hover:text-gray-800 dark:group-hover:text-slate-200'
      }`}>
        {label}
      </span>
      {active && (
        <motion.div
          layoutId="category-underline"
          className="absolute bottom-0 left-3 right-3 h-0.5 bg-gray-900 dark:bg-slate-100 rounded-full"
        />
      )}
    </motion.button>
  );
}
