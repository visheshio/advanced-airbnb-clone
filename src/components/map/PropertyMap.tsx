import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatPrice } from '../../utils/formatPrice';

/* ── Exact coordinates for every Indian listing city ── */
const CITY_COORDS: Record<string, [number, number]> = {
  'Goa':            [15.2993, 74.1240],
  'Panaji':         [15.4909, 73.8278],
  'Calangute':      [15.5440, 73.7553],
  'Baga':           [15.5538, 73.7528],
  'Manali':         [32.2396, 77.1887],
  'Kullu':          [31.9579, 77.1095],
  'Kumarakom':      [9.6200,  76.4292],
  'Alleppey':       [9.4981,  76.3388],
  'Havelock Island':[11.9810, 92.9895],
  'Port Blair':     [11.6234, 92.7265],

  'Jodhpur':        [26.2389, 73.0243],
  'Srinagar':       [34.0837, 74.7973],
  'Pahalgam':       [34.0151, 75.3155],
  'Jaisalmer':      [26.9157, 70.9083],
  'Mumbai':         [19.0760, 72.8777],
  'Munnar':         [10.0889, 77.0595],
  'Varkala':        [8.7379,  76.7163],
  'Wayanad':        [11.6854, 76.1320],
  'Coorg':          [12.3375, 75.8069],
  'Ooty':           [11.4102, 76.6950],
  'Udaipur':        [24.5854, 73.7125],
  'Jaipur':         [26.9124, 75.7873],
  'Rishikesh':      [30.0869, 78.2676],
  'Mussoorie':      [30.4598, 78.0664],
  'Darjeeling':     [27.0410, 88.2663],
  'Shimla':         [31.1048, 77.1734],
  'Agra':           [27.1767, 78.0081],
  'Varanasi':       [25.3176, 82.9739],
  'Hampi':          [15.3350, 76.4600],
  'Pushkar':        [26.4899, 74.5511],
  'Mysuru':         [12.2958, 76.6394],
  'Pondicherry':    [11.9416, 79.8083],
};

function getCoords(city: string): [number, number] {
  return CITY_COORDS[city] ?? [20.5937, 78.9629];
}

interface Props {
  city: string;
  state: string;
  country: string;
  address: string;
  title: string;
  price: number; // always in INR
}

declare global {
  interface Window {
    L: typeof import('leaflet');
  }
}

export default function PropertyMap({ city, state, address, title, price }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<ReturnType<typeof window.L.map> | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(!!window.L);
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');
  const { selectedCurrency } = useStore();
  const coords = getCoords(city);

  /* ── Load Leaflet from CDN ── */
  useEffect(() => {
    if (window.L) { setLeafletLoaded(true); return; }
    const link = document.createElement('link');
    link.rel   = 'stylesheet';
    link.href  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script   = document.createElement('script');
    script.src     = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload  = () => setLeafletLoaded(true);
    document.head.appendChild(script);
  }, []);

  /* ── Build / rebuild map whenever Leaflet, mapStyle, city, or currency changes ── */
  useEffect(() => {
    if (!leafletLoaded || !containerRef.current) return;

    const L          = window.L;
    const priceLabel = formatPrice(price, selectedCurrency);

    // Destroy previous instance
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    containerRef.current.innerHTML = '';

    const map = L.map(containerRef.current, {
      center:           coords,
      zoom:             13,
      zoomControl:      true,
      scrollWheelZoom:  false,
      attributionControl: true,
    });

    /* Tile layer */
    const tileUrl = mapStyle === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const attribution = mapStyle === 'satellite'
      ? '© Esri — Source: Esri, Maxar'
      : '© <a href="https://openstreetmap.org">OpenStreetMap</a>';
    L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(map);

    /* Custom price-pin marker */
    const pinHtml = [
      '<div style="position:relative;display:flex;flex-direction:column;align-items:center;">',
        '<div style="background:linear-gradient(135deg,#f43f5e,#ec4899);color:white;',
        'border-radius:12px;padding:6px 12px;font-weight:700;font-size:13px;',
        'white-space:nowrap;box-shadow:0 4px 16px rgba(244,63,94,0.45);',
        'border:2px solid white;font-family:system-ui,sans-serif;cursor:pointer;">',
          priceLabel + '/night',
        '</div>',
        '<div style="width:0;height:0;border-left:8px solid transparent;',
        'border-right:8px solid transparent;border-top:10px solid #f43f5e;margin-top:-1px;"></div>',
        '<div style="width:8px;height:8px;background:#f43f5e;border-radius:50%;margin-top:2px;',
        'box-shadow:0 0 0 4px rgba(244,63,94,0.25);animation:pulse-ring 2s ease-out infinite;"></div>',
      '</div>',
    ].join('');

    const pinIcon = L.divIcon({
      className: '',
      html:      pinHtml,
      iconSize:  [140, 62],
      iconAnchor:[70, 60],
    });

    /* Popup html */
    const popupHtml = [
      '<div style="padding:4px 0;min-width:200px;font-family:system-ui,sans-serif;">',
        '<p style="font-weight:700;font-size:13px;color:#111;margin:0 0 4px 0;line-height:1.3">' + title + '</p>',
        '<p style="color:#6b7280;font-size:12px;margin:0 0 6px 0">' + address + ', ' + city + '</p>',
        '<p style="font-weight:700;color:#f43f5e;font-size:14px;margin:0">' + priceLabel +
          '<span style="font-weight:400;color:#9ca3af;font-size:11px">/night</span></p>',
      '</div>',
    ].join('');

    L.marker(coords, { icon: pinIcon })
      .addTo(map)
      .bindPopup(popupHtml, { offset: [0, -52], closeButton: false, className: 'property-popup' })
      .openPopup();

    /* Neighbourhood circle */
    L.circle(coords, {
      radius:      500,
      color:       '#f43f5e',
      fillColor:   '#f43f5e',
      fillOpacity: 0.08,
      weight:      1.5,
      dashArray:   '6 4',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [leafletLoaded, mapStyle, city, price, selectedCurrency]); // eslint-disable-line

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold dark:text-slate-100 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-rose-500" />
          Where you'll be
        </h2>

        <div className="flex items-center gap-2">
          {/* Street / Satellite toggle */}
          <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-semibold">
            {(['street', 'satellite'] as const).map((style) => (
              <button
                key={style}
                onClick={() => setMapStyle(style)}
                className={`px-3 py-1.5 rounded-lg capitalize transition ${
                  mapStyle === style
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 shadow-sm'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          {/* Open in Google Maps */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Google Maps
          </a>
        </div>
      </div>

      {/* Map container */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-xl">
        {/* Pulse-ring keyframe */}
        <style>{`
          @keyframes pulse-ring {
            0%   { box-shadow: 0 0 0 0 rgba(244,63,94,0.5); }
            70%  { box-shadow: 0 0 0 14px rgba(244,63,94,0); }
            100% { box-shadow: 0 0 0 0 rgba(244,63,94,0); }
          }
          .property-popup .leaflet-popup-content-wrapper {
            border-radius: 12px !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.18) !important;
            padding: 12px !important;
          }
          .property-popup .leaflet-popup-tip { background: white !important; }
        `}</style>

        {/* Leaflet div */}
        <div
          ref={containerRef}
          style={{ height: '420px', width: '100%' }}
          className="bg-slate-100 dark:bg-slate-800"
        />

        {/* Loading state */}
        {!leafletLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Loading map…</p>
          </div>
        )}

        {/* Scroll-zoom toggle button */}
        <div className="absolute bottom-4 right-4 z-[999]">
          <button
            onClick={() => {
              if (!mapRef.current) return;
              if (mapRef.current.scrollWheelZoom.enabled()) {
                mapRef.current.scrollWheelZoom.disable();
              } else {
                mapRef.current.scrollWheelZoom.enable();
              }
            }}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-lg px-3 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 flex items-center gap-1.5 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
          >
            <Navigation className="w-3.5 h-3.5 text-rose-500" />
            Enable scroll zoom
          </button>
        </div>
      </div>

      {/* Address info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
        <div>
          <p className="font-bold text-gray-900 dark:text-slate-100">{city}, {state}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {address} · Exact location provided after booking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-full text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            {city}
          </div>
          <span className="text-xs text-gray-500 dark:text-slate-400">95% guests ★ location 5/5</span>
        </div>
      </div>
    </div>
  );
}
