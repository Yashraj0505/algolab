import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function CodePanel({ code = '', activeLine = null }) {
  const containerRef = useRef(null);
  const activeLineRef = useRef(null);

  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      const container = containerRef.current;
      const el = activeLineRef.current;
      const elTop = el.offsetTop;
      const elHeight = el.offsetHeight;
      const containerHeight = container.clientHeight;
      container.scrollTop = elTop - containerHeight / 2 + elHeight / 2;
    }
  }, [activeLine]);

  if (!code) {
    return (
      <div className="w-80 bg-zinc-950 border-l border-zinc-800/50 flex items-center justify-center">
        <p className="text-zinc-500 text-sm">No code available</p>
      </div>
    );
  }

  const lines = code.split('\n');

  return (
    <div className="w-80 bg-zinc-950 border-l border-zinc-800/50 flex flex-col">
      <div className="px-4 py-3 border-b border-zinc-800/50">
        <h3 className="text-sm font-semibold text-zinc-200">Algorithm Code</h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">Live execution trace</p>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 font-mono text-xs">
        {lines.map((line, index) => {
          const lineNumber = index + 1;
          const isActive = lineNumber === activeLine;

          return (
            <motion.div
              key={index}
              ref={isActive ? activeLineRef : null}
              initial={false}
              animate={{
                backgroundColor: isActive ? 'rgba(39, 39, 42, 0.5)' : 'transparent',
                borderLeftColor: isActive ? '#a1a1aa' : 'transparent',
              }}
              className="flex gap-3 py-0.5 px-2 -mx-2 rounded-r border-l-2"
            >
              <span className={`select-none w-6 text-right shrink-0 ${isActive ? 'text-zinc-400 font-bold' : 'text-zinc-600'}`}>
                {lineNumber}
              </span>
              <span className={isActive ? 'text-zinc-100 font-medium' : 'text-zinc-400'}>
                {line || ' '}
              </span>
            </motion.div>
          );
        })}
      </div>

      {activeLine && (
        <div className="px-4 py-2 border-t border-zinc-800/50 bg-zinc-900">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-pulse" />
            <span className="text-[11px] text-zinc-400">
              Executing line <span className="text-zinc-200 font-semibold">{activeLine}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
