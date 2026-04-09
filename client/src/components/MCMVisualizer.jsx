import { motion } from 'framer-motion';

export default function MCMVisualizer({ frame }) {
  const {
    dp, split, n,
    phase = 'filling',
    activeCell,
    filledCells = new Set(),
    optimalCost,
    parenthesisation,
    message,
    i: fi, j: fj, k: fk,
  } = frame || {};

  if (!dp) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Enter matrix dimensions and press Run to begin</p>
      </div>
    );
  }

  const cellSize = n <= 6 ? 52 : n <= 8 ? 44 : 36;
  const fontSize = n <= 6 ? 13 : n <= 8 ? 11 : 10;

  const getCellStyle = (r, c, table) => {
    if (r === 0 || c === 0) return { bg: '#18181b', text: '#52525b', border: '#27272a' };
    if (r > c) return { bg: '#0a0a0b', text: '#27272a', border: '#18181b' }; // below diagonal — unused

    const key = `${r},${c}`;
    const isActive = activeCell && activeCell[0] === r && activeCell[1] === c;
    const isFilled = filledCells.has(key);
    const isDone = phase === 'done';

    if (isActive && table === 'dp') return { bg: '#1e3a5f', text: '#93c5fd', border: '#3b82f6', glow: true };
    if (isActive && table === 'split') return { bg: '#3b1f5e', text: '#c4b5fd', border: '#8b5cf6', glow: true };
    if (isDone && r === 1 && c === n) return { bg: '#14532d', text: '#86efac', border: '#22c55e' };
    if (isFilled) return { bg: '#27272a', text: '#d4d4d8', border: '#3f3f46' };
    if (r === c) return { bg: '#1c1c1e', text: '#52525b', border: '#27272a' }; // diagonal = 0
    return { bg: '#09090b', text: '#3f3f46', border: '#1c1c1e' };
  };

  const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const matrixLabels = Array.from({ length: n }, (_, i) => LABELS[i]);

  const renderTable = (table, title, getValue) => (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">{title}</span>
      <div className="inline-block">
        {/* col headers */}
        <div className="flex" style={{ marginLeft: cellSize + 2 }}>
          {matrixLabels.map((lbl, idx) => (
            <div key={idx} className="flex items-center justify-center shrink-0"
              style={{ width: cellSize, height: 24 }}>
              <span className="font-bold font-mono text-indigo-400" style={{ fontSize: fontSize - 1 }}>{lbl}</span>
            </div>
          ))}
        </div>
        {/* rows */}
        {Array.from({ length: n }, (_, ri) => ri + 1).map(r => (
          <div key={r} className="flex">
            {/* row header */}
            <div className="flex items-center justify-center shrink-0" style={{ width: cellSize, height: cellSize }}>
              <span className="font-bold font-mono text-indigo-400" style={{ fontSize: fontSize - 1 }}>{matrixLabels[r - 1]}</span>
            </div>
            {Array.from({ length: n }, (_, ci) => ci + 1).map(c => {
              const style = getCellStyle(r, c, table);
              const isActive = activeCell && activeCell[0] === r && activeCell[1] === c;
              const val = getValue(r, c);
              const displayVal = r > c ? '' : val === Infinity ? '∞' : val;
              return (
                <motion.div
                  key={`${r}-${c}`}
                  animate={{ scale: isActive ? 1.12 : 1, backgroundColor: style.bg, borderColor: style.border }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="flex items-center justify-center shrink-0 rounded-sm border"
                  style={{
                    width: cellSize, height: cellSize,
                    boxShadow: style.glow ? `0 0 10px ${table === 'dp' ? 'rgba(59,130,246,0.4)' : 'rgba(139,92,246,0.4)'}` : 'none',
                    position: 'relative', zIndex: isActive ? 10 : 1,
                  }}
                >
                  <motion.span
                    animate={{ opacity: r <= c ? 1 : 0.15 }}
                    className="font-mono font-semibold"
                    style={{ fontSize, color: style.text }}
                  >
                    {displayVal}
                  </motion.span>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Phase banner */}
      <motion.div key={phase} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
        className="text-center py-2 shrink-0">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-semibold text-zinc-300 bg-zinc-800/50 border border-zinc-700/50 uppercase tracking-wider">
          {phase === 'filling' ? '📊 Filling DP Table' : '✅ Complete'}
        </span>
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div key={message} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center pb-2 shrink-0">
          <span className="text-xs text-zinc-400 font-mono">{message}</span>
        </motion.div>
      )}

      {/* Current k indicator */}
      {phase === 'filling' && fk !== null && fk !== undefined && (
        <div className="text-center pb-1 shrink-0">
          <span className="text-[11px] text-zinc-500 font-mono">
            Trying split <span className="text-amber-400 font-bold">k={fk}</span> for dp[{fi}][{fj}]
          </span>
        </div>
      )}

      {/* Tables */}
      <div className="flex-1 flex items-center justify-center overflow-auto px-4 pb-2">
        <div className="flex gap-10 items-start">
          {renderTable('dp', 'Cost Table  dp[i][j]', (r, c) => dp[r]?.[c])}
          {renderTable('split', 'Split Table  s[i][j]', (r, c) => r < c ? split[r]?.[c] : r === c ? 0 : '')}
        </div>
      </div>

      {/* Result */}
      {phase === 'done' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-3 shrink-0 border-t border-zinc-800/50 space-y-1">
          <div>
            <span className="text-sm text-zinc-400">Optimal cost = </span>
            <span className="text-lg font-bold font-mono text-emerald-400">{optimalCost?.toLocaleString()}</span>
            <span className="text-sm text-zinc-500 ml-2">scalar multiplications</span>
          </div>
          <div>
            <span className="text-sm text-zinc-400">Parenthesisation: </span>
            <span className="text-sm font-mono text-amber-300">{parenthesisation}</span>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 py-2 shrink-0 border-t border-zinc-800/50">
        <Legend color="#1e3a5f" label="Active (cost)" />
        <Legend color="#3b1f5e" label="Active (split)" />
        <Legend color="#27272a" label="Filled" />
        <Legend color="#14532d" label="Optimal dp[1][n]" />
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
