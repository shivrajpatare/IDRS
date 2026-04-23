import { motion } from 'framer-motion';

const MOCK_INFRA = [
  { id: 1, zone: "Chennai North", roads: "Damaged", power: "Operational", water: "Damaged", telecom: "Operational" },
  { id: 2, zone: "Cuddalore", roads: "Damaged", power: "Damaged", water: "Damaged", telecom: "Damaged" },
  { id: 3, zone: "Nagapattinam", roads: "Operational", power: "Restored", water: "Damaged", telecom: "Operational" },
];

export default function InfraStatusMap() {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Operational': return 'text-green-400 bg-green-500/20';
      case 'Restored': return 'text-blue-400 bg-blue-500/20';
      case 'Damaged': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-6">Infrastructure Status Map</h2>
      
      <div className="grid grid-cols-2 gap-6 h-full">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 relative overflow-hidden flex items-center justify-center">
           <div className="absolute inset-0 bg-[url('https://cartodb-basemaps-c.global.ssl.fastly.net/dark_all/13/6000/3800.png')] opacity-40 bg-cover bg-center pointer-events-none" />
           <p className="z-10 text-gray-400 font-bold">Live Geo-Overlay (Leaflet placeholder)</p>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
          {MOCK_INFRA.map((infra, i) => (
            <motion.div 
              key={infra.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-5"
            >
              <h3 className="font-bold text-lg mb-4 text-white">{infra.zone}</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Roads", val: infra.roads },
                  { label: "Power", val: infra.power },
                  { label: "Water", val: infra.water },
                  { label: "Telecom", val: infra.telecom },
                ].map(item => (
                  <div key={item.label} className="bg-gray-900 rounded-lg p-3 flex justify-between items-center border border-gray-700">
                    <span className="text-gray-400 text-sm font-medium">{item.label}</span>
                    <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${getStatusColor(item.val)}`}>
                      {item.val}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
