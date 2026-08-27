import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileCode,
  Layers,
  Code,
} from 'lucide-react';
import { Path, MachineSettings, PhysicalDimensions } from '../../types';
import { exportToSVG } from '../../lib/exporters/svgExporter';
import { exportToDXF } from '../../lib/exporters/dxfExporter';
import { exportToGcode } from '../../lib/exporters/gcodeExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  paths: Path[];
  dimensions: PhysicalDimensions;
  machine: MachineSettings;
  imageName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  paths,
  dimensions,
  machine,
  imageName,
}) => {
  const [activeTab, setActiveTab] = useState<'svg' | 'dxf' | 'gcode'>('svg');
  const [copied, setCopied] = useState(false);

  // SVG Export options
  const [svgStrokeWidthMm, setSvgStrokeWidthMm] = useState(0.3);
  const [svgIncludeRapid, setSvgIncludeRapid] = useState(false);

  // DXF Export options
  const [dxfInvertY, setDxfInvertY] = useState(true);
  const [dxfLayerName, setDxfLayerName] = useState('PLOTTER_ART');

  // GCode options
  const [gcodeExtension, setGcodeExtension] = useState<'.gcode' | '.nc'>('.gcode');

  const baseFileName = useMemo(() => {
    return imageName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') || 'plotter-art';
  }, [imageName]);

  // Compute file outputs
  const svgContent = useMemo(() => {
    if (!isOpen || activeTab !== 'svg') return '';
    return exportToSVG(paths, {
      dimensions,
      strokeWidthMm: svgStrokeWidthMm,
      includeRapidTravel: svgIncludeRapid,
    });
  }, [isOpen, activeTab, paths, dimensions, svgStrokeWidthMm, svgIncludeRapid]);

  const dxfContent = useMemo(() => {
    if (!isOpen || activeTab !== 'dxf') return '';
    return exportToDXF(paths, {
      dimensions,
      invertY: dxfInvertY,
      layerName: dxfLayerName,
    });
  }, [isOpen, activeTab, paths, dimensions, dxfInvertY, dxfLayerName]);

  const gcodeContent = useMemo(() => {
    if (!isOpen || activeTab !== 'gcode') return '';
    return exportToGcode(paths, {
      machine,
      dimensions,
    });
  }, [isOpen, activeTab, paths, machine, dimensions]);

  if (!isOpen) return null;

  const currentContent =
    activeTab === 'svg' ? svgContent : activeTab === 'dxf' ? dxfContent : gcodeContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeTab === 'svg' ? '.svg' : activeTab === 'dxf' ? '.dxf' : gcodeExtension;
    const mime =
      activeTab === 'svg'
        ? 'image/svg+xml'
        : activeTab === 'dxf'
        ? 'application/dxf'
        : 'text/plain';

    const blob = new Blob([currentContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseFileName}${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl cad-panel rounded-2xl border border-cad-border flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-cad-border flex items-center justify-between bg-cad-panelSub">
          <div className="flex items-center gap-2.5">
            <Download size={18} className="text-cad-accent" />
            <span className="font-semibold text-cad-text text-sm">
              Export CAM Vector Artwork
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-cad-textDim hover:text-cad-text hover:bg-cad-border transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-cad-border bg-cad-panel">
          <button
            onClick={() => setActiveTab('svg')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'svg'
                ? 'border-cad-accent text-cad-accent bg-cad-accent/5'
                : 'border-transparent text-cad-textMuted hover:text-cad-text'
            }`}
          >
            <FileCode size={16} />
            <span>Plotter SVG</span>
          </button>

          <button
            onClick={() => setActiveTab('dxf')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'dxf'
                ? 'border-cad-accent text-cad-accent bg-cad-accent/5'
                : 'border-transparent text-cad-textMuted hover:text-cad-text'
            }`}
          >
            <Layers size={16} />
            <span>AutoCAD DXF (R12)</span>
          </button>

          <button
            onClick={() => setActiveTab('gcode')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'gcode'
                ? 'border-cad-accent text-cad-accent bg-cad-accent/5'
                : 'border-transparent text-cad-textMuted hover:text-cad-text'
            }`}
          >
            <Code size={16} />
            <span>Standard G-Code</span>
          </button>
        </div>

        {/* Tab Controls & Settings */}
        <div className="p-4 border-b border-cad-border/60 bg-cad-panelSub/40 text-xs">
          {activeTab === 'svg' && (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="text-cad-textMuted font-mono">Stroke Width:</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  max="2.0"
                  value={svgStrokeWidthMm}
                  onChange={(e) => setSvgStrokeWidthMm(parseFloat(e.target.value) || 0.3)}
                  className="cad-input w-20"
                />
                <span className="text-cad-textDim">mm</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-cad-textMuted cursor-pointer flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={svgIncludeRapid}
                    onChange={(e) => setSvgIncludeRapid(e.target.checked)}
                    className="rounded accent-cad-accent"
                  />
                  <span>Include Pen-Up Travel Layer</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'dxf' && (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="text-cad-textMuted font-mono">Layer Name:</span>
                <input
                  type="text"
                  value={dxfLayerName}
                  onChange={(e) => setDxfLayerName(e.target.value)}
                  className="cad-input w-36"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-cad-textMuted cursor-pointer flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={dxfInvertY}
                    onChange={(e) => setDxfInvertY(e.target.checked)}
                    className="rounded accent-cad-accent"
                  />
                  <span>Invert Y-Axis (Standard CAD Cartesian Space)</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'gcode' && (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-cad-textMuted font-mono">File Extension:</span>
                <div className="flex gap-1">
                  {(['.gcode', '.nc'] as const).map((ext) => (
                    <button
                      key={ext}
                      onClick={() => setGcodeExtension(ext)}
                      className={`px-2.5 py-1 rounded font-mono text-xs border ${
                        gcodeExtension === ext
                          ? 'bg-cad-accent/20 border-cad-accent text-cad-accent font-semibold'
                          : 'cad-panel-sub border-cad-border text-cad-textMuted'
                      }`}
                    >
                      {ext}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-cad-textDim font-mono">
                {machine.penLiftMethod === 'servo-z'
                  ? `Servo Z: Up=${machine.penUpZ}mm, Down=${machine.penDownZ}mm`
                  : machine.penLiftMethod === 'spindle-pwm'
                  ? `Laser PWM: M3 S${machine.laserPowerDown}`
                  : 'Custom G-code'}
              </div>
            </div>
          )}
        </div>

        {/* Code Preview Box */}
        <div className="flex-1 p-4 bg-cad-canvasBg overflow-hidden flex flex-col min-h-[260px]">
          <div className="flex items-center justify-between pb-2 text-[11px] font-mono text-cad-textDim">
            <span>
              {activeTab.toUpperCase()} File Output ({currentContent.length.toLocaleString()} bytes,{' '}
              {currentContent.split('\n').length.toLocaleString()} lines)
            </span>
          </div>

          <pre className="flex-1 bg-cad-bg p-3 rounded-lg border border-cad-border font-mono text-xs text-cad-textMuted overflow-auto select-text leading-relaxed">
            <code>{currentContent.slice(0, 15000) + (currentContent.length > 15000 ? '\n... [truncated for preview]' : '')}</code>
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-cad-border flex items-center justify-between bg-cad-panelSub">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-lg cad-panel border border-cad-border hover:border-cad-accent text-cad-text font-semibold flex items-center gap-1.5 transition-colors text-xs"
          >
            {copied ? <Check size={14} className="text-cad-success" /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-cad-textMuted hover:text-cad-text transition-colors text-xs"
            >
              Close
            </button>

            <button
              onClick={handleDownload}
              className="px-5 py-2 rounded-lg bg-cad-accent hover:bg-cad-accentHover text-black font-bold flex items-center gap-2 shadow-glow-accent transition-all text-xs"
            >
              <Download size={15} />
              <span>
                Download {activeTab.toUpperCase()} ({baseFileName}
                {activeTab === 'svg' ? '.svg' : activeTab === 'dxf' ? '.dxf' : gcodeExtension})
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
