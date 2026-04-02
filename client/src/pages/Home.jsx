import { useState, useRef, useCallback, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Visualizer from '../components/Visualizer';
import BSTVisualizer from '../components/BSTVisualizer';
import Controls from '../components/Controls';
import AiPanel from '../components/AiPanel';
import PerformanceMetrics from '../components/PerformanceMetrics';
import CodePanel from '../components/CodePanel';

// Algorithm imports — sorting / searching
import { bubbleSort, bubbleSortInfo, bubbleSortCode } from '../algorithms/bubbleSort';
import { mergeSort, mergeSortInfo, mergeSortCode } from '../algorithms/mergeSort';
import { quickSort, quickSortInfo, quickSortCode } from '../algorithms/quickSort';
import { binarySearch, binarySearchInfo, binarySearchCode } from '../algorithms/binarySearch';

// BST imports
import {
  bstInsert,
  bstSearch,
  bstDelete,
  bstInorder,
  bstPreorder,
  bstPostorder,
  bstBFS,
  bstDFS,
  buildBST,
  bstInfo,
  bstCode,
} from '../algorithms/bst';

// ─── Algorithm registry (sorting / searching only) ───────────────────────────
const algorithmRegistry = {
  bubbleSort: { generator: bubbleSort, info: bubbleSortInfo, type: 'sorting', code: bubbleSortCode },
  mergeSort: { generator: mergeSort, info: mergeSortInfo, type: 'sorting', code: mergeSortCode },
  quickSort: { generator: quickSort, info: quickSortInfo, type: 'sorting', code: quickSortCode },
  binarySearch: { generator: binarySearch, info: binarySearchInfo, type: 'searching', code: binarySearchCode },
};

const BST_NO_INPUT = ['bstInorder', 'bstPreorder', 'bstPostorder', 'bstBFS', 'bstDFS'];
const BST_IDS = new Set(['bstInsert', 'bstSearch', 'bstDelete', ...BST_NO_INPUT]);

// Default seed values for the starting tree
const DEFAULT_TREE_VALUES = [50, 30, 70, 20, 40, 60, 80];

/** Generate a random array for sorting/searching */
function generateArray(size = 30, min = 5, max = 100) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

// =============================================================================
export default function Home() {
  // ── Shared state ─────────────────────────────────────────────────────────
  const [selectedAlgo, setSelectedAlgo] = useState('bubbleSort');
  const [showCodePanel, setShowCodePanel] = useState(true);

  // ── Sorting / Searching state ─────────────────────────────────────────────
  const [array, setArray] = useState(() => generateArray());
  const [frame, setFrame] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [timeTaken, setTimeTaken] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const generatorRef = useRef(null);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  // ── BST state ─────────────────────────────────────────────────────────────
  const [bstRoot, setBstRoot] = useState(() => buildBST(DEFAULT_TREE_VALUES));
  const [bstFrame, setBstFrame] = useState(null);
  const [bstInput, setBstInput] = useState('');
  const [bstRunning, setBstRunning] = useState(false);
  const [bstDone, setBstDone] = useState(false);
  const [bstGenRoot, setBstGenRoot] = useState(null); // root used by current generator

  const bstGenRef = useRef(null);
  const bstIntervalRef = useRef(null);

  const isBST = BST_IDS.has(selectedAlgo);
  const currentAlgo = !isBST ? algorithmRegistry[selectedAlgo] : null;

  // ── Sorting/Searching helpers ─────────────────────────────────────────────
  const initGenerator = useCallback(() => {
    const gen = currentAlgo.generator(array);
    generatorRef.current = gen;
    setIsDone(false);
    setFrame(null);
    setTimeTaken(0);
    setStartTime(Date.now());
  }, [array, currentAlgo]);

  const step = useCallback(() => {
    if (!generatorRef.current) return false;
    const { value, done } = generatorRef.current.next();
    if (done) {
      setIsRunning(false);
      setIsDone(true);
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
      if (startTime) setTimeTaken(Date.now() - startTime);
      return false;
    }
    setArray(value.array);
    setFrame(value);
    return true;
  }, [startTime]);

  const handleStart = useCallback(() => {
    if (isDone) {
      const newArr = generateArray();
      setArray(newArr);
      const gen = currentAlgo.generator(newArr);
      generatorRef.current = gen;
      setIsDone(false);
      setTimeTaken(0);
      setStartTime(Date.now());
    } else if (!generatorRef.current) {
      initGenerator();
    } else if (!startTime) {
      setStartTime(Date.now());
    }
    setIsRunning(true);
  }, [isDone, currentAlgo, initGenerator, startTime]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);
    if (startTime) setTimeTaken(Date.now() - startTime);
  }, [startTime]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);
    const newArr = generateArray();
    setArray(newArr);
    setFrame(null);
    setIsDone(false);
    setTimeTaken(0);
    setStartTime(null);
    generatorRef.current = null;
  }, []);

  const handleStep = useCallback(() => {
    if (!generatorRef.current) {
      initGenerator();
      setTimeout(() => {
        const gen = generatorRef.current;
        if (!gen) return;
        const { value, done } = gen.next();
        if (!done) { setArray(value.array); setFrame(value); }
        else {
          setIsDone(true);
          clearInterval(timerRef.current);
          if (startTime) setTimeTaken(Date.now() - startTime);
        }
      }, 0);
      return;
    }
    step();
  }, [initGenerator, step, startTime]);

  const handleSelectAlgo = useCallback((algoId) => {
    setSelectedAlgo(algoId);
    setIsRunning(false);
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);
    // Reset sorting/searching
    const newArr = generateArray();
    setArray(newArr);
    setFrame(null);
    setIsDone(false);
    setTimeTaken(0);
    setStartTime(null);
    generatorRef.current = null;
    // Reset BST animation
    stopBST();
    setBstFrame(null);
    setBstInput('');
    setBstDone(false);
  }, []); // eslint-disable-line

  // Auto-play loop (sorting/searching)
  useEffect(() => {
    if (!isBST && isRunning) {
      if (!generatorRef.current) {
        generatorRef.current = currentAlgo.generator(array);
      }
      timerRef.current = setInterval(() => {
        if (startTime) setTimeTaken(Date.now() - startTime);
      }, 10);
      intervalRef.current = setInterval(() => {
        if (!step()) {
          clearInterval(intervalRef.current);
          clearInterval(timerRef.current);
        }
      }, speed);
    }
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
    };
  }, [isRunning, speed, step, currentAlgo, array, startTime, isBST]);

  // ── BST helpers ───────────────────────────────────────────────────────────
  function stopBST() {
    setBstRunning(false);
    clearInterval(bstIntervalRef.current);
    bstGenRef.current = null;
  }

  // After a BST animation finishes, we need to update the underlying tree.
  // The generators return the new root via their `return` value, but since
  // we drive them with setInterval we capture it via a ref.
  const pendingRootRef = useRef(null);

  function runBSTAnimation(gen, workingRoot) {
    stopBST();
    pendingRootRef.current = workingRoot;
    bstGenRef.current = gen;
    setBstRunning(true);
    setBstDone(false);
    setBstGenRoot(workingRoot);

    bstIntervalRef.current = setInterval(() => {
      if (!bstGenRef.current) return;
      const { value, done, value: returnVal } = bstGenRef.current.next();

      if (done) {
        clearInterval(bstIntervalRef.current);
        setBstRunning(false);
        setBstDone(true);
        bstGenRef.current = null;
        // For insert/delete the generator mutates and returns new root via last yield's frame
        // We rely on the last frame's root
        return;
      }

      setBstFrame(value);
      // Keep track of the latest root from frame
      if (value.root) pendingRootRef.current = value.root;
    }, speed);
  }

  // When BST animation is done, commit the resulting tree
  useEffect(() => {
    if (bstDone && pendingRootRef.current) {
      setBstRoot(pendingRootRef.current);
    }
  }, [bstDone]);

  // Cleanup BST intervals on unmount
  useEffect(() => () => clearInterval(bstIntervalRef.current), []);

  function handleBSTRun() {
    if (BST_NO_INPUT.includes(selectedAlgo)) {
      if (selectedAlgo === 'bstInorder') runBSTAnimation(bstInorder(bstRoot), bstRoot);
      else if (selectedAlgo === 'bstPreorder') runBSTAnimation(bstPreorder(bstRoot), bstRoot);
      else if (selectedAlgo === 'bstPostorder') runBSTAnimation(bstPostorder(bstRoot), bstRoot);
      else if (selectedAlgo === 'bstBFS') runBSTAnimation(bstBFS(bstRoot), bstRoot);
      else if (selectedAlgo === 'bstDFS') runBSTAnimation(bstDFS(bstRoot), bstRoot);
      return;
    }

    const raw = bstInput.trim();
    const val = parseInt(raw, 10);
    if (isNaN(val) || val < 1 || val > 999) return;

    // Clone the current root so generators can work on it safely
    if (selectedAlgo === 'bstInsert') {
      const gen = bstInsert(bstRoot, val);
      runBSTAnimation(gen, bstRoot);
    } else if (selectedAlgo === 'bstSearch') {
      const gen = bstSearch(bstRoot, val);
      runBSTAnimation(gen, bstRoot);
    } else if (selectedAlgo === 'bstDelete') {
      const gen = bstDelete(bstRoot, val);
      runBSTAnimation(gen, bstRoot);
    }
  }

  function handleBSTReset() {
    stopBST();
    setBstRoot(buildBST(DEFAULT_TREE_VALUES));
    setBstFrame(null);
    setBstInput('');
    setBstDone(false);
    pendingRootRef.current = null;
  }

  function handleBSTStep() {
    if (!bstGenRef.current) return;
    const { value, done } = bstGenRef.current.next();
    if (done) {
      setBstRunning(false);
      setBstDone(true);
      clearInterval(bstIntervalRef.current);
      bstGenRef.current = null;
      if (pendingRootRef.current) setBstRoot(pendingRootRef.current);
      return;
    }
    setBstFrame(value);
    if (value.root) pendingRootRef.current = value.root;
  }

  function handleBSTStart() {
    if (!bstGenRef.current) {
      handleBSTRun();
      return;
    }
    setBstRunning(true);
    bstIntervalRef.current = setInterval(() => {
      if (!bstGenRef.current) {
        clearInterval(bstIntervalRef.current);
        return;
      }
      const { value, done } = bstGenRef.current.next();
      if (done) {
        clearInterval(bstIntervalRef.current);
        setBstRunning(false);
        setBstDone(true);
        bstGenRef.current = null;
        if (pendingRootRef.current) setBstRoot(pendingRootRef.current);
        return;
      }
      setBstFrame(value);
      if (value.root) pendingRootRef.current = value.root;
    }, speed);
  }

  function handleBSTPause() {
    setBstRunning(false);
    clearInterval(bstIntervalRef.current);
  }

  // Operation label
  const bstOpLabel = {
    bstInsert: 'Insert',
    bstSearch: 'Search',
    bstDelete: 'Delete',
    bstInorder: 'Run Inorder',
    bstPreorder: 'Run Preorder',
    bstPostorder: 'Run Postorder',
    bstBFS: 'Run BFS',
    bstDFS: 'Run DFS',
  }[selectedAlgo] || '';

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Top Navbar */}
      <Navbar algorithmInfo={isBST ? bstInfo : currentAlgo.info} />

      {/* Main body */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar */}
        <Sidebar selected={selectedAlgo} onSelect={handleSelectAlgo} />

        {/* Center: Visualizer + Controls */}
        <main className="flex-1 flex flex-col min-h-0 bg-zinc-950">

          {/* ── BST Branch ─────────────────────────────────────────── */}
          {isBST ? (
            <>
              <BSTVisualizer
                frame={bstFrame ?? { root: bstRoot, highlightedNodes: [], highlightedEdges: [], pathNodes: [], message: null, phase: null }}
              />

              {/* BST Controls */}
              <div className="shrink-0 bg-zinc-900 border-t border-zinc-800/50 px-5 py-3 flex flex-wrap items-center gap-3">
                {/* Value input */}
                {!BST_NO_INPUT.includes(selectedAlgo) && (
                  <input
                    type="number"
                    value={bstInput}
                    onChange={(e) => setBstInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBSTRun()}
                    placeholder="Enter value (1-999)"
                    className="w-44 px-3 py-1.5 rounded-md bg-zinc-800/50 border border-zinc-700 text-zinc-200 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-all font-mono"
                    min={1}
                    max={999}
                    disabled={bstRunning}
                  />
                )}

                {/* Run operation button */}
                <button
                  onClick={handleBSTRun}
                  disabled={bstRunning || (!BST_NO_INPUT.includes(selectedAlgo) && !bstInput.trim())}
                  className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-zinc-900 text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  {bstOpLabel}
                </button>

                {/* Pause / Resume */}
                {bstRunning ? (
                  <button
                    onClick={handleBSTPause}
                    className="px-4 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="5" y="3" width="4" height="18" />
                      <rect x="15" y="3" width="4" height="18" />
                    </svg>
                    Pause
                  </button>
                ) : bstGenRef.current && !bstDone ? (
                  <button
                    onClick={handleBSTStart}
                    className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    Resume
                  </button>
                ) : null}

                {/* Step */}
                <button
                  onClick={handleBSTStep}
                  disabled={bstRunning || !bstGenRef.current || bstDone}
                  className="px-3 py-1.5 rounded-md bg-transparent hover:bg-zinc-800 border border-zinc-700 disabled:border-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 hover:text-zinc-100 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 15,12 5,21" />
                    <rect x="17" y="3" width="3" height="18" />
                  </svg>
                  Step
                </button>

                {/* Reset */}
                <button
                  onClick={handleBSTReset}
                  className="px-3 py-1.5 rounded-md bg-transparent hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1,4 1,10 7,10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  Reset Tree
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-zinc-800 mx-2" />

                {/* Speed */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 whitespace-nowrap">Speed</span>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    value={510 - speed}
                    onChange={(e) => setSpeed(510 - Number(e.target.value))}
                    className="w-24 accent-zinc-400"
                  />
                  <span className="text-xs text-zinc-500 font-mono w-10">{speed}ms</span>
                </div>

                <div className="ml-auto text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
                  Tree: <span className="text-zinc-300 font-mono font-medium">{countTreeNodes(bstRoot)}</span> nodes
                </div>
              </div>
            </>
          ) : (
            /* ── Standard Sorting / Searching Branch ──────────────── */
            <>
              <Visualizer
                array={array}
                frame={frame}
                algorithmType={currentAlgo.type}
              />
              <PerformanceMetrics
                comparisons={frame?.comparisons || 0}
                swaps={frame?.swaps || 0}
                timeTaken={timeTaken}
                spaceComplexity={currentAlgo.info.spaceComplexity}
              />
              <Controls
                isRunning={isRunning}
                onStart={handleStart}
                onPause={handlePause}
                onReset={handleReset}
                onStep={handleStep}
                speed={speed}
                onSpeedChange={setSpeed}
                disabled={isDone}
              />
            </>
          )}
        </main>

        {/* Right Panel with Toggle */}
        <div className="relative flex flex-col">
          {/* Toggle Button */}
          <div className="absolute top-4 -left-10 z-10 w-10">
            <button
              onClick={() => setShowCodePanel(!showCodePanel)}
              className="flex flex-col items-center justify-center gap-1 w-10 py-3 bg-zinc-900 hover:bg-zinc-800 border-y border-l border-zinc-800/50 rounded-l-md transition-colors group cursor-pointer"
              title={showCodePanel ? 'Show AI Chat' : 'Show Code'}
            >
              {showCodePanel ? (
                <>
                  <svg className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span className="text-[10px] font-medium text-zinc-600 group-hover:text-zinc-400">AI</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span className="text-[10px] font-medium text-zinc-600 group-hover:text-zinc-400">Code</span>
                </>
              )}
            </button>
          </div>

          {/* Conditional Panel */}
          {showCodePanel ? (
            <CodePanel
              code={isBST ? bstCode : currentAlgo.code}
              activeLine={isBST ? bstFrame?.activeLine : frame?.activeLine}
            />
          ) : (
            <AiPanel />
          )}
        </div>
      </div>
    </div>
  );
}

/** Utility: count nodes in a BST */
function countTreeNodes(node) {
  if (!node) return 0;
  return 1 + countTreeNodes(node.left) + countTreeNodes(node.right);
}
