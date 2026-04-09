import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Color palettes per state ─────────────────────────────────────────────────
const NODE_COLORS = {
  unvisited:  { fill: '#18181b', stroke: '#3f3f46', text: '#71717a' },
  visiting:   { fill: '#1e1b4b', stroke: '#6366f1', text: '#a5b4fc' },
  inStack:    { fill: '#2d1b69', stroke: '#7c3aed', text: '#c4b5fd' },
  visited:    { fill: '#052e16', stroke: '#16a34a', text: '#86efac' },
  current:    { fill: '#1e3a5f', stroke: '#3b82f6', text: '#93c5fd' },
  source:     { fill: '#1c1917', stroke: '#f59e0b', text: '#fcd34d' },
  finished:   { fill: '#14532d', stroke: '#22c55e', text: '#86efac' },
  inPath:     { fill: '#422006', stroke: '#f97316', text: '#fed7aa' },
};

const EDGE_COLORS = {
  default:    { stroke: '#27272a', width: 1.5, opacity: 0.7 },
  mst:        { stroke: '#22c55e', width: 3,   opacity: 1 },
  rejected:   { stroke: '#dc2626', width: 2,   opacity: 0.6 },
  current:    { stroke: '#6366f1', width: 3,   opacity: 1 },
  relaxing:   { stroke: '#3b82f6', width: 3,   opacity: 1 },
  updated:    { stroke: '#22c55e', width: 3,   opacity: 1 },
  treeEdge:   { stroke: '#7c3aed', width: 2.5, opacity: 1 },
  exploring:  { stroke: '#f59e0b', width: 2.5, opacity: 1 },
  path:       { stroke: '#f97316', width: 3,   opacity: 1 },
};

// ─── Arrowhead marker defs ────────────────────────────────────────────────────
function Defs({ directed }) {
  const markers = directed
    ? [
        { id: 'arrow-default',   color: '#3f3f46' },
        { id: 'arrow-treeEdge',  color: '#7c3aed' },
        { id: 'arrow-exploring', color: '#f59e0b' },
        { id: 'arrow-current',   color: '#6366f1' },
        { id: 'arrow-done',      color: '#22c55e' },
      ]
    : [];

  return (
    <defs>
      {markers.map(({ id, color }) => (
        <marker
          key={id}
          id={id}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      ))}
    </defs>
  );
}

// ─── Compute edge geometry (shorten so arrows don't overlap nodes) ─────────
const NODE_R = 28;

function edgeGeom(from, to, nodeR = NODE_R) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: from.x + ux * nodeR,
    y1: from.y + uy * nodeR,
    x2: to.x - ux * (nodeR + 6),
    y2: to.y - uy * (nodeR + 6),
    midX: (from.x + to.x) / 2,
    midY: (from.y + to.y) / 2,
  };
}

// ─── Helpers: determine colors from frame ────────────────────────────────────
function resolveEdgeStyle(edge, frame, algoType) {
  if (!frame) return EDGE_COLORS.default;

  if (algoType === 'kruskal') {
    const isMST = (frame.mstEdges || []).some(
      e => (e.from === edge.from && e.to === edge.to) || (e.from === edge.to && e.to === edge.from)
    );
    const isRejected = (frame.rejectedEdges || []).some(
      e => (e.from === edge.from && e.to === edge.to) || (e.from === edge.to && e.to === edge.from)
    );
    const isCurrent = frame.currentEdge &&
      ((frame.currentEdge.from === edge.from && frame.currentEdge.to === edge.to) ||
       (frame.currentEdge.from === edge.to && frame.currentEdge.to === edge.from));

    if (isCurrent && frame.phase === 'accepted') return EDGE_COLORS.mst;
    if (isCurrent) return EDGE_COLORS.current;
    if (isMST) return EDGE_COLORS.mst;
    if (isRejected) return EDGE_COLORS.rejected;
    return EDGE_COLORS.default;
  }

  if (algoType === 'dijkstra') {
    const isRelaxing = frame.relaxedEdge &&
      ((frame.relaxedEdge.from === edge.from && frame.relaxedEdge.to === edge.to) ||
       (frame.relaxedEdge.from === edge.to && frame.relaxedEdge.to === edge.from));
    const isPath = (frame.pathEdges || []).some(
      e => (e.from === edge.from && e.to === edge.to) || (e.from === edge.to && e.to === edge.from)
    );

    if (isRelaxing && frame.phase === 'updated') return EDGE_COLORS.updated;
    if (isRelaxing) return EDGE_COLORS.relaxing;
    if (isPath) return EDGE_COLORS.path;
    return EDGE_COLORS.default;
  }

  if (algoType === 'topoSort') {
    const isCurrent = frame.currentEdge &&
      frame.currentEdge.from === edge.from && frame.currentEdge.to === edge.to;
    const isDone = (frame.color || {})[edge.from] === 'visited' &&
      (frame.color || {})[edge.to] === 'visited';

    if (isCurrent && frame.phase === 'push') return EDGE_COLORS.treeEdge;
    if (isCurrent) return EDGE_COLORS.exploring;
    if (isDone) return EDGE_COLORS.treeEdge;
    return EDGE_COLORS.default;
  }

  return EDGE_COLORS.default;
}

function resolveNodeStyle(nodeId, frame, algoType) {
  if (!frame) return NODE_COLORS.unvisited;

  if (algoType === 'dijkstra') {
    const isSource = nodeId === 'A';
    const isCurrent = frame.currentNode === nodeId;
    const isVisited = (frame.visited || []).includes(nodeId);
    const isRelaxTarget = frame.relaxedEdge?.to === nodeId;

    if (frame.phase === 'done') return isVisited ? NODE_COLORS.visited : NODE_COLORS.unvisited;
    if (isCurrent) return NODE_COLORS.current;
    if (isRelaxTarget && frame.phase === 'updated') return NODE_COLORS.visiting;
    if (isVisited) return NODE_COLORS.visited;
    if (isSource && frame.phase === 'init') return NODE_COLORS.source;
    return NODE_COLORS.unvisited;
  }

  if (algoType === 'kruskal') {
    const inMST = (frame.mstEdges || []).some(e => e.from === nodeId || e.to === nodeId);
    const isCurrent = frame.currentEdge &&
      (frame.currentEdge.from === nodeId || frame.currentEdge.to === nodeId);

    if (isCurrent && frame.phase !== 'done') return NODE_COLORS.current;
    if (inMST) return NODE_COLORS.visited;
    return NODE_COLORS.unvisited;
  }

  if (algoType === 'topoSort') {
    const c = (frame.color || {})[nodeId];
    const isCurrent = frame.currentNode === nodeId;

    if (frame.phase === 'done') return NODE_COLORS.finished;
    if (isCurrent && c === 'inStack') return NODE_COLORS.inStack;
    if (isCurrent) return NODE_COLORS.current;
    if (c === 'visited') return NODE_COLORS.finished;
    if (c === 'inStack') return NODE_COLORS.visiting;
    return NODE_COLORS.unvisited;
  }

  return NODE_COLORS.unvisited;
}

// ─── Distance Table (Dijkstra) ────────────────────────────────────────────────
function DistanceTable({ frame }) {
  if (!frame?.distances) return null;
  const entries = Object.entries(frame.distances);

  return (
    <div className="absolute top-3 right-3 bg-zinc-900/90 border border-zinc-700/50 rounded-lg p-3 backdrop-blur-sm shadow-xl">
      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
        Distances from A
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {entries.map(([node, dist]) => (
          <div key={node} className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-zinc-400 w-4">{node}</span>
            <span
              className={`text-[12px] font-mono font-bold transition-colors duration-300 ${
                dist === Infinity ? 'text-zinc-600' :
                frame.visited?.includes(node) ? 'text-green-400' :
                frame.currentNode === node ? 'text-blue-400' :
                'text-zinc-200'
              }`}
            >
              {dist === Infinity ? '∞' : dist}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Topo Result Strip ────────────────────────────────────────────────────────
function TopoResult({ frame, nodes }) {
  if (!frame?.result?.length) return null;
  return (
    <div className="absolute top-3 right-3 bg-zinc-900/90 border border-zinc-700/50 rounded-lg p-3 backdrop-blur-sm shadow-xl max-w-xs">
      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
        Topo Order
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        {frame.result.map((id, i) => {
          const n = nodes.find(n => n.id === id);
          return (
            <span key={id} className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded bg-purple-900/60 border border-purple-700/50 text-purple-300 text-[11px] font-mono font-bold">
                {n?.label.split('\n')[0] || id}
              </span>
              {i < frame.result.length - 1 && (
                <span className="text-zinc-600 text-xs">→</span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── DFS Stack Panel (Topo) ──────────────────────────────────────────────────
function DFSStackPanel({ frame, nodes }) {
  if (!frame) return null;
  const stack = frame.dfsStack || [];

  return (
    <div className="absolute top-3 left-3 bg-zinc-900/90 border border-zinc-700/50 rounded-lg p-3 backdrop-blur-sm shadow-xl">
      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
        DFS Stack
      </div>
      {stack.length === 0 ? (
        <span className="text-zinc-600 text-[11px]">empty</span>
      ) : (
        <div className="flex flex-col-reverse gap-1">
          {stack.map((id, i) => {
            const n = nodes.find(n => n.id === id);
            const isTop = i === stack.length - 1;
            return (
              <div
                key={`${id}-${i}`}
                className={`px-3 py-1 rounded text-[11px] font-mono font-bold border ${
                  isTop
                    ? 'bg-purple-900/60 border-purple-700/50 text-purple-300'
                    : 'bg-zinc-800/60 border-zinc-700/30 text-zinc-400'
                }`}
              >
                {n?.label.split('\n')[0] || id}
                {isTop && <span className="ml-1 text-[9px] text-purple-500">← top</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MST Edge List (Kruskal) ─────────────────────────────────────────────────
function MSTPanel({ frame }) {
  if (!frame?.mstEdges) return null;
  const totalW = (frame.mstEdges || []).reduce((s, e) => s + e.weight, 0);

  return (
    <div className="absolute top-3 right-3 bg-zinc-900/90 border border-zinc-700/50 rounded-lg p-3 backdrop-blur-sm shadow-xl">
      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
        MST Edges{totalW > 0 && <span className="ml-2 text-green-500">w={totalW}</span>}
      </div>
      {frame.mstEdges.length === 0 ? (
        <span className="text-zinc-600 text-[11px]">none yet</span>
      ) : (
        <div className="flex flex-col gap-1">
          {frame.mstEdges.map((e, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              <span className="text-green-400 font-bold">{e.from}–{e.to}</span>
              <span className="text-zinc-500">w={e.weight}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main GraphVisualizer
// ═══════════════════════════════════════════════════════════════════════════════
export default function GraphVisualizer({ frame, algoType, defaultNodes = [], defaultEdges = [] }) {
  const nodes = frame?.nodes?.length ? frame.nodes : defaultNodes;
  const edges = frame?.edges?.length ? frame.edges : defaultEdges;
  const directed = algoType === 'topoSort';

  // Compute bounding box for SVG viewport
  const { minX, minY, maxX, maxY } = useMemo(() => {
    if (!nodes.length) return { minX: 0, minY: 0, maxX: 900, maxY: 500 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(({ x, y }) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
    return { minX, minY, maxX, maxY };
  }, [nodes]);

  const pad = 60;
  const vbX = minX - pad;
  const vbY = minY - pad;
  const vbW = (maxX - minX) + pad * 2;
  const vbH = (maxY - minY) + pad * 2;

  const nodeMap = useMemo(() => {
    const m = {};
    nodes.forEach(n => { m[n.id] = n; });
    return m;
  }, [nodes]);

  const phaseIcons = {
    init: '🗺️', visiting: '🔍', relaxing: '⚡', updated: '✅',
    considering: '🤔', accepted: '✅', rejected: '❌',
    push: '📥', exploring: '🔍', finished: '✅', done: '🎉',
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
      {/* Status Banner */}
      <AnimatePresence mode="wait">
        {frame?.message && (
          <motion.div
            key={frame.message}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 px-4 py-2 text-center z-10"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-[11px] font-semibold bg-zinc-800/60 border border-zinc-700/40 text-zinc-300 shadow-sm uppercase tracking-wider backdrop-blur-sm max-w-3xl">
              <span>{phaseIcons[frame.phase] || '▶'}</span>
              <span className="normal-case font-normal text-[12px] tracking-normal text-zinc-300">{frame.message}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <Defs directed={directed} />

          {/* Edges */}
          {edges.map((edge, i) => {
            const fromNode = nodeMap[edge.from];
            const toNode = nodeMap[edge.to];
            if (!fromNode || !toNode) return null;

            const geom = edgeGeom(fromNode, toNode);
            const style = resolveEdgeStyle(edge, frame, algoType);
            const markerId = directed ? `arrow-${
              style === EDGE_COLORS.treeEdge ? 'treeEdge' :
              style === EDGE_COLORS.exploring ? 'exploring' :
              style === EDGE_COLORS.current ? 'current' :
              'default'
            }` : undefined;

            return (
              <g key={`edge-${i}`}>
                <motion.line
                  x1={geom.x1} y1={geom.y1}
                  x2={geom.x2} y2={geom.y2}
                  stroke={style.stroke}
                  strokeWidth={style.width}
                  strokeOpacity={style.opacity}
                  markerEnd={directed ? `url(#${markerId})` : undefined}
                  animate={{
                    stroke: style.stroke,
                    strokeWidth: style.width,
                    strokeOpacity: style.opacity,
                  }}
                  transition={{ duration: 0.35 }}
                />
                {/* Weight label */}
                {edge.weight !== undefined && (
                  <text
                    x={geom.midX}
                    y={geom.midY - 6}
                    textAnchor="middle"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="700"
                    fill={style.stroke}
                    fillOpacity={0.9}
                    stroke="#09090b"
                    strokeWidth="3"
                    paintOrder="stroke"
                  >
                    {edge.weight}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const colors = resolveNodeStyle(node.id, frame, algoType);
            const label = node.label || node.id;
            const lines = label.split('\n');

            return (
              <motion.g key={node.id}>
                {/* Glow ring for active nodes */}
                {(frame?.currentNode === node.id || (frame?.relaxedEdge?.to === node.id)) && (
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_R + 8}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth={1.5}
                    strokeOpacity={0.4}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                )}

                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_R}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={2.5}
                  style={{ transition: 'fill 0.35s, stroke 0.35s' }}
                />

                {/* Node label — support two lines */}
                {lines.length === 1 ? (
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="700"
                    fontFamily="monospace"
                    fill={colors.text}
                  >
                    {lines[0]}
                  </text>
                ) : (
                  <>
                    <text
                      x={node.x}
                      y={node.y - 5}
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="700"
                      fontFamily="monospace"
                      fill={colors.text}
                    >
                      {lines[0]}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 9}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="400"
                      fontFamily="sans-serif"
                      fill={colors.text}
                      fillOpacity={0.7}
                    >
                      {lines[1]}
                    </text>
                  </>
                )}
              </motion.g>
            );
          })}
        </svg>

        {/* Info Overlays */}
        {algoType === 'dijkstra' && <DistanceTable frame={frame} />}
        {algoType === 'kruskal' && <MSTPanel frame={frame} />}
        {algoType === 'topoSort' && (
          <>
            <DFSStackPanel frame={frame} nodes={nodes} />
            <TopoResult frame={frame} nodes={nodes} />
          </>
        )}
      </div>

      {/* Legend */}
      <div className="shrink-0 flex items-center justify-center gap-4 py-2 border-t border-zinc-800/50 flex-wrap">
        {algoType === 'dijkstra' && (
          <>
            <LegendDot color="#f59e0b" label="Source" />
            <LegendDot color="#3b82f6" label="Current" />
            <LegendDot color="#6366f1" label="Relaxing" />
            <LegendDot color="#22c55e" label="Visited" />
            <LegendDot color="#f97316" label="Shortest path" />
          </>
        )}
        {algoType === 'kruskal' && (
          <>
            <LegendDot color="#6366f1" label="Considering" />
            <LegendDot color="#22c55e" label="In MST" />
            <LegendDot color="#dc2626" label="Rejected (cycle)" />
            <LegendDot color="#3f3f46" label="Default" />
          </>
        )}
        {algoType === 'topoSort' && (
          <>
            <LegendDot color="#3f3f46" label="Unvisited" />
            <LegendDot color="#7c3aed" label="In DFS stack" />
            <LegendDot color="#22c55e" label="Finished" />
            <LegendDot color="#f59e0b" label="Exploring" />
          </>
        )}
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
