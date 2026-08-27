import React from 'react';
import {
  Activity,
  Hash,
  Disc,
  CircleDot,
  Layers,
  Wind,
} from 'lucide-react';
import { AlgorithmConfig, AlgorithmType } from '../../types';

interface AlgorithmPanelProps {
  algorithm: AlgorithmConfig;
  onUpdateAlgorithm: (updater: (prev: AlgorithmConfig) => AlgorithmConfig) => void;
}

export const AlgorithmPanel: React.FC<AlgorithmPanelProps> = ({
  algorithm,
  onUpdateAlgorithm,
}) => {
  const algorithms: { id: AlgorithmType; name: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'squiggle',
      name: 'Squiggle / Waves',
      icon: <Activity size={16} />,
      desc: 'Scanline frequency/amplitude modulation',
    },
    {
      id: 'crosshatch',
      name: 'Cross-Hatching',
      icon: <Hash size={16} />,
      desc: 'Multi-layer multi-angle tone passes',
    },
    {
      id: 'spiral',
      name: 'Continuous Spiral',
      icon: <Disc size={16} />,
      desc: 'Archimedean spiral with 0 pen lifts',
    },
    {
      id: 'stipple-tsp',
      name: 'Stipple & TSP',
      icon: <CircleDot size={16} />,
      desc: '2-Opt Travelling Salesperson tour',
    },
    {
      id: 'contours',
      name: 'Contours (Iso)',
      icon: <Layers size={16} />,
      desc: 'Marching squares elevation curves',
    },
    {
      id: 'flowfield',
      name: 'Flow Field',
      icon: <Wind size={16} />,
      desc: 'Luminance & gradient streamlines',
    },
  ];

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Algorithm Selector Grid */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-cad-textMuted uppercase tracking-wider">
          Generation Algorithm
        </label>
        <div className="grid grid-cols-2 gap-2">
          {algorithms.map((algo) => {
            const isSelected = algorithm.type === algo.id;
            return (
              <button
                key={algo.id}
                onClick={() =>
                  onUpdateAlgorithm((prev) => ({ ...prev, type: algo.id }))
                }
                className={`p-2.5 rounded-xl text-left flex flex-col gap-1 border transition-all ${
                  isSelected
                    ? 'bg-cad-accent/15 border-cad-accent text-cad-accent shadow-glow-accent'
                    : 'cad-panel-sub border-cad-border hover:border-cad-borderLight text-cad-text'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={isSelected ? 'text-cad-accent' : 'text-cad-textMuted'}>
                    {algo.icon}
                  </span>
                  <span className="font-semibold text-xs">{algo.name}</span>
                </div>
                <span className="text-[10px] text-cad-textDim line-clamp-1 leading-tight">
                  {algo.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Algorithm Parameters */}
      <div className="flex flex-col gap-3 pt-2 border-t border-cad-border/60">
        <label className="text-[11px] font-semibold text-cad-textMuted uppercase tracking-wider">
          {algorithm.type.toUpperCase()} PARAMETERS
        </label>

        {/* 1. SQUIGGLE PARAMS */}
        {algorithm.type === 'squiggle' && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-cad-textMuted font-mono">
                <span>Line Spacing</span>
                <span className="text-cad-accent">{algorithm.squiggle.lineSpacing.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="8.0"
                step="0.2"
                value={algorithm.squiggle.lineSpacing}
                onChange={(e) =>
                  onUpdateAlgorithm((prev) => ({
                    ...prev,
                    squiggle: { ...prev.squiggle, lineSpacing: parseFloat(e.target.value) },
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-cad-textMuted font-mono">
                <span>Max Wave Amplitude</span>
                <span className="text-cad-accent">{algorithm.squiggle.maxAmplitude.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="8.0"
                step="0.2"
                value={algorithm.squiggle.maxAmplitude}
                onChange={(e) =>
                  onUpdateAlgorithm((prev) => ({
                    ...prev,
                    squiggle: { ...prev.squiggle, maxAmplitude: parseFloat(e.target.value) },
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-cad-textMuted font-mono">
                <span>Max Frequency</span>
                <span className="text-cad-accent">{algorithm.squiggle.maxFrequency.toFixed(1)} w/mm</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="4.0"
                step="0.1"
                value={algorithm.squiggle.maxFrequency}
                onChange={(e) =>
                  onUpdateAlgorithm((prev) => ({
                    ...prev,
                    squiggle: { ...prev.squiggle, maxFrequency: parseFloat(e.target.value) },
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-cad-textMuted font-mono">
                <span>Scanline Angle</span>
                <span className="text-cad-accent">{algorithm.squiggle.angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="5"
                value={algorithm.squiggle.angle}
                onChange={(e) =>
                  onUpdateAlgorithm((prev) => ({
                    ...prev,
                    squiggle: { ...prev.squiggle, angle: parseInt(e.target.value) },
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-cad-textMuted">Waveform Geometry</span>
              <div className="grid grid-cols-4 gap-1">
                {(['sine', 'triangle', 'square', 'noise'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      onUpdateAlgorithm((prev) => ({
                        ...prev,
                        squiggle: { ...prev.squiggle, waveType: type },
                      }))
                    }
                    className={`py-1 rounded text-center capitalize font-mono text-[11px] border transition-all ${
                      algorithm.squiggle.waveType === type
                        ? 'bg-cad-accent/20 border-cad-accent text-cad-accent font-semibold'
                        : 'cad-panel-sub border-cad-border text-cad-textMuted'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="flex flex-col">
                <span className="text-cad-text font-medium">Serpentine Snake</span>
                <span className="text-[10px] text-cad-textDim">Connects lines to reduce pen lifts</span>
              </div>
              <button
                onClick={() =>
                  onUpdateAlgorithm((prev) => ({
                    ...prev,
                    squiggle: { ...prev.squiggle, serpentine: !prev.squiggle.serpentine },
                  }))
                }
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  algorithm.squiggle.serpentine
                    ? 'bg-cad-accent'
                    : 'bg-cad-panelSub border border-cad-border'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    algorithm.squiggle.serpentine ? 'left-4.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* 2. CROSSHATCH PARAMS */}
        {algorithm.type === 'crosshatch' && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-cad-textMuted font-mono">
                <span>Hatch Spacing</span>
                <span className="text-cad-accent">{algorithm.crosshatch.lineSpacing.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="6.0"
                step="0.2"
                value={algorithm.crosshatch.lineSpacing}
                onChange={(e) =>
                  onUpdateAlgorithm((prev) => ({
                    ...prev,
                    crosshatch: { ...prev.crosshatch, lineSpacing: parseFloat(e.target.value) },
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-cad-textMuted font-mono">
                <span>Number of Passes</span>
                <span className="text-cad-accent">{algorithm.crosshatch.numLayers} Layers</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                value={algorithm.crosshatch.numLayers}
                onChange={(e) =>
                  onUpdateAlgorithm((prev) => ({
                    ...prev,
                    crosshatch: { ...prev.crosshatch, numLayers: parseInt(e.target.value) },
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-cad-textMuted font-mono">
                <span>Organic Wobble</span>
                <span className="text-cad-accent">{(algorithm.crosshatch.wobble * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={algorithm.crosshatch.wobble}
                onChange={(e) =>
                  onUpdateAlgorithm((prev) => ({
                    ...prev,
                    crosshatch: { ...prev.crosshatch, wobble: parseFloat(e.target.value) },
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-cad-text font-medium">Serpentine Routing</span>
              <button
                onClick={() =>
                  onUpdateAlgorithm((prev) => ({
                    ...prev,
                    crosshatch: { ...prev.crosshatch, serpentine: !prev.crosshatch.serpentine },
                  }))
                }
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  algorithm.crosshatch.serpentine
                    ? 'bg-cad-accent'
                    : 'bg-cad-panelSub border border-cad-border'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    algorithm.crosshatch.serpentine ? 'left-4.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* 3. SPIRAL PARAMS */}
        {algorithm.type === 'spiral' && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-cad-textMuted font-mono">
                <span>Ring Spacing</span>
                <span className="text-cad-accent">{algorithm.spiral.ringSpacing.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={algorithm.spiral.ringSpacing}
                onChange={(e) =>
                  onUpdateAlgorithm((prev) => ({
                    ...prev,
                    spiral: { ...prev.spiral, ringSpacing: parseFloat(e.target.value) },
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-cad-textMuted font-mono">
                <span>Max Oscillation</span>
                <span className="text-cad-accent">{algorithm.spiral.maxWaveAmplitude.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="4.0"
                step="0.1"
                value={algorithm.spiral.maxWaveAmplitude}
                onChange={(e) =>
                  onUpdateAlgorithm((prev) => ({
                    ...prev,
                    spiral: { ...prev.spiral, maxWaveAmplitude: parseFloat(e.target.value) },
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-cad-textMuted font-mono">
                <span>Angular Resolution</span>
                <span className="text-cad-accent">{algorithm.spiral.angularResolution} pts/rev</span>
              </div>
              <input
                type="range"
                min="60"
                max="360"
                step="20"
                value={algorithm.spiral.angularResolution}
                onChange={(e) =>
                  onUpdateAlgorithm((prev) => ({
                    ...prev,
                    spiral: { ...prev.spiral, angularResolution: parseInt(e.target.value) },
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-cad-textMuted font-mono">
                <span>Center Offset X</span>
                <span className="text-cad-accent">{algorithm.spiral.centerX.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-0.5"
                max="0.5"
                step="0.05"
                value={algorithm.spiral.centerX}
                onChange={(e) =>
                  onUpdateAlgorithm((prev) => ({
                    ...prev,
                    spiral: { ...prev.spiral, centerX: parseFloat(e.target.value) },
                  }))
                }
              />
            </div>
          </div>
        )}

        {/* 4. STIPPLE & TSP PARAMS */}
        {algorithm.type === 'stipple-tsp' && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-cad-textMuted font-mono">
                <span>Point Count</span>
                <span className="text-cad-accent">{algorithm.stippleTsp.pointCount.toLocaleString()} pts</span>
              </div>
              <input
                type="range"
                min="400"
                max="6000"
                step="200"
                value={algorithm.stippleTsp.pointCount}
                onChange={(e) =>
                  onUpdateAlgorithm((prev) => ({
                    ...prev,
                    stippleTsp: { ...prev.stippleTsp, pointCount: parseInt(e.target.value) },
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-cad-textMuted font-mono">
                <span>2-Opt TSP Passes</span>
                <span className="text-cad-accent">{algorithm.stippleTsp.tspIterations} iterations</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={algorithm.stippleTsp.tspIterations}
                onChange={(e) =>
                  onUpdateAlgorithm((prev) => ({
                    ...prev,
                    stippleTsp: { ...prev.stippleTsp, tspIterations: parseInt(e.target.value) },
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-cad-textMuted">Stipple Distribution</span>
              <div className="grid grid-cols-3 gap-1">
                {(['error-diffusion', 'rejection', 'lloyd-voronoi'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() =>
                      onUpdateAlgorithm((prev) => ({
                        ...prev,
                        stippleTsp: { ...prev.stippleTsp, samplingMode: mode },
                      }))
                    }
                    className={`py-1 px-1 rounded text-center font-mono text-[10px] truncate border transition-all ${
                      algorithm.stippleTsp.samplingMode === mode
                        ? 'bg-cad-accent/20 border-cad-accent text-cad-accent font-semibold'
                        : 'cad-panel-sub border-cad-border text-cad-textMuted'
                    }`}
                  >
                    {mode === 'error-diffusion' ? 'Diffusion' : mode === 'rejection' ? 'Rejection' : 'Lloyd'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-cad-textMuted">Output Stroke Mode</span>
              <div className="grid grid-cols-3 gap-1">
                {(['tsp-tour', 'dots', 'circles'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() =>
                      onUpdateAlgorithm((prev) => ({
                        ...prev,
                        stippleTsp: { ...prev.stippleTsp, connectMode: mode },
                      }))
                    }
                    className={`py-1 px-1 rounded text-center font-mono text-[10px] truncate border transition-all ${
                      algorithm.stippleTsp.connectMode === mode
                        ? 'bg-cad-accent/20 border-cad-accent text-cad-accent font-semibold'
                        : 'cad-panel-sub border-cad-border text-cad-textMuted'
                    }`}
                  >
                    {mode === 'tsp-tour' ? 'TSP Tour' : mode === 'dots' ? 'Stipple Dots' : 'Circles'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. CONTOURS PARAMS */}
        {algorithm.type === 'contours' && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-cad-textMuted font-mono">
                <span>Elevation Levels</span>
                <span className="text-cad-accent">{algorithm.contours.levels} Levels</span>
              </div>
              <input
                type="range"
                min="4"
                max="30"
                value={algorithm.contours.levels}
                onChange={(e) =>
                  onUpdateAlgorithm((prev) => ({
                    ...prev,
                    contours: { ...prev.contours, levels: parseInt(e.target.value) },
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-cad-textMuted font-mono">
                <span>Chaikin Curve Smoothing</span>
                <span className="text-cad-accent">{algorithm.contours.smoothing} Passes</span>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                value={algorithm.contours.smoothing}
                onChange={(e) =>
                  onUpdateAlgorithm((prev) => ({
                    ...prev,
                    contours: { ...prev.contours, smoothing: parseInt(e.target.value) },
                  }))
                }
              />
            </div>
          </div>
        )}

        {/* 6. FLOWFIELD PARAMS */}
        {algorithm.type === 'flowfield' && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-cad-textMuted font-mono">
                <span>Streamline Spacing</span>
                <span className="text-cad-accent">{algorithm.flowfield.streamSpacing.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="4.0"
                step="0.2"
                value={algorithm.flowfield.streamSpacing}
                onChange={(e) =>
                  onUpdateAlgorithm((prev) => ({
                    ...prev,
                    flowfield: { ...prev.flowfield, streamSpacing: parseFloat(e.target.value) },
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-cad-textMuted font-mono">
                <span>Max Stream Length</span>
                <span className="text-cad-accent">{algorithm.flowfield.maxSteps} steps</span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={algorithm.flowfield.maxSteps}
                onChange={(e) =>
                  onUpdateAlgorithm((prev) => ({
                    ...prev,
                    flowfield: { ...prev.flowfield, maxSteps: parseInt(e.target.value) },
                  }))
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
