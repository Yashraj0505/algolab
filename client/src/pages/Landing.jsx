import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Network, Search, ArrowRight, Waypoints, Code2 } from 'lucide-react';

const sections = [
  {
    title: 'Trees & Advanced Trees',
    description: 'Explore AVL Trees, Segment Trees, Min/Max Heaps, and Heap Sort with dynamic visualizations.',
    icon: <Network className="w-8 h-8 text-emerald-400" />,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    border: 'group-hover:border-emerald-500/50',
    shadow: 'group-hover:shadow-emerald-500/20',
    path: '/visualizer?section=trees'
  },
  {
    title: 'Graph Algorithms',
    description: 'Master Dijkstra, Kruskal, Prim, Topological Sort, and Bellman-Ford algorithms.',
    icon: <Waypoints className="w-8 h-8 text-blue-400" />,
    gradient: 'from-blue-500/20 to-indigo-500/20',
    border: 'group-hover:border-blue-500/50',
    shadow: 'group-hover:shadow-blue-500/20',
    path: '/visualizer?section=graphs'
  },
  {
    title: 'Dynamic Programming',
    description: 'Visualize advanced DP concepts like LCS, LIS, and Matrix Chain Multiplication.',
    icon: <Code2 className="w-8 h-8 text-purple-400" />,
    gradient: 'from-purple-500/20 to-fuchsia-500/20',
    border: 'group-hover:border-purple-500/50',
    shadow: 'group-hover:shadow-purple-500/20',
    path: '/visualizer?section=dp'
  },
  {
    title: 'Strings + Special DS',
    description: 'Dive into KMP Algorithm, Trie (Prefix Tree), and Union-Find structures.',
    icon: <Search className="w-8 h-8 text-rose-400" />,
    gradient: 'from-rose-500/20 to-orange-500/20',
    border: 'group-hover:border-rose-500/50',
    shadow: 'group-hover:shadow-rose-500/20',
    path: '/visualizer?section=strings'
  }
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-hidden font-sans">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center justify-center flex-1">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500 drop-shadow-sm">
            AlgoLab
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 font-light leading-relaxed">
            A premium, interactive environment to visualize and understand complex algorithms and data structures.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <button
                onClick={() => navigate(section.path)}
                className={`group cursor-pointer w-full h-full text-left p-8 rounded-2xl bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 hover:bg-zinc-800/60 transition-all duration-300 shadow-lg flex flex-col justify-between ${section.border} ${section.shadow}`}
              >
                <div>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300`}>
                    {section.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-100 mb-3 group-hover:text-white transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-zinc-400 font-light leading-relaxed mb-6 group-hover:text-zinc-300 transition-colors">
                    {section.description}
                  </p>
                </div>
                
                <div className="flex items-center text-sm font-semibold text-zinc-500 group-hover:text-zinc-200 transition-colors mt-auto">
                  <span>Explore Module</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
