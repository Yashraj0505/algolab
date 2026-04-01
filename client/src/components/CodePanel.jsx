import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

/**
 * CodePanel — displays algorithm code with active line highlighting
 * 
 * Props:
 *  - code: string - the algorithm code to display
 *  - activeLine: number - the currently executing line (1-indexed)
 *  - language: string - programming language for syntax
 */
export default function CodePanel({ code = '', activeLine = null, language = 'javascript' }) {
  const activeLineRef = useRef(null);

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLine]);

  if (!code) {
    return (
      <div className="w-80 bg-slate-900/50 border-l border-slate-800/50 flex items-center justify-center">
        <p className="text-slate-500 text-sm">No code available</p>
      </div>
    );
  }

  const lines = code.split('\n');

  return (
    <div className="w-80 bg-slate-900/50 border-l border-slate-800/50 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/50">
        <h3 className="text-sm font-semibold text-slate-300">Algorithm Code</h3>
        <p className="text-xs text-slate-500 mt-0.5">Live execution trace</p>
      </div>

      {/* Code Display */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
        {lines.map((line, index) => {
          const lineNumber = index + 1;
          const isActive = lineNumber === activeLine;

          return (
            <motion.div
              key={index}
              ref={isActive ? activeLineRef : null}
              initial={false}
              animate={{
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                borderLeftColor: isActive ? '#6366f1' : 'transparent',
              }}
              className="flex gap-3 py-0.5 px-2 -mx-2 rounded border-l-2"
            >
              {/* Line Number */}
              <span
                className={`select-none w-6 text-right shrink-0 ${
                  isActive ? 'text-indigo-400 font-bold' : 'text-slate-600'
                }`}
              >
                {lineNumber}
              </span>

              {/* Code Line */}
              <span
                className={`${
                  isActive ? 'text-slate-200 font-medium' : 'text-slate-400'
                }`}
              >
                {line || ' '}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Active Line Indicator */}
      {activeLine && (
        <div className="px-4 py-2 border-t border-slate-800/50 bg-slate-900/70">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs text-slate-400">
              Executing line <span className="text-indigo-400 font-semibold">{activeLine}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
