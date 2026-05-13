import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import { Download, FileText, Activity, Heart, Users } from 'lucide-react';

function AnimatedCounter({ from, to }: { from: number, to: number }) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, latest => Math.round(latest).toLocaleString());

  useEffect(() => {
    const controls = animate(count, to, { duration: 1.2, ease: "easeOut" });
    return controls.stop;
  }, [count, to]);

  return <motion.span>{rounded}</motion.span>;
}

export default function PostIncidentReport() {
  const handleExportCSV = () => {
    // Generate mock CSV data
    const csvContent = "Event ID,Phase,Time,Description\n" +
      "TN-FLD-2026,PRE_DISASTER,Oct 12 08:00 AM,IMD Orange Alert received. NDMA mobilized.\n" +
      "TN-FLD-2026,MID_DISASTER,Oct 14 02:00 AM,Flood thresholds crossed in Chennai. 300+ SOS active.\n" +
      "TN-FLD-2026,POST_DISASTER,Oct 18 06:00 PM,Water receding. Relief claims and recovery started.";

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'IDRS_Post_Incident_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = (e: React.MouseEvent) => {
    e.preventDefault();
    // Use the browser's native print-to-PDF functionality for the dashboard
    window.print();
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col h-full overflow-y-auto pr-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Post-Incident Report</h2>
          <p className="text-gray-400 mt-1">Tamil Nadu Floods 2026 - Event ID: #TN-FLD-2026</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleExportCSV}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 border border-gray-600 transition-colors"
          >
            <FileText size={18} /> Export CSV
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
          >
            <Download size={18} /> Download PDF Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total SOS Processed", value: 1245, icon: <Activity className="text-blue-400" /> },
          { label: "Resources Deployed", value: 86, icon: <Heart className="text-red-400" /> },
          { label: "Claims Processed", value: 432, icon: <FileText className="text-purple-400" /> },
          { label: "Persons Found", value: 18, icon: <Users className="text-green-400" /> },
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -3, boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-gray-400 font-medium text-sm">{kpi.label}</p>
              {kpi.icon}
            </div>
            <p className="text-3xl font-bold"><AnimatedCounter from={0} to={kpi.value} /></p>
          </motion.div>
        ))}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
        <h3 className="font-bold text-lg mb-6">Incident Timeline</h3>
        <div className="space-y-6">
          {[
            { phase: "PRE_DISASTER", time: "Oct 12, 08:00 AM", desc: "IMD Orange Alert received. NDMA mobilized." },
            { phase: "MID_DISASTER", time: "Oct 14, 02:00 AM", desc: "Flood thresholds crossed in Chennai. 300+ SOS active." },
            { phase: "POST_DISASTER", time: "Oct 18, 06:00 PM", desc: "Water receding. Relief claims and recovery started." },
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ x: -20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              transition={{ delay: 0.3 + (i * 0.1) }}
              className="flex gap-6"
            >
              <div className="w-32 flex-shrink-0">
                <p className="text-sm font-bold text-gray-300">{item.time}</p>
                <span className="text-xs uppercase tracking-wider text-blue-400">{item.phase}</span>
              </div>
              <div className="w-4 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-blue-500 border-4 border-gray-900" />
                {i !== 2 && <div className="w-0.5 h-full bg-gray-700 my-1" />}
              </div>
              <div className="flex-1 pb-6">
                <p className="text-gray-300">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
