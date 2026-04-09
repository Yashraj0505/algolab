import LISVisualizer from '../components/LISVisualizer';

export default function LISSection({ lisArr, setLisArr, lisFrame, lisRunning, lisDone, lisGenRef, speed, onSpeedChange, onRun, onPause, onResume, onStep, onReset }) {
  return (
    <>
      <LISVisualizer frame={lisFrame} />
      <div className="shrink-0 bg-zinc-900 border-t border-zinc-800/50 px-5 py-3 flex flex-wrap items-center gap-3">
        <input type="text" value={lisArr} onChange={(e) => setLisArr(e.target.value)}
          placeholder="e.g. 3,10,2,1,20" disabled={lisRunning}
          className="w-48 px-3 py-1.5 rounded-md bg-zinc-800/50 border border-zinc-700 text-zinc-200 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 font-mono" />
        <button onClick={onRun} disabled={lisRunning}
          className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-zinc-900 text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
          Run
        </button>
        {lisRunning ? (
          <button onClick={onPause} className="px-4 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 text-sm font-medium transition-colors flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18" /><rect x="15" y="3" width="4" height="18" /></svg>
            Pause
          </button>
        ) : lisGenRef.current && !lisDone ? (
          <button onClick={onResume} className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
            Resume
          </button>
        ) : null}
        <button onClick={onStep} disabled={lisRunning || lisDone}
          className="px-3 py-1.5 rounded-md bg-transparent hover:bg-zinc-800 border border-zinc-700 disabled:border-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 hover:text-zinc-100 text-sm font-medium transition-colors flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 15,12 5,21" /><rect x="17" y="3" width="3" height="18" /></svg>
          Step
        </button>
        <button onClick={onReset} className="px-3 py-1.5 rounded-md bg-transparent hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-sm font-medium transition-colors flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1,4 1,10 7,10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
          Reset
        </button>
        <div className="w-px h-6 bg-zinc-800 mx-2" />
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 whitespace-nowrap">Speed</span>
          <input type="range" min="10" max="500" value={510 - speed} onChange={(e) => onSpeedChange(510 - Number(e.target.value))} className="w-24 accent-zinc-400" />
          <span className="text-xs text-zinc-500 font-mono w-10">{speed}ms</span>
        </div>
      </div>
    </>
  );
}
