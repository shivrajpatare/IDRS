import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, FastForward, Square, CheckCircle2 } from 'lucide-react';

interface Props {
  currentPhase: 'PRE' | 'MID' | 'POST';
  setPhase: (phase: 'PRE' | 'MID' | 'POST') => void;
}

export default function DemoControls({ currentPhase, setPhase }: Props) {
  const [isRunning, setIsRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      if (demoStep === 0) {
        setPhase('PRE');
        timer = setTimeout(() => setDemoStep(1), 5000);
      } else if (demoStep === 1) {
        setPhase('MID');
        timer = setTimeout(() => setDemoStep(2), 10000);
      } else if (demoStep === 2) {
        setPhase('POST');
        timer = setTimeout(() => {
          setIsRunning(false);
          setDemoStep(0);
        }, 5000);
      }
    }
    return () => clearTimeout(timer);
  }, [isRunning, demoStep, setPhase]);

  const runAutoDemo = () => {
    setIsRunning(true);
    setDemoStep(0);
  };

  const getBtnClass = (stepPhase: string) => {
    if (currentPhase === stepPhase) return "bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]";
    return "bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-700 hover:text-gray-200";
  };

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="absolute top-6 right-6 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex justify-between items-center">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Play size={16} fill="currentColor" /> 
          Simulation Engine
        </h3>
        {isRunning && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>}
      </div>
      
      <div className="p-4 space-y-3">
        <button 
          onClick={() => setPhase('PRE')}
          className={`w-full text-left p-3 rounded-lg text-sm font-bold border transition-all flex justify-between items-center ${getBtnClass('PRE')}`}
        >
          <span>1. Preparedness (PRE)</span>
          {currentPhase === 'PRE' && <CheckCircle2 size={16} />}
        </button>
        
        <button 
          onClick={() => setPhase('MID')}
          className={`w-full text-left p-3 rounded-lg text-sm font-bold border transition-all flex justify-between items-center ${getBtnClass('MID')}`}
        >
          <span>2. Flood Event (MID)</span>
          {currentPhase === 'MID' && <CheckCircle2 size={16} />}
        </button>

        <button 
          onClick={() => setPhase('POST')}
          className={`w-full text-left p-3 rounded-lg text-sm font-bold border transition-all flex justify-between items-center ${getBtnClass('POST')}`}
        >
          <span>3. Recovery (POST)</span>
          {currentPhase === 'POST' && <CheckCircle2 size={16} />}
        </button>
        
        <div className="border-t border-gray-700 my-4"></div>
        
        {isRunning ? (
          <button 
            onClick={() => setIsRunning(false)}
            className="w-full bg-red-600 hover:bg-red-500 text-white p-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
          >
            <Square size={18} fill="currentColor" /> Stop Simulation
          </button>
        ) : (
          <button 
            onClick={runAutoDemo}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <FastForward size={18} fill="currentColor" /> Run Auto-Demo
          </button>
        )}
      </div>
      
      {isRunning && (
        <div className="h-1 w-full bg-gray-800">
          <motion.div 
            className="h-full bg-blue-500" 
            initial={{ width: 0 }} 
            animate={{ width: "100%" }} 
            transition={{ duration: demoStep === 0 ? 5 : demoStep === 1 ? 10 : 5, ease: "linear" }}
            key={demoStep}
          />
        </div>
      )}
    </motion.div>
  );
}
