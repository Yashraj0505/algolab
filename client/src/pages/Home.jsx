import { useState, useRef, useCallback, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Visualizer from '../components/Visualizer';
import Controls from '../components/Controls';
import AiPanel from '../components/AiPanel';

// Algorithm imports
import { bubbleSort, bubbleSortInfo } from '../algorithms/bubbleSort';
import { mergeSort, mergeSortInfo } from '../algorithms/mergeSort';
import { quickSort, quickSortInfo } from '../algorithms/quickSort';
import { binarySearch, binarySearchInfo } from '../algorithms/binarySearch';

// Registry of available algorithms
const algorithmRegistry = {
  bubbleSort: { generator: bubbleSort, info: bubbleSortInfo, type: 'sorting' },
  mergeSort: { generator: mergeSort, info: mergeSortInfo, type: 'sorting' },
  quickSort: { generator: quickSort, info: quickSortInfo, type: 'sorting' },
  binarySearch: { generator: binarySearch, info: binarySearchInfo, type: 'searching' },
};

/**
 * Generate a random array of given size with values between min and max.
 */
function generateArray(size = 30, min = 5, max = 100) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

/**
 * Home — the main page composing the full layout.
 *
 * State management:
 *   - selectedAlgo: current algorithm id
 *   - array: the data array to visualize
 *   - frame: current visualization frame from generator
 *   - isRunning: whether auto-play is active
 *   - speed: delay between frames in ms
 *   - generatorRef: holds the generator instance
 *   - intervalRef: holds the setInterval id
 */
export default function Home() {
  const [selectedAlgo, setSelectedAlgo] = useState('bubbleSort');
  const [array, setArray] = useState(() => generateArray());
  const [frame, setFrame] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [speed, setSpeed] = useState(100);

  const generatorRef = useRef(null);
  const intervalRef = useRef(null);

  const currentAlgo = algorithmRegistry[selectedAlgo];

  /**
   * Initialize generator from current array and algorithm
   */
  const initGenerator = useCallback(() => {
    const gen = currentAlgo.generator(array);
    generatorRef.current = gen;
    setIsDone(false);
    setFrame(null);
  }, [array, currentAlgo]);

  /**
   * Advance one step in the generator
   */
  const step = useCallback(() => {
    if (!generatorRef.current) return false;

    const { value, done } = generatorRef.current.next();
    if (done) {
      setIsRunning(false);
      setIsDone(true);
      clearInterval(intervalRef.current);
      return false;
    }

    setArray(value.array);
    setFrame(value);
    return true;
  }, []);

  /**
   * Start auto-play
   */
  const handleStart = useCallback(() => {
    if (isDone) {
      // Re-initialize if done
      const newArr = generateArray();
      setArray(newArr);
      const gen = currentAlgo.generator(newArr);
      generatorRef.current = gen;
      setIsDone(false);
    } else if (!generatorRef.current) {
      initGenerator();
    }

    setIsRunning(true);
  }, [isDone, currentAlgo, initGenerator]);

  /**
   * Pause auto-play
   */
  const handlePause = useCallback(() => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
  }, []);

  /**
   * Reset array and generator
   */
  const handleReset = useCallback(() => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    const newArr = generateArray();
    setArray(newArr);
    setFrame(null);
    setIsDone(false);
    generatorRef.current = null;
  }, []);

  /**
   * Single-step (manual advance)
   */
  const handleStep = useCallback(() => {
    if (!generatorRef.current) {
      initGenerator();
      // Step once after init
      setTimeout(() => {
        const gen = generatorRef.current;
        if (!gen) return;
        const { value, done } = gen.next();
        if (!done) {
          setArray(value.array);
          setFrame(value);
        } else {
          setIsDone(true);
        }
      }, 0);
      return;
    }
    step();
  }, [initGenerator, step]);

  /**
   * Handle algorithm selection change
   */
  const handleSelectAlgo = useCallback((algoId) => {
    setSelectedAlgo(algoId);
    setIsRunning(false);
    clearInterval(intervalRef.current);
    const newArr = generateArray();
    setArray(newArr);
    setFrame(null);
    setIsDone(false);
    generatorRef.current = null;
  }, []);

  /**
   * Auto-play loop — runs when isRunning changes
   */
  useEffect(() => {
    if (isRunning) {
      if (!generatorRef.current) {
        const gen = currentAlgo.generator(array);
        generatorRef.current = gen;
      }

      intervalRef.current = setInterval(() => {
        const continued = step();
        if (!continued) {
          clearInterval(intervalRef.current);
        }
      }, speed);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, speed, step, currentAlgo, array]);

  return (
    <div className="flex flex-col h-full">
      {/* Top Navbar */}
      <Navbar algorithmInfo={currentAlgo.info} />

      {/* Main body */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar */}
        <Sidebar selected={selectedAlgo} onSelect={handleSelectAlgo} />

        {/* Center: Visualizer + Controls */}
        <main className="flex-1 flex flex-col min-h-0 bg-[#0a0e1a]">
          <Visualizer
            array={array}
            frame={frame}
            algorithmType={currentAlgo.type}
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
        </main>

        {/* Right: AI Tutor Panel */}
        <AiPanel />
      </div>
    </div>
  );
}
