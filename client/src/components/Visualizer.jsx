import { motion } from 'framer-motion';

/**
 * Visualizer — renders bars representing array elements.
 *
 * Props:
 *  - array: number[]
 *  - frame: visualization frame from the algorithm generator
 *  - algorithmType: 'sorting' | 'searching'
 */
export default function Visualizer({ array, frame, algorithmType }) {
  if (!array || array.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Select an algorithm to begin</p>
      </div>
    );
  }

  const maxVal = Math.max(...array);

  // Check if this is a merge sort frame (has phase info)
  const isMergeSortFrame = frame?.phase != null;

  /**
   * Determine bar color based on current frame state
   */
  const getBarStyle = (index) => {
    if (algorithmType === 'searching') {
      return getSearchBarStyle(index);
    }
    if (isMergeSortFrame) {
      return getMergeSortBarStyle(index);
    }
    return getSortBarStyle(index);
  };

  const getSortBarStyle = (index) => {
    const { comparing = [], swapped = [], sorted = [], pivot } = frame || {};

    if (sorted.includes(index)) {
      return { background: 'linear-gradient(to top, #10b981, #34d399)', boxShadow: '0 0 12px rgba(16,185,129,0.3)' };
    }
    if (index === pivot) {
      return { background: 'linear-gradient(to top, #a855f7, #c084fc)', boxShadow: '0 0 12px rgba(168,85,247,0.4)' };
    }
    if (swapped.includes(index)) {
      return { background: 'linear-gradient(to top, #ef4444, #f87171)', boxShadow: '0 0 12px rgba(239,68,68,0.4)' };
    }
    if (comparing.includes(index)) {
      return { background: 'linear-gradient(to top, #f59e0b, #fbbf24)', boxShadow: '0 0 12px rgba(245,158,11,0.4)' };
    }
    return { background: 'linear-gradient(to top, #6366f1, #818cf8)', boxShadow: '0 0 8px rgba(99,102,241,0.2)' };
  };

  const getMergeSortBarStyle = (index) => {
    const {
      comparing = [], swapped = [], sorted = [],
      activeRange, phase, dividePoint,
    } = frame || {};

    // Final sorted state
    if (sorted.includes(index)) {
      return { background: 'linear-gradient(to top, #10b981, #34d399)', boxShadow: '0 0 12px rgba(16,185,129,0.3)' };
    }

    // Currently being placed (merge step)
    if (swapped.includes(index)) {
      return { background: 'linear-gradient(to top, #ef4444, #f87171)', boxShadow: '0 0 12px rgba(239,68,68,0.4)' };
    }

    // Being compared
    if (comparing.includes(index)) {
      return { background: 'linear-gradient(to top, #f59e0b, #fbbf24)', boxShadow: '0 0 15px rgba(245,158,11,0.5)' };
    }

    // Check if inside active range
    const inRange = activeRange && index >= activeRange[0] && index <= activeRange[1];

    if (inRange && phase === 'dividing') {
      // Dividing phase — highlight left vs right halves in different shades
      if (dividePoint != null && index <= dividePoint) {
        return { background: 'linear-gradient(to top, #6366f1, #818cf8)', boxShadow: '0 0 10px rgba(99,102,241,0.3)' };
      }
      return { background: 'linear-gradient(to top, #8b5cf6, #a78bfa)', boxShadow: '0 0 10px rgba(139,92,246,0.3)' };
    }

    if (inRange && phase === 'merging') {
      // In active merge range but not being compared/swapped — show as active
      return { background: 'linear-gradient(to top, #6366f1, #818cf8)', boxShadow: '0 0 8px rgba(99,102,241,0.2)' };
    }

    // Outside active range — dim
    if (activeRange && !inRange) {
      return { background: 'linear-gradient(to top, #1e293b, #334155)', opacity: 0.35 };
    }

    return { background: 'linear-gradient(to top, #6366f1, #818cf8)', boxShadow: '0 0 8px rgba(99,102,241,0.2)' };
  };

  const getSearchBarStyle = (index) => {
    const { low = -1, high = -1, mid = -1, found = -1, eliminated = [] } = frame || {};

    if (found === index) {
      return { background: 'linear-gradient(to top, #10b981, #34d399)', boxShadow: '0 0 20px rgba(16,185,129,0.5)' };
    }
    if (mid === index) {
      return { background: 'linear-gradient(to top, #f59e0b, #fbbf24)', boxShadow: '0 0 15px rgba(245,158,11,0.5)' };
    }
    if (eliminated.includes(index)) {
      return { background: 'linear-gradient(to top, #334155, #475569)', opacity: 0.35 };
    }
    if (index >= low && index <= high) {
      return { background: 'linear-gradient(to top, #6366f1, #818cf8)', boxShadow: '0 0 8px rgba(99,102,241,0.2)' };
    }
    return { background: 'linear-gradient(to top, #334155, #475569)', opacity: 0.5 };
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Phase description banner for Merge Sort */}
      {isMergeSortFrame && frame.phaseDetail && (
        <motion.div
          key={frame.phaseDetail}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-2 shrink-0"
        >
          <span className={`
            inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
            ${frame.phase === 'dividing'
              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/25'
              : frame.phase === 'merging'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
            }
          `}>
            {frame.phase === 'dividing' && '✂️'}
            {frame.phase === 'merging' && '🔀'}
            {frame.phase === 'done' && '✅'}
            {frame.phaseDetail}
          </span>
        </motion.div>
      )}

      {/* Target display for binary search */}
      {algorithmType === 'searching' && frame?.target !== undefined && (
        <div className="text-center py-2 shrink-0">
          <span className="text-sm text-slate-400">
            Searching for:{' '}
            <span className="text-indigo-400 font-bold text-base">{frame.target}</span>
          </span>
          {frame?.found >= 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-3 text-sm text-emerald-400 font-semibold"
            >
              ✓ Found at index {frame.found}!
            </motion.span>
          )}
        </div>
      )}

      {/* Bars */}
      <div className="flex-1 flex items-end justify-center gap-[2px] px-6 pb-4 pt-2 min-h-0">
        {array.map((value, index) => {
          const heightPercent = (value / maxVal) * 100;
          const style = getBarStyle(index);

          return (
            <motion.div
              key={index}
              layout
              initial={false}
              animate={{
                height: `${heightPercent}%`,
                opacity: style.opacity || 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative rounded-t-sm min-w-[4px]"
              style={{
                flex: 1,
                maxWidth: '28px',
                background: style.background,
                boxShadow: style.boxShadow || 'none',
              }}
            >
              {/* Value label for small arrays */}
              {array.length <= 30 && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-mono">
                  {value}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Merge sort active range markers */}
      {isMergeSortFrame && frame.activeRange && frame.phase !== 'done' && (
        <div className="flex items-center justify-center gap-4 py-1 shrink-0">
          <span className="text-[10px] text-slate-500 font-mono">
            Active range: [{frame.activeRange[0]}..{frame.activeRange[1]}]
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 py-2 shrink-0 border-t border-slate-800/50">
        {algorithmType === 'sorting' && !isMergeSortFrame && (
          <>
            <Legend color="#6366f1" label="Default" />
            <Legend color="#f59e0b" label="Comparing" />
            <Legend color="#ef4444" label="Swapping" />
            <Legend color="#10b981" label="Sorted" />
            <Legend color="#a855f7" label="Pivot" />
          </>
        )}
        {isMergeSortFrame && (
          <>
            <Legend color="#6366f1" label="Left Half" />
            <Legend color="#8b5cf6" label="Right Half" />
            <Legend color="#f59e0b" label="Comparing" />
            <Legend color="#ef4444" label="Placing" />
            <Legend color="#334155" label="Inactive" />
            <Legend color="#10b981" label="Sorted" />
          </>
        )}
        {algorithmType === 'searching' && (
          <>
            <Legend color="#6366f1" label="In Range" />
            <Legend color="#f59e0b" label="Mid" />
            <Legend color="#10b981" label="Found" />
            <Legend color="#475569" label="Eliminated" />
          </>
        )}
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
      <span className="text-[10px] text-slate-500">{label}</span>
    </div>
  );
}
