import { useState, useRef, useEffect } from 'react';
import {
  minHeapInsert, maxHeapInsert, minHeapExtract, maxHeapExtract,
  heapBuild, heapSort, heapInfo, heapCodeMap,
} from '../algorithms/heap';

const DEFAULT_HEAP_ARRAY = [40, 15, 60, 10, 30, 55, 70, 5, 20];
export const HEAP_IDS = new Set(['minHeapInsert', 'maxHeapInsert', 'minHeapExtract', 'maxHeapExtract', 'heapBuildMin', 'heapBuildMax', 'heapSort']);
export const HEAP_NO_INPUT = new Set(['minHeapExtract', 'maxHeapExtract', 'heapBuildMin', 'heapBuildMax', 'heapSort']);
export { heapInfo, heapCodeMap };

export function useHeap(selectedAlgo, speed) {
  const [heapArray, setHeapArray] = useState([...DEFAULT_HEAP_ARRAY]);
  const [heapFrame, setHeapFrame] = useState(null);
  const [heapInput, setHeapInput] = useState('');
  const [heapRunning, setHeapRunning] = useState(false);
  const [heapDone, setHeapDone] = useState(false);

  const heapGenRef      = useRef(null);
  const heapIntervalRef = useRef(null);

  function stop() {
    setHeapRunning(false);
    clearInterval(heapIntervalRef.current);
    heapGenRef.current = null;
  }

  function runAnimation(gen) {
    stop();
    heapGenRef.current = gen;
    setHeapRunning(true);
    setHeapDone(false);
    heapIntervalRef.current = setInterval(() => {
      if (!heapGenRef.current) return;
      const { value, done } = heapGenRef.current.next();
      if (done) {
        clearInterval(heapIntervalRef.current);
        setHeapRunning(false);
        setHeapDone(true);
        heapGenRef.current = null;
        if (value) setHeapArray(value);
        return;
      }
      setHeapFrame(value);
      if (value?.array) setHeapArray(value.array);
    }, speed);
  }

  useEffect(() => () => clearInterval(heapIntervalRef.current), []);

  function handleRun() {
    if (HEAP_NO_INPUT.has(selectedAlgo)) {
      const gen =
        selectedAlgo === 'minHeapExtract' ? minHeapExtract(heapArray)
        : selectedAlgo === 'maxHeapExtract' ? maxHeapExtract(heapArray)
        : selectedAlgo === 'heapBuildMin' ? heapBuild(heapArray, true)
        : selectedAlgo === 'heapBuildMax' ? heapBuild(heapArray, false)
        : heapSort(heapArray);
      runAnimation(gen);
      return;
    }
    const val = parseInt(heapInput.trim(), 10);
    if (isNaN(val) || val < 1 || val > 999) return;
    runAnimation(selectedAlgo === 'minHeapInsert' ? minHeapInsert(heapArray, val) : maxHeapInsert(heapArray, val));
  }

  function handleReset() {
    stop();
    setHeapArray([...DEFAULT_HEAP_ARRAY]);
    setHeapFrame(null);
    setHeapInput('');
    setHeapDone(false);
  }

  function handleStep() {
    if (!heapGenRef.current) return;
    const { value, done } = heapGenRef.current.next();
    if (done) {
      setHeapRunning(false);
      setHeapDone(true);
      clearInterval(heapIntervalRef.current);
      heapGenRef.current = null;
      if (value) setHeapArray(value);
      return;
    }
    setHeapFrame(value);
    if (value?.array) setHeapArray(value.array);
  }

  function handleStart() {
    if (!heapGenRef.current) { handleRun(); return; }
    setHeapRunning(true);
    heapIntervalRef.current = setInterval(() => {
      if (!heapGenRef.current) { clearInterval(heapIntervalRef.current); return; }
      const { value, done } = heapGenRef.current.next();
      if (done) {
        clearInterval(heapIntervalRef.current);
        setHeapRunning(false);
        setHeapDone(true);
        heapGenRef.current = null;
        if (value) setHeapArray(value);
        return;
      }
      setHeapFrame(value);
      if (value?.array) setHeapArray(value.array);
    }, speed);
  }

  function handlePause() {
    setHeapRunning(false);
    clearInterval(heapIntervalRef.current);
  }

  function resetState() {
    stop();
    setHeapFrame(null);
    setHeapInput('');
    setHeapDone(false);
  }

  return {
    heapArray, heapFrame, heapInput, setHeapInput,
    heapRunning, heapDone, heapGenRef,
    handleRun, handleReset, handleStep, handleStart, handlePause, resetState,
  };
}
