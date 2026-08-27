import React from 'react';
import {
  X,
  HelpCircle,
  Cpu,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl cad-panel rounded-2xl border border-cad-border flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-cad-border flex items-center justify-between bg-cad-panelSub">
          <div className="flex items-center gap-2.5">
            <HelpCircle size={18} className="text-cad-accent" />
            <span className="font-semibold text-cad-text text-sm">
              VectorPlotter CAM Documentation & Guide
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-cad-textDim hover:text-cad-text hover:bg-cad-border transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5 text-xs text-cad-text leading-relaxed">
          {/* Section 1 */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-cad-accent flex items-center gap-2">
              <Sparkles size={16} />
              <span>1. Plotter Generation Algorithms</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg cad-panel-sub border border-cad-border/50">
                <span className="font-bold text-cad-text">Squiggle / Waves:</span>
                <p className="text-cad-textMuted mt-1">
                  Generates parallel scanlines where amplitude and frequency oscillate dynamically based on pixel darkness. Darker regions produce tight, high-amplitude waves.
                </p>
              </div>
              <div className="p-3 rounded-lg cad-panel-sub border border-cad-border/50">
                <span className="font-bold text-cad-text">Cross-Hatching:</span>
                <p className="text-cad-textMuted mt-1">
                  Multi-pass strokes at angles (45°, 135°, 0°, 90°) with layered darkness thresholds, recreating vintage copperplate and technical hatching.
                </p>
              </div>
              <div className="p-3 rounded-lg cad-panel-sub border border-cad-border/50">
                <span className="font-bold text-cad-text">Archimedean Spiral:</span>
                <p className="text-cad-textMuted mt-1">
                  A single unbroken continuous spiral arm from center to perimeter (zero pen lifts!) with radial wave modulation.
                </p>
              </div>
              <div className="p-3 rounded-lg cad-panel-sub border border-cad-border/50">
                <span className="font-bold text-cad-text">Stipple & 2-Opt TSP:</span>
                <p className="text-cad-textMuted mt-1">
                  Distributes points via error diffusion or rejection sampling, then computes an optimal non-intersecting TSP tour connecting all stipple dots into 1 stroke.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="flex flex-col gap-2 pt-2 border-t border-cad-border/60">
            <h3 className="text-sm font-semibold text-cad-success flex items-center gap-2">
              <TrendingDown size={16} />
              <span>2. CAM Optimization Engine</span>
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-cad-textMuted pl-1">
              <li>
                <strong className="text-cad-text">RDP Polyline Simplification:</strong> Compresses dense vector curves into optimal sub-millimeter segments within tolerance ε = 0.05 - 0.2 mm, reducing G-code file sizes by up to 80% without detail loss.
              </li>
              <li>
                <strong className="text-cad-text">Greedy Nearest-Neighbor Sorter:</strong> Re-indexes paths to minimize pen-up air transit distance and reverses stroke directions when entering from the opposite vertex is closer.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="flex flex-col gap-2 pt-2 border-t border-cad-border/60">
            <h3 className="text-sm font-semibold text-cad-warning flex items-center gap-2">
              <Cpu size={16} />
              <span>3. Machine & Hardware Compatibility</span>
            </h3>
            <p className="text-cad-textMuted">
              Exports are 100% compliant with standard CAM machines:
            </p>
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="p-2 rounded bg-cad-panelSub border border-cad-border text-center">
                <strong className="text-cad-accent block">AxiDraw / iDraw</strong>
                <span className="text-cad-textDim">SVG / G-Code</span>
              </div>
              <div className="p-2 rounded bg-cad-panelSub border border-cad-border text-center">
                <strong className="text-cad-accent block">GRBL / Laser</strong>
                <span className="text-cad-textDim">M3/M5 PWM G-code</span>
              </div>
              <div className="p-2 rounded bg-cad-panelSub border border-cad-border text-center">
                <strong className="text-cad-accent block">CNC / 3D Printers</strong>
                <span className="text-cad-textDim">Standard G0/G1 Z-axis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-cad-border flex justify-end bg-cad-panelSub">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cad-accent text-black font-semibold text-xs hover:bg-cad-accentHover transition-colors"
          >
            Got it, Let's Plot!
          </button>
        </div>
      </div>
    </div>
  );
};
