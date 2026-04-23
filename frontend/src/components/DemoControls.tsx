import { motion } from 'framer-motion';

export default function DemoControls() {
  const runAutoDemo = () => {
    // Simulated sequence
    console.log("Starting Auto Demo...");
  };

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="absolute top-6 right-6 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="bg-blue-600 px-4 py-2 flex justify-between items-center">
        <h3 className="font-bold text-white text-sm">Demo Controls (Dev Only)</h3>
      </div>
      <div className="p-4 space-y-3">
        <button className="w-full text-left bg-gray-800 hover:bg-gray-700 p-2 rounded text-sm text-gray-300 font-bold border border-gray-700 transition-colors">
          1. Start PRE Phase
        </button>
        <button className="w-full text-left bg-gray-800 hover:bg-gray-700 p-2 rounded text-sm text-gray-300 font-bold border border-gray-700 transition-colors">
          2. Trigger Flood Event (MID)
        </button>
        <button className="w-full text-left bg-gray-800 hover:bg-gray-700 p-2 rounded text-sm text-gray-300 font-bold border border-gray-700 transition-colors">
          3. Simulate Rescue Progress
        </button>
        <button className="w-full text-left bg-gray-800 hover:bg-gray-700 p-2 rounded text-sm text-gray-300 font-bold border border-gray-700 transition-colors">
          4. Switch to POST Phase
        </button>
        
        <div className="border-t border-gray-700 my-2"></div>
        
        <button 
          onClick={runAutoDemo}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded font-bold transition-colors"
        >
          Run Full Auto Demo (60s)
        </button>
      </div>
    </motion.div>
  );
}
