import { Path, Point, ContourParams } from '../../types';
import { LuminanceMap } from '../image/imageProcessor';

/**
 * Generate Topographic / Iso-Luminance Contours via Marching Squares
 */
export function generateContourPaths(
  luminanceMap: LuminanceMap,
  params: ContourParams,
  bounds: { widthMm: number; heightMm: number; marginMm: number }
): Path[] {
  const { widthMm, heightMm, marginMm } = bounds;
  const drawWidth = widthMm - 2 * marginMm;
  const drawHeight = heightMm - 2 * marginMm;

  if (drawWidth <= 0 || drawHeight <= 0) return [];

  const levels = Math.max(2, Math.min(40, params.levels));
  const minL = Math.max(0, params.minLuminance || 20) / 255.0;
  const maxL = Math.min(255, params.maxLuminance || 235) / 255.0;

  const w = Math.min(180, luminanceMap.width);
  const h = Math.min(180, luminanceMap.height);

  const grid = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      grid[y * w + x] = luminanceMap.sampleLuminance(x / (w - 1), y / (h - 1));
    }
  }

  const allContours: Path[] = [];

  for (let l = 0; l < levels; l++) {
    const isovalue = minL + (l / (levels - 1)) * (maxL - minL);
    const segments: [Point, Point][] = [];

    // Marching squares cell evaluation
    for (let y = 0; y < h - 1; y++) {
      for (let x = 0; x < w - 1; x++) {
        const v0 = grid[y * w + x];
        const v1 = grid[y * w + (x + 1)];
        const v2 = grid[(y + 1) * w + (x + 1)];
        const v3 = grid[(y + 1) * w + x];

        let state = 0;
        if (v0 >= isovalue) state |= 1;
        if (v1 >= isovalue) state |= 2;
        if (v2 >= isovalue) state |= 4;
        if (v3 >= isovalue) state |= 8;

        if (state === 0 || state === 15) continue;

        // Linear interpolation for smooth contour coordinates
        const interp = (valA: number, valB: number) => {
          if (Math.abs(valB - valA) < 1e-5) return 0.5;
          return Math.max(0, Math.min(1, (isovalue - valA) / (valB - valA)));
        };

        const top: Point = [x + interp(v0, v1), y];
        const right: Point = [x + 1, y + interp(v1, v2)];
        const bottom: Point = [x + interp(v3, v2), y + 1];
        const left: Point = [x, y + interp(v0, v3)];

        switch (state) {
          case 1: segments.push([left, top]); break;
          case 2: segments.push([top, right]); break;
          case 3: segments.push([left, right]); break;
          case 4: segments.push([right, bottom]); break;
          case 5: segments.push([left, top]); segments.push([right, bottom]); break;
          case 6: segments.push([top, bottom]); break;
          case 7: segments.push([left, bottom]); break;
          case 8: segments.push([bottom, left]); break;
          case 9: segments.push([bottom, top]); break;
          case 10: segments.push([top, right]); segments.push([bottom, left]); break;
          case 11: segments.push([right, bottom]); break;
          case 12: segments.push([right, left]); break;
          case 13: segments.push([top, right]); break;
          case 14: segments.push([top, left]); break;
        }
      }
    }

    // Connect segments into polylines
    const polylines = connectContourSegments(segments);

    // Map to physical mm coordinates
    for (const poly of polylines) {
      if (poly.length < 3) continue;

      let smoothed = poly;
      if (params.smoothing > 0) {
        smoothed = chaikinSmooth(poly, Math.min(3, params.smoothing));
      }

      const mmPath: Path = smoothed.map(([gx, gy]) => [
        marginMm + (gx / (w - 1)) * drawWidth,
        marginMm + (gy / (h - 1)) * drawHeight,
      ]);

      allContours.push(mmPath);
    }
  }

  return allContours;
}

function connectContourSegments(segments: [Point, Point][]): Path[] {
  if (segments.length === 0) return [];
  const paths: Path[] = [];
  const remaining = [...segments];

  while (remaining.length > 0) {
    const first = remaining.pop()!;
    const path: Path = [first[0], first[1]];

    let extended = true;
    while (extended) {
      extended = false;
      const head = path[0];
      const tail = path[path.length - 1];

      for (let i = 0; i < remaining.length; i++) {
        const [pA, pB] = remaining[i];
        if (distSq(tail, pA) < 1e-4) {
          path.push(pB);
          remaining.splice(i, 1);
          extended = true;
          break;
        } else if (distSq(tail, pB) < 1e-4) {
          path.push(pA);
          remaining.splice(i, 1);
          extended = true;
          break;
        } else if (distSq(head, pB) < 1e-4) {
          path.unshift(pA);
          remaining.splice(i, 1);
          extended = true;
          break;
        } else if (distSq(head, pA) < 1e-4) {
          path.unshift(pB);
          remaining.splice(i, 1);
          extended = true;
          break;
        }
      }
    }

    paths.push(path);
  }

  return paths;
}

function distSq(p1: Point, p2: Point): number {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return dx * dx + dy * dy;
}

function chaikinSmooth(path: Path, iterations: number): Path {
  let current = path;
  for (let it = 0; it < iterations; it++) {
    const next: Path = [current[0]];
    for (let i = 0; i < current.length - 1; i++) {
      const p0 = current[i];
      const p1 = current[i + 1];
      const q: Point = [0.75 * p0[0] + 0.25 * p1[0], 0.75 * p0[1] + 0.25 * p1[1]];
      const r: Point = [0.25 * p0[0] + 0.75 * p1[0], 0.25 * p0[1] + 0.75 * p1[1]];
      next.push(q, r);
    }
    next.push(current[current.length - 1]);
    current = next;
  }
  return current;
}
