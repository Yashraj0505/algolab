import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NODE_R = 22;
const LEVEL_H = 76;

// Build tree positions from array (heap is a complete binary tree)
function layoutHeap(array, heapSize, containerWidth) {
  const positions = [];
  const depth = Math.floor(Math.log2(heapSize || 1));
  const totalWidth = containerWidth;

  for (let i = 0; i < heapSize; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const posInLevel = i - (Math.pow(2, level) - 1);
    const nodesInLevel = Math.pow(2, level);
    const x = (totalWidth / (nodesInLevel + 1)) * (posInLevel + 1);
    const y = level * LEVEL_H + NODE_R + 10;
    positions.push({ x, y, i });
  }
  return positions;
}

function nodeColor(idx, frame) {
  const { comparing = [], swapping = [], sorted = [], heapified = [], heapSize, array } = frame || {};
  const inHeap = heapSize === undefined || idx < heapSize;

  if (sorted.includes(idx)) return { fill: '#052e16', stroke: '#15803d', text: '#86efac' };
  if (!inHeap) return { fill: '#09090b', stroke: '#27272a', text: '#3f3f46' };
  if (swapping.includes(idx)) return { fill: '#450a0a', stroke: '#ef4444', text: '#fca5a5' };
  if (comparing.includes(idx)) return { fill: '#1c1917', stroke: '#f59e0b', text: '#fde68a' };
  if (heapified.includes(idx)) return { fill: '#0c1a2e', stroke: '#3b82f6', text: '#93c5fd' };
  return { fill: '#18181b', stroke: '#3f3f46', text: '#a1a1aa' };
}

export default function HeapVisualizer({ frame, isMin, containerWidth = 760 }) {
  const array = frame?.array ?? [];
  const heapSize = frame?.heapSize ?? array.length;
  const positions = useMemo(
    () => layoutHeap(array, heapSize, containerWidth),
    [array, heapSize, containerWidth]
  );

  // SVG height based on depth
  const depth = heapSize > 0 ? Math.floor(Math.log2(heapSize)) : 0;
  const svgHeight = (depth + 1) * LEVEL_H + NODE_R + 30;

  const maxVal = array.length > 0 ? Math.max(...array, 1) : 1;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Status banner */}
      <AnimatePresence mode="wait">
        {frame?.message && (
          <motion.div
            key={frame.message}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 text-center py-2 px-4"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-[11px] font-semibold bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 shadow-sm uppercase tracking-wider">
              {frame.phase === 'insert' && '➕'}
              {frame.phase === 'extract' && '⬆️'}
              {frame.phase === 'comparing' && '🔍'}
              {frame.phase === 'swap' && '🔄'}
              {frame.phase === 'heapify' && '⚙️'}
              {frame.phase === 'heapified' && '✓'}
              {frame.phase === 'build' && '🏗️'}
              {frame.phase === 'done' && '✅'}
              {frame.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tree view */}
      <div className="flex-1 flex justify-center overflow-hidden min-h-0">
        <svg width={containerWidth} height={svgHeight} className="overflow-visible shrink-0">
          {/* Edges */}
          {positions.map(({ x, y, i }) => {
            if (i === 0) return null;
            const parentIdx = Math.floor((i - 1) / 2);
            const parent = positions[parentIdx];
            if (!parent) return null;
            const isSorted = frame?.sorted?.includes(i) && frame?.sorted?.includes(parentIdx);
            return (
              <line
                key={`e-${i}`}
                x1={parent.x} y1={parent.y}
                x2={x} y2={y}
                stroke={isSorted ? '#15803d' : '#3f3f46'}
                strokeWidth={1.5}
              />
            );
          })}

          {/* Nodes */}
          {positions.map(({ x, y, i }) => {
            const colors = nodeColor(i, frame);
            return (
              <motion.g
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                style={{ originX: `${x}px`, originY: `${y}px` }}
              >
                <motion.circle
                  cx={x} cy={y} r={NODE_R}
                  animate={{ fill: colors.fill, stroke: colors.stroke }}
                  strokeWidth={2}
                  transition={{ duration: 0.25 }}
                />
                <text x={x} y={y + 5} textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="monospace" fill={colors.text}>
                  {array[i]}
                </text>
                {/* Index label */}
                <text x={x} y={y + NODE_R + 12} textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#52525b">
                  [{i}]
                </text>
              </motion.g>
            );
          })}

          {/* Heap size boundary marker */}
          {frame?.heapSize !== undefined && frame.heapSize < array.length && (
            <text x={containerWidth - 8} y={16} textAnchor="end" fontSize="10" fontFamily="monospace" fill="#52525b">
              heap size: {frame.heapSize}
            </text>
          )}
        </svg>
      </div>

      {/* Array bar view */}
      <div className="shrink-0 border-t border-zinc-800/50 px-4 pt-3 pb-1">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-600 mb-2">Array View</div>
        <div className="flex items-end gap-[3px] h-16">
          {array.map((val, idx) => {
            const colors = nodeColor(idx, frame);
            const heightPct = Math.max((val / maxVal) * 100, 8);
            return (
              <motion.div
                key={idx}
                className="relative flex flex-col items-center"
                style={{ flex: 1, maxWidth: 36 }}
              >
                <motion.div
                  animate={{ height: `${heightPct}%`, background: colors.stroke }}
                  transition={{ duration: 0.25 }}
                  className="w-full rounded-t-sm"
                  style={{ minHeight: 4 }}
                />
                <span className="text-[9px] font-mono text-zinc-600 mt-0.5">{val}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 py-2 shrink-0 border-t border-zinc-800/50 flex-wrap">
        <LegendDot color="#f59e0b" label="Comparing" />
        <LegendDot color="#ef4444" label="Swapping" />
        <LegendDot color="#3b82f6" label="Heapified" />
        <LegendDot color="#15803d" label="Sorted" />
        <LegendDot color="#27272a" label="Outside heap" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
      <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">{label}</span>
    </div>
  );
}
