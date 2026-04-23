import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Heart, FileText, MapPin } from 'lucide-react';

export default function CitizenRecovery() {
  const [activeView, setActiveView] = useState<'home' | 'claim'>('home');
  const [status, setStatus] = useState('idle');

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden relative">
      <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900 z-10">
        <h1 className="text-xl font-bold">IDRS Citizen Dashboard</h1>
        <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-widest border border-emerald-500/30">
          RECOVERY PHASE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 z-10">
        <AnimatePresence mode="wait">
          {activeView === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-2xl mx-auto">
              {/* Return Home Checker */}
              <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Home /> Return Home Safety</h2>
                <div className="flex gap-4">
                  <select className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white">
                    <option>Chennai_Velachery</option>
                  </select>
                  <button onClick={() => setStatus('checked')} className="bg-blue-600 px-6 py-3 rounded-lg font-bold">Check Status</button>
                </div>
                
                {status === 'checked' && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-6 bg-green-500/10 border border-green-500/30 p-4 rounded-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-400">Area is Safe</h3>
                      <p className="text-sm text-gray-400">Water levels have receded. Power is restored.</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setActiveView('claim')} className="bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl border border-gray-700 text-left transition-colors">
                  <FileText className="text-blue-400 mb-4" size={32} />
                  <h3 className="font-bold text-lg mb-1">Aid Registration</h3>
                  <p className="text-gray-400 text-sm">Submit claims for damage or relief distribution.</p>
                </button>
                <button className="bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl border border-gray-700 text-left transition-colors">
                  <Heart className="text-purple-400 mb-4" size={32} />
                  <h3 className="font-bold text-lg mb-1">Mental Health</h3>
                  <p className="text-gray-400 text-sm">Connect with counselors and support groups.</p>
                </button>
              </div>
            </motion.div>
          )}

          {activeView === 'claim' && (
            <motion.div key="claim" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-2xl border border-gray-700">
              <button onClick={() => setActiveView('home')} className="text-blue-400 text-sm font-bold mb-6">← Back to Home</button>
              <h2 className="text-2xl font-bold mb-6">Submit Relief Claim</h2>
              <div className="space-y-4">
                <div><label className="text-gray-400 text-sm">Claim Type</label><select className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg mt-1 text-white"><option>Property Damage</option><option>Loss of Livelihood</option></select></div>
                <div><label className="text-gray-400 text-sm">Amount Requested (₹)</label><input type="number" className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg mt-1 text-white" placeholder="e.g. 5000" /></div>
                <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg mt-4">Submit Claim</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CheckCircle(props: any) {
  return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
