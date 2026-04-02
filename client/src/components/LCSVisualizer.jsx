import { motion } from 'framer-motion';

/**
 * LCSVisualizer — renders the DP table as an animated grid.
 *
 * Props:
 *  - frame: current animation frame from lcs generator
 */
export default function LCSVisualizer({ frame }) {
    const {
        dp,
        str1 = '',
        str2 = '',
        phase = 'filling',
        activeCell,
        filledCells = new Set(),
        matchCells = new Set(),
        backtrackPath = [],
        lcsResult,
        message,
    } = frame || {};

    if (!dp) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-zinc-500 text-sm">Enter two strings and press Run to begin</p>
            </div>
        );
    }

    const rows = dp.length;
    const cols = dp[0].length;

    // Build a Set of backtrack coords for quick lookup
    const btSet = new Set(backtrackPath.map(([r, c]) => `${r},${c}`));

    // ── Cell colour logic ──────────────────────────────────────────────────
    const getCellStyle = (r, c) => {
        const key = `${r},${c}`;

        // Header row/col (index 0)
        if (r === 0 || c === 0) {
            return { bg: '#18181b', text: '#71717a', border: '#27272a' };
        }

        // Active cell being computed
        if (activeCell && activeCell[0] === r && activeCell[1] === c) {
            if (phase === 'backtracking') {
                return { bg: '#7c3aed', text: '#f5f3ff', border: '#8b5cf6', glow: true };
            }
            return { bg: '#3f3f46', text: '#fafafa', border: '#a1a1aa', glow: true };
        }

        // Backtrack path
        if (btSet.has(key) && phase !== 'filling') {
            if (matchCells.has(key)) {
                return { bg: '#166534', text: '#bbf7d0', border: '#22c55e' };
            }
            return { bg: '#581c87', text: '#e9d5ff', border: '#7c3aed' };
        }

        // Match cell (diagonal +1)
        if (matchCells.has(key)) {
            return { bg: '#14532d', text: '#86efac', border: '#166534' };
        }

        // Already filled
        if (filledCells.has(key)) {
            return { bg: '#27272a', text: '#d4d4d8', border: '#3f3f46' };
        }

        // Not yet filled
        return { bg: '#09090b', text: '#3f3f46', border: '#1c1c1e' };
    };

    // Determine optimal cell size based on grid dimensions
    const maxDim = Math.max(rows, cols);
    const cellSize = maxDim <= 8 ? 48 : maxDim <= 12 ? 40 : maxDim <= 16 ? 34 : 28;
    const fontSize = maxDim <= 8 ? 14 : maxDim <= 12 ? 12 : 10;
    const headerFontSize = maxDim <= 8 ? 13 : maxDim <= 12 ? 11 : 9;

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* Phase banner */}
            <motion.div
                key={phase}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-2 shrink-0"
            >
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-semibold text-zinc-300 bg-zinc-800/50 border border-zinc-700/50 uppercase tracking-wider">
                    {phase === 'filling' && '📊'}
                    {phase === 'backtracking' && '↩️'}
                    {phase === 'done' && '✅'}
                    {phase === 'filling' && 'Filling DP Table'}
                    {phase === 'backtracking' && 'Backtracking'}
                    {phase === 'done' && 'Complete'}
                </span>
            </motion.div>

            {/* Message banner */}
            {message && (
                <motion.div
                    key={message}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center pb-2 shrink-0"
                >
                    <span className="text-xs text-zinc-400 font-mono">{message}</span>
                </motion.div>
            )}

            {/* DP Grid */}
            <div className="flex-1 flex items-center justify-center overflow-auto px-4 pb-2">
                <div className="inline-block">
                    {/* Column headers (str2 chars) */}
                    <div className="flex" style={{ marginLeft: cellSize + 4 }}>
                        <div
                            className="flex items-center justify-center shrink-0"
                            style={{ width: cellSize, height: 28 }}
                        >
                            <span className="text-zinc-600 font-mono" style={{ fontSize: headerFontSize }}>ε</span>
                        </div>
                        {str2.split('').map((ch, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-center shrink-0"
                                style={{ width: cellSize, height: 28 }}
                            >
                                <span className="font-bold font-mono text-indigo-400" style={{ fontSize: headerFontSize }}>
                                    {ch}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Rows */}
                    {dp.map((row, r) => (
                        <div key={r} className="flex">
                            {/* Row header (str1 chars) */}
                            <div
                                className="flex items-center justify-center shrink-0"
                                style={{ width: cellSize, height: cellSize }}
                            >
                                <span
                                    className="font-bold font-mono"
                                    style={{
                                        fontSize: headerFontSize,
                                        color: r === 0 ? '#71717a' : '#818cf8',
                                    }}
                                >
                                    {r === 0 ? 'ε' : str1[r - 1]}
                                </span>
                            </div>

                            {/* DP cells */}
                            {row.map((val, c) => {
                                const style = getCellStyle(r, c);
                                const isFilled = r === 0 || c === 0 || filledCells.has(`${r},${c}`);
                                const isActive = activeCell && activeCell[0] === r && activeCell[1] === c;

                                return (
                                    <motion.div
                                        key={`${r}-${c}`}
                                        initial={false}
                                        animate={{
                                            scale: isActive ? 1.15 : 1,
                                            backgroundColor: style.bg,
                                            borderColor: style.border,
                                        }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 25,
                                        }}
                                        className="flex items-center justify-center shrink-0 rounded-sm border"
                                        style={{
                                            width: cellSize,
                                            height: cellSize,
                                            boxShadow: style.glow
                                                ? phase === 'backtracking'
                                                    ? '0 0 12px rgba(124, 58, 237, 0.5)'
                                                    : '0 0 12px rgba(161, 161, 170, 0.3)'
                                                : 'none',
                                            zIndex: isActive ? 10 : 1,
                                            position: 'relative',
                                        }}
                                    >
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{
                                                opacity: isFilled ? 1 : 0.2,
                                                scale: isFilled ? 1 : 0.5,
                                            }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            className="font-mono font-semibold"
                                            style={{ fontSize, color: style.text }}
                                        >
                                            {val}
                                        </motion.span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* LCS Result */}
            {lcsResult !== null && lcsResult !== undefined && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-3 shrink-0"
                >
                    <span className="text-sm text-zinc-400">LCS = </span>
                    <span className="text-lg font-bold font-mono text-emerald-400 tracking-widest">
                        "{lcsResult}"
                    </span>
                    <span className="ml-3 text-sm text-zinc-500">(length {lcsResult.length})</span>
                </motion.div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 py-2 shrink-0 border-t border-zinc-800/50">
                <Legend color="#09090b" label="Empty" />
                <Legend color="#3f3f46" label="Active" />
                <Legend color="#27272a" label="Filled" />
                <Legend color="#14532d" label="Match (↗)" />
                <Legend color="#581c87" label="Backtrack" />
                <Legend color="#166534" label="LCS Cell" />
            </div>
        </div>
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
