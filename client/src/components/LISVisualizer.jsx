import { motion } from 'framer-motion';

export default function LISVisualizer({ frame }) {
    const {
        arr = [],
        dp = [],
        phase = 'filling',
        activeIdx = null,
        compareIdx = null,
        filledIndices = new Set(),
        lisIndices = new Set(),
        lisResult = null,
        message,
    } = frame || {};

    if (!arr.length) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-zinc-500 text-sm">Enter an array and press Run to begin</p>
            </div>
        );
    }

    const getBoxStyle = (i) => {
        if (lisIndices.has(i) && phase !== 'filling')
            return { bg: '#78350f', border: '#f59e0b', text: '#fde68a' };
        if (i === activeIdx)
            return { bg: '#1e3a8a', border: '#60a5fa', text: '#eff6ff' };
        if (i === compareIdx)
            return { bg: '#1e3a5f', border: '#3b82f6', text: '#bfdbfe' };
        if (filledIndices.has(i))
            return { bg: '#27272a', border: '#52525b', text: '#d4d4d8' };
        return { bg: '#18181b', border: '#3f3f46', text: '#52525b' };
    };

    const isDpKnown = (i) => filledIndices.has(i) || i === activeIdx;

    return (
        <div className="flex-1 flex flex-col min-h-0">

            {/* Phase banner */}
            <div className="text-center pt-4 pb-2 shrink-0">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-semibold text-zinc-300 bg-zinc-800/50 border border-zinc-700/50 uppercase tracking-wider">
                    {phase === 'filling' && '📊 Filling dp[ ]'}
                    {phase === 'backtracking' && '↩️ Backtracking'}
                    {phase === 'done' && '✅ Complete'}
                </span>
            </div>

            {/* Message */}
            <div className="text-center pb-3 shrink-0 h-6">
                {message && (
                    <motion.span
                        key={message}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-zinc-400 font-mono"
                    >
                        {message}
                    </motion.span>
                )}
            </div>

            {/* Main grid */}
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8">

                {/* dp[] row */}
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-zinc-500 w-10 text-right shrink-0">dp[ ]</span>
                    <div className="flex gap-2">
                        {arr.map((_, i) => (
                            <div key={i} className="w-10 text-center">
                                <motion.span
                                    animate={{ color: getBoxStyle(i).text }}
                                    transition={{ duration: 0.2 }}
                                    className="text-[13px] font-mono font-bold"
                                >
                                    {isDpKnown(i) ? dp[i] : '·'}
                                </motion.span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Array boxes row */}
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-zinc-500 w-10 text-right shrink-0">arr[ ]</span>
                    <div className="flex gap-2">
                        {arr.map((val, i) => {
                            const style = getBoxStyle(i);
                            return (
                                <motion.div
                                    key={i}
                                    animate={{
                                        backgroundColor: style.bg,
                                        borderColor: style.border,
                                        scale: i === activeIdx ? 1.08 : 1,
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className="w-10 h-10 flex items-center justify-center rounded-md border text-sm font-mono font-bold"
                                    style={{ color: style.text }}
                                >
                                    {val}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Index row */}
                <div className="flex items-center gap-2">
                    <span className="w-10 shrink-0" />
                    <div className="flex gap-2">
                        {arr.map((_, i) => (
                            <div key={i} className="w-10 text-center">
                                <span className="text-[10px] text-zinc-600 font-mono">{i}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* LIS Result */}
            {lisResult && (
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-3 shrink-0"
                >
                    <span className="text-sm text-zinc-400">LIS = </span>
                    <span className="text-base font-bold font-mono text-amber-400 tracking-widest">
                        [{lisResult.join(', ')}]
                    </span>
                    <span className="ml-2 text-sm text-zinc-500">(length {lisResult.length})</span>
                </motion.div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-center gap-5 py-2 shrink-0 border-t border-zinc-800/50">
                <Legend color="#18181b" border="#3f3f46" label="Unvisited" />
                <Legend color="#27272a" border="#52525b" label="Filled" />
                <Legend color="#1e3a8a" border="#60a5fa" label="Active (i)" />
                <Legend color="#1e3a5f" border="#3b82f6" label="Comparing (j)" />
                <Legend color="#78350f" border="#f59e0b" label="LIS Element" />
            </div>
        </div>
    );
}

function Legend({ color, border, label }) {
    return (
        <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm border" style={{ background: color, borderColor: border }} />
            <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">{label}</span>
        </div>
    );
}
