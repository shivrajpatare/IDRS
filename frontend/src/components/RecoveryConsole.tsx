import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecoveryConsole() {
  const [activeTab, setActiveTab] = useState('claims');

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-6">Recovery Console (POST_DISASTER)</h2>
      
      <div className="flex gap-4 mb-6 border-b border-gray-700 pb-2">
        {['claims', 'missing', 'relief'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-bold uppercase tracking-wider text-sm transition-colors ${activeTab === tab ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'claims' && (
            <motion.div key="claims" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="h-full overflow-y-auto">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                <table className="w-full text-left">
                  <thead className="text-gray-400 border-b border-gray-700">
                    <tr><th className="pb-3">Citizen</th><th className="pb-3">Zone</th><th className="pb-3">Amount</th><th className="pb-3">Fraud Score</th><th className="pb-3">Action</th></tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700/50 bg-red-900/20">
                      <td className="py-4 font-bold">John Doe</td><td className="py-4">Chennai_Velachery</td><td className="py-4">₹5000</td>
                      <td className="py-4"><span className="bg-red-500/20 text-red-400 px-2 py-1 rounded font-bold animate-pulse">0.8 (Duplicate)</span></td>
                      <td className="py-4 flex gap-2"><button className="px-3 py-1 bg-green-600 rounded">Approve</button><button className="px-3 py-1 bg-red-600 rounded">Reject</button></td>
                    </tr>
                    <tr>
                      <td className="py-4 font-bold">Jane Smith</td><td className="py-4">Cuddalore_Coastal</td><td className="py-4">₹2000</td>
                      <td className="py-4"><span className="bg-green-500/20 text-green-400 px-2 py-1 rounded font-bold">0.1</span></td>
                      <td className="py-4 flex gap-2"><button className="px-3 py-1 bg-green-600 rounded">Approve</button><button className="px-3 py-1 bg-red-600 rounded">Reject</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'missing' && (
            <motion.div key="missing" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
              <div className="flex gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex-1 text-center"><p className="text-3xl font-bold text-blue-400">8</p><p className="text-gray-400">Total Reported</p></div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex-1 text-center"><p className="text-3xl font-bold text-green-400">2</p><p className="text-gray-400">Found</p></div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex-1 text-center"><p className="text-3xl font-bold text-yellow-400">6</p><p className="text-gray-400">Searching</p></div>
              </div>
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                 <p className="text-gray-400 text-center py-8">Registry loaded. AI Matcher active.</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'relief' && (
            <motion.div key="relief" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
              <div className="space-y-6">
                {['Chennai North', 'Cuddalore', 'Nagapattinam'].map((zone, i) => (
                  <div key={zone} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="font-bold text-lg mb-4">{zone}</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Food Delivered</span><span className="text-white">60%</span></div>
                        <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden"><motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i*0.1 }} style={{ width: '60%', originX: 0 }} className="h-full bg-blue-500"/></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Medical</span><span className="text-white">80%</span></div>
                        <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden"><motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i*0.1 }} style={{ width: '80%', originX: 0 }} className="h-full bg-green-500"/></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Water</span><span className="text-red-400 font-bold">20% (Critical)</span></div>
                        <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden"><motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i*0.1 }} style={{ width: '20%', originX: 0 }} className="h-full bg-red-500"/></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
