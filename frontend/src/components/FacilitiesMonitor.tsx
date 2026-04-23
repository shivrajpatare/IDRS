import { motion } from 'framer-motion';

const MOCK_FACILITIES = [
  { id: 1, type: "hospital", name: "TN Govt Hospital 1", zone: "Chennai_Velachery", total: 200, avail: 45, status: "Operational" },
  { id: 2, type: "hospital", name: "TN Govt Hospital 2", zone: "Chennai_Adyar", total: 150, avail: 12, status: "Critical" },
  { id: 3, type: "shelter", name: "Relief Camp 1", zone: "Chennai_Velachery", total: 500, avail: 120, status: "Operational" },
];

export default function FacilitiesMonitor() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Facilities Monitor</h2>
      
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="p-4 text-gray-400 font-medium">Facility Name</th>
              <th className="p-4 text-gray-400 font-medium">Type</th>
              <th className="p-4 text-gray-400 font-medium">Zone</th>
              <th className="p-4 text-gray-400 font-medium">Capacity</th>
              <th className="p-4 text-gray-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_FACILITIES.map((f, i) => (
              <motion.tr 
                key={f.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-gray-700/50 last:border-0 hover:bg-gray-750"
              >
                <td className="p-4 font-medium text-white">{f.name}</td>
                <td className="p-4">
                  <span className={`text-xs uppercase tracking-wider font-bold px-2 py-1 rounded ${f.type === 'hospital' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {f.type}
                  </span>
                </td>
                <td className="p-4 text-gray-300">{f.zone}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${f.avail < 20 ? 'text-red-400' : 'text-green-400'}`}>{f.avail}</span>
                    <span className="text-gray-500">/ {f.total}</span>
                    <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${f.avail < 20 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${((f.total - f.avail)/f.total)*100}%` }} />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${f.status === 'Operational' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                    <span className={f.status === 'Operational' ? 'text-green-400' : 'text-red-400'}>{f.status}</span>
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
