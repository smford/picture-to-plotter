import { Path, CrossHatchParams } from '../../types';
import { LuminanceMap } from '../image/imageProcessor';

/**
 * Generate Adaptive Cross-Hatching vector paths
 */
export function generateCrossHatchPaths(
  luminanceMap: LuminanceMap,
  params: CrossHatchParams,
  bounds: { widthMm: number; heightMm: number; marginMm: number }
): Path[] {
  const { widthMm, heightMm, marginMm } = bounds;
  const drawWidth = widthMm - 2 * marginMm;
  const drawHeight = heightMm - 2 * marginMm;

  if (drawWidth <= 0 || drawHeight <= 0) return [];

  const allPaths: Path[] = [];
  const lineSpacing = Math.max(0.3, params.lineSpacing);
  const numLayers = Math.min(params.numLayers, params.angles.length, params.thresholds.length);
  const stepSizeMm = Math.max(0.2, params.segmentLength || 0.6);

  const cx = marginMm + drawWidth / 2;
  const cy = marginMm + drawHeight / 2;
  const diag = Math.sqrt(drawWidth * drawWidth + drawHeight * drawHeight);
  const numLines = Math.ceil(diag / lineSpacing);
  const startOffset = -(numLines * lineSpacing) / 2;
  const samplesPerLine = Math.ceil(diag / stepSizeMm);

  for (let layer = 0; layer < numLayers; layer++) {
    const angle = params.angles[layer];
    const thresholdNorm = (params.thresholds[layer] || 128) / 255.0; // darkness threshold [0..1]
    const angleRad = (angle * Math.PI) / 180;
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);

    const layerPaths: Path[] = [];

    for (let l = 0; l <= numLines; l++) {
      const lineOffset = startOffset + l * lineSpacing;
      let currentSegment: Path = [];

      for (let s = 0; s <= samplesPerLine; s++) {
        const uPos = -diag / 2 + s * stepSizeMm;

        const rawX = uPos * cosA - lineOffset * sinA;
        const rawY = uPos * sinA + lineOffset * cosA;

        const physicalX = cx + rawX;
        const physicalY = cy + rawY;

        // Bounding box check
        if (
          physicalX < marginMm ||
          physicalX > marginMm + drawWidth ||
          physicalY < marginMm ||
          physicalY > marginMm + drawHeight
        ) {
          if (currentSegment.length > 1) {
            layerPaths.push(currentSegment);
            currentSegment = [];
          }
          continue;
        }

        const normU = (physicalX - marginMm) / drawWidth;
        const normV = (physicalY - marginMm) / drawHeight;
        const darkness = luminanceMap.sampleDarkness(normU, normV);

        // Check if darkness meets this layer's threshold
        if (darkness >= thresholdNorm) {
          let px = physicalX;
          let py = physicalY;

          // Organic wobble
          if (params.wobble > 0) {
            const wobbleAmount = params.wobble * 0.15;
            px += (Math.sin(s * 0.7 + l) * wobbleAmount);
            py += (Math.cos(s * 0.8 + l) * wobbleAmount);
          }

          currentSegment.push([px, py]);
        } else {
          if (currentSegment.length > 1) {
            layerPaths.push(currentSegment);
            currentSegment = [];
          } else {
            currentSegment = [];
          }
        }
      }

      if (currentSegment.length > 1) {
        layerPaths.push(currentSegment);
      }
    }

    // Connect serpentine if enabled
    if (params.serpentine && layerPaths.length > 1) {
      // Connect adjacent line segments within threshold
      for (let i = 0; i < layerPaths.length; i++) {
        if (i % 2 === 1) {
          layerPaths[i].reverse();
        }
        allPaths.push(layerPaths[i]);
      }
    } else {
      allPaths.push(...layerPaths);
    }
  }

  return allPaths;
}
