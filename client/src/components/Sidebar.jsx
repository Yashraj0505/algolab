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
  {
    category: 'BST',
    icon: '🌳',
    items: [
      { id: 'bstInsert', name: 'BST Insert' },
      { id: 'bstSearch', name: 'BST Search' },
      { id: 'bstDelete', name: 'BST Delete' },
      { id: 'bstInorder', name: 'Inorder Traversal' },
      { id: 'bstPreorder', name: 'Preorder Traversal' },
      { id: 'bstPostorder', name: 'Postorder Traversal' },
      { id: 'bstBFS', name: 'BFS (Level Order)' },
      { id: 'bstDFS', name: 'DFS Iterative' },
    ],
  },
  {
    category: 'Dynamic Programming',
    icon: '📊',
    items: [
      { id: 'lcs', name: 'LCS' },
    ],
  },
  {
    category: 'Graphs',
    icon: '🕸️',
    items: [
      { id: 'dijkstra',  name: "Dijkstra's SSSP" },
      { id: 'kruskal',   name: "Kruskal's MST" },
      { id: 'topoSort',  name: 'Topological Sort' },
    ],
  },
];

/**
 * Sidebar — left panel listing algorithms grouped by category.
 */
export default function Sidebar({ selected, onSelect }) {
  return (
    <aside className="w-56 shrink-0 bg-zinc-950 border-r border-zinc-800/50 flex flex-col overflow-y-auto">
      <div className="p-4">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
          Algorithms
        </h2>

        {algorithms.map((group) => (
          <div key={group.category} className="mb-6">
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-sm text-zinc-400">{group.icon}</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
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
                      text-left px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer
                      ${isActive
                        ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/50 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 border border-transparent'
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
      <div className="mt-auto p-4 border-t border-zinc-800/50">
        <p className="text-[10px] text-zinc-600 text-center font-medium">
          Built with ♥ for learning
        </p>
      </div>
    </aside>
  );
}
