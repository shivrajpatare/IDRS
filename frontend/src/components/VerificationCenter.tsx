import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

const MOCK_REPORTS = [
  { id: 1, text: "Flood depth 4ft near Adyar bridge", score: 0.85, source: "Gov", flagged: false },
  { id: 2, text: "Need boats, massive flooding", score: 0.5, source: "Social", flagged: false },
  { id: 3, text: "Fake evacuation camp at random school", score: 0.2, source: "Anonymous", flagged: true },
];

export default function VerificationCenter() {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [selected, setSelected] = useState(reports[0]);

  return (
    <div className="flex h-full gap-6">
      {/* List */}
      <div className="w-1/3 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-700 bg-gray-900">
          <h2 className="text-xl font-bold">Verification Queue</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {reports.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ x: -30, opacity: 0, borderColor: "transparent" }}
                animate={{ x: 0, opacity: 1, borderColor: r.flagged ? "#EF4444" : "#374151" }}
                exit={{ opacity: 0, x: -100 }}
                onClick={() => setSelected(r)}
                className={`p-4 rounded-lg border cursor-pointer hover:bg-gray-700 transition-colors ${selected.id === r.id ? 'bg-gray-700' : 'bg-gray-800'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs px-2 py-1 rounded font-bold ${r.score < 0.4 ? 'bg-red-500/20 text-red-400' : r.score > 0.7 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    Score: {r.score}
                  </span>
                  <span className="text-xs text-gray-400">{r.source}</span>
                </div>
                <p className="text-gray-300 text-sm line-clamp-2">{r.text}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Report Details</h2>
        <div className="bg-gray-900 p-4 rounded-lg mb-6">
          <p className="text-lg">{selected.text}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm mb-1">Credibility Score</h3>
            <p className={`text-3xl font-bold ${selected.score < 0.4 ? 'text-red-400' : selected.score > 0.7 ? 'text-green-400' : 'text-yellow-400'}`}>
              {(selected.score * 100).toFixed(0)}%
            </p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm mb-1">Source Type</h3>
            <p className="text-xl font-bold text-white">{selected.source}</p>
          </div>
        </div>

        <div className="mt-auto flex gap-4">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-bold"
          >
            <CheckCircle size={20} /> Mark Verified
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-bold"
          >
            <ShieldAlert size={20} /> Confirm Misinformation
          </motion.button>
        </div>
      </div>
    </div>
  );
}
