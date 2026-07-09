import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Listing } from '../../data/mockData';

/* ─── Indian city coordinates ─────────────────────────────────── */
const CITY_COORDS: Record<string, [number, number]> = {
  'Goa': [15.2993, 74.1240],
  'Panaji': [15.4909, 73.8278],
  'Calangute': [15.5440, 73.7553],
  'Manali': [32.2396, 77.1887],
  'Kullu': [31.9579, 77.1095],
  'Kumarakom': [9.6200, 76.4292],
  'Alleppey': [9.4981, 76.3388],
  'Havelock Island': [11.9810, 92.9895],
  'Port Blair': [11.6234, 92.7265],

  'Jodhpur': [26.2389, 73.0243],
  'Srinagar': [34.0837, 74.7973],
  'Pahalgam': [34.0151, 75.3155],
  'Jaisalmer': [26.9157, 70.9083],
  'Mumbai': [19.0760, 72.8777],
  'Munnar': [10.0889, 77.0595],
  'Varkala': [8.7379, 76.7163],
  'Wayanad': [11.6854, 76.1320],
  'Coorg': [12.3375, 75.8069],
  'Ooty': [11.4102, 76.6950],
  'Udaipur': [24.5854, 73.7125],
  'Jaipur': [26.9124, 75.7873],
  'Rishikesh': [30.0869, 78.2676],
  'Mussoorie': [30.4598, 78.0664],
  'Darjeeling': [27.0410, 88.2663],
  'Shimla': [31.1048, 77.1734],
  'Agra': [27.1767, 78.0081],
  'Varanasi': [25.3176, 82.9739],
  'Hampi': [15.3350, 76.4600],
  'Pushkar': [26.4899, 74.5511],
  'Mysuru': [12.2958, 76.6394],
  'Pondicherry': [11.9416, 79.8083],
};

function getCoords(city: string): [number, number] {
  return CITY_COORDS[city] ?? [20.5937, 78.9629];
}

interface Props {
  listings: Listing[];
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}

interface MapState {
  map: unknown;
  markers: unknown[];
}

declare global {
  interface Window {
    L: typeof import('leaflet');
    _leafletMapInstance?: unknown;
  }
}

export default function ListingsMap({ listings, selectedId, onSelect }: Props) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapState | null>(null);
  const [popupListing, setPopupListing] = useState<Listing | null>(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  /* ── Load Leaflet dynamically (avoids SSR / bundler issues) ─── */
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);
  }, []);

  /* ── Build / rebuild map whenever listings or leaflet changes ── */
  useEffect(() => {
    if (!leafletLoaded || !containerRef.current) return;

    const L = window.L;

    // Destroy previous map instance
    if (mapRef.current) {
      (mapRef.current.map as ReturnType<typeof L.map>).remove();
      mapRef.current = null;
    }

    // Clear container
    containerRef.current.innerHTML = '';

    // Create map
    const map = L.map(containerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const markers: ReturnType<typeof L.marker>[] = [];

    listings.forEach((listing) => {
      const coords = getCoords(listing.location.city);
      const priceK = listing.price >= 1000
        ? `₹${(listing.price / 1000).toFixed(0)}k`
        : `₹${listing.price}`;

      const isActive = selectedId === listing.id;

      const icon = L.divIcon({
        className: '',
        html: `<div class="price-marker${isActive ? ' active' : ''}" data-id="${listing.id}">${priceK}</div>`,
        iconSize: [72, 32],
        iconAnchor: [36, 16],
      });

      const marker = L.marker(coords, { icon })
        .addTo(map)
        .on('click', (e: { originalEvent: MouseEvent }) => {
          const rect = containerRef.current!.getBoundingClientRect();
          setPopupPos({
            x: e.originalEvent.clientX - rect.left,
            y: e.originalEvent.clientY - rect.top,
          });
          setPopupListing((prev) => (prev?.id === listing.id ? null : listing));
          onSelect?.(listing.id === selectedId ? null : listing.id);
        });

      markers.push(marker);
    });

    mapRef.current = { map, markers };

    // Fit bounds if listings exist
    if (listings.length > 0) {
      const coords = listings.map((l) => getCoords(l.location.city));
      if (coords.length === 1) {
        map.setView(coords[0], 10);
      } else {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10 });
      }
    }

    // Close popup when clicking map
    map.on('click', () => {
      setPopupListing(null);
    });

    return () => {
      if (mapRef.current) {
        (mapRef.current.map as ReturnType<typeof L.map>).remove();
        mapRef.current = null;
      }
    };
  }, [leafletLoaded, listings, selectedId]); // eslint-disable-line

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Map container */}
      <div
        ref={containerRef}
        className="w-full h-full rounded-2xl overflow-hidden shadow-xl bg-slate-100"
        style={{ minHeight: '500px' }}
      />

      {/* Loading overlay */}
      {!leafletLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Loading map…</p>
          </div>
        </div>
      )}

      {/* Custom popup */}
      {popupListing && (
        <div
          className="absolute z-[1000] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden w-56 border border-gray-100 dark:border-slate-700"
          style={{
            left: Math.min(popupPos.x, (containerRef.current?.clientWidth ?? 400) - 240),
            top: popupPos.y - 230,
            transform: 'translateX(-50%)',
          }}
        >
          <img
            src={popupListing.images[0] || 'https://placehold.co/600x400?text=No+Image'}
            alt={popupListing.title}
            className="w-full h-32 object-cover cursor-pointer"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image';
            }}
            onClick={() => navigate(`/listings/${popupListing.id}`)}
          />
          <div className="p-3">
            <p
              className="font-bold text-sm text-gray-900 dark:text-slate-100 line-clamp-1 cursor-pointer hover:text-rose-500 transition"
              onClick={() => navigate(`/listings/${popupListing.id}`)}
            >
              {popupListing.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1.5">
              {popupListing.location.city}, {popupListing.location.state}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-gray-900 dark:text-slate-100">
                ₹{popupListing.price.toLocaleString('en-IN')}
                <span className="font-normal text-gray-500 text-xs">/night</span>
              </span>
              <div className="flex items-center gap-0.5 text-xs font-semibold text-gray-700 dark:text-slate-300">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {popupListing.averageRating.toFixed(1)}
              </div>
            </div>
          </div>
          {/* Close button */}
          <button
            onClick={() => setPopupListing(null)}
            className="absolute top-2 right-2 w-6 h-6 bg-black/40 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/60 transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-slate-900 rounded-xl shadow-lg px-3 py-2 text-xs font-medium text-gray-600 dark:text-slate-300 z-[999] pointer-events-none">
        📍 {listings.length} properties shown
      </div>
    </div>
  );
}
