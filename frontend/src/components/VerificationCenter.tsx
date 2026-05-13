import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle, Info, X } from 'lucide-react';
import { VerificationListSkeleton } from './Skeleton';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ScoreBreakdown {
  sourceWeight:      number; // 0–1
  locationMatch:     number; // 0–0.3
  duplicatePenalty:  number; // negative
  evidenceBonus:     number; // 0–0.2
  finalScore:        number;
}

interface Report {
  id: number;
  text: string;
  score: number;
  source: string;
  flagged: boolean;
  breakdown: ScoreBreakdown;
}

// ─── Mock data with rich breakdowns ──────────────────────────────────────────
const MOCK_REPORTS: Report[] = [
  {
    id: 1, source: 'Gov', flagged: false, score: 0.85,
    text: 'Flood depth 4ft near Adyar bridge — confirmed by NDRF team',
    breakdown: { sourceWeight: 0.4, locationMatch: 0.3, duplicatePenalty: 0.0, evidenceBonus: 0.15, finalScore: 0.85 }
  },
  {
    id: 2, source: 'Social', flagged: false, score: 0.50,
    text: 'Need boats urgently — massive flooding at Thiruvanmiyur beach road',
    breakdown: { sourceWeight: 0.25, locationMatch: 0.2, duplicatePenalty: -0.1, evidenceBonus: 0.15, finalScore: 0.50 }
  },
  {
    id: 3, source: 'Anonymous', flagged: true, score: 0.20,
    text: 'Fake evacuation camp set up at Perungudi school — misleading citizens',
    breakdown: { sourceWeight: 0.1, locationMatch: 0.2, duplicatePenalty: -0.4, evidenceBonus: 0.0, finalScore: 0.20 }
  },
  {
    id: 4, source: 'NGO', flagged: false, score: 0.72,
    text: 'Shelter at Guduvancheri school fully operational — 340 displaced families',
    breakdown: { sourceWeight: 0.35, locationMatch: 0.25, duplicatePenalty: 0.0, evidenceBonus: 0.12, finalScore: 0.72 }
  },
];

// ─── Animated score bar ───────────────────────────────────────────────────────
function ScoreBar({ label, value, max, color, delay }: { label: string; value: number; max: number; color: string; delay: number }) {
  const pct = max !== 0 ? Math.abs(value) / Math.abs(max) * 100 : 0;
  const isNegative = value < 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="mb-3"
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        <span className={`text-xs font-bold font-mono ${isNegative ? 'text-red-400' : 'text-gray-200'}`}>
          {isNegative ? '−' : ''}{Math.abs(value).toFixed(2)}{max !== 1 ? `/${max}` : ''}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-700/60 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: delay + 0.1, duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

// ─── Confidence Explanation Card ──────────────────────────────────────────────
function ConfidenceCard({ report, onClose }: { report: Report; onClose: () => void }) {
  const { breakdown: b } = report;
  const verdict = b.finalScore >= 0.7 ? 'VERIFIED' : b.finalScore >= 0.4 ? 'UNCERTAIN' : 'FLAGGED';
  const verdictColor = verdict === 'VERIFIED' ? 'text-emerald-400' : verdict === 'UNCERTAIN' ? 'text-amber-400' : 'text-red-400';
  const verdictBg   = verdict === 'VERIFIED' ? 'bg-emerald-500/10 border-emerald-500/30' : verdict === 'UNCERTAIN' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30';

  return (
    <motion.div
      key={report.id}
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="bg-gray-900 border border-gray-700 rounded-xl p-5 relative"
    >
      <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-white">
        <X size={16} />
      </button>

      <div className="flex items-center gap-2 mb-4">
        <Info size={14} className="text-blue-400" />
        <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Confidence Score Breakdown</h4>
      </div>

      <ScoreBar label="Source Weight"     value={b.sourceWeight}     max={1}    color="bg-blue-500"    delay={0.0} />
      <ScoreBar label="Location Match"    value={b.locationMatch}    max={0.3}  color="bg-emerald-500" delay={0.1} />
      <ScoreBar label="Duplicate Penalty" value={b.duplicatePenalty} max={-0.5} color="bg-red-500"     delay={0.2} />
      <ScoreBar label="Evidence Bonus"    value={b.evidenceBonus}    max={0.2}  color="bg-amber-400"   delay={0.3} />

      <div className={`mt-4 rounded-lg border px-4 py-3 flex items-center justify-between ${verdictBg}`}>
        <span className="text-gray-400 text-xs">Final Score</span>
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-black font-mono ${verdictColor}`}>{b.finalScore.toFixed(2)}</span>
          <span className={`text-sm font-bold px-2 py-0.5 rounded ${verdictColor} border ${verdictBg}`}>{verdict}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function VerificationCenter() {
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [selected, setSelected] = useState<Report>(reports[0]);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [loading] = useState(false); // flip to true to see skeletons

  const handleVerdict = (action: 'verified' | 'misinformation') => {
    setReports(prev => prev.filter(r => r.id !== selected.id));
    const remaining = reports.filter(r => r.id !== selected.id);
    if (remaining.length > 0) setSelected(remaining[0]);
    setShowBreakdown(false);
  };

  return (
    <div className="flex h-full gap-6">
      {/* ── List panel ── */}
      <div className="w-1/3 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-700 bg-gray-900 flex items-center justify-between">
          <h2 className="text-xl font-bold">Verification Queue</h2>
          <span className="text-xs font-bold px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
            {reports.filter(r => r.flagged).length} Flagged
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <VerificationListSkeleton />
          ) : (
            <div className="p-4 space-y-4">
              <AnimatePresence>
                {reports.map((r) => (
                  <motion.div
                    key={r.id}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, borderColor: r.flagged ? '#EF4444' : '#374151' }}
                    exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0, padding: 0 }}
                    onClick={() => { setSelected(r); setShowBreakdown(false); }}
                    className={`p-4 rounded-lg border cursor-pointer hover:bg-gray-700 transition-colors ${selected.id === r.id ? 'bg-gray-700 ring-1 ring-blue-500/40' : 'bg-gray-800'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs px-2 py-1 rounded font-bold ${
                        r.score < 0.4  ? 'bg-red-500/20 text-red-400' :
                        r.score > 0.7  ? 'bg-green-500/20 text-green-400' :
                                          'bg-yellow-500/20 text-yellow-400'}`}>
                        {(r.score * 100).toFixed(0)}%
                      </span>
                      <span className="text-xs text-gray-400">{r.source}</span>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-2">{r.text}</p>
                    {r.flagged && (
                      <div className="mt-2 flex items-center gap-1 text-red-400 text-xs font-bold">
                        <ShieldAlert size={11} /> Auto-Flagged
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {reports.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle size={32} className="mx-auto mb-3 text-emerald-500" />
                  <p className="font-medium">Queue cleared</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Detail panel ── */}
      <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col gap-4 overflow-y-auto">
        <h2 className="text-2xl font-bold">Report Details</h2>

        <div className="bg-gray-900 p-4 rounded-lg">
          <p className="text-lg leading-relaxed">{selected.text}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm mb-1">Credibility Score</h3>
            <p className={`text-3xl font-bold ${
              selected.score < 0.4 ? 'text-red-400' : selected.score > 0.7 ? 'text-green-400' : 'text-yellow-400'
            }`}>{(selected.score * 100).toFixed(0)}%</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm mb-1">Source Type</h3>
            <p className="text-xl font-bold text-white">{selected.source}</p>
          </div>
        </div>

        {/* Why was it flagged button */}
        <button
          onClick={() => setShowBreakdown(prev => !prev)}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          <Info size={15} />
          {showBreakdown ? 'Hide' : 'Explain'} confidence score breakdown
        </button>

        {/* Animated breakdown card */}
        <AnimatePresence>
          {showBreakdown && <ConfidenceCard key={selected.id} report={selected} onClose={() => setShowBreakdown(false)} />}
        </AnimatePresence>

        <div className="mt-auto flex gap-4 pt-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleVerdict('verified')}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-colors"
          >
            <CheckCircle size={20} /> Mark Verified
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleVerdict('misinformation')}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-colors"
          >
            <ShieldAlert size={20} /> Confirm Misinformation
          </motion.button>
        </div>
      </div>
    </div>
  );
}
