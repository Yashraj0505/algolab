import { useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AiPanel from '../components/AiPanel';
import CodePanel from '../components/CodePanel';

import { algorithmRegistry, useSortingSearch } from '../hooks/useSortingSearch';
import { useBST, BST_IDS, bstInfo, bstCode } from '../hooks/useBST';
import { useLCS, lcsInfo, lcsCode } from '../hooks/useLCS';
import { useLIS, lisInfo, lisCode } from '../hooks/useLIS';

import SortingSection from '../sections/SortingSection';
import BSTSection from '../sections/BSTSection';
import LCSSection from '../sections/LCSSection';
import LISSection from '../sections/LISSection';

export default function Home() {
  const [selectedAlgo, setSelectedAlgo] = useState('bubbleSort');
  const [showCodePanel, setShowCodePanel] = useState(true);
  const [speed, setSpeed] = useState(100);

  const isBST = BST_IDS.has(selectedAlgo);
  const isLCS = selectedAlgo === 'lcs';
  const isLIS = selectedAlgo === 'lis';
  const isSort = !isBST && !isLCS && !isLIS;

  const currentAlgo = isSort ? algorithmRegistry[selectedAlgo] : null;

  const sorting = useSortingSearch(selectedAlgo, speed, isSort);
  const bst     = useBST(selectedAlgo, speed);
  const lcs     = useLCS(speed);
  const lis     = useLIS(speed);

  const handleSelectAlgo = useCallback((algoId) => {
    setSelectedAlgo(algoId);
    sorting.handleReset();
    bst.resetState();
    lcs.resetState();
    lis.resetState();
  }, []); // eslint-disable-line

  const currentInfo = isLIS ? lisInfo : isLCS ? lcsInfo : isBST ? bstInfo : currentAlgo?.info;
  const currentCode = isLIS ? lisCode : isLCS ? lcsCode : isBST ? bstCode : currentAlgo?.code;
  const currentActiveLine = isLIS ? lis.lisFrame?.activeLine
    : isLCS ? lcs.lcsFrame?.activeLine
    : isBST ? bst.bstFrame?.activeLine
    : sorting.frame?.activeLine;

  return (
    <div className="flex flex-col h-full">
      <Navbar algorithmInfo={currentInfo} />

      <div className="flex flex-1 min-h-0">
        <Sidebar selected={selectedAlgo} onSelect={handleSelectAlgo} />

        <main className="flex-1 flex flex-col min-h-0 bg-zinc-950">
          {isLIS ? (
            <LISSection
              lisArr={lis.lisArr} setLisArr={lis.setLisArr}
              lisFrame={lis.lisFrame} lisRunning={lis.lisRunning}
              lisDone={lis.lisDone} lisGenRef={lis.lisGenRef}
              speed={speed} onSpeedChange={setSpeed}
              onRun={lis.handleRun} onPause={lis.handlePause}
              onResume={lis.handleResume} onStep={lis.handleStep}
              onReset={lis.handleReset}
            />
          ) : isLCS ? (
            <LCSSection
              lcsStr1={lcs.lcsStr1} setLcsStr1={lcs.setLcsStr1}
              lcsStr2={lcs.lcsStr2} setLcsStr2={lcs.setLcsStr2}
              lcsFrame={lcs.lcsFrame} lcsRunning={lcs.lcsRunning}
              lcsDone={lcs.lcsDone} lcsGenRef={lcs.lcsGenRef}
              speed={speed} onSpeedChange={setSpeed}
              onRun={lcs.handleRun} onPause={lcs.handlePause}
              onResume={lcs.handleResume} onStep={lcs.handleStep}
              onReset={lcs.handleReset}
            />
          ) : isBST ? (
            <BSTSection
              selectedAlgo={selectedAlgo}
              bstRoot={bst.bstRoot} bstFrame={bst.bstFrame}
              bstInput={bst.bstInput} setBstInput={bst.setBstInput}
              bstRunning={bst.bstRunning} bstDone={bst.bstDone}
              bstGenRef={bst.bstGenRef}
              speed={speed} onSpeedChange={setSpeed}
              onRun={bst.handleRun} onStart={bst.handleStart}
              onPause={bst.handlePause} onStep={bst.handleStep}
              onReset={bst.handleReset}
            />
          ) : (
            <SortingSection
              array={sorting.array} frame={sorting.frame}
              currentAlgo={currentAlgo}
              isRunning={sorting.isRunning} isDone={sorting.isDone}
              timeTaken={sorting.timeTaken}
              speed={speed} onSpeedChange={setSpeed}
              onStart={sorting.handleStart} onPause={sorting.handlePause}
              onReset={sorting.handleReset} onStep={sorting.handleStep}
            />
          )}
        </main>

        <div className="relative flex flex-col">
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

          {showCodePanel ? (
            <CodePanel code={currentCode} activeLine={currentActiveLine} />
          ) : (
            <AiPanel />
          )}
        </div>
      </div>
    </div>
  );
}
