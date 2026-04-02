import { motion } from 'framer-motion';

/**
 * Navbar — top bar with logo and algorithm info badge.
 */
export default function Navbar({ algorithmInfo }) {
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-zinc-950 border-b border-zinc-800/50 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold text-sm shadow-sm shadow-white/5 border border-zinc-200">
          A
        </div>
        <h1 className="text-lg font-bold text-zinc-100 tracking-tight">
          Clarify
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
          <span className="text-sm text-zinc-400">{algorithmInfo.name}</span>
          <span className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-zinc-800/50 text-zinc-300 border border-zinc-700/50">
            Time: {algorithmInfo.timeComplexity}
          </span>
          <span className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-zinc-800/50 text-zinc-300 border border-zinc-700/50">
            Space: {algorithmInfo.spaceComplexity}
          </span>
        </motion.div>
      )}

      {/* GitHub-style badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 font-medium">Interactive Algorithm Learning</span>
      </div>
    </nav>
  );
}
