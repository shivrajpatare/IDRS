import { motion } from 'framer-motion';

const phases = [
  {
    id: 'PRE',
    title: 'Pre-Disaster',
    subtitle: 'Preparedness',
    dot: 'bg-[#595c5e]',
    desc: 'The initial phase focusing on early warnings, predictive modeling, and civilian readiness before impact.',
    features: ['Early Warning Broadcasting', 'Safe Node Allocation', 'Evacuation Routing']
  },
  {
    id: 'MID',
    title: 'Mid-Disaster',
    subtitle: 'Active Crisis',
    dot: 'bg-[#ef4444]',
    desc: 'The critical response phase prioritizing live SOS signals, dynamic triage, and tactical unit dispatch.',
    features: ['Live SOS Reporting', 'Command Center Triage', 'Resource Orchestration']
  },
  {
    id: 'POST',
    title: 'Post-Disaster',
    subtitle: 'Recovery',
    dot: 'bg-[#006947]',
    desc: 'The rehabilitation phase designed to manage aid distribution, missing persons, and infrastructure recovery.',
    features: ['Missing Persons Registry', 'Aid Distribution Sync', 'Rehabilitation Assessment']
  }
];

export default function PhaseAwareSection() {
  return (
    <section id="operations" className="relative bg-[#f5f7f9]">
      <div className="container mx-auto px-6 lg:px-12 py-24 max-w-6xl">
        
        <div className="mb-16">
          <h2 className="text-3xl font-bold font-['Space_Grotesk'] text-[#2c2f31] tracking-tight mb-4">
            Three-Phase Operational Model
          </h2>
          <p className="text-[16px] text-[#595c5e] max-w-xl">
            The platform is explicitly designed to operate across the complete disaster lifecycle—adapting the Citizen Dashboard and Command Control Room for each phase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {phases.map((p, i) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-[#e5e9eb] p-8 rounded-xl shadow-sm flex flex-col"
            >
              <div className="flex items-center gap-2 mb-6">
                <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                <span className="text-[11px] font-semibold text-[#595c5e] uppercase tracking-widest">{p.subtitle}</span>
              </div>
              
              <h3 className="text-[20px] font-bold text-[#2c2f31] tracking-tight mb-4">
                {p.title}
              </h3>
              
              <p className="text-[14px] text-[#595c5e] leading-relaxed mb-8 flex-1">
                {p.desc}
              </p>

              <ul className="space-y-3 border-t border-[#e5e9eb] pt-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-[13px] font-medium text-[#2c2f31]">
                    <svg className="w-4 h-4 text-[#e5e9eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
