import { Path, FlowFieldParams } from '../../types';
import { LuminanceMap } from '../image/imageProcessor';

/**
 * Generate Flow Field Streamlines guided by image luminance & gradient vector fields
 */
export function generateFlowFieldPaths(
  luminanceMap: LuminanceMap,
  params: FlowFieldParams,
  bounds: { widthMm: number; heightMm: number; marginMm: number }
): Path[] {
  const { widthMm, heightMm, marginMm } = bounds;
  const drawWidth = widthMm - 2 * marginMm;
  const drawHeight = heightMm - 2 * marginMm;

  if (drawWidth <= 0 || drawHeight <= 0) return [];

  const paths: Path[] = [];
  const streamSpacing = Math.max(0.5, params.streamSpacing || 1.5);
  const stepLen = Math.max(0.2, params.stepLength || 0.8);
  const maxSteps = Math.max(10, Math.min(300, params.maxSteps || 60));

  const cols = Math.floor(drawWidth / streamSpacing);
  const rows = Math.floor(drawHeight / streamSpacing);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const startU = (c + 0.5) / cols;
      const startV = (r + 0.5) / rows;

      const darkness = luminanceMap.sampleDarkness(startU, startV);
      // Skip very light areas
      if (darkness < 0.15) continue;

      let curX = marginMm + startU * drawWidth;
      let curY = marginMm + startV * drawHeight;

      const path: Path = [[curX, curY]];
      const steps = Math.floor(maxSteps * Math.pow(darkness, 1.2));

      for (let s = 0; s < steps; s++) {
        const u = (curX - marginMm) / drawWidth;
        const v = (curY - marginMm) / drawHeight;

        if (u < 0 || u > 1 || v < 0 || v > 1) break;

        const lum = luminanceMap.sampleLuminance(u, v);
        // Perpendicular gradient / angle
        const delta = 0.01;
        const lumRight = luminanceMap.sampleLuminance(Math.min(1, u + delta), v);
        const lumDown = luminanceMap.sampleLuminance(u, Math.min(1, v + delta));

        const gx = (lumRight - lum) / delta;
        const gy = (lumDown - lum) / delta;

        let angle = Math.atan2(gy, gx) + Math.PI / 2; // isophote tangent
        if (params.directionMode === 'luminance') {
          angle = lum * Math.PI * 4;
        }

        curX += Math.cos(angle) * stepLen;
        curY += Math.sin(angle) * stepLen;

        path.push([curX, curY]);
      }

      if (path.length > 3) {
        paths.push(path);
      }
    }
  }

  return paths;
}
