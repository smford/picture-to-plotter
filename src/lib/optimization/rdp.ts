import { Path, Point } from '../../types';

/**
 * Ramer-Douglas-Peucker (RDP) Polyline Simplification Algorithm
 * Reduces vertex count within tolerance epsilon (in mm)
 */
export function simplifyPathRDP(points: Path, epsilonMm: number): Path {
  if (points.length <= 2 || epsilonMm <= 0) {
    return points;
  }

  let maxDist = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }

  if (maxDist > epsilonMm) {
    // Recursive split
    const left = simplifyPathRDP(points.slice(0, index + 1), epsilonMm);
    const right = simplifyPathRDP(points.slice(index), epsilonMm);
    return left.slice(0, left.length - 1).concat(right);
  } else {
    return [points[0], points[end]];
  }
}

/**
 * Calculate perpendicular distance from point P to line segment (A, B)
 */
function perpendicularDistance(p: Point, a: Point, b: Point): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];

  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-10) {
    // A and B are identical
    const px = p[0] - a[0];
    const py = p[1] - a[1];
    return Math.sqrt(px * px + py * py);
  }

  // Projection scalar t = dot(P-A, B-A) / lenSq
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lenSq));

  const projX = a[0] + t * dx;
  const projY = a[1] + t * dy;

  const distX = p[0] - projX;
  const distY = p[1] - projY;

  return Math.sqrt(distX * distX + distY * distY);
}

/**
 * Simplify a list of toolpaths
 */
export function simplifyToolpathRDP(paths: Path[], epsilonMm: number): Path[] {
  if (epsilonMm <= 0) return paths;
  return paths
    .map(p => simplifyPathRDP(p, epsilonMm))
    .filter(p => p.length >= 2);
}
