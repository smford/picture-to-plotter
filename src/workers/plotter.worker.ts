import { WorkerGenerateRequest, WorkerMessage, Path } from '../types';
import { processImageToLuminance } from '../lib/image/imageProcessor';
import { generateWoodcutPaths } from '../lib/algorithms/woodcut';
import { generateSquigglePaths } from '../lib/algorithms/squiggle';
import { generateCrossHatchPaths } from '../lib/algorithms/crosshatch';
import { generateSpiralPaths } from '../lib/algorithms/spiral';
import { generateStippleTspPaths } from '../lib/algorithms/stippleTsp';
import { generateContourPaths } from '../lib/algorithms/contours';
import { generateFlowFieldPaths } from '../lib/algorithms/flowfield';
import { simplifyToolpathRDP } from '../lib/optimization/rdp';
import { optimizePathOrder } from '../lib/optimization/pathSorter';
import { calculateTelemetryMetrics } from '../lib/optimization/metrics';

// Web Worker message listener
self.onmessage = (event: MessageEvent<WorkerGenerateRequest>) => {
  const data = event.data;

  if (data.type === 'GENERATE') {
    const { id, imageData, filters, algorithm, optimization, dimensions } = data;

    try {
      // 1. Image Preprocessing & Grayscale Luminance Map
      postProgress(id, 'Preprocessing image...', 0.1);
      const { luminanceMap, processedImageData } = processImageToLuminance(imageData, filters);

      // 2. Vector Generation Algorithm
      postProgress(id, `Generating ${algorithm.type} vector toolpaths...`, 0.25);
      let rawPaths: Path[] = [];

      const bounds = {
        widthMm: dimensions.widthMm,
        heightMm: dimensions.heightMm,
        marginMm: dimensions.marginMm,
      };

      switch (algorithm.type) {
        case 'woodcut':
          rawPaths = generateWoodcutPaths(luminanceMap, algorithm.woodcut, bounds);
          break;
        case 'squiggle':
          rawPaths = generateSquigglePaths(luminanceMap, algorithm.squiggle, bounds);
          break;
        case 'crosshatch':
          rawPaths = generateCrossHatchPaths(luminanceMap, algorithm.crosshatch, bounds);
          break;
        case 'spiral':
          rawPaths = generateSpiralPaths(luminanceMap, algorithm.spiral, bounds);
          break;
        case 'stipple-tsp':
          rawPaths = generateStippleTspPaths(
            luminanceMap,
            algorithm.stippleTsp,
            bounds,
            (prog, phase) => postProgress(id, phase, 0.25 + prog * 0.45)
          );
          break;
        case 'contours':
          rawPaths = generateContourPaths(luminanceMap, algorithm.contours, bounds);
          break;
        case 'flowfield':
          rawPaths = generateFlowFieldPaths(luminanceMap, algorithm.flowfield, bounds);
          break;
        default:
          throw new Error(`Unknown algorithm type: ${algorithm.type}`);
      }

      // 3. CAM Optimization (RDP Simplification)
      postProgress(id, 'Simplifying polylines (RDP)...', 0.75);
      let optimizedPaths = rawPaths;
      if (optimization.enableRDP && optimization.rdpTolerance > 0) {
        optimizedPaths = simplifyToolpathRDP(optimizedPaths, optimization.rdpTolerance);
      }

      // 4. CAM Optimization (Path Sorting & Air Transit Optimization)
      postProgress(id, 'Sorting toolpaths to minimize air transit...', 0.85);
      if (optimization.enablePathSorting) {
        optimizedPaths = optimizePathOrder(optimizedPaths, {
          enableSorting: optimization.enablePathSorting,
          enableReversal: optimization.enablePathReversal,
          removeShortPaths: optimization.removeShortPaths,
          minPathLengthMm: optimization.minPathLengthMm,
          startPoint: [0, 0],
        });
      }

      // 5. Calculate Telemetry
      postProgress(id, 'Calculating machine telemetry...', 0.95);
      const defaultMachine = {
        feedrate: 2500,
        rapidFeedrate: 6000,
        penLiftMethod: 'servo-z' as const,
        penUpZ: 3.0,
        penDownZ: 0.0,
        penDownDelayMs: 40,
        laserPowerDown: 1000,
        laserPowerUp: 0,
        customPenDownGcode: '',
        customPenUpGcode: '',
        gcodeOrigin: 'top-left' as const,
        coordinatePrecision: 3,
        preamble: '',
        postamble: '',
      };

      const metrics = calculateTelemetryMetrics(rawPaths, optimizedPaths, defaultMachine);

      // 6. Complete
      postProgress(id, 'Complete', 1.0);
      const successMessage: WorkerMessage = {
        type: 'SUCCESS',
        id,
        rawPaths,
        optimizedPaths,
        metrics,
        preprocessedImageData: processedImageData,
      };

      self.postMessage(successMessage);
    } catch (err: any) {
      const errorMessage: WorkerMessage = {
        type: 'ERROR',
        id,
        error: err?.message || 'Unknown vector generation error',
      };
      self.postMessage(errorMessage);
    }
  }
};

function postProgress(id: string, phase: string, progress: number) {
  const msg: WorkerMessage = {
    type: 'PROGRESS',
    id,
    phase,
    progress: Math.min(1.0, Math.max(0.0, progress)),
  };
  self.postMessage(msg);
}
