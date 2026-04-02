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
        <p className="text-zinc-500 text-sm">Select an algorithm to begin</p>
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
      return { background: '#15803d' }; // emerald-700
    }
    if (index === pivot) {
      return { background: '#a1a1aa' }; // zinc-400
    }
    if (swapped.includes(index)) {
      return { background: '#b91c1c' }; // red-700
    }
    if (comparing.includes(index)) {
      return { background: '#52525b' }; // zinc-600
    }
    return { background: '#27272a' }; // zinc-800
  };

  const getMergeSortBarStyle = (index) => {
    const {
      comparing = [], swapped = [], sorted = [],
      activeRange, phase, dividePoint,
    } = frame || {};

    // Final sorted state
    if (sorted.includes(index)) {
      return { background: '#15803d' };
    }

    // Currently being placed (merge step)
    if (swapped.includes(index)) {
      return { background: '#b91c1c' };
    }

    // Being compared
    if (comparing.includes(index)) {
      return { background: '#52525b' };
    }

    // Check if inside active range
    const inRange = activeRange && index >= activeRange[0] && index <= activeRange[1];

    if (inRange && phase === 'dividing') {
      // Dividing phase — highlight left vs right halves in different shades
      if (dividePoint != null && index <= dividePoint) {
        return { background: '#52525b' };
      }
      return { background: '#3f3f46' };
    }

    if (inRange && phase === 'merging') {
      // In active merge range but not being compared/swapped — show as active
      return { background: '#52525b' };
    }

    // Outside active range — dim
    if (activeRange && !inRange) {
      return { background: '#18181b', opacity: 0.5 };
    }

    return { background: '#27272a' };
  };

  const getSearchBarStyle = (index) => {
    const { low = -1, high = -1, mid = -1, found = -1, eliminated = [] } = frame || {};

    if (found === index) {
      return { background: '#16a34a' }; // green-600
    }
    if (mid === index) {
      return { background: '#71717a' }; // zinc-500
    }
    if (eliminated.includes(index)) {
      return { background: '#18181b', opacity: 0.5 };
    }
    if (index >= low && index <= high) {
      return { background: '#3f3f46' }; // zinc-700
    }
    return { background: '#27272a', opacity: 0.6 };
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
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-semibold text-zinc-300 bg-zinc-800/50 border border-zinc-700/50 uppercase tracking-wider`}>
            {frame.phase === 'dividing' && '✂️'}
            {frame.phase === 'merging' && '🔀'}
            {frame.phase === 'done' && '✅'}
            {frame.phaseDetail}
          </span>
        </motion.div>
      )}

      {/* Target display for binary search */}
      {
        algorithmType === 'searching' && frame?.target !== undefined && (
          <div className="text-center py-2 shrink-0">
            <span className="text-sm text-zinc-500">
              Searching for:{' '}
              <span className="text-zinc-200 font-bold text-base">{frame.target}</span>
            </span>
            {frame?.found >= 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-3 text-sm text-emerald-500 font-semibold"
              >
                ✓ Found at index {frame.found}!
              </motion.span>
            )}
          </div>
        )
      }

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
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-zinc-500 font-mono">
                  {value}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Merge sort active range markers */}
      {
        isMergeSortFrame && frame.activeRange && frame.phase !== 'done' && (
          <div className="flex items-center justify-center gap-4 py-1 shrink-0">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 font-mono">
              Active range: [{frame.activeRange[0]}..{frame.activeRange[1]}]
            </span>
          </div>
        )
      }

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 py-2 shrink-0 border-t border-zinc-800/50">
        {algorithmType === 'sorting' && !isMergeSortFrame && (
          <>
            <Legend color="#27272a" label="Default" />
            <Legend color="#52525b" label="Comparing" />
            <Legend color="#b91c1c" label="Swapping" />
            <Legend color="#15803d" label="Sorted" />
            <Legend color="#a1a1aa" label="Pivot" />
          </>
        )}
        {isMergeSortFrame && (
          <>
            <Legend color="#52525b" label="Left Half" />
            <Legend color="#3f3f46" label="Right Half" />
            <Legend color="#52525b" label="Comparing" />
            <Legend color="#b91c1c" label="Placing" />
            <Legend color="#18181b" label="Inactive" />
            <Legend color="#15803d" label="Sorted" />
          </>
        )}
        {algorithmType === 'searching' && (
          <>
            <Legend color="#3f3f46" label="In Range" />
            <Legend color="#71717a" label="Mid" />
            <Legend color="#16a34a" label="Found" />
            <Legend color="#18181b" label="Eliminated" />
          </>
        )}
      </div>
    </div >
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
      <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">{label}</span>
    </div>
  );
}
