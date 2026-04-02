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
    if (!frame) return { fill: '#18181b', stroke: '#3f3f46', text: '#a1a1aa' };

    const { highlightedNodes = [], newNodeId, foundId, deletedId, phase } = frame;

    if (nodeId === deletedId && (phase === 'deleting')) {
        return { fill: '#450a0a', stroke: '#b91c1c', text: '#fca5a5' };
    }
    if (nodeId === newNodeId && phase === 'inserted') {
        return { fill: '#052e16', stroke: '#15803d', text: '#86efac' };
    }
    if (nodeId === newNodeId && phase === 'done') {
        return { fill: '#18181b', stroke: '#15803d', text: '#86efac' };
    }
    if (nodeId === foundId) {
        return { fill: '#052e16', stroke: '#15803d', text: '#86efac' };
    }
    if (highlightedNodes.length > 0 && nodeId === highlightedNodes[highlightedNodes.length - 1] && phase === 'traversing') {
        return { fill: '#27272a', stroke: '#71717a', text: '#f4f4f5' };
    }
    if (highlightedNodes.includes(nodeId)) {
        return { fill: '#27272a', stroke: '#a1a1aa', text: '#e4e4e7' };
    }
    return { fill: '#18181b', stroke: '#3f3f46', text: '#a1a1aa' };
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
                <p className="text-zinc-500 text-sm">Enter a value and choose an operation to begin</p>
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
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-[11px] font-semibold bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 shadow-sm uppercase tracking-wider">
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
                                stroke={highlighted ? '#a1a1aa' : '#27272a'}
                                strokeWidth={highlighted ? 2.5 : 1.5}
                                strokeOpacity={highlighted ? 1 : 0.6}
                                initial={false}
                                animate={{
                                    stroke: highlighted ? '#a1a1aa' : '#3f3f46',
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
            <div className="flex items-center justify-center gap-4 py-2 shrink-0 border-t border-zinc-800/50 flex-wrap">
                <LegendDot color="#a1a1aa" label="Path traversed" />
                <LegendDot color="#f4f4f5" label="Current node" />
                <LegendDot color="#15803d" label="Inserted / Found" />
                <LegendDot color="#b91c1c" label="Deleting" />
                <LegendDot color="#27272a" label="Default" />
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
