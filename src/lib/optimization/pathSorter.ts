import { Path, Point } from '../../types';

/**
 * Greedy Nearest-Neighbor Path Sorter
 * Minimizes Pen-Up rapid travel distance and reverses paths if entering from the opposite end is shorter
 */
export function optimizePathOrder(
  paths: Path[],
  options: {
    enableSorting: boolean;
    enableReversal: boolean;
    removeShortPaths: boolean;
    minPathLengthMm: number;
    startPoint?: Point;
  }
): Path[] {
  if (paths.length === 0) return [];

  // Filter out tiny zero-length or sub-threshold paths
  let filteredPaths = paths.filter(path => {
    if (path.length < 2) return false;
    if (options.removeShortPaths && options.minPathLengthMm > 0) {
      let len = 0;
      for (let i = 0; i < path.length - 1; i++) {
        const dx = path[i + 1][0] - path[i][0];
        const dy = path[i + 1][1] - path[i][1];
        len += Math.sqrt(dx * dx + dy * dy);
      }
      return len >= options.minPathLengthMm;
    }
    return true;
  });

  if (!options.enableSorting || filteredPaths.length <= 1) {
    return filteredPaths;
  }

  const remaining = [...filteredPaths];
  const sorted: Path[] = [];

  let currentPos: Point = options.startPoint || [0, 0];

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestDistanceSq = Infinity;
    let shouldReverse = false;

    for (let i = 0; i < remaining.length; i++) {
      const path = remaining[i];
      const startPt = path[0];
      const endPt = path[path.length - 1];

      // Distance to start of path
      const dStartSq = distSq(currentPos, startPt);
      if (dStartSq < bestDistanceSq) {
        bestDistanceSq = dStartSq;
        bestIndex = i;
        shouldReverse = false;
      }

      // Distance to end of path (if reversal enabled)
      if (options.enableReversal) {
        const dEndSq = distSq(currentPos, endPt);
        if (dEndSq < bestDistanceSq) {
          bestDistanceSq = dEndSq;
          bestIndex = i;
          shouldReverse = true;
        }
      }
    }

    // Pick best path
    const chosenPath = remaining.splice(bestIndex, 1)[0];
    if (shouldReverse) {
      chosenPath.reverse();
    }

    sorted.push(chosenPath);
    currentPos = chosenPath[chosenPath.length - 1];
  }

  return sorted;
}

function distSq(p1: Point, p2: Point): number {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return dx * dx + dy * dy;
}
