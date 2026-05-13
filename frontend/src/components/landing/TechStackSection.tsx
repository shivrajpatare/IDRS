import { motion } from 'framer-motion';
import { Smartphone, Server, Brain, Database, ShieldAlert } from 'lucide-react';

const nodes = [
  { id: 'citizen', label: 'Citizen App', tech: 'React PWA', icon: Smartphone, color: '#00f1fe', x: '10%', y: '20%' },
  { id: 'api', label: 'API Gateway', tech: 'FastAPI + WSS', icon: Server, color: '#00666c', x: '50%', y: '50%' },
  { id: 'ml', label: 'Intelligence Core', tech: 'NLP Triage', icon: Brain, color: '#006947', x: '90%', y: '20%' },
  { id: 'db', label: 'Persistence', tech: 'PostgreSQL', icon: Database, color: '#595c5e', x: '30%', y: '80%' },
  { id: 'command', label: 'Command Room', tech: 'React', icon: ShieldAlert, color: '#ef4444', x: '80%', y: '80%' },
];

export default function TechStackSection() {
  return (
    <section id="architecture" className="relative bg-[#f5f7f9] py-24 border-t border-[#e5e9eb]">
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
        
        <div className="mb-16">
          <h2 className="text-3xl font-bold font-['Space_Grotesk'] text-[#2c2f31] tracking-tight mb-4">
            System Architecture
          </h2>
          <p className="text-[16px] text-[#595c5e] max-w-xl">
            A real-time, bidirectional topology designed for extreme scale. Data flows seamlessly from ground-level citizens to tactical command units with zero latency.
          </p>
        </div>

        <div className="bg-white border border-[#e5e9eb] rounded-2xl shadow-sm p-8 lg:p-12">
          
          <div className="relative w-full h-[400px] lg:h-[500px] rounded-xl border border-[#e5e9eb] bg-[#f5f7f9] overflow-hidden">
            
            {/* Vercel Grid Background */}
            <div className="absolute inset-0 z-0 opacity-50" style={{ backgroundImage: 'radial-gradient(#e5e9eb 2px, transparent 2px)', backgroundSize: '32px 32px' }} />

            {/* Connection Lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00666c" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#00666c" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Citizen to API */}
              <motion.path 
                d="M 10% 20% C 30% 20%, 30% 50%, 50% 50%" 
                fill="transparent" stroke="#e5e9eb" strokeWidth="2" strokeDasharray="6 6"
              />
              <motion.path 
                d="M 10% 20% C 30% 20%, 30% 50%, 50% 50%" 
                fill="transparent" stroke="url(#grad1)" strokeWidth="3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />

              {/* API to ML */}
              <motion.path 
                d="M 50% 50% C 70% 50%, 70% 20%, 90% 20%" 
                fill="transparent" stroke="#e5e9eb" strokeWidth="2" strokeDasharray="6 6"
              />
              <motion.path 
                d="M 50% 50% C 70% 50%, 70% 20%, 90% 20%" 
                fill="transparent" stroke="url(#grad1)" strokeWidth="3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "linear" }}
              />

              {/* API to Command */}
              <motion.path 
                d="M 50% 50% C 65% 50%, 65% 80%, 80% 80%" 
                fill="transparent" stroke="#e5e9eb" strokeWidth="2" strokeDasharray="6 6"
              />
               <motion.path 
                d="M 50% 50% C 65% 50%, 65% 80%, 80% 80%" 
                fill="transparent" stroke="url(#grad1)" strokeWidth="3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: 1, repeat: Infinity, ease: "linear" }}
              />

              {/* API to DB */}
              <motion.path 
                d="M 50% 50% C 40% 50%, 40% 80%, 30% 80%" 
                fill="transparent" stroke="#e5e9eb" strokeWidth="2" strokeDasharray="6 6"
              />
              <motion.path 
                d="M 50% 50% C 40% 50%, 40% 80%, 30% 80%" 
                fill="transparent" stroke="url(#grad1)" strokeWidth="3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </svg>

            {/* Nodes */}
            {nodes.map((node, i) => (
              <motion.div
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, type: "spring", stiffness: 100 }}
                className="absolute z-20 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
                style={{ left: node.x, top: node.y }}
              >
                <div className="w-16 h-16 bg-white border border-[#e5e9eb] rounded-2xl shadow-sm flex items-center justify-center mb-3 relative group">
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: node.color }} />
                  <node.icon size={24} style={{ color: node.color }} />
                </div>
                <div className="bg-white/90 backdrop-blur-sm border border-[#e5e9eb] px-3 py-1.5 rounded-md shadow-sm text-center">
                  <p className="text-[13px] font-bold text-[#2c2f31]">{node.label}</p>
                  <p className="text-[11px] font-medium text-[#595c5e] uppercase tracking-widest">{node.tech}</p>
                </div>
              </motion.div>
            ))}

          </div>

        </div>
      </div>
    </section>
  );
}
