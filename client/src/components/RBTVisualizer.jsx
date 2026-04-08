import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NODE_R = 20;
const LEVEL_H = 80;
const VIEW_W = 900;
const VIEW_H = 480;

function layoutTree(root) {
  const positions = new Map();
  let counter = 0;

  function assign(node, depth) {
    if (!node) return;
    assign(node.left, depth + 1);
    positions.set(node.id, { x: 0, y: depth * LEVEL_H + NODE_R + 10, rank: counter++, node });
    assign(node.right, depth + 1);
  }

  assign(root, 0);

  const total = positions.size;
  const padding = NODE_R + 8;
  const usable = VIEW_W - padding * 2;
  positions.forEach((info) => {
    info.x = total <= 1 ? VIEW_W / 2 : padding + (info.rank / (total - 1)) * usable;
  });

  return positions;
}

function collectEdges(node, edges = []) {
  if (!node) return edges;
  if (node.left) { edges.push({ fromId: node.id, toId: node.left.id }); collectEdges(node.left, edges); }
  if (node.right) { edges.push({ fromId: node.id, toId: node.right.id }); collectEdges(node.right, edges); }
  return edges;
}

function nodeColor(nodeId, frame) {
  const { highlightedNodes = [], rotatingNodes = [], recoloredNodes = [], phase } = frame || {};
  const isHighlighted = highlightedNodes.includes(nodeId);
  const isRotating = rotatingNodes.includes(nodeId);
  const isRecolored = recoloredNodes.includes(nodeId);

  // Get the actual node color from the frame's root
  function findNode(node) {
    if (!node) return null;
    if (node.id === nodeId) return node;
    return findNode(node.left) || findNode(node.right);
  }
  const node = findNode(frame?.root);
  const isRed = node?.color === 'RED';

  if (isRotating) return { fill: '#1e1b4b', stroke: '#818cf8', text: '#c7d2fe', ring: '#818cf8' };
  if (isRecolored) return { fill: '#1c1917', stroke: '#f59e0b', text: '#fde68a', ring: '#f59e0b' };

  if (isRed) {
    return isHighlighted
      ? { fill: '#7f1d1d', stroke: '#f87171', text: '#fecaca', ring: '#f87171' }
      : { fill: '#450a0a', stroke: '#dc2626', text: '#fca5a5', ring: '#dc2626' };
  } else {
    return isHighlighted
      ? { fill: '#27272a', stroke: '#a1a1aa', text: '#f4f4f5', ring: '#a1a1aa' }
      : { fill: '#18181b', stroke: '#3f3f46', text: '#a1a1aa', ring: '#3f3f46' };
  }
}

export default function RBTVisualizer({ frame }) {
  const root = frame?.root ?? null;

  const positions = useMemo(() => (root ? layoutTree(root) : new Map()), [root]);
  const edges = useMemo(() => (root ? collectEdges(root) : []), [root]);

  const viewBox = useMemo(() => {
    if (positions.size === 0) return `0 0 ${VIEW_W} ${VIEW_H}`;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    positions.forEach(({ x, y }) => {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    });
    const pad = NODE_R + 20;
    const vw = Math.max(maxX - minX + pad * 2, VIEW_W);
    const vh = Math.max(maxY - minY + pad * 2, VIEW_H);
    const vx = (minX + maxX) / 2 - vw / 2;
    const vy = (minY + maxY) / 2 - vh / 2;
    return `${vx} ${vy} ${vw} ${vh}`;
  }, [positions]);

  if (!root) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Enter a value and press Insert to begin</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-auto">
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
              {frame.phase === 'traversing' && '🔍'}
              {frame.phase === 'searching' && '🔍'}
              {frame.phase === 'inserted' && '🔴'}
              {frame.phase === 'done' && '✅'}
              {frame.phase === 'notfound' && '❌'}
              {frame.phase === 'found' && '✅'}
              {frame.phase === 'duplicate' && '⚠️'}
              {frame.phase === 'deleting' && '🗑️'}
              {frame.phase === 'recoloring' && '🎨'}
              {frame.phase === 'rotating' && '🔄'}
              {frame.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG Tree */}
      <div className="flex-1 overflow-hidden flex justify-center">
        <svg
          width="100%"
          height="100%"
          viewBox={viewBox}
          className="overflow-visible"
          style={{ transition: 'viewBox 0.4s ease' }}
        >
          {/* Edges */}
          {edges.map(({ fromId, toId }) => {
            const from = positions.get(fromId);
            const to = positions.get(toId);
            if (!from || !to) return null;
            const isRotating = frame?.rotatingNodes?.includes(fromId) && frame?.rotatingNodes?.includes(toId);
            return (
              <motion.line
                key={`${fromId}-${toId}`}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                initial={false}
                animate={{ stroke: isRotating ? '#818cf8' : '#3f3f46', strokeWidth: isRotating ? 2.5 : 1.5 }}
                transition={{ duration: 0.3 }}
              />
            );
          })}

          {/* Nodes */}
          {Array.from(positions.entries()).map(([id, { x, y, node }]) => {
            const colors = nodeColor(id, frame);
            const bh = frame?.blackHeights?.get(id);

            return (
              <motion.g
                key={id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                style={{ originX: `${x}px`, originY: `${y}px` }}
              >
                {/* Glow ring for highlighted */}
                {(frame?.highlightedNodes?.includes(id) || frame?.rotatingNodes?.includes(id)) && (
                  <circle cx={x} cy={y} r={NODE_R + 5} fill="none" stroke={colors.ring} strokeWidth={1} opacity={0.3} />
                )}

                <motion.circle
                  cx={x} cy={y} r={NODE_R}
                  animate={{ fill: colors.fill, stroke: colors.stroke }}
                  strokeWidth={2}
                  transition={{ duration: 0.3 }}
                />

                {/* Value */}
                <text x={x} y={y + 5} textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="monospace" fill={colors.text}>
                  {node.value}
                </text>

                {/* Black-height badge */}
                {bh !== undefined && (
                  <g>
                    <circle cx={x + NODE_R - 2} cy={y - NODE_R + 2} r={10} fill="#09090b" stroke="#52525b" strokeWidth={1.5} />
                    <text x={x + NODE_R - 2} y={y - NODE_R + 6} textAnchor="middle" fontSize="9" fontWeight="700" fontFamily="monospace" fill="#a1a1aa">
                      {bh}
                    </text>
                  </g>
                )}
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 py-2 shrink-0 border-t border-zinc-800/50 flex-wrap">
        <LegendDot color="#dc2626" label="Red node" />
        <LegendDot color="#3f3f46" label="Black node" />
        <LegendDot color="#818cf8" label="Rotating" />
        <LegendDot color="#f59e0b" label="Recoloring" />
        <LegendDot color="#52525b" label="Badge = Black Height" />
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
