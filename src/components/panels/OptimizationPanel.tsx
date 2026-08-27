import React from 'react';
import {
  TrendingDown,
  Navigation,
  ArrowRightLeft,
  Scissors,
} from 'lucide-react';
import { OptimizationParams, PhysicalDimensions, PaperSize, Orientation } from '../../types';

interface OptimizationPanelProps {
  optimization: OptimizationParams;
  onUpdateOptimization: (updater: (prev: OptimizationParams) => OptimizationParams) => void;
  dimensions: PhysicalDimensions;
  onUpdateDimensions: (updater: (prev: PhysicalDimensions) => PhysicalDimensions) => void;
}

export const OptimizationPanel: React.FC<OptimizationPanelProps> = ({
  optimization,
  onUpdateOptimization,
  dimensions,
  onUpdateDimensions,
}) => {
  const paperSizes: { id: PaperSize; label: string; dims: string }[] = [
    { id: 'A4', label: 'A4', dims: '210 × 297 mm' },
    { id: 'A3', label: 'A3', dims: '297 × 420 mm' },
    { id: 'A5', label: 'A5', dims: '148 × 210 mm' },
    { id: 'Letter', label: 'US Letter', dims: '8.5 × 11 in' },
    { id: 'Square', label: 'Square', dims: '200 × 200 mm' },
    { id: 'Custom', label: 'Custom', dims: 'User defined' },
  ];

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* 1. PHYSICAL DIMENSIONS & BED */}
      <div className="flex flex-col gap-3">
        <label className="text-[11px] font-semibold text-cad-textMuted uppercase tracking-wider">
          Physical Sheet / Machine Bed
        </label>

        {/* Paper Size Grid */}
        <div className="grid grid-cols-3 gap-1.5">
          {paperSizes.map((p) => (
            <button
              key={p.id}
              onClick={() => onUpdateDimensions((d) => ({ ...d, paperSize: p.id }))}
              className={`p-2 rounded-lg text-left border flex flex-col transition-all ${
                dimensions.paperSize === p.id
                  ? 'bg-cad-accent/15 border-cad-accent text-cad-accent shadow-glow-accent'
                  : 'cad-panel-sub border-cad-border text-cad-text hover:border-cad-borderLight'
              }`}
            >
              <span className="font-semibold text-xs">{p.label}</span>
              <span className="text-[9px] text-cad-textDim font-mono truncate">{p.dims}</span>
            </button>
          ))}
        </div>

        {/* Custom Width & Height inputs if Custom */}
        {dimensions.paperSize === 'Custom' && (
          <div className="grid grid-cols-2 gap-2 p-2 rounded-lg cad-panel-sub border border-cad-border/60">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-cad-textMuted font-mono">Width (mm)</span>
              <input
                type="number"
                value={dimensions.customWidthMm}
                onChange={(e) =>
                  onUpdateDimensions((d) => ({
                    ...d,
                    customWidthMm: Math.max(10, parseFloat(e.target.value) || 100),
                  }))
                }
                className="cad-input text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-cad-textMuted font-mono">Height (mm)</span>
              <input
                type="number"
                value={dimensions.customHeightMm}
                onChange={(e) =>
                  onUpdateDimensions((d) => ({
                    ...d,
                    customHeightMm: Math.max(10, parseFloat(e.target.value) || 100),
                  }))
                }
                className="cad-input text-xs"
              />
            </div>
          </div>
        )}

        {/* Orientation & Margin */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-cad-textMuted">Orientation</span>
            <div className="grid grid-cols-2 gap-1">
              {(['portrait', 'landscape'] as Orientation[]).map((orient) => (
                <button
                  key={orient}
                  onClick={() => onUpdateDimensions((d) => ({ ...d, orientation: orient }))}
                  className={`py-1 rounded capitalize font-mono text-[10px] border transition-all ${
                    dimensions.orientation === orient
                      ? 'bg-cad-accent/20 border-cad-accent text-cad-accent font-semibold'
                      : 'cad-panel-sub border-cad-border text-cad-textMuted'
                  }`}
                >
                  {orient}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-cad-textMuted font-mono text-[10px]">
              <span>Margin</span>
              <span className="text-cad-accent">{dimensions.marginMm} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="2"
              value={dimensions.marginMm}
              onChange={(e) =>
                onUpdateDimensions((d) => ({ ...d, marginMm: parseInt(e.target.value) }))
              }
            />
          </div>
        </div>
      </div>

      {/* 2. CAM GEOMETRIC OPTIMIZATION */}
      <div className="flex flex-col gap-3 pt-3 border-t border-cad-border/60">
        <label className="text-[11px] font-semibold text-cad-textMuted uppercase tracking-wider">
          CAM Polyline & Path Sorter
        </label>

        {/* RDP Tolerance */}
        <div className="flex flex-col gap-2 p-2.5 rounded-xl cad-panel-sub border border-cad-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingDown size={14} className="text-cad-accent" />
              <span className="text-cad-text font-medium">RDP Simplification</span>
            </div>
            <button
              onClick={() =>
                onUpdateOptimization((o) => ({ ...o, enableRDP: !o.enableRDP }))
              }
              className={`w-9 h-5 rounded-full transition-colors relative ${
                optimization.enableRDP ? 'bg-cad-accent' : 'bg-cad-panel border border-cad-border'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  optimization.enableRDP ? 'left-4.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {optimization.enableRDP && (
            <div className="flex flex-col gap-1 pt-1 border-t border-cad-border/30">
              <div className="flex justify-between text-cad-textMuted font-mono text-[11px]">
                <span>Epsilon Tolerance (ε)</span>
                <span className="text-cad-accent">{optimization.rdpTolerance.toFixed(3)} mm</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.40"
                step="0.01"
                value={optimization.rdpTolerance}
                onChange={(e) =>
                  onUpdateOptimization((o) => ({
                    ...o,
                    rdpTolerance: parseFloat(e.target.value),
                  }))
                }
              />
              <span className="text-[9px] text-cad-textDim">
                Eliminates collinear micro-vertices while maintaining sub-millimeter fidelity.
              </span>
            </div>
          )}
        </div>

        {/* Greedy Path Sorter */}
        <div className="flex flex-col gap-2 p-2.5 rounded-xl cad-panel-sub border border-cad-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Navigation size={14} className="text-cad-success" />
              <span className="text-cad-text font-medium">Nearest-Neighbor Sorter</span>
            </div>
            <button
              onClick={() =>
                onUpdateOptimization((o) => ({
                  ...o,
                  enablePathSorting: !o.enablePathSorting,
                }))
              }
              className={`w-9 h-5 rounded-full transition-colors relative ${
                optimization.enablePathSorting
                  ? 'bg-cad-accent'
                  : 'bg-cad-panel border border-cad-border'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  optimization.enablePathSorting ? 'left-4.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <span className="text-[10px] text-cad-textDim leading-tight">
            Re-indexes disconnected strokes in 2D space to minimize pen-up air transit.
          </span>

          {optimization.enablePathSorting && (
            <div className="flex items-center justify-between pt-1 border-t border-cad-border/30">
              <div className="flex items-center gap-1.5 text-cad-textMuted">
                <ArrowRightLeft size={13} className="text-cad-accent" />
                <span>Bidirectional Path Reversal</span>
              </div>
              <button
                onClick={() =>
                  onUpdateOptimization((o) => ({
                    ...o,
                    enablePathReversal: !o.enablePathReversal,
                  }))
                }
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  optimization.enablePathReversal
                    ? 'bg-cad-accent'
                    : 'bg-cad-panel border border-cad-border'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    optimization.enablePathReversal ? 'left-4.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Filter Micro Paths */}
        <div className="flex flex-col gap-2 p-2.5 rounded-xl cad-panel-sub border border-cad-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Scissors size={14} className="text-cad-warning" />
              <span className="text-cad-text font-medium">Filter Micro Paths</span>
            </div>
            <button
              onClick={() =>
                onUpdateOptimization((o) => ({
                  ...o,
                  removeShortPaths: !o.removeShortPaths,
                }))
              }
              className={`w-9 h-5 rounded-full transition-colors relative ${
                optimization.removeShortPaths
                  ? 'bg-cad-accent'
                  : 'bg-cad-panel border border-cad-border'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  optimization.removeShortPaths ? 'left-4.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {optimization.removeShortPaths && (
            <div className="flex flex-col gap-1 pt-1 border-t border-cad-border/30">
              <div className="flex justify-between text-cad-textMuted font-mono text-[11px]">
                <span>Min Stroke Length</span>
                <span className="text-cad-accent">{optimization.minPathLengthMm.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={optimization.minPathLengthMm}
                onChange={(e) =>
                  onUpdateOptimization((o) => ({
                    ...o,
                    minPathLengthMm: parseFloat(e.target.value),
                  }))
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
