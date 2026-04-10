import { useState, useRef, useEffect } from 'react';
import { avlInsert, avlDelete, buildAVL, avlInfo, avlCodeMap } from '../algorithms/avl';

const DEFAULT_AVL_VALUES = [30, 20, 40, 10, 25];
export const AVL_IDS = new Set(['avlInsert', 'avlDelete']);
export { avlInfo, avlCodeMap };

export function useAVL(selectedAlgo, speed) {
  const [avlRoot, setAvlRoot] = useState(() => buildAVL(DEFAULT_AVL_VALUES));
  const [avlFrame, setAvlFrame] = useState(null);
  const [avlInput, setAvlInput] = useState('');
  const [avlRunning, setAvlRunning] = useState(false);
  const [avlDone, setAvlDone] = useState(false);

  const avlGenRef      = useRef(null);
  const avlIntervalRef = useRef(null);
  const pendingRootRef = useRef(null);

  function stop() {
    setAvlRunning(false);
    clearInterval(avlIntervalRef.current);
    avlGenRef.current = null;
  }

  function runAnimation(gen) {
    stop();
    avlGenRef.current = gen;
    setAvlRunning(true);
    setAvlDone(false);
    avlIntervalRef.current = setInterval(() => {
      if (!avlGenRef.current) return;
      const { value, done } = avlGenRef.current.next();
      if (done) {
        clearInterval(avlIntervalRef.current);
        setAvlRunning(false);
        setAvlDone(true);
        avlGenRef.current = null;
        if (pendingRootRef.current) setAvlRoot(pendingRootRef.current);
        return;
      }
      setAvlFrame(value);
      if (value?.root) pendingRootRef.current = value.root;
    }, speed);
  }

  useEffect(() => {
    if (avlDone && pendingRootRef.current) setAvlRoot(pendingRootRef.current);
  }, [avlDone]);

  useEffect(() => () => clearInterval(avlIntervalRef.current), []);

  function handleRun() {
    const val = parseInt(avlInput.trim(), 10);
    if (isNaN(val) || val < 1 || val > 999) return;
    pendingRootRef.current = avlRoot;
    runAnimation(selectedAlgo === 'avlInsert' ? avlInsert(avlRoot, val) : avlDelete(avlRoot, val));
  }

  function handleReset() {
    stop();
    setAvlRoot(buildAVL(DEFAULT_AVL_VALUES));
    setAvlFrame(null);
    setAvlInput('');
    setAvlDone(false);
    pendingRootRef.current = null;
  }

  function handleStep() {
    if (!avlGenRef.current) return;
    const { value, done } = avlGenRef.current.next();
    if (done) {
      setAvlRunning(false);
      setAvlDone(true);
      clearInterval(avlIntervalRef.current);
      avlGenRef.current = null;
      if (pendingRootRef.current) setAvlRoot(pendingRootRef.current);
      return;
    }
    setAvlFrame(value);
    if (value?.root) pendingRootRef.current = value.root;
  }

  function handleStart() {
    if (!avlGenRef.current) { handleRun(); return; }
    setAvlRunning(true);
    avlIntervalRef.current = setInterval(() => {
      if (!avlGenRef.current) { clearInterval(avlIntervalRef.current); return; }
      const { value, done } = avlGenRef.current.next();
      if (done) {
        clearInterval(avlIntervalRef.current);
        setAvlRunning(false);
        setAvlDone(true);
        avlGenRef.current = null;
        if (pendingRootRef.current) setAvlRoot(pendingRootRef.current);
        return;
      }
      setAvlFrame(value);
      if (value?.root) pendingRootRef.current = value.root;
    }, speed);
  }

  function handlePause() {
    setAvlRunning(false);
    clearInterval(avlIntervalRef.current);
  }

  function resetState() {
    stop();
    setAvlFrame(null);
    setAvlInput('');
    setAvlDone(false);
  }

  return {
    avlRoot, avlFrame, avlInput, setAvlInput,
    avlRunning, avlDone, avlGenRef,
    handleRun, handleReset, handleStep, handleStart, handlePause, resetState,
  };
}
