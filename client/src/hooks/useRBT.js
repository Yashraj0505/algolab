import { useState, useRef, useEffect } from 'react';
import { rbtInsert, rbtDelete, rbtSearch, buildRBT, rbtInfo, rbtCodeMap } from '../algorithms/rbt';

const DEFAULT_RBT_VALUES = [10, 20, 30, 15, 25];
export const RBT_IDS = new Set(['rbtInsert', 'rbtDelete', 'rbtSearch']);
export { rbtInfo, rbtCodeMap };

function getRoot(node) {
  if (!node) return null;
  while (node.parent) node = node.parent;
  return node;
}

export function useRBT(selectedAlgo, speed) {
  const [rbtRoot, setRbtRoot] = useState(() => buildRBT(DEFAULT_RBT_VALUES));
  const [rbtFrame, setRbtFrame] = useState(null);
  const [rbtInput, setRbtInput] = useState('');
  const [rbtRunning, setRbtRunning] = useState(false);
  const [rbtDone, setRbtDone] = useState(false);

  const rbtGenRef      = useRef(null);
  const rbtIntervalRef = useRef(null);
  const pendingRootRef = useRef(null);

  function stop() {
    setRbtRunning(false);
    clearInterval(rbtIntervalRef.current);
    rbtGenRef.current = null;
  }

  function runAnimation(gen) {
    stop();
    rbtGenRef.current = gen;
    setRbtRunning(true);
    setRbtDone(false);
    rbtIntervalRef.current = setInterval(() => {
      if (!rbtGenRef.current) return;
      const { value, done } = rbtGenRef.current.next();
      if (done) {
        clearInterval(rbtIntervalRef.current);
        setRbtRunning(false);
        setRbtDone(true);
        rbtGenRef.current = null;
        setRbtRoot(value ?? pendingRootRef.current);
        return;
      }
      setRbtFrame(value);
      if (value?.root) pendingRootRef.current = value.root;
    }, speed);
  }

  useEffect(() => () => clearInterval(rbtIntervalRef.current), []);

  function handleRun() {
    const val = parseInt(rbtInput.trim(), 10);
    if (isNaN(val) || val < 1 || val > 999) return;
    pendingRootRef.current = rbtRoot;
    const gen = selectedAlgo === 'rbtInsert' ? rbtInsert(rbtRoot, val)
      : selectedAlgo === 'rbtDelete' ? rbtDelete(rbtRoot, val)
      : rbtSearch(rbtRoot, val);
    runAnimation(gen);
  }

  function handleReset() {
    stop();
    setRbtRoot(buildRBT(DEFAULT_RBT_VALUES));
    setRbtFrame(null);
    setRbtInput('');
    setRbtDone(false);
    pendingRootRef.current = null;
  }

  function handleStep() {
    if (!rbtGenRef.current) return;
    const { value, done } = rbtGenRef.current.next();
    if (done) {
      setRbtRunning(false);
      setRbtDone(true);
      clearInterval(rbtIntervalRef.current);
      rbtGenRef.current = null;
      setRbtRoot(value ?? pendingRootRef.current);
      return;
    }
    setRbtFrame(value);
    if (value?.root) pendingRootRef.current = value.root;
  }

  function handleStart() {
    if (!rbtGenRef.current) { handleRun(); return; }
    setRbtRunning(true);
    rbtIntervalRef.current = setInterval(() => {
      if (!rbtGenRef.current) { clearInterval(rbtIntervalRef.current); return; }
      const { value, done } = rbtGenRef.current.next();
      if (done) {
        clearInterval(rbtIntervalRef.current);
        setRbtRunning(false);
        setRbtDone(true);
        rbtGenRef.current = null;
        setRbtRoot(value ?? pendingRootRef.current);
        return;
      }
      setRbtFrame(value);
      if (value?.root) pendingRootRef.current = value.root;
    }, speed);
  }

  function handlePause() {
    setRbtRunning(false);
    clearInterval(rbtIntervalRef.current);
  }

  function resetState() {
    stop();
    setRbtFrame(null);
    setRbtInput('');
    setRbtDone(false);
  }

  return {
    rbtRoot, rbtFrame, rbtInput, setRbtInput,
    rbtRunning, rbtDone, rbtGenRef,
    handleRun, handleReset, handleStep, handleStart, handlePause, resetState,
  };
}
