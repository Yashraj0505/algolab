import { useState, useRef, useEffect } from 'react';
import { lcs, lcsInfo, lcsCode } from '../algorithms/lcs';

export { lcsInfo, lcsCode };

export function useLCS(speed) {
  const [lcsStr1, setLcsStr1] = useState('ABCBDAB');
  const [lcsStr2, setLcsStr2] = useState('BDCAB');
  const [lcsFrame, setLcsFrame] = useState(null);
  const [lcsRunning, setLcsRunning] = useState(false);
  const [lcsDone, setLcsDone] = useState(false);

  const lcsGenRef      = useRef(null);
  const lcsIntervalRef = useRef(null);

  function stop() {
    setLcsRunning(false);
    clearInterval(lcsIntervalRef.current);
    lcsGenRef.current = null;
  }

  function handleRun() {
    const s1 = lcsStr1.trim(), s2 = lcsStr2.trim();
    if (!s1 || !s2) return;
    stop();
    lcsGenRef.current = lcs(s1, s2);
    setLcsRunning(true);
    setLcsDone(false);
    setLcsFrame(null);
    lcsIntervalRef.current = setInterval(() => {
      if (!lcsGenRef.current) return;
      const { value, done } = lcsGenRef.current.next();
      if (done) { clearInterval(lcsIntervalRef.current); setLcsRunning(false); setLcsDone(true); lcsGenRef.current = null; return; }
      setLcsFrame(value);
    }, speed);
  }

  function handlePause() { setLcsRunning(false); clearInterval(lcsIntervalRef.current); }

  function handleResume() {
    setLcsRunning(true);
    lcsIntervalRef.current = setInterval(() => {
      if (!lcsGenRef.current) { clearInterval(lcsIntervalRef.current); return; }
      const { value, done } = lcsGenRef.current.next();
      if (done) { clearInterval(lcsIntervalRef.current); setLcsRunning(false); setLcsDone(true); lcsGenRef.current = null; return; }
      setLcsFrame(value);
    }, speed);
  }

  function handleStep() {
    if (!lcsGenRef.current) {
      const s1 = lcsStr1.trim(), s2 = lcsStr2.trim();
      if (!s1 || !s2) return;
      lcsGenRef.current = lcs(s1, s2);
      setLcsDone(false);
    }
    const { value, done } = lcsGenRef.current.next();
    if (done) { setLcsRunning(false); setLcsDone(true); clearInterval(lcsIntervalRef.current); lcsGenRef.current = null; return; }
    setLcsFrame(value);
  }

  function handleReset() { stop(); setLcsFrame(null); setLcsDone(false); }

  function resetState() { stop(); setLcsFrame(null); setLcsDone(false); }

  useEffect(() => () => clearInterval(lcsIntervalRef.current), []);

  return {
    lcsStr1, setLcsStr1, lcsStr2, setLcsStr2,
    lcsFrame, lcsRunning, lcsDone, lcsGenRef,
    handleRun, handlePause, handleResume, handleStep, handleReset, resetState,
  };
}
