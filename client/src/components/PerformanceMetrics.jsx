import { motion } from 'framer-motion';

/**
 * PerformanceMetrics — displays algorithm performance statistics
 * 
 * Props:
 *  - comparisons: number of comparisons made
 *  - swaps: number of swaps/moves made
 *  - timeTaken: time elapsed in ms
 *  - spaceComplexity: static space complexity string
 */
export default function PerformanceMetrics({ comparisons = 0, swaps = 0, timeTaken = 0, spaceComplexity = 'O(1)' }) {
  return (
    <div className="flex items-center justify-center gap-6 py-3 px-4 bg-slate-900/50 border-t border-slate-800/50">
      <MetricItem label="Comparisons" value={comparisons} color="text-blue-400" />
      <MetricItem label="Swaps" value={swaps} color="text-amber-400" />
      <MetricItem label="Time" value={`${timeTaken}ms`} color="text-emerald-400" />
      <MetricItem label="Space" value={spaceComplexity} color="text-purple-400" />
    </div>
  );
}

function MetricItem({ label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</span>
      <motion.span
        key={value}
        initial={{ scale: 1.2, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`text-sm font-mono font-semibold ${color}`}
      >
        {value}
      </motion.span>
    </div>
  );
}
