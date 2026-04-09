import { useState, useRef, useEffect } from 'react';
import {
  bstInsert, bstSearch, bstDelete,
  bstInorder, bstPreorder, bstPostorder,
  bstBFS, bstDFS, buildBST,
  bstInfo, bstCode,
} from '../algorithms/bst';

export const BST_NO_INPUT = ['bstInorder', 'bstPreorder', 'bstPostorder', 'bstBFS', 'bstDFS'];
export const BST_IDS = new Set(['bstInsert', 'bstSearch', 'bstDelete', ...BST_NO_INPUT]);
const DEFAULT_TREE_VALUES = [50, 30, 70, 20, 40, 60, 80];

export { bstInfo, bstCode };

export function useBST(selectedAlgo, speed) {
  const [bstRoot, setBstRoot] = useState(() => buildBST(DEFAULT_TREE_VALUES));
  const [bstFrame, setBstFrame] = useState(null);
  const [bstInput, setBstInput] = useState('');
  const [bstRunning, setBstRunning] = useState(false);
  const [bstDone, setBstDone] = useState(false);

  const bstGenRef      = useRef(null);
  const bstIntervalRef = useRef(null);
  const pendingRootRef = useRef(null);

  function stop() {
    setBstRunning(false);
    clearInterval(bstIntervalRef.current);
    bstGenRef.current = null;
  }

  function runAnimation(gen, workingRoot) {
    stop();
    pendingRootRef.current = workingRoot;
    bstGenRef.current = gen;
    setBstRunning(true);
    setBstDone(false);

    bstIntervalRef.current = setInterval(() => {
      if (!bstGenRef.current) return;
      const { value, done } = bstGenRef.current.next();
      if (done) {
        clearInterval(bstIntervalRef.current);
        setBstRunning(false);
        setBstDone(true);
        bstGenRef.current = null;
        return;
      }
      setBstFrame(value);
      if (value.root) pendingRootRef.current = value.root;
    }, speed);
  }

  useEffect(() => {
    if (bstDone && pendingRootRef.current) setBstRoot(pendingRootRef.current);
  }, [bstDone]);

  useEffect(() => () => clearInterval(bstIntervalRef.current), []);

  function handleRun() {
    if (BST_NO_INPUT.includes(selectedAlgo)) {
      const map = { bstInorder: bstInorder, bstPreorder: bstPreorder, bstPostorder: bstPostorder, bstBFS: bstBFS, bstDFS: bstDFS };
      runAnimation(map[selectedAlgo](bstRoot), bstRoot);
      return;
    }
    const val = parseInt(bstInput.trim(), 10);
    if (isNaN(val) || val < 1 || val > 999) return;
    const map = { bstInsert, bstSearch, bstDelete };
    runAnimation(map[selectedAlgo](bstRoot, val), bstRoot);
  }

  function handleReset() {
    stop();
    setBstRoot(buildBST(DEFAULT_TREE_VALUES));
    setBstFrame(null);
    setBstInput('');
    setBstDone(false);
    pendingRootRef.current = null;
  }

  function handleStep() {
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

  function handleStart() {
    if (!bstGenRef.current) { handleRun(); return; }
    setBstRunning(true);
    bstIntervalRef.current = setInterval(() => {
      if (!bstGenRef.current) { clearInterval(bstIntervalRef.current); return; }
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

  function handlePause() {
    setBstRunning(false);
    clearInterval(bstIntervalRef.current);
  }

  function resetState() {
    stop();
    setBstFrame(null);
    setBstInput('');
    setBstDone(false);
  }

  return {
    bstRoot, bstFrame, bstInput, setBstInput,
    bstRunning, bstDone, bstGenRef,
    handleRun, handleReset, handleStep, handleStart, handlePause, resetState,
  };
}
