import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Activity, Users, Map as MapIcon, Menu, CheckSquare, ClipboardList, BarChart2 } from 'lucide-react';
import UnifiedMap from '../components/UnifiedMap';
import SOSQueue from '../components/SOSQueue';
import FacilitiesMonitor from '../components/FacilitiesMonitor';
import VerificationCenter from '../components/VerificationCenter';
import RecoveryConsole from '../components/RecoveryConsole';
import InfraStatusMap from '../components/InfraStatusMap';
import PostIncidentReport from '../components/PostIncidentReport';
import DemoControls from '../components/DemoControls';

export default function CommandDashboard() {
  const [activeTab, setActiveTab] = useState('map');
  const [phase, setPhase] = useState<'PRE'|'MID'|'POST'>('MID');

  const getPhaseColor = () => {
    if (phase === 'PRE') return 'bg-blue-500';
    if (phase === 'MID') return 'bg-red-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -250 }} animate={{ x: 0 }}
        className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col"
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="text-red-500" size={28} />
            <h1 className="text-xl font-bold tracking-wider">IDRS CMD</h1>
          </div>
          
          <div className="flex bg-gray-900 rounded-lg p-1 relative">
            {['PRE', 'MID', 'POST'].map((p) => (
              <button 
                key={p} 
                onClick={() => setPhase(p as any)}
                className="flex-1 py-1 z-10 text-xs font-bold text-white uppercase"
              >
                {p}
              </button>
            ))}
            <motion.div 
              layoutId="phase-pill"
              className={`absolute top-1 bottom-1 w-1/3 rounded shadow-md ${getPhaseColor()}`}
              initial={false}
              animate={{ x: phase === 'PRE' ? 0 : phase === 'MID' ? '100%' : '200%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('map')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'map' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            <MapIcon size={20} /> Unified Map
          </button>
          <button 
            onClick={() => setActiveTab('sos')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'sos' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            <Activity size={20} /> SOS Queue
          </button>
          <button 
            onClick={() => setActiveTab('facilities')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'facilities' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            <Users size={20} /> Facilities
          </button>
          <button 
            onClick={() => setActiveTab('verify')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'verify' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            <CheckSquare size={20} /> Verification
          </button>
          <button 
            onClick={() => setActiveTab('recovery')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'recovery' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            <ClipboardList size={20} /> Recovery
          </button>
          <button 
            onClick={() => setActiveTab('infra')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'infra' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            <MapIcon size={20} /> Infrastructure
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'reports' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            <BarChart2 size={20} /> Reports
          </button>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 relative bg-gray-950 overflow-hidden">
        <DemoControls />
        <AnimatePresence mode="wait">
          {activeTab === 'map' && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full">
              <UnifiedMap />
            </motion.div>
          )}
          {activeTab === 'sos' && (
            <motion.div key="sos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full p-6 overflow-y-auto">
              <SOSQueue />
            </motion.div>
          )}
          {activeTab === 'facilities' && (
            <motion.div key="facilities" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full p-6 overflow-y-auto">
              <FacilitiesMonitor />
            </motion.div>
          )}
          {activeTab === 'verify' && (
            <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full p-6 overflow-y-auto">
              <VerificationCenter />
            </motion.div>
          )}
          {activeTab === 'recovery' && (
            <motion.div key="recovery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full p-6 overflow-y-auto">
              <RecoveryConsole />
            </motion.div>
          )}
          {activeTab === 'infra' && (
            <motion.div key="infra" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full p-6 overflow-y-auto">
              <InfraStatusMap />
            </motion.div>
          )}
          {activeTab === 'reports' && (
            <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full p-6 overflow-y-auto">
              <PostIncidentReport />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
