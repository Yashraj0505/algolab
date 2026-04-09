import { useState, useRef, useCallback, useEffect } from 'react';
import { bubbleSort, bubbleSortInfo, bubbleSortCode } from '../algorithms/bubbleSort';
import { mergeSort, mergeSortInfo, mergeSortCode } from '../algorithms/mergeSort';
import { quickSort, quickSortInfo, quickSortCode } from '../algorithms/quickSort';
import { binarySearch, binarySearchInfo, binarySearchCode } from '../algorithms/binarySearch';

export const algorithmRegistry = {
  bubbleSort: { generator: bubbleSort, info: bubbleSortInfo, type: 'sorting', code: bubbleSortCode },
  mergeSort:  { generator: mergeSort,  info: mergeSortInfo,  type: 'sorting', code: mergeSortCode  },
  quickSort:  { generator: quickSort,  info: quickSortInfo,  type: 'sorting', code: quickSortCode  },
  binarySearch: { generator: binarySearch, info: binarySearchInfo, type: 'searching', code: binarySearchCode },
};

function generateArray(size = 30, min = 5, max = 100) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

export function useSortingSearch(selectedAlgo, speed, isActive) {
  const currentAlgo = algorithmRegistry[selectedAlgo];

  const [array, setArray] = useState(() => generateArray());
  const [frame, setFrame] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const generatorRef = useRef(null);
  const intervalRef  = useRef(null);
  const timerRef     = useRef(null);

  const reset = useCallback(() => {
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
      generatorRef.current = currentAlgo.generator(newArr);
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

  const handleStep = useCallback(() => {
    if (!generatorRef.current) {
      initGenerator();
      setTimeout(() => {
        const gen = generatorRef.current;
        if (!gen) return;
        const { value, done } = gen.next();
        if (!done) { setArray(value.array); setFrame(value); }
        else { setIsDone(true); clearInterval(timerRef.current); if (startTime) setTimeTaken(Date.now() - startTime); }
      }, 0);
      return;
    }
    step();
  }, [initGenerator, step, startTime]);

  useEffect(() => {
    if (!isActive || !isRunning) return;
    if (!generatorRef.current) generatorRef.current = currentAlgo.generator(array);
    timerRef.current = setInterval(() => { if (startTime) setTimeTaken(Date.now() - startTime); }, 10);
    intervalRef.current = setInterval(() => { if (!step()) { clearInterval(intervalRef.current); clearInterval(timerRef.current); } }, speed);
    return () => { clearInterval(intervalRef.current); clearInterval(timerRef.current); };
  }, [isRunning, speed, step, currentAlgo, array, startTime, isActive]);

  return { array, frame, isRunning, isDone, timeTaken, handleStart, handlePause, handleReset: reset, handleStep };
}
