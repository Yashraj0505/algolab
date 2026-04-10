import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AiPanel from '../components/AiPanel';
import CodePanel from '../components/CodePanel';

import { algorithmRegistry, useSortingSearch } from '../hooks/useSortingSearch';
import { useBST, BST_IDS, bstInfo, bstCode } from '../hooks/useBST';
import { useLCS, lcsInfo, lcsCode } from '../hooks/useLCS';
import { useLIS, lisInfo, lisCode } from '../hooks/useLIS';
import { useMCM, mcmInfo, mcmCode } from '../hooks/useMCM';
import { useAVL, AVL_IDS, avlInfo, avlCodeMap } from '../hooks/useAVL';
import { useRBT, RBT_IDS, rbtInfo, rbtCodeMap } from '../hooks/useRBT';
import { useHeap, HEAP_IDS, heapInfo, heapCodeMap } from '../hooks/useHeap';

import SortingSection from '../sections/SortingSection';
import BSTSection from '../sections/BSTSection';
import LCSSection from '../sections/LCSSection';
import LISSection from '../sections/LISSection';
import MCMSection from '../sections/MCMSection';
import AVLSection from '../sections/AVLSection';
import RBTSection from '../sections/RBTSection';
import HeapSection from '../sections/HeapSection';

const SECTION_DEFAULT = {
  trees: 'bstInsert',
  dp: 'lcs',
  graphs: null,
  strings: 'bubbleSort',
};

export default function Home() {
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') || 'strings';
  const [selectedAlgo, setSelectedAlgo] = useState(() => SECTION_DEFAULT[section] ?? 'bubbleSort');
  const [showCodePanel, setShowCodePanel] = useState(true);
  const [speed, setSpeed] = useState(100);

  const isBST = BST_IDS.has(selectedAlgo);
  const isLCS = selectedAlgo === 'lcs';
  const isLIS = selectedAlgo === 'lis';
  const isMCM = selectedAlgo === 'mcm';
  const isAVL = AVL_IDS.has(selectedAlgo);
  const isRBT = RBT_IDS.has(selectedAlgo);
  const isHeap = HEAP_IDS.has(selectedAlgo);
  const isSort = !isBST && !isLCS && !isLIS && !isMCM && !isAVL && !isRBT && !isHeap;

  const currentAlgo = isSort ? algorithmRegistry[selectedAlgo] : null;

  const sorting = useSortingSearch(selectedAlgo, speed, isSort);
  const bst = useBST(selectedAlgo, speed);
  const lcs = useLCS(speed);
  const lis = useLIS(speed);
  const mcm = useMCM(speed);
  const avl = useAVL(selectedAlgo, speed);
  const rbt = useRBT(selectedAlgo, speed);
  const heap = useHeap(selectedAlgo, speed);

  const handleSelectAlgo = useCallback((algoId) => {
    setSelectedAlgo(algoId);
    sorting.handleReset();
    bst.resetState();
    lcs.resetState();
    lis.resetState();
    mcm.resetState();
    avl.resetState();
    rbt.resetState();
    heap.resetState();
  }, []); // eslint-disable-line

  const currentInfo = isHeap ? heapInfo
    : isRBT ? rbtInfo
      : isAVL ? avlInfo
        : isMCM ? mcmInfo
          : isLIS ? lisInfo
            : isLCS ? lcsInfo
              : isBST ? bstInfo
                : currentAlgo?.info;

  const currentCode = isHeap ? heapCodeMap[selectedAlgo]
    : isRBT ? rbtCodeMap[selectedAlgo]
      : isAVL ? avlCodeMap[selectedAlgo]
        : isMCM ? mcmCode
          : isLIS ? lisCode
            : isLCS ? lcsCode
              : isBST ? bstCode
                : currentAlgo?.code;

  const currentActiveLine = isHeap ? heap.heapFrame?.activeLine
    : isRBT ? rbt.rbtFrame?.activeLine
      : isAVL ? avl.avlFrame?.activeLine
        : isMCM ? mcm.mcmFrame?.activeLine
          : isLIS ? lis.lisFrame?.activeLine
            : isLCS ? lcs.lcsFrame?.activeLine
              : isBST ? bst.bstFrame?.activeLine
                : sorting.frame?.activeLine;

  return (
    <div className="flex flex-col h-screen">
      <Navbar algorithmInfo={currentInfo} />

      <div className="flex flex-1 min-h-0">
        <Sidebar selected={selectedAlgo} onSelect={handleSelectAlgo} section={section} />

        <main className="flex-1 flex flex-col min-h-0 bg-zinc-950">
          {section === 'graphs' ? (
            <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
              Graph algorithms coming soon
            </div>
          ) : isHeap ? (
            <HeapSection
              selectedAlgo={selectedAlgo}
              heapArray={heap.heapArray} heapFrame={heap.heapFrame}
              heapInput={heap.heapInput} setHeapInput={heap.setHeapInput}
              heapRunning={heap.heapRunning} heapDone={heap.heapDone}
              heapGenRef={heap.heapGenRef}
              speed={speed} onSpeedChange={setSpeed}
              onRun={heap.handleRun} onStart={heap.handleStart}
              onPause={heap.handlePause} onStep={heap.handleStep}
              onReset={heap.handleReset}
            />
          ) : isRBT ? (
            <RBTSection
              selectedAlgo={selectedAlgo}
              rbtRoot={rbt.rbtRoot} rbtFrame={rbt.rbtFrame}
              rbtInput={rbt.rbtInput} setRbtInput={rbt.setRbtInput}
              rbtRunning={rbt.rbtRunning} rbtDone={rbt.rbtDone}
              rbtGenRef={rbt.rbtGenRef}
              speed={speed} onSpeedChange={setSpeed}
              onRun={rbt.handleRun} onStart={rbt.handleStart}
              onPause={rbt.handlePause} onStep={rbt.handleStep}
              onReset={rbt.handleReset}
            />
          ) : isAVL ? (
            <AVLSection
              selectedAlgo={selectedAlgo}
              avlRoot={avl.avlRoot} avlFrame={avl.avlFrame}
              avlInput={avl.avlInput} setAvlInput={avl.setAvlInput}
              avlRunning={avl.avlRunning} avlDone={avl.avlDone}
              avlGenRef={avl.avlGenRef}
              speed={speed} onSpeedChange={setSpeed}
              onRun={avl.handleRun} onStart={avl.handleStart}
              onPause={avl.handlePause} onStep={avl.handleStep}
              onReset={avl.handleReset}
            />
          ) : isMCM ? (
            <MCMSection
              mcmDims={mcm.mcmDims} setMcmDims={mcm.setMcmDims}
              mcmFrame={mcm.mcmFrame} mcmRunning={mcm.mcmRunning}
              mcmDone={mcm.mcmDone} mcmGenRef={mcm.mcmGenRef}
              speed={speed} onSpeedChange={setSpeed}
              onRun={mcm.handleRun} onPause={mcm.handlePause}
              onResume={mcm.handleResume} onStep={mcm.handleStep}
              onReset={mcm.handleReset}
            />
          ) : isLIS ? (
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
            <AiPanel selectedAlgo={selectedAlgo} />
          )}
        </div>
      </div>
    </div>
  );
}
