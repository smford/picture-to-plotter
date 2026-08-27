import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CadCanvas } from './components/Viewport/CadCanvas';
import { ViewportToolbar } from './components/Viewport/ViewportToolbar';
import { SimulationControls } from './components/Viewport/SimulationControls';
import { MetricsHud } from './components/HUD/MetricsHud';
import { ExportModal } from './components/Modals/ExportModal';
import { HelpModal } from './components/Modals/HelpModal';
import { usePlotterWorker } from './hooks/usePlotterWorker';
import { usePanZoom } from './hooks/usePanZoom';
import { SAMPLE_IMAGES } from './lib/image/sampleImages';
import { DEFAULT_PRESETS } from './lib/presets/defaultPresets';
import {
  AlgorithmConfig,
  ImageFilters,
  MachineSettings,
  OptimizationParams,
  PhysicalDimensions,
  Preset,
  SimulationState,
  ViewportSettings,
} from './types';

export const App: React.FC = () => {
  // 1. Initial State from Holbein Dance of Death (1538) Preset
  const defaultPreset = DEFAULT_PRESETS[0];

  const [filters, setFilters] = useState<ImageFilters>({
    brightness: defaultPreset.filters.brightness ?? 12,
    contrast: defaultPreset.filters.contrast ?? 40,
    gamma: defaultPreset.filters.gamma ?? 1.15,
    invert: defaultPreset.filters.invert ?? false,
    blurRadius: defaultPreset.filters.blurRadius ?? 0.5,
    thresholdEnabled: defaultPreset.filters.thresholdEnabled ?? false,
    thresholdValue: defaultPreset.filters.thresholdValue ?? 128,
    edgeDetection: defaultPreset.filters.edgeDetection ?? true,
    edgeBlend: defaultPreset.filters.edgeBlend ?? 0.45,
  });

  const [algorithm, setAlgorithm] = useState<AlgorithmConfig>(defaultPreset.algorithm);

  const [optimization, setOptimization] = useState<OptimizationParams>({
    enableRDP: defaultPreset.optimization.enableRDP ?? true,
    rdpTolerance: defaultPreset.optimization.rdpTolerance ?? 0.08,
    enablePathSorting: defaultPreset.optimization.enablePathSorting ?? true,
    enablePathReversal: defaultPreset.optimization.enablePathReversal ?? true,
    removeShortPaths: defaultPreset.optimization.removeShortPaths ?? true,
    minPathLengthMm: defaultPreset.optimization.minPathLengthMm ?? 0.4,
  });

  const [dimensions, setDimensions] = useState<PhysicalDimensions>({
    paperSize: 'A4',
    customWidthMm: 210,
    customHeightMm: 297,
    orientation: 'portrait',
    marginMm: 12,
    fitMode: 'contain',
  });

  const [machine, setMachine] = useState<MachineSettings>({
    feedrate: 3000,
    rapidFeedrate: 7000,
    penLiftMethod: 'servo-z',
    penUpZ: 3.5,
    penDownZ: 0.0,
    penDownDelayMs: 40,
    laserPowerDown: 1000,
    laserPowerUp: 0,
    customPenDownGcode: 'G1 Z0.0 F1000',
    customPenUpGcode: 'G0 Z3.5',
    gcodeOrigin: 'top-left',
    coordinatePrecision: 3,
    preamble: '',
    postamble: '',
  });

  const [viewportSettings, setViewportSettings] = useState<ViewportSettings>({
    showOriginalImage: false,
    imageOpacity: 0.35,
    showVectorPaths: true,
    showRapidTravel: true,
    showVertices: false,
    showGrid: true,
    showRulers: true,
    penColor: '#111111',
    penWidthMm: 0.35,
    travelColor: 'rgba(255, 61, 113, 0.65)',
    paperColor: defaultPreset.paperColor || '#f4eedb',
  });

  const [simulationState, setSimulationState] = useState<SimulationState>({
    isPlaying: false,
    progress: 1.0,
    speed: 5,
    currentPathIndex: 0,
    currentVertexIndex: 0,
    currentX: 0,
    currentY: 0,
    isPenDown: false,
  });

  const [currentImageData, setCurrentImageData] = useState<ImageData | null>(null);
  const [imageName, setImageName] = useState<string>('Dance of Death (1538)');

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // 2. Web Worker Hook
  const {
    isGenerating,
    progress: workerProgress,
    phase: workerPhase,
    rawPaths,
    optimizedPaths,
    metrics,
    preprocessedImageData,
    generate,
  } = usePlotterWorker();

  // 3. Viewport Pan & Zoom Hook
  const {
    scale,
    panX,
    panY,
    isPanning,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
    fitToViewport,
    resetZoom,
    zoomIn,
    zoomOut,
  } = usePanZoom();

  // Load initial sample image on mount
  useEffect(() => {
    const defaultSample = SAMPLE_IMAGES[0]; // Dance of Death (1538)
    const imgData = defaultSample.generate();
    setCurrentImageData(imgData);
    setImageName(defaultSample.name);
  }, []);

  // Calculate paper dimensions in mm
  let paperWidthMm = dimensions.paperSize === 'Custom' ? dimensions.customWidthMm : 210;
  let paperHeightMm = dimensions.paperSize === 'Custom' ? dimensions.customHeightMm : 297;

  if (dimensions.paperSize === 'A4') {
    paperWidthMm = dimensions.orientation === 'landscape' ? 297 : 210;
    paperHeightMm = dimensions.orientation === 'landscape' ? 210 : 297;
  } else if (dimensions.paperSize === 'A3') {
    paperWidthMm = dimensions.orientation === 'landscape' ? 420 : 297;
    paperHeightMm = dimensions.orientation === 'landscape' ? 297 : 420;
  } else if (dimensions.paperSize === 'A5') {
    paperWidthMm = dimensions.orientation === 'landscape' ? 210 : 148;
    paperHeightMm = dimensions.orientation === 'landscape' ? 148 : 210;
  } else if (dimensions.paperSize === 'Letter') {
    paperWidthMm = dimensions.orientation === 'landscape' ? 279.4 : 215.9;
    paperHeightMm = dimensions.orientation === 'landscape' ? 215.9 : 279.4;
  } else if (dimensions.paperSize === 'Square') {
    paperWidthMm = 200;
    paperHeightMm = 200;
  }

  // Auto-fit on initial render or resize
  useEffect(() => {
    const handleResize = () => {
      const containerW = window.innerWidth - 384;
      const containerH = window.innerHeight - 56;
      if (containerW > 100 && containerH > 100) {
        fitToViewport(containerW, containerH, paperWidthMm, paperHeightMm);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [paperWidthMm, paperHeightMm, fitToViewport]);

  const debounceTimerRef = useRef<number | null>(null);

  const triggerCompute = useCallback(() => {
    if (!currentImageData) return;
    generate(
      currentImageData,
      filters,
      algorithm,
      optimization,
      {
        widthMm: paperWidthMm,
        heightMm: paperHeightMm,
        marginMm: dimensions.marginMm,
        fitMode: dimensions.fitMode,
      }
    );
  }, [currentImageData, filters, algorithm, optimization, paperWidthMm, paperHeightMm, dimensions.marginMm, dimensions.fitMode, generate]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      triggerCompute();
    }, 150);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [triggerCompute]);

  const handleApplyPreset = (preset: Preset) => {
    if (preset.filters) {
      setFilters((prev) => ({ ...prev, ...preset.filters }));
    }
    if (preset.algorithm) {
      setAlgorithm(preset.algorithm);
    }
    if (preset.optimization) {
      setOptimization((prev) => ({ ...prev, ...preset.optimization }));
    }
    if (preset.paperColor) {
      setViewportSettings((prev) => ({ ...prev, paperColor: preset.paperColor! }));
    }
  };

  const handleFitToScreen = () => {
    const containerW = window.innerWidth - 384;
    const containerH = window.innerHeight - 56;
    fitToViewport(containerW, containerH, paperWidthMm, paperHeightMm);
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-cad-bg text-cad-text overflow-hidden">
      {/* 1. Header */}
      <Header
        onOpenExport={() => setIsExportOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onApplyPreset={handleApplyPreset}
        onRecompute={triggerCompute}
        isGenerating={isGenerating}
      />

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left CAD Control Sidebar */}
        <Sidebar
          filters={filters}
          onUpdateFilters={setFilters}
          algorithm={algorithm}
          onUpdateAlgorithm={setAlgorithm}
          optimization={optimization}
          onUpdateOptimization={setOptimization}
          dimensions={dimensions}
          onUpdateDimensions={setDimensions}
          machine={machine}
          onUpdateMachine={setMachine}
          onImageLoaded={(imgData, name) => {
            setCurrentImageData(imgData);
            setImageName(name);
          }}
          imageName={imageName}
          onApplyPreset={handleApplyPreset}
        />

        {/* Center Viewport */}
        <div className="flex-1 h-full relative overflow-hidden bg-cad-canvasBg">
          {/* Floating Viewport Toolbar */}
          <ViewportToolbar
            settings={viewportSettings}
            onUpdateSettings={setViewportSettings}
            onFitToScreen={handleFitToScreen}
            onResetZoom={resetZoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            scale={scale}
          />

          {/* Interactive CAD Canvas */}
          <CadCanvas
            paths={optimizedPaths}
            rawPaths={rawPaths}
            dimensions={dimensions}
            viewportSettings={viewportSettings}
            preprocessedImage={preprocessedImageData}
            simulationState={simulationState}
            scale={scale}
            panX={panX}
            panY={panY}
            isPanning={isPanning}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onWheel={onWheel}
          />

          {/* Machine Telemetry HUD */}
          <MetricsHud
            metrics={metrics}
            isGenerating={isGenerating}
            progress={workerProgress}
            phase={workerPhase}
          />

          {/* Plot Simulation Scrub & Playback Bar */}
          <SimulationControls
            simulationState={simulationState}
            setSimulationState={setSimulationState}
            paths={optimizedPaths}
            totalDrawingDistanceMm={metrics?.drawDistanceMm || 0}
          />
        </div>
      </main>

      {/* 3. Export Dialog Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        paths={optimizedPaths}
        dimensions={dimensions}
        machine={machine}
        imageName={imageName}
      />

      {/* 4. Help Documentation Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};
