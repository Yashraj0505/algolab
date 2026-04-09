import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NODE_R = 20;
const LEVEL_H = 80;
const VIEW_W = 900;
const VIEW_H = 480;

function layoutTree(root, width) {
  const positions = new Map();
  let counter = 0;

  function assign(node, depth) {
    if (!node) return;
    assign(node.left, depth + 1);
    const rank = counter++;
    positions.set(node.id, { x: 0, y: depth * LEVEL_H + NODE_R + 10, rank, node });
    assign(node.right, depth + 1);
  }

  assign(root, 0);

  const total = positions.size;
  const padding = NODE_R + 8;
  const usable = width - padding * 2;

  positions.forEach((info) => {
    info.x = total <= 1 ? width / 2 : padding + (info.rank / (total - 1)) * usable;
  });

  return positions;
}

function collectEdges(node, edges = []) {
  if (!node) return edges;
  if (node.left) { edges.push({ fromId: node.id, toId: node.left.id }); collectEdges(node.left, edges); }
  if (node.right) { edges.push({ fromId: node.id, toId: node.right.id }); collectEdges(node.right, edges); }
  return edges;
}

function height(node) { return node ? node.height : 0; }
function balanceFactor(node) { return node ? height(node.left) - height(node.right) : 0; }
function collectBalanceFactors(node, map = new Map()) {
  if (!node) return map;
  map.set(node.id, balanceFactor(node));
  collectBalanceFactors(node.left, map);
  collectBalanceFactors(node.right, map);
  return map;
}

function nodeColor(nodeId, frame) {
  const { highlightedNodes = [], rotatingNodes = [], unbalancedNode, newNodeId, deletedId, phase } = frame || {};

  if (nodeId === deletedId && phase === 'deleting')
    return { fill: '#450a0a', stroke: '#b91c1c', text: '#fca5a5' };
  if (nodeId === unbalancedNode)
    return { fill: '#431407', stroke: '#ea580c', text: '#fed7aa' };
  if (rotatingNodes.includes(nodeId))
    return { fill: '#1e1b4b', stroke: '#818cf8', text: '#c7d2fe' };
  if (nodeId === newNodeId && phase === 'inserted')
    return { fill: '#052e16', stroke: '#15803d', text: '#86efac' };
  if (nodeId === newNodeId && (phase === 'done' || phase === 'rotating'))
    return { fill: '#18181b', stroke: '#15803d', text: '#86efac' };
  if (highlightedNodes.length > 0 && nodeId === highlightedNodes[highlightedNodes.length - 1])
    return { fill: '#27272a', stroke: '#71717a', text: '#f4f4f5' };
  if (highlightedNodes.includes(nodeId))
    return { fill: '#27272a', stroke: '#a1a1aa', text: '#e4e4e7' };
  return { fill: '#18181b', stroke: '#3f3f46', text: '#a1a1aa' };
}

function bfColor(bf) {
  if (bf === 0) return '#22c55e';
  if (Math.abs(bf) === 1) return '#eab308';
  return '#ef4444';
}

export default function AVLVisualizer({ frame, containerWidth = 820, containerHeight = 520 }) {
  const root = frame?.root ?? null;

  const balanceFactors = useMemo(() => {
    if (frame?.balanceFactors && frame.balanceFactors.size > 0) return frame.balanceFactors;
    return root ? collectBalanceFactors(root) : new Map();
  }, [frame, root]);

  const positions = useMemo(
    () => (root ? layoutTree(root, VIEW_W) : new Map()),
    [root]
  );
  const edges = useMemo(() => (root ? collectEdges(root) : []), [root]);

  // Find focused node: last highlighted, unbalanced, or rotating
  const focusId = useMemo(() => {
    const { highlightedNodes = [], unbalancedNode, rotatingNodes = [], newNodeId, phase } = frame || {};
    if (unbalancedNode) return unbalancedNode;
    if (rotatingNodes.length) return rotatingNodes[0];
    if (highlightedNodes.length) return highlightedNodes[highlightedNodes.length - 1];
    if (newNodeId && (phase === 'inserted' || phase === 'done')) return newNodeId;
    return null;
  }, [frame]);

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
    // center on focused node if available, else center on tree
    const focused = focusId ? positions.get(focusId) : null;
    const cx = focused ? focused.x : (minX + maxX) / 2;
    const cy = focused ? focused.y : (minY + maxY) / 2;
    // clamp so tree bounds stay visible
    const vx = (minX + maxX) / 2 - vw / 2;
    const vy = (minY + maxY) / 2 - vh / 2;
    return `${vx} ${vy} ${vw} ${vh}`;
  }, [focusId, positions]);

  let maxY = 60;
  positions.forEach(({ y }) => { if (y > maxY) maxY = y; });
  const svgHeight = Math.max(containerHeight, maxY + NODE_R + 30);

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
              {frame.phase === 'inserted' && '✅'}
              {frame.phase === 'done' && '✅'}
              {frame.phase === 'notfound' && '❌'}
              {frame.phase === 'duplicate' && '⚠️'}
              {frame.phase === 'deleting' && '🗑️'}
              {frame.phase === 'unbalanced' && '⚖️'}
              {frame.phase === 'rotating' && '🔄'}
              {frame.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG Tree */}
      <div className="flex-1 overflow-hidden flex justify-center">
        <svg
          width={containerWidth}
          height={Math.min(svgHeight, containerHeight)}
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
                animate={{
                  stroke: isRotating ? '#818cf8' : '#3f3f46',
                  strokeWidth: isRotating ? 2.5 : 1.5,
                }}
                transition={{ duration: 0.3 }}
              />
            );
          })}

          {/* Nodes */}
          {Array.from(positions.entries()).map(([id, { x, y, node }]) => {
            const colors = nodeColor(id, frame);
            const bf = balanceFactors.get(id);
            const bfVal = bf !== undefined ? bf : null;

            return (
              <motion.g
                key={id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                style={{ originX: `${x}px`, originY: `${y}px` }}
              >
                {/* Node circle */}
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

                {/* Balance factor badge */}
                {bfVal !== null && (
                  <g>
                    <circle cx={x + NODE_R - 2} cy={y - NODE_R + 2} r={10} fill="#09090b" stroke={bfColor(bfVal)} strokeWidth={1.5} />
                    <text
                      x={x + NODE_R - 2} y={y - NODE_R + 6}
                      textAnchor="middle" fontSize="9" fontWeight="700" fontFamily="monospace"
                      fill={bfColor(bfVal)}
                    >
                      {bfVal > 0 ? `+${bfVal}` : bfVal}
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
        <LegendDot color="#22c55e" label="BF = 0" />
        <LegendDot color="#eab308" label="BF = ±1" />
        <LegendDot color="#ef4444" label="BF = ±2 (unbalanced)" />
        <LegendDot color="#ea580c" label="Unbalanced node" />
        <LegendDot color="#818cf8" label="Rotating" />
        <LegendDot color="#15803d" label="Inserted" />
        <LegendDot color="#b91c1c" label="Deleting" />
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
