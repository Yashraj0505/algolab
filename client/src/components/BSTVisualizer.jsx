import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Layout constants ────────────────────────────────────────────────────────
const NODE_R = 22;
const LEVEL_H = 80;

/**
 * Compute (x, y) for every node via a recursive in-order layout.
 *
 * Returns Map<id, {x, y, node}>
 */
function layoutTree(root, width) {
    const positions = new Map();
    let counter = 0; // in-order rank

    function assign(node, depth) {
        if (!node) return;
        assign(node.left, depth + 1);
        const rank = counter++;
        positions.set(node.id, { x: 0, y: depth * LEVEL_H + NODE_R + 10, rank, node });
        assign(node.right, depth + 1);
    }

    assign(root, 0);

    // Map ranks → x positions
    const total = positions.size;
    const padding = NODE_R + 6;
    const usable = width - padding * 2;

    positions.forEach((info) => {
        info.x = total <= 1
            ? width / 2
            : padding + (info.rank / (total - 1)) * usable;
    });

    return positions;
}

/**
 * Collect all edges as { fromId, toId }
 */
function collectEdges(node, edges = []) {
    if (!node) return edges;
    if (node.left) {
        edges.push({ fromId: node.id, toId: node.left.id });
        collectEdges(node.left, edges);
    }
    if (node.right) {
        edges.push({ fromId: node.id, toId: node.right.id });
        collectEdges(node.right, edges);
    }
    return edges;
}

// ─── Color palette per phase / node state ───────────────────────────────────
function nodeColor(nodeId, frame) {
    if (!frame) return { fill: '#1e293b', stroke: '#475569', text: '#94a3b8' };

    const { highlightedNodes = [], newNodeId, foundId, deletedId, phase } = frame;

    if (nodeId === deletedId && (phase === 'deleting')) {
        return { fill: '#7f1d1d', stroke: '#ef4444', text: '#fca5a5', glow: 'rgba(239,68,68,0.5)' };
    }
    if (nodeId === newNodeId && phase === 'inserted') {
        return { fill: '#064e3b', stroke: '#10b981', text: '#6ee7b7', glow: 'rgba(16,185,129,0.5)' };
    }
    if (nodeId === newNodeId && phase === 'done') {
        return { fill: '#064e3b', stroke: '#10b981', text: '#6ee7b7', glow: 'rgba(16,185,129,0.35)' };
    }
    if (nodeId === foundId) {
        return { fill: '#064e3b', stroke: '#10b981', text: '#6ee7b7', glow: 'rgba(16,185,129,0.5)' };
    }
    if (highlightedNodes.length > 0 && nodeId === highlightedNodes[highlightedNodes.length - 1] && phase === 'traversing') {
        return { fill: '#312e81', stroke: '#818cf8', text: '#c7d2fe', glow: 'rgba(129,140,248,0.5)' };
    }
    if (highlightedNodes.includes(nodeId)) {
        return { fill: '#1e1b4b', stroke: '#6366f1', text: '#a5b4fc', glow: 'rgba(99,102,241,0.35)' };
    }
    return { fill: '#1e293b', stroke: '#334155', text: '#64748b' };
}

function edgeIsHighlighted(fromId, toId, frame) {
    if (!frame) return false;
    const { highlightedNodes = [] } = frame;
    if (highlightedNodes.length < 2) return false;
    for (let i = 0; i < highlightedNodes.length - 1; i++) {
        if (highlightedNodes[i] === fromId && highlightedNodes[i + 1] === toId) return true;
    }
    return false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BSTVisualizer
// ═══════════════════════════════════════════════════════════════════════════════
export default function BSTVisualizer({ frame, containerWidth = 800, containerHeight = 520 }) {
    const root = frame?.root ?? null;

    const positions = useMemo(
        () => (root ? layoutTree(root, containerWidth) : new Map()),
        [root, containerWidth]
    );

    const edges = useMemo(() => (root ? collectEdges(root) : []), [root]);

    // Compute SVG height
    let maxY = 60;
    positions.forEach(({ y }) => { if (y > maxY) maxY = y; });
    const svgHeight = Math.max(containerHeight, maxY + NODE_R + 20);

    if (!root) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-slate-500 text-sm">Enter a value and choose an operation to begin</p>
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
                        transition={{ duration: 0.25 }}
                        className="shrink-0 text-center py-2 px-4"
                    >
                        <span className={`
              inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold
              ${frame.phase === 'done' || frame.phase === 'inserted' || frame.phase === 'found'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                                : frame.phase === 'notfound' || frame.phase === 'duplicate'
                                    ? 'bg-red-500/15 text-red-300 border border-red-500/25'
                                    : frame.phase === 'deleting'
                                        ? 'bg-red-500/15 text-red-300 border border-red-500/25'
                                        : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                            }
            `}>
                            {frame.phase === 'traversing' && '🔍'}
                            {frame.phase === 'searching' && '🔍'}
                            {frame.phase === 'inserted' && '✅'}
                            {frame.phase === 'found' && '✅'}
                            {frame.phase === 'done' && '✅'}
                            {frame.phase === 'notfound' && '❌'}
                            {frame.phase === 'duplicate' && '⚠️'}
                            {frame.phase === 'deleting' && '🗑️'}
                            {frame.message}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SVG Tree */}
            <div className="flex-1 overflow-auto flex justify-center">
                <svg
                    width={containerWidth}
                    height={svgHeight}
                    className="overflow-visible"
                >
                    <defs>
                        {/* Glow filter */}
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Edges */}
                    {edges.map(({ fromId, toId }) => {
                        const from = positions.get(fromId);
                        const to = positions.get(toId);
                        if (!from || !to) return null;
                        const highlighted = edgeIsHighlighted(fromId, toId, frame);
                        return (
                            <motion.line
                                key={`${fromId}-${toId}`}
                                x1={from.x}
                                y1={from.y}
                                x2={to.x}
                                y2={to.y}
                                stroke={highlighted ? '#818cf8' : '#1e293b'}
                                strokeWidth={highlighted ? 2.5 : 1.5}
                                strokeOpacity={highlighted ? 1 : 0.6}
                                initial={false}
                                animate={{
                                    stroke: highlighted ? '#818cf8' : '#334155',
                                    strokeWidth: highlighted ? 2.5 : 1.5,
                                }}
                                transition={{ duration: 0.3 }}
                            />
                        );
                    })}

                    {/* Nodes */}
                    {Array.from(positions.entries()).map(([id, { x, y, node }]) => {
                        const colors = nodeColor(id, frame);
                        return (
                            <motion.g
                                key={id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                style={{ originX: `${x}px`, originY: `${y}px` }}
                            >
                                {/* Glow halo */}
                                {colors.glow && (
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={NODE_R + 6}
                                        fill={colors.glow}
                                        filter="url(#glow)"
                                    />
                                )}

                                {/* Node circle */}
                                <motion.circle
                                    cx={x}
                                    cy={y}
                                    r={NODE_R}
                                    fill={colors.fill}
                                    stroke={colors.stroke}
                                    strokeWidth={2}
                                    animate={{
                                        fill: colors.fill,
                                        stroke: colors.stroke,
                                    }}
                                    transition={{ duration: 0.3 }}
                                />

                                {/* Value label */}
                                <text
                                    x={x}
                                    y={y + 5}
                                    textAnchor="middle"
                                    fontSize="13"
                                    fontWeight="600"
                                    fontFamily="monospace"
                                    fill={colors.text}
                                >
                                    {node.value}
                                </text>
                            </motion.g>
                        );
                    })}
                </svg>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 py-2 shrink-0 border-t border-slate-800/50 flex-wrap">
                <LegendDot color="#6366f1" label="Path traversed" />
                <LegendDot color="#818cf8" label="Current node" />
                <LegendDot color="#10b981" label="Inserted / Found" />
                <LegendDot color="#ef4444" label="Deleting" />
                <LegendDot color="#334155" label="Default" />
            </div>
        </div>
    );
}

function LegendDot({ color, label }) {
    return (
        <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: color, background: color + '33' }} />
            <span className="text-[10px] text-slate-500">{label}</span>
        </div>
    );
}
