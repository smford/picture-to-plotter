import React from 'react';
import {
  PenTool,
  Download,
  HelpCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Preset } from '../types';
import { DEFAULT_PRESETS } from '../lib/presets/defaultPresets';

interface HeaderProps {
  onOpenExport: () => void;
  onOpenHelp: () => void;
  onApplyPreset: (preset: Preset) => void;
  onRecompute: () => void;
  isGenerating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExport,
  onOpenHelp,
  onApplyPreset,
  onRecompute,
  isGenerating,
}) => {
  return (
    <header className="h-14 cad-panel border-b border-cad-border px-4 flex items-center justify-between z-30 select-none">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-cad-accent/15 border border-cad-accent flex items-center justify-center text-cad-accent shadow-glow-accent">
          <PenTool size={18} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide text-cad-text font-mono">
              VectorPlotter <span className="text-cad-accent font-sans text-xs uppercase px-1.5 py-0.5 rounded bg-cad-accent/10 border border-cad-accent/30">CAM</span>
            </span>
          </div>
          <span className="text-[10px] text-cad-textDim font-sans">
            Raster Photo to Machine-Optimized Vector Art
          </span>
        </div>
      </div>

      {/* Center: Preset Selector */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cad-panel-sub border border-cad-border">
          <Sparkles size={14} className="text-cad-accent" />
          <span className="text-xs text-cad-textMuted">Preset:</span>
          <select
            onChange={(e) => {
              const p = DEFAULT_PRESETS.find((pr) => pr.id === e.target.value);
              if (p) onApplyPreset(p);
            }}
            className="bg-transparent text-xs font-semibold text-cad-text outline-none cursor-pointer pr-2"
          >
            {DEFAULT_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id} className="bg-cad-panel text-cad-text">
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onRecompute}
          disabled={isGenerating}
          title="Recompute Vector Paths"
          className="p-2 rounded-lg cad-panel-sub border border-cad-border hover:border-cad-accent text-cad-text hover:text-cad-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw size={15} className={isGenerating ? 'animate-spin text-cad-accent' : ''} />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenHelp}
          title="Guide & Machine Setup"
          className="p-2 rounded-lg cad-panel-sub border border-cad-border hover:border-cad-accent text-cad-textMuted hover:text-cad-text transition-colors"
        >
          <HelpCircle size={17} />
        </button>

        <button
          onClick={onOpenExport}
          className="px-4 py-2 rounded-lg bg-cad-accent hover:bg-cad-accentHover text-black font-bold text-xs flex items-center gap-2 shadow-glow-accent transition-all"
        >
          <Download size={15} />
          <span>Export CAM (SVG / DXF / G-Code)</span>
        </button>
      </div>
    </header>
  );
};
