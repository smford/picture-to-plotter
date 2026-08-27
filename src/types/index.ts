export type Point = [number, number]; // [x, y] in physical mm
export type Path = Point[];           // polyline of points
export type Toolpath = Path[];        // list of polylines

export interface ImageFilters {
  brightness: number;       // -100 to 100
  contrast: number;         // -100 to 100
  gamma: number;            // 0.1 to 3.0 (exposure)
  invert: boolean;          // invert luminance
  blurRadius: number;       // 0 to 20 px
  thresholdEnabled: boolean;// whether hard binarization is on
  thresholdValue: number;   // 0 to 255
  edgeDetection: boolean;   // Sobel edge filter
  edgeBlend: number;        // 0 to 1 (blend with grayscale)
}

export type AlgorithmType =
  | 'woodcut'
  | 'squiggle'
  | 'crosshatch'
  | 'spiral'
  | 'stipple-tsp'
  | 'contours'
  | 'flowfield';

export interface WoodcutParams {
  hatchSpacing: number;     // mm between hatch strokes (e.g. 0.8 to 4.0)
  edgeStrength: number;     // contour carving prominence (0.0 to 1.0)
  crossHatchShadows: boolean;// cross-hatch deep shadow regions
  gougeTexture: boolean;    // woodblock chisel flecks in midtones
  handCarvedBorder: boolean;// authentic 16th-century rough woodblock border
  hatchAngle: number;       // primary hatch angle in degrees (e.g. 45 or dynamic)
  contrastBoost: number;    // woodcut tonal flattening (1.0 to 3.0)
  minStrokeLengthMm: number;// minimum stroke length in mm
}

export interface SquiggleParams {
  lineSpacing: number;      // mm between scanlines (e.g. 1.0 to 10.0)
  maxAmplitude: number;     // max wave height in mm (e.g. 0.5 to 8.0)
  minFrequency: number;     // min waves per mm (e.g. 0.05 to 1.0)
  maxFrequency: number;     // max waves per mm (e.g. 0.5 to 4.0)
  angle: number;            // scanline angle in degrees (0 = horizontal, 90 = vertical)
  waveType: 'sine' | 'triangle' | 'square' | 'noise';
  serpentine: boolean;      // connect scanlines alternately to avoid pen-ups
  phaseShift: number;       // 0 to 360 deg
}

export interface CrossHatchParams {
  lineSpacing: number;      // mm between strokes in a layer (e.g. 0.8 to 6.0)
  angles: number[];         // angles for layers (e.g. [45, 135, 0, 90])
  thresholds: number[];     // darkness threshold for each layer (0-255)
  numLayers: number;        // 1 to 4
  serpentine: boolean;      // continuous zig-zag
  wobble: number;           // organic hand-drawn wobble amount (0 to 1)
  segmentLength: number;    // sample segment step in mm
}

export interface SpiralParams {
  ringSpacing: number;      // mm between spiral turns (e.g. 0.5 to 5.0)
  maxWaveAmplitude: number; // max wave oscillation height (e.g. 0 to 4.0 mm)
  angularResolution: number;// points per complete 360 deg turn (e.g. 100 to 500)
  direction: 'inward' | 'outward';
  centerX: number;          // normalized offset -0.5 to 0.5
  centerY: number;          // normalized offset -0.5 to 0.5
  frequencyModulation: number; // frequency multiplier in dark areas
}

export interface StippleTSPParams {
  pointCount: number;       // 500 to 10000 points
  samplingMode: 'rejection' | 'lloyd-voronoi' | 'error-diffusion';
  tspIterations: number;    // 2-opt passes (e.g. 1 to 20)
  connectMode: 'tsp-tour' | 'dots' | 'circles';
  dotRadius: number;        // if circles mode, radius in mm
  invertedDensity: boolean; // stipple dark or light
}

export interface ContourParams {
  levels: number;           // number of iso-luminance contour levels (3 to 30)
  minLuminance: number;     // 0 to 255
  maxLuminance: number;     // 0 to 255
  smoothing: number;        // Chaikin smoothing iterations (0 to 4)
}

export interface FlowFieldParams {
  streamSpacing: number;    // mm between seed streamlines
  stepLength: number;       // step size in mm
  maxSteps: number;         // length of streamlines
  noiseScale: number;       // scale of vector field
  directionMode: 'gradient' | 'luminance' | 'curl';
}

export interface AlgorithmConfig {
  type: AlgorithmType;
  woodcut: WoodcutParams;
  squiggle: SquiggleParams;
  crosshatch: CrossHatchParams;
  spiral: SpiralParams;
  stippleTsp: StippleTSPParams;
  contours: ContourParams;
  flowfield: FlowFieldParams;
}

export interface OptimizationParams {
  enableRDP: boolean;
  rdpTolerance: number;     // epsilon in mm (0.01 to 1.0)
  enablePathSorting: boolean; // greedy nearest-neighbor sorter
  enablePathReversal: boolean;// reverse subpaths if closer
  removeShortPaths: boolean;
  minPathLengthMm: number;
}

export type PaperSize = 'A4' | 'A3' | 'A5' | 'Letter' | 'Square' | 'Custom';
export type Orientation = 'portrait' | 'landscape';
export type FitMode = 'contain' | 'cover' | 'stretch';

export interface PhysicalDimensions {
  paperSize: PaperSize;
  customWidthMm: number;
  customHeightMm: number;
  orientation: Orientation;
  marginMm: number;
  fitMode: FitMode;
}

export type PenLiftMethod = 'servo-z' | 'spindle-pwm' | 'custom';
export type GcodeOrigin = 'top-left' | 'bottom-left' | 'center';

export interface MachineSettings {
  feedrate: number;          // mm/min for G1 drawing (e.g. 2500)
  rapidFeedrate: number;     // mm/min for G0 travel (e.g. 6000)
  penLiftMethod: PenLiftMethod;
  penUpZ: number;            // mm (e.g. 3.0)
  penDownZ: number;          // mm (e.g. 0.0)
  penDownDelayMs: number;    // dwell delay after pen down
  laserPowerDown: number;    // PWM S-value for M3 (e.g. 1000)
  laserPowerUp: number;      // PWM S-value for M5 / G0 (e.g. 0)
  customPenDownGcode: string;
  customPenUpGcode: string;
  gcodeOrigin: GcodeOrigin;
  coordinatePrecision: number;// decimals (e.g. 2 or 3)
  preamble: string;
  postamble: string;
}

export interface TelemetryMetrics {
  totalPaths: number;            // number of pen-downs
  drawDistanceMm: number;        // total drawing distance in mm
  airDistanceMm: number;         // rapid pen-up transit distance in mm
  totalDistanceMm: number;       // draw + air distance
  rawVertexCount: number;        // before RDP
  optimizedVertexCount: number;  // after RDP
  reductionPercent: number;      // % reduction from RDP
  estimatedTimeSec: number;      // calculated total execution time
  efficiencyPercent: number;     // (draw time / total time) * 100
}

export interface ViewportSettings {
  showOriginalImage: boolean;
  imageOpacity: number;          // 0 to 1
  showVectorPaths: boolean;
  showRapidTravel: boolean;
  showVertices: boolean;
  showGrid: boolean;
  showRulers: boolean;
  penColor: string;
  penWidthMm: number;
  travelColor: string;
  paperColor: string;
}

export interface SimulationState {
  isPlaying: boolean;
  progress: number;              // 0 to 1 (overall progress)
  speed: number;                 // 1x, 2x, 5x, 10x, 50x
  currentPathIndex: number;
  currentVertexIndex: number;
  currentX: number;
  currentY: number;
  isPenDown: boolean;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  category: 'plotter' | 'laser' | 'artistic' | 'minimalist' | 'renaissance';
  filters: Partial<ImageFilters>;
  algorithm: AlgorithmConfig;
  optimization: Partial<OptimizationParams>;
  machine?: Partial<MachineSettings>;
  paperColor?: string;
}

export interface WorkerGenerateRequest {
  type: 'GENERATE';
  id: string;
  imageData: ImageData;
  filters: ImageFilters;
  algorithm: AlgorithmConfig;
  optimization: OptimizationParams;
  dimensions: {
    widthMm: number;
    heightMm: number;
    marginMm: number;
    fitMode: FitMode;
  };
}

export interface WorkerProgressMessage {
  type: 'PROGRESS';
  id: string;
  phase: string;
  progress: number;
}

export interface WorkerSuccessMessage {
  type: 'SUCCESS';
  id: string;
  rawPaths: Toolpath;
  optimizedPaths: Toolpath;
  metrics: TelemetryMetrics;
  preprocessedImageData?: ImageData;
}

export interface WorkerErrorMessage {
  type: 'ERROR';
  id: string;
  error: string;
}

export type WorkerMessage =
  | WorkerProgressMessage
  | WorkerSuccessMessage
  | WorkerErrorMessage;
