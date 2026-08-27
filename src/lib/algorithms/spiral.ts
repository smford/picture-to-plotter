import { Path, SpiralParams } from '../../types';
import { LuminanceMap } from '../image/imageProcessor';

/**
 * Generate Archimedean Spiral plotter path (zero pen lifts)
 */
export function generateSpiralPaths(
  luminanceMap: LuminanceMap,
  params: SpiralParams,
  bounds: { widthMm: number; heightMm: number; marginMm: number }
): Path[] {
  const { widthMm, heightMm, marginMm } = bounds;
  const drawWidth = widthMm - 2 * marginMm;
  const drawHeight = heightMm - 2 * marginMm;

  if (drawWidth <= 0 || drawHeight <= 0) return [];

  const ringSpacing = Math.max(0.3, params.ringSpacing);
  const maxWaveAmp = params.maxWaveAmplitude;
  const angularRes = Math.max(60, params.angularResolution);

  const cx = marginMm + drawWidth / 2 + params.centerX * drawWidth * 0.4;
  const cy = marginMm + drawHeight / 2 + params.centerY * drawHeight * 0.4;

  const maxRadius = Math.sqrt(drawWidth * drawWidth + drawHeight * drawHeight) / 2;
  const totalTurns = maxRadius / ringSpacing;
  const totalSteps = Math.ceil(totalTurns * angularRes);

  const path: Path = [];
  let phase = 0;

  for (let i = 0; i <= totalSteps; i++) {
    const theta = (i / angularRes) * Math.PI * 2;
    const baseRadius = (theta / (Math.PI * 2)) * ringSpacing;

    if (baseRadius > maxRadius * 1.1) break;

    // Center unperturbed coordinate
    const idealX = cx + Math.cos(theta) * baseRadius;
    const idealY = cy + Math.sin(theta) * baseRadius;

    // Check if inside bounding box
    const normU = (idealX - marginMm) / drawWidth;
    const normV = (idealY - marginMm) / drawHeight;

    let darkness = 0;
    if (normU >= 0 && normU <= 1 && normV >= 0 && normV <= 1) {
      darkness = luminanceMap.sampleDarkness(normU, normV);
    }

    // Modulate wave oscillation by darkness
    const waveAmp = maxWaveAmp * Math.pow(darkness, 1.3);
    const freqMult = 1.0 + (params.frequencyModulation || 1.0) * darkness * 4.0;

    phase += (Math.PI * 2 / angularRes) * freqMult * 4;
    const waveOffset = Math.sin(phase) * waveAmp;

    const rFinal = Math.max(0, baseRadius + waveOffset);
    const finalX = cx + Math.cos(theta) * rFinal;
    const finalY = cy + Math.sin(theta) * rFinal;

    // Clip smoothly to physical canvas bounds
    const clampedX = Math.max(marginMm, Math.min(marginMm + drawWidth, finalX));
    const clampedY = Math.max(marginMm, Math.min(marginMm + drawHeight, finalY));

    path.push([clampedX, clampedY]);
  }

  if (params.direction === 'inward') {
    path.reverse();
  }

  return path.length > 2 ? [path] : [];
}
