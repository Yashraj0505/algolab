import { motion } from 'framer-motion';

/**
 * Navbar — top bar with logo and algorithm info badge.
 */
export default function Navbar({ algorithmInfo }) {
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-[#0f1629] border-b border-slate-800 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
          A
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
          AlgoLab
        </h1>
      </div>

      {/* Current algorithm info */}
      {algorithmInfo && (
        <motion.div
          key={algorithmInfo.name}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden sm:flex items-center gap-4"
        >
          <span className="text-sm text-slate-400">{algorithmInfo.name}</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Time: {algorithmInfo.timeComplexity}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Space: {algorithmInfo.spaceComplexity}
          </span>
        </motion.div>
      )}

      {/* GitHub-style badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Interactive Algorithm Learning</span>
      </div>
    </nav>
  );
}
