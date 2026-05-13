import { motion } from 'framer-motion';
import { Target, Shield, RefreshCw } from 'lucide-react';

const coreThemes = [
  { icon: Target, title: 'Citizen Dashboard', desc: 'A localized interface for the public to report incidents, access safe nodes, and receive real-time evacuation routes.' },
  { icon: Shield, title: 'Command Control Room', desc: 'An authoritative dashboard for emergency services to triage distress signals, allocate resources, and orchestrate rescue operations.' },
  { icon: RefreshCw, title: 'Bidirectional Loop', desc: 'Continuous synchronization between citizen reports and responder actions, eliminating the data gap during active crises.' },
];

export default function ProblemSection() {
  return (
    <section id="system" className="relative bg-[#f5f7f9] border-t border-[#e5e9eb]">
      <div className="container mx-auto px-6 lg:px-12 py-24 max-w-6xl">
        
        <div className="mb-16">
          <h2 className="text-3xl font-bold font-['Space_Grotesk'] text-[#2c2f31] tracking-tight mb-4">
            Two Interconnected Experiences
          </h2>
          <p className="text-[16px] text-[#595c5e] max-w-xl">
            The platform is built on the thesis of connecting the public directly to authoritative responders, ensuring no distress signal is lost in the chaos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coreThemes.map((p, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-[#e5e9eb] p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-[#f5f7f9] border border-[#e5e9eb] rounded-lg mb-6 flex items-center justify-center">
                <p.icon className="text-[#2c2f31]" size={18} />
              </div>
              <h3 className="text-[16px] font-semibold text-[#2c2f31] mb-2">{p.title}</h3>
              <p className="text-[14px] text-[#595c5e] leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
