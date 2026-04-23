import { motion } from 'framer-motion';

export default function UnifiedMap() {
  return (
    <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
      {/* Placeholder for Leaflet map */}
      <div className="absolute inset-0 bg-[url('https://cartodb-basemaps-c.global.ssl.fastly.net/dark_all/13/6000/3800.png')] opacity-50 bg-cover bg-center pointer-events-none" />
      
      <div className="z-10 text-center">
        <MapIcon className="w-16 h-16 text-blue-500 mx-auto mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-gray-500">Unified Map View</h2>
        <p className="text-gray-600 mt-2">Loading geospatial layers...</p>
      </div>

      {/* Toggles Panel */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="absolute top-6 left-6 bg-gray-800/90 backdrop-blur border border-gray-700 p-4 rounded-xl z-20"
      >
        <h3 className="font-bold text-white mb-3">Map Layers</h3>
        <div className="space-y-2">
          {['Incidents', 'SOS Heatmap', 'Facilities', 'Resources'].map(layer => (
            <label key={layer} className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-700" />
              {layer}
            </label>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function MapIcon(props: any) {
  return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;
}
