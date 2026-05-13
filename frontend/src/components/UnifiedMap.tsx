import { useState } from 'react';
import { motion } from 'framer-motion';
import Map, { Source, Layer, Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAlerts } from '../hooks/useAlerts';
import { AlertCircle, Wifi, WifiOff, Layers } from 'lucide-react';

const MAP_STYLES = [
  { id: 'dark', label: 'Dark', url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' },
  { id: 'street', label: 'Street', url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json' },
  { id: 'positron', label: 'Light', url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json' },
] as const;

type StyleId = typeof MAP_STYLES[number]['id'];

export default function UnifiedMap() {
  const [layerVisibility, setLayerVisibility] = useState({
    incidents: true,
    sos: true,
    facilities: true,
    resources: true
  });
  const [activeStyle, setActiveStyle] = useState<StyleId>('dark');
  const { alerts, loading, error, syncStatus, lastSyncedAt } = useAlerts();

  const currentStyle = MAP_STYLES.find(s => s.id === activeStyle)!;

  const [viewState, setViewState] = useState({
    longitude: 78.6569,
    latitude: 11.1271,
    zoom: 7,
    pitch: 0,
    bearing: 0
  });

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-xl overflow-hidden">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={currentStyle.url}
      >
        <NavigationControl position="bottom-right" />

        {/* Alert markers */}
        {alerts.map((alert: any, i: number) => (
          <Marker
            key={`alert-${alert.id}`}
            longitude={78.6569 + (Math.random() - 0.5) * 2}
            latitude={11.1271 + (Math.random() - 0.5) * 2}
            anchor="center"
          >
            <div
              className="rounded-full border-2 border-white shadow-lg"
              style={{
                width: 12, height: 12,
                background: alert.severity === 'Extreme' || alert.severity === 'Severe' ? '#ef4444' : '#f59e0b',
                boxShadow: `0 0 10px ${alert.severity === 'Extreme' || alert.severity === 'Severe' ? '#ef444488' : '#f59e0b88'}`
              }}
            />
          </Marker>
        ))}

        {/* Facilities marker */}
        {layerVisibility.facilities && (
          <Marker longitude={80.2707} latitude={13.0827} anchor="bottom">
            <div className="w-4 h-4 bg-cyan-500 rounded-full border-2 border-white shadow-lg" />
          </Marker>
        )}
      </Map>

      {/* Sync Status Badge */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className={`flex flex-col px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 shadow-lg ${
          syncStatus === 'live'    ? 'bg-emerald-500/20 text-emerald-400' :
          syncStatus === 'cached'  ? 'bg-amber-500/20 text-amber-400'   :
                                     'bg-red-500/20 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {syncStatus === 'live' ? <Wifi size={12} /> : <WifiOff size={12} />}
            {syncStatus.toUpperCase()} DATA
          </div>
          {lastSyncedAt && (
            <div className="text-[8px] opacity-60 mt-0.5">
              Synced: {lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
        {error && (
          <div className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded text-[10px] backdrop-blur-sm">
            {error}
          </div>
        )}
      </div>

      {/* Style Toggle */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
        <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl p-1 flex gap-1 shadow-lg">
          {MAP_STYLES.map(style => (
            <motion.button
              key={style.id}
              onClick={() => setActiveStyle(style.id)}
              className={`relative px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors z-10 ${
                activeStyle === style.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {activeStyle === style.id && (
                <motion.div
                  layoutId="style-pill"
                  className="absolute inset-0 bg-blue-600 rounded-lg"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{style.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Layer toggles */}
        <div className="bg-gray-800/90 backdrop-blur border border-gray-700 p-3 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={12} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Layers</span>
          </div>
          <div className="space-y-2">
            {Object.keys(layerVisibility).map(layer => (
              <label key={layer} className="flex items-center gap-2 text-xs font-bold text-gray-300 capitalize cursor-pointer">
                <input
                  type="checkbox"
                  checked={(layerVisibility as any)[layer]}
                  onChange={() => setLayerVisibility({...layerVisibility, [layer]: !(layerVisibility as any)[layer]})}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                {layer.replace('sos', 'SOS')}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
