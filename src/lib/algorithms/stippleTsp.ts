import { Path, Point, StippleTSPParams } from '../../types';
import { LuminanceMap } from '../image/imageProcessor';

/**
 * Generate Stippling points and solve 2-Opt Travelling Salesperson Problem (TSP) tour
 */
export function generateStippleTspPaths(
  luminanceMap: LuminanceMap,
  params: StippleTSPParams,
  bounds: { widthMm: number; heightMm: number; marginMm: number },
  onProgress?: (progress: number, phase: string) => void
): Path[] {
  const { widthMm, heightMm, marginMm } = bounds;
  const drawWidth = widthMm - 2 * marginMm;
  const drawHeight = heightMm - 2 * marginMm;

  if (drawWidth <= 0 || drawHeight <= 0) return [];

  const targetCount = Math.max(100, Math.min(10000, params.pointCount));

  // 1. Generate Stipple Points
  onProgress?.(0.1, 'Generating stipple points...');
  let points: Point[] = [];

  if (params.samplingMode === 'error-diffusion') {
    points = sampleErrorDiffusion(luminanceMap, targetCount, drawWidth, drawHeight, marginMm);
  } else if (params.samplingMode === 'lloyd-voronoi') {
    points = sampleLloydRelaxation(luminanceMap, targetCount, drawWidth, drawHeight, marginMm);
  } else {
    points = sampleRejection(luminanceMap, targetCount, drawWidth, drawHeight, marginMm);
  }

  if (points.length < 2) return [];

  // If user selected individual dots or circles mode
  if (params.connectMode === 'dots') {
    return points.map(pt => [
      [pt[0], pt[1]],
      [pt[0] + 0.05, pt[1] + 0.05]
    ]);
  } else if (params.connectMode === 'circles') {
    const r = Math.max(0.1, params.dotRadius || 0.4);
    const circleSegments = 8;
    return points.map(pt => {
      const circle: Path = [];
      for (let s = 0; s <= circleSegments; s++) {
        const a = (s / circleSegments) * Math.PI * 2;
        circle.push([pt[0] + Math.cos(a) * r, pt[1] + Math.sin(a) * r]);
      }
      return circle;
    });
  }

  // 2. Continuous TSP Tour
  onProgress?.(0.3, 'Initializing nearest-neighbor tour...');
  const initialTour = solveNearestNeighbor(points);

  // 3. 2-Opt TSP Optimization
  const maxIterations = Math.max(1, Math.min(30, params.tspIterations));
  const optimizedTour = solve2Opt(initialTour, maxIterations, onProgress);

  return [optimizedTour];
}

/**
 * Rejection sampling based on luminance
 */
function sampleRejection(
  luminanceMap: LuminanceMap,
  targetCount: number,
  drawW: number,
  drawH: number,
  marginMm: number
): Point[] {
  const points: Point[] = [];
  const maxAttempts = targetCount * 40;
  let attempts = 0;

  while (points.length < targetCount && attempts < maxAttempts) {
    attempts++;
    const u = Math.random();
    const v = Math.random();
    const darkness = luminanceMap.sampleDarkness(u, v);

    if (Math.random() < Math.pow(darkness, 1.4)) {
      points.push([
        marginMm + u * drawW,
        marginMm + v * drawH,
      ]);
    }
  }

  return points;
}

/**
 * Floyd-Steinberg error diffusion stippling
 */
function sampleErrorDiffusion(
  luminanceMap: LuminanceMap,
  targetCount: number,
  drawW: number,
  drawH: number,
  marginMm: number
): Point[] {
  const w = luminanceMap.width;
  const h = luminanceMap.height;
  const buffer = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      buffer[y * w + x] = 1.0 - luminanceMap.get(x, y);
    }
  }

  const rawPoints: Point[] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const oldVal = buffer[idx];
      const newVal = oldVal > 0.5 ? 1.0 : 0.0;
      const error = oldVal - newVal;

      if (newVal === 1.0) {
        const u = x / (w - 1);
        const v = y / (h - 1);
        rawPoints.push([marginMm + u * drawW, marginMm + v * drawH]);
      }

      if (x + 1 < w) buffer[idx + 1] += error * (7 / 16);
      if (x - 1 >= 0 && y + 1 < h) buffer[(y + 1) * w + (x - 1)] += error * (3 / 16);
      if (y + 1 < h) buffer[(y + 1) * w + x] += error * (5 / 16);
      if (x + 1 < w && y + 1 < h) buffer[(y + 1) * w + (x + 1)] += error * (1 / 16);
    }
  }

  if (rawPoints.length <= targetCount) return rawPoints;

  const step = rawPoints.length / targetCount;
  const result: Point[] = [];
  for (let i = 0; i < targetCount; i++) {
    result.push(rawPoints[Math.floor(i * step)]);
  }
  return result;
}

/**
 * Lloyd's Voronoi relaxation approximation
 */
function sampleLloydRelaxation(
  luminanceMap: LuminanceMap,
  targetCount: number,
  drawW: number,
  drawH: number,
  marginMm: number
): Point[] {
  let points = sampleRejection(luminanceMap, targetCount, drawW, drawH, marginMm);

  const iterations = 3;
  const sampleRadius = Math.sqrt((drawW * drawH) / targetCount) * 1.5;

  for (let iter = 0; iter < iterations; iter++) {
    const nextPoints: Point[] = [];
    for (let i = 0; i < points.length; i++) {
      const [px, py] = points[i];
      let sumX = 0;
      let sumY = 0;
      let sumWeight = 0;

      const samples = 8;
      for (let s = 0; s < samples; s++) {
        const a = (s / samples) * Math.PI * 2;
        const sx = px + Math.cos(a) * sampleRadius;
        const sy = py + Math.sin(a) * sampleRadius;

        const u = (sx - marginMm) / drawW;
        const v = (sy - marginMm) / drawH;

        if (u >= 0 && u <= 1 && v >= 0 && v <= 1) {
          const w = luminanceMap.sampleDarkness(u, v);
          sumX += sx * w;
          sumY += sy * w;
          sumWeight += w;
        }
      }

      if (sumWeight > 0.001) {
        nextPoints.push([sumX / sumWeight, sumY / sumWeight]);
      } else {
        nextPoints.push([px, py]);
      }
    }
    points = nextPoints;
  }

  return points;
}

/**
 * Fast Nearest-Neighbor Tour Initialization
 */
function solveNearestNeighbor(points: Point[]): Point[] {
  const n = points.length;
  const visited = new Uint8Array(n);
  const tour: Point[] = [points[0]];
  visited[0] = 1;

  let currentIdx = 0;

  for (let step = 1; step < n; step++) {
    let nearestIdx = -1;
    let minDistSq = Infinity;
    const [cx, cy] = points[currentIdx];

    for (let j = 0; j < n; j++) {
      if (visited[j] === 0) {
        const dx = points[j][0] - cx;
        const dy = points[j][1] - cy;
        const distSq = dx * dx + dy * dy;
        if (distSq < minDistSq) {
          minDistSq = distSq;
          nearestIdx = j;
        }
      }
    }

    if (nearestIdx !== -1) {
      visited[nearestIdx] = 1;
      tour.push(points[nearestIdx]);
      currentIdx = nearestIdx;
    }
  }

  return tour;
}

/**
 * 2-Opt TSP iterative local optimization
 */
function solve2Opt(
  initialTour: Point[],
  maxIterations: number,
  onProgress?: (progress: number, phase: string) => void
): Point[] {
  const tour = [...initialTour];
  const n = tour.length;
  if (n < 4) return tour;

  let improved = true;
  let iteration = 0;

  while (improved && iteration < maxIterations) {
    improved = false;
    iteration++;
    onProgress?.(
      0.3 + (iteration / maxIterations) * 0.6,
      `Optimizing TSP 2-opt pass ${iteration}/${maxIterations}...`
    );

    for (let i = 1; i < n - 2; i++) {
      for (let j = i + 1; j < n; j++) {
        if (j - i === 1) continue;

        const pA = tour[i - 1];
        const pB = tour[i];
        const pC = tour[j - 1];
        const pD = tour[j % n];

        const dAB = dist(pA, pB);
        const dCD = dist(pC, pD);
        const dAC = dist(pA, pC);
        const dBD = dist(pB, pD);

        if (dAC + dBD < dAB + dCD - 1e-6) {
          reverseSegment(tour, i, j - 1);
          improved = true;
        }
      }
    }
  }

  return tour;
}

function dist(p1: Point, p2: Point): number {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function reverseSegment(arr: Point[], start: number, end: number): void {
  let l = start;
  let r = end;
  while (l < r) {
    const temp = arr[l];
    arr[l] = arr[r];
    arr[r] = temp;
    l++;
    r--;
  }
}
