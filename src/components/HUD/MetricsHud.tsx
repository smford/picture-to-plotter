import React from 'react';
import {
  Activity,
  PenTool,
  Clock,
  Zap,
  TrendingDown,
  Navigation,
} from 'lucide-react';
import { TelemetryMetrics } from '../../types';

interface MetricsHudProps {
  metrics: TelemetryMetrics | null;
  isGenerating: boolean;
  progress: number;
  phase: string;
}

export const MetricsHud: React.FC<MetricsHudProps> = ({
  metrics,
  isGenerating,
  progress,
  phase,
}) => {
  const formatTime = (seconds: number) => {
    if (seconds <= 0 || !isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins % 60}m ${secs}s`;
    }
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <aside aria-label="Machine Telemetry HUD" className="absolute top-4 right-4 z-20 w-80 cad-panel rounded-xl border border-cad-border p-3.5 shadow-2xl flex flex-col gap-3">
      {/* HUD Header */}
      <div className="flex items-center justify-between pb-2 border-b border-cad-border/60">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-cad-accent animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-cad-text">
            CAM Telemetry HUD
          </span>
        </div>

        {isGenerating ? (
          <span className="cad-badge bg-cad-warning/20 text-cad-warning animate-pulse">
            COMPUTING
          </span>
        ) : (
          <span className="cad-badge bg-cad-success/20 text-cad-success">
            CAM READY
          </span>
        )}
      </div>

      {/* Generating Progress Bar */}
      {isGenerating && (
        <div className="flex flex-col gap-1 py-1">
          <div className="flex justify-between text-[11px] font-mono text-cad-textMuted">
            <span className="truncate pr-2">{phase || 'Processing...'}</span>
            <span className="text-cad-accent">{(progress * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-cad-panelSub rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cad-accent to-cad-success transition-all duration-200"
              style={{ width: `${Math.max(5, progress * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Telemetry Grid */}
      {metrics ? (
        <div className="grid grid-cols-2 gap-2.5">
          {/* Pen-Downs */}
          <div className="cad-panel-sub p-2.5 rounded-lg flex flex-col">
            <div className="flex items-center gap-1.5 text-cad-textMuted text-[11px]">
              <PenTool size={13} className="text-cad-accent" />
              <span>Pen-Downs</span>
            </div>
            <span className="text-base font-mono font-bold text-cad-text mt-0.5">
              {metrics.totalPaths.toLocaleString()}
            </span>
            <span className="text-[10px] text-cad-textDim font-mono">strokes</span>
          </div>

          {/* Draw Distance */}
          <div className="cad-panel-sub p-2.5 rounded-lg flex flex-col">
            <div className="flex items-center gap-1.5 text-cad-textMuted text-[11px]">
              <Zap size={13} className="text-cad-success" />
              <span>Drawing Dist.</span>
            </div>
            <span className="text-base font-mono font-bold text-cad-success mt-0.5">
              {(metrics.drawDistanceMm / 1000).toFixed(2)} m
            </span>
            <span className="text-[10px] text-cad-textDim font-mono">
              {metrics.drawDistanceMm.toFixed(0)} mm
            </span>
          </div>

          {/* Rapid Air Transit */}
          <div className="cad-panel-sub p-2.5 rounded-lg flex flex-col">
            <div className="flex items-center gap-1.5 text-cad-textMuted text-[11px]">
              <Navigation size={13} className="text-cad-danger" />
              <span>Air Transit</span>
            </div>
            <span className="text-base font-mono font-bold text-cad-danger mt-0.5">
              {(metrics.airDistanceMm / 1000).toFixed(2)} m
            </span>
            <span className="text-[10px] text-cad-textDim font-mono">
              {metrics.airDistanceMm.toFixed(0)} mm pen-up
            </span>
          </div>

          {/* Estimated Plot Time */}
          <div className="cad-panel-sub p-2.5 rounded-lg flex flex-col">
            <div className="flex items-center gap-1.5 text-cad-textMuted text-[11px]">
              <Clock size={13} className="text-cad-warning" />
              <span>Est. Plot Time</span>
            </div>
            <span className="text-base font-mono font-bold text-cad-warning mt-0.5">
              {formatTime(metrics.estimatedTimeSec)}
            </span>
            <span className="text-[10px] text-cad-textDim font-mono">
              at target feedrate
            </span>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-cad-textMuted">
          Upload an image or select a preset to generate telemetry
        </div>
      )}

      {/* RDP Vertex Optimization & Efficiency */}
      {metrics && (
        <div className="cad-panel-sub p-2.5 rounded-lg flex flex-col gap-2 border border-cad-border/40">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-cad-textMuted">
              <TrendingDown size={13} className="text-cad-accent" />
              <span>RDP Simplification</span>
            </div>
            <span className="font-mono text-cad-accent font-bold">
              -{metrics.reductionPercent.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-cad-textDim">
            <span>Raw: {metrics.rawVertexCount.toLocaleString()} pts</span>
            <span>CAM: {metrics.optimizedVertexCount.toLocaleString()} pts</span>
          </div>

          <div className="pt-1 border-t border-cad-border/30 flex items-center justify-between text-[11px]">
            <span className="text-cad-textMuted">Plotting Efficiency</span>
            <span className="font-mono text-cad-success font-semibold">
              {metrics.efficiencyPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};
