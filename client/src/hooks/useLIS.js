import { useState, useRef, useEffect } from 'react';
import { lis, lisInfo, lisCode } from '../algorithms/lis';

export { lisInfo, lisCode };

export function useLIS(speed) {
  const [lisArr, setLisArr] = useState('3,10,2,1,20,4,6,5');
  const [lisFrame, setLisFrame] = useState(null);
  const [lisRunning, setLisRunning] = useState(false);
  const [lisDone, setLisDone] = useState(false);

  const lisGenRef      = useRef(null);
  const lisIntervalRef = useRef(null);

  function stop() {
    setLisRunning(false);
    clearInterval(lisIntervalRef.current);
    lisGenRef.current = null;
  }

  function parseArr() {
    return lisArr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  }

  function handleRun() {
    const arr = parseArr();
    if (arr.length < 2) return;
    stop();
    lisGenRef.current = lis(arr);
    setLisRunning(true);
    setLisDone(false);
    setLisFrame(null);
    lisIntervalRef.current = setInterval(() => {
      if (!lisGenRef.current) return;
      const { value, done } = lisGenRef.current.next();
      if (done) { clearInterval(lisIntervalRef.current); setLisRunning(false); setLisDone(true); lisGenRef.current = null; return; }
      setLisFrame(value);
    }, speed);
  }

  function handlePause() { setLisRunning(false); clearInterval(lisIntervalRef.current); }

  function handleResume() {
    setLisRunning(true);
    lisIntervalRef.current = setInterval(() => {
      if (!lisGenRef.current) { clearInterval(lisIntervalRef.current); return; }
      const { value, done } = lisGenRef.current.next();
      if (done) { clearInterval(lisIntervalRef.current); setLisRunning(false); setLisDone(true); lisGenRef.current = null; return; }
      setLisFrame(value);
    }, speed);
  }

  function handleStep() {
    if (!lisGenRef.current) {
      const arr = parseArr();
      if (arr.length < 2) return;
      lisGenRef.current = lis(arr);
      setLisDone(false);
    }
    const { value, done } = lisGenRef.current.next();
    if (done) { setLisRunning(false); setLisDone(true); lisGenRef.current = null; return; }
    setLisFrame(value);
  }

  function handleReset() { stop(); setLisFrame(null); setLisDone(false); }

  function resetState() { stop(); setLisFrame(null); setLisDone(false); }

  useEffect(() => () => clearInterval(lisIntervalRef.current), []);

  return {
    lisArr, setLisArr,
    lisFrame, lisRunning, lisDone, lisGenRef,
    handleRun, handlePause, handleResume, handleStep, handleReset, resetState,
  };
}
