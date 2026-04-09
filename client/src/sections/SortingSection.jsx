import Visualizer from '../components/Visualizer';
import PerformanceMetrics from '../components/PerformanceMetrics';
import Controls from '../components/Controls';

export default function SortingSection({ array, frame, currentAlgo, isRunning, isDone, timeTaken, speed, onStart, onPause, onReset, onStep, onSpeedChange }) {
  return (
    <>
      <Visualizer array={array} frame={frame} algorithmType={currentAlgo.type} />
      <PerformanceMetrics
        comparisons={frame?.comparisons || 0}
        swaps={frame?.swaps || 0}
        timeTaken={timeTaken}
        spaceComplexity={currentAlgo.info.spaceComplexity}
      />
      <Controls
        isRunning={isRunning}
        onStart={onStart}
        onPause={onPause}
        onReset={onReset}
        onStep={onStep}
        speed={speed}
        onSpeedChange={onSpeedChange}
        disabled={isDone}
      />
    </>
  );
}
