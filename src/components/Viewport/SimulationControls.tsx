import React, { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
} from 'lucide-react';
import { SimulationState, Path } from '../../types';

interface SimulationControlsProps {
  simulationState: SimulationState;
  setSimulationState: React.Dispatch<React.SetStateAction<SimulationState>>;
  paths: Path[];
  totalDrawingDistanceMm: number;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  simulationState,
  setSimulationState,
  paths,
  totalDrawingDistanceMm,
}) => {
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const speeds = [1, 2, 5, 10, 20, 50];

  useEffect(() => {
    if (!simulationState.isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const animate = (now: number) => {
      const deltaMs = now - lastTimeRef.current;
      lastTimeRef.current = now;

      const baseDurationMs = 18000;
      const progressDelta = (deltaMs / baseDurationMs) * simulationState.speed;

      setSimulationState((prev) => {
        const nextProgress = prev.progress + progressDelta;
        if (nextProgress >= 1.0) {
          return { ...prev, progress: 1.0, isPlaying: false };
        }
        return { ...prev, progress: nextProgress };
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [simulationState.isPlaying, simulationState.speed, setSimulationState]);

  const togglePlay = () => {
    setSimulationState((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
      progress: prev.progress >= 1.0 ? 0 : prev.progress,
    }));
  };

  const handleReset = () => {
    setSimulationState((prev) => ({
      ...prev,
      isPlaying: false,
      progress: 0,
    }));
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSimulationState((prev) => ({
      ...prev,
      progress: val,
    }));
  };

  const cycleSpeed = () => {
    const curIdx = speeds.indexOf(simulationState.speed);
    const nextSpeed = speeds[(curIdx + 1) % speeds.length];
    setSimulationState((prev) => ({ ...prev, speed: nextSpeed }));
  };

  const completedPaths = Math.floor(simulationState.progress * paths.length);
  const currentDrawnMm = simulationState.progress * totalDrawingDistanceMm;

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-11/12 max-w-2xl cad-panel px-4 py-2.5 rounded-xl border border-cad-border shadow-2xl flex flex-col gap-2">
      {/* Top row: Scrubber and Time */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-cad-accent font-semibold w-12">
          {(simulationState.progress * 100).toFixed(1)}%
        </span>

        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={simulationState.progress}
          onChange={handleScrub}
          className="flex-1 accent-cad-accent h-1.5 cursor-pointer"
        />

        <div className="text-[11px] font-mono text-cad-textMuted flex items-center gap-2">
          <span>
            {completedPaths}/{paths.length} <span className="text-cad-textDim">paths</span>
          </span>
          <span>
            {(currentDrawnMm / 1000).toFixed(2)}m <span className="text-cad-textDim">drawn</span>
          </span>
        </div>
      </div>

      {/* Bottom row: Controls */}
      <div className="flex items-center justify-between pt-1 border-t border-cad-border/50">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
              simulationState.isPlaying
                ? 'bg-cad-warning text-black font-semibold'
                : 'bg-cad-accent text-black font-semibold hover:bg-cad-accentHover'
            }`}
          >
            {simulationState.isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>

          <button
            onClick={handleReset}
            title="Reset Simulation"
            className="p-1.5 rounded-lg bg-cad-panelSub hover:bg-cad-border text-cad-textMuted hover:text-cad-text transition-colors"
          >
            <RotateCcw size={15} />
          </button>

          <button
            onClick={cycleSpeed}
            className="px-2 py-1 rounded-lg bg-cad-panelSub hover:bg-cad-border text-cad-text font-mono text-xs flex items-center gap-1 transition-colors"
          >
            <FastForward size={13} className="text-cad-accent" />
            <span>{simulationState.speed}x</span>
          </button>
        </div>

        {/* Live Simulation Indicator */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                simulationState.progress < 1.0 && simulationState.isPlaying
                  ? 'bg-cad-success animate-pulse'
                  : 'bg-cad-textDim'
              }`}
            />
            <span className="text-cad-textMuted">
              {simulationState.progress >= 1.0
                ? 'PLOT READY'
                : simulationState.isPlaying
                ? 'SIMULATING'
                : 'PAUSED'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
