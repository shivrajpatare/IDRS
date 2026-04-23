import { motion } from 'framer-motion';

const MOCK_QUEUE = [
  { id: 1, loc: "Chennai_Velachery", injury: "critical", time: "2m ago", score: 4.8, status: "pending" },
  { id: 2, loc: "Chennai_Velachery", injury: "moderate", time: "12m ago", score: 3.5, status: "pending" },
  { id: 3, loc: "Cuddalore_Coastal", injury: "minor", time: "5m ago", score: 2.1, status: "assigned" },
];

export default function SOSQueue() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Active SOS Queue</h2>
        <div className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium border border-red-500/30">
          2 Pending
        </div>
      </div>

      <motion.div 
        className="space-y-4"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.06 } }
        }}
        initial="hidden"
        animate="show"
      >
        {MOCK_QUEUE.map((item, i) => (
          <motion.div
            key={item.id}
            variants={{
              hidden: { opacity: 0, x: -20 },
              show: { opacity: 1, x: 0 }
            }}
            whileHover={{ y: -3, boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`p-4 rounded-xl border flex items-center justify-between ${item.status === 'pending' ? 'bg-gray-800 border-gray-700' : 'bg-gray-800/50 border-gray-800 opacity-70'}`}
          >
            <div className="flex items-center gap-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${item.score >= 4 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                {item.score.toFixed(1)}
              </div>
              <div>
                <p className="text-lg font-bold text-white">{item.loc}</p>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                  <span className={`uppercase tracking-wider font-semibold ${item.injury === 'critical' ? 'text-red-400' : 'text-gray-400'}`}>{item.injury}</span>
                  <span>•</span>
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {item.status === 'pending' ? (
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
                >
                  Assign Unit
                </motion.button>
              ) : (
                <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
                  Assigned
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
