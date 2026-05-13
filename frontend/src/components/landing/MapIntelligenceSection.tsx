import { motion } from 'framer-motion';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapIntelligenceSection() {
  // Shimla, Himachal Pradesh coordinates (Landslide simulation)
  const INITIAL_VIEW_STATE = {
    longitude: 77.1734,
    latitude: 31.1048,
    zoom: 14,
    pitch: 60,
    bearing: -20
  };

  return (
    <section className="relative bg-white border-t border-b border-[#e5e9eb]">
      <div className="container mx-auto px-6 lg:px-12 py-24 max-w-6xl flex flex-col lg:flex-row items-center gap-16">
        
        <div className="w-full lg:w-5/12">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold font-['Space_Grotesk'] text-[#2c2f31] tracking-tight mb-4">
              Real-Time Map Intelligence
            </h2>
            <p className="text-[16px] text-[#595c5e] mb-8 leading-relaxed">
              An interactive 3D tactical map system actively monitoring disaster zones in India. Experience real-time alerts, topographic vulnerabilities, and rapid operational routing.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {['MapLibre GL', 'GeoJSON', 'Real-time Sync'].map(tech => (
                <span key={tech} className="px-3 py-1.5 bg-[#f5f7f9] border border-[#e5e9eb] rounded-md text-[11px] font-medium text-[#595c5e] uppercase tracking-widest">
                  {tech}
                </span>
              ))}
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_10px_#ef4444]" />
                    <span className="text-[13px] font-medium text-[#2c2f31]">Critical SOS Event</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00666c] shadow-[0_0_10px_#00666c]" />
                    <span className="text-[13px] font-medium text-[#2c2f31]">Safe Node / Shelter</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] shadow-[0_0_10px_#eab308]" />
                    <span className="text-[13px] font-medium text-[#2c2f31]">Active Rescue Unit</span>
                </div>
            </div>
          </motion.div>
        </div>

        <div className="w-full lg:w-7/12 relative h-[500px]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="absolute inset-0 bg-[#f5f7f9] border border-[#e5e9eb] rounded-xl overflow-hidden shadow-sm p-1"
          >
             <div className="w-full h-full rounded-lg overflow-hidden relative">
               <Map
                 initialViewState={INITIAL_VIEW_STATE}
                 mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                 interactive={true}
                 dragPan={true}
                 scrollZoom={false}
               >
                 <NavigationControl position="bottom-right" />

                 {/* Critical SOS Marker */}
                 <Marker longitude={77.1700} latitude={31.1060}>
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-8 h-8 bg-[#ef4444]/30 rounded-full animate-ping" />
                        <div className="w-4 h-4 bg-[#ef4444] border-2 border-white rounded-full shadow-md" />
                    </div>
                 </Marker>

                 {/* Safe Node */}
                 <Marker longitude={77.1780} latitude={31.1020}>
                    <div className="w-4 h-4 bg-[#00666c] border-2 border-white rounded-full shadow-md" />
                 </Marker>

                 {/* Rescue Unit */}
                 <Marker longitude={77.1750} latitude={31.1080}>
                    <div className="w-3 h-3 bg-[#eab308] border-2 border-white rounded-full shadow-sm animate-pulse" />
                 </Marker>
                 
               </Map>
             </div>

             {/* Overlay UI Panel */}
             <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-3 rounded-lg border border-[#e5e9eb] shadow-sm flex items-center gap-3 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-[#006947] animate-pulse" />
                <span className="text-[11px] font-semibold text-[#2c2f31] uppercase tracking-widest">Shimla Sector Live</span>
             </div>

          </motion.div>
        </div>

      </div>
    </section>
  );
}
