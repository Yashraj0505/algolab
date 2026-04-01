import { motion } from 'framer-motion';

const algorithms = [
  {
    category: 'Sorting',
    icon: '⇅',
    items: [
      { id: 'bubbleSort', name: 'Bubble Sort' },
      { id: 'mergeSort', name: 'Merge Sort' },
      { id: 'quickSort', name: 'Quick Sort' },
    ],
  },
  {
    category: 'Searching',
    icon: '⌕',
    items: [
      { id: 'binarySearch', name: 'Binary Search' },
    ],
  },
];

/**
 * Sidebar — left panel listing algorithms grouped by category.
 */
export default function Sidebar({ selected, onSelect }) {
  return (
    <aside className="w-56 shrink-0 bg-[#0c1022] border-r border-slate-800 flex flex-col overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
          Algorithms
        </h2>

        {algorithms.map((group) => (
          <div key={group.category} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{group.icon}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {group.category}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                const isActive = selected === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.97 }}
                    className={`
                      text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                      ${isActive
                        ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                      }
                    `}
                  >
                    {item.name}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto p-4 border-t border-slate-800">
        <p className="text-[10px] text-slate-600 text-center">
          Built with ♥ for learning
        </p>
      </div>
    </aside>
  );
}
