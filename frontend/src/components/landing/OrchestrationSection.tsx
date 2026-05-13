import { motion } from 'framer-motion';
import { Network, Server, LayoutDashboard, Smartphone } from 'lucide-react';

const steps = [
  { label: "Public Access", title: "Citizen Dashboard", icon: Smartphone, desc: "Mobile-optimized progressive web app for civilian reporting." },
  { label: "Data Pipeline", title: "Adaptive Engine", icon: Network, desc: "WebSockets and REST APIs managing real-time bidirectional data." },
  { label: "Processing", title: "Intelligence Layer", icon: Server, desc: "Filtering noise and routing actionable intelligence." },
  { label: "Authority", title: "Command Control", icon: LayoutDashboard, desc: "Centralized hub for authoritative orchestration." },
];

export default function OrchestrationSection() {
  return (
    <section id="intelligence" className="relative bg-white border-t border-b border-[#e5e9eb]">
      <div className="container mx-auto px-6 lg:px-12 py-24 max-w-6xl">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <h2 className="text-3xl font-bold font-['Space_Grotesk'] text-[#2c2f31] tracking-tight mb-4">
              Full Architecture Blueprint
            </h2>
            <p className="text-[16px] text-[#595c5e] max-w-xl">
              A deeply integrated, multi-tier architecture designed specifically for India's scale, ensuring seamless data flow from the ground to the command center.
            </p>
          </div>
          <div className="px-4 py-2 bg-[#f5f7f9] border border-[#e5e9eb] rounded-md flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#00f1fe] rounded-full animate-pulse" />
            <span className="text-[12px] font-medium text-[#2c2f31]">Bidirectional Sync Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          
          {/* Subtle connector line on desktop */}
          <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-[1px] bg-[#e5e9eb] z-0" />

          {steps.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative z-10 bg-white border border-[#e5e9eb] p-6 rounded-xl shadow-sm"
            >
              <div className="w-10 h-10 bg-[#f5f7f9] border border-[#e5e9eb] rounded-lg mb-6 flex items-center justify-center">
                <s.icon className="text-[#00666c]" size={18} />
              </div>
              <div className="text-[11px] font-semibold text-[#595c5e] uppercase tracking-widest mb-2">{s.label}</div>
              <h3 className="text-[16px] font-bold text-[#2c2f31] mb-2">{s.title}</h3>
              <p className="text-[13px] text-[#595c5e]">{s.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
