import { useState, useRef, useEffect } from 'react';
import { mcm, mcmInfo, mcmCode } from '../algorithms/mcm';

export { mcmInfo, mcmCode };

export function useMCM(speed) {
  const [mcmDims, setMcmDims] = useState('10,30,5,60');
  const [mcmFrame, setMcmFrame] = useState(null);
  const [mcmRunning, setMcmRunning] = useState(false);
  const [mcmDone, setMcmDone] = useState(false);

  const mcmGenRef = useRef(null);
  const mcmIntervalRef = useRef(null);

  function stop() {
    setMcmRunning(false);
    clearInterval(mcmIntervalRef.current);
    mcmGenRef.current = null;
  }

  function parseDims(str) {
    return str.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n > 0);
  }

  function handleRun() {
    const dims = parseDims(mcmDims);
    if (dims.length < 3) return;
    stop();
    mcmGenRef.current = mcm(dims);
    setMcmRunning(true);
    setMcmDone(false);
    setMcmFrame(null);
    mcmIntervalRef.current = setInterval(() => {
      if (!mcmGenRef.current) return;
      const { value, done } = mcmGenRef.current.next();
      if (done) { clearInterval(mcmIntervalRef.current); setMcmRunning(false); setMcmDone(true); mcmGenRef.current = null; return; }
      setMcmFrame(value);
    }, speed);
  }

  function handlePause() { setMcmRunning(false); clearInterval(mcmIntervalRef.current); }

  function handleResume() {
    setMcmRunning(true);
    mcmIntervalRef.current = setInterval(() => {
      if (!mcmGenRef.current) { clearInterval(mcmIntervalRef.current); return; }
      const { value, done } = mcmGenRef.current.next();
      if (done) { clearInterval(mcmIntervalRef.current); setMcmRunning(false); setMcmDone(true); mcmGenRef.current = null; return; }
      setMcmFrame(value);
    }, speed);
  }

  function handleStep() {
    if (!mcmGenRef.current) {
      const dims = parseDims(mcmDims);
      if (dims.length < 3) return;
      mcmGenRef.current = mcm(dims);
      setMcmDone(false);
    }
    const { value, done } = mcmGenRef.current.next();
    if (done) { setMcmRunning(false); setMcmDone(true); clearInterval(mcmIntervalRef.current); mcmGenRef.current = null; return; }
    setMcmFrame(value);
  }

  function handleReset() { stop(); setMcmFrame(null); setMcmDone(false); }
  function resetState() { stop(); setMcmFrame(null); setMcmDone(false); }

  useEffect(() => () => clearInterval(mcmIntervalRef.current), []);

  return {
    mcmDims, setMcmDims,
    mcmFrame, mcmRunning, mcmDone, mcmGenRef,
    handleRun, handlePause, handleResume, handleStep, handleReset, resetState,
  };
}
