import { Path, SquiggleParams } from '../../types';
import { LuminanceMap } from '../image/imageProcessor';

/**
 * Generate Squiggle / Waveform plotter paths
 */
export function generateSquigglePaths(
  luminanceMap: LuminanceMap,
  params: SquiggleParams,
  bounds: { widthMm: number; heightMm: number; marginMm: number }
): Path[] {
  const { widthMm, heightMm, marginMm } = bounds;
  const drawWidth = widthMm - 2 * marginMm;
  const drawHeight = heightMm - 2 * marginMm;

  if (drawWidth <= 0 || drawHeight <= 0) return [];

  const rawPaths: Path[] = [];
  const lineSpacing = Math.max(0.2, params.lineSpacing);
  const maxAmplitude = params.maxAmplitude;
  const minFreq = params.minFrequency;
  const maxFreq = params.maxFrequency;
  const angleRad = (params.angle * Math.PI) / 180;
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);

  // Determine rotated bounding box coverage
  // Center of drawing area
  const cx = marginMm + drawWidth / 2;
  const cy = marginMm + drawHeight / 2;
  const diag = Math.sqrt(drawWidth * drawWidth + drawHeight * drawHeight);
  const numLines = Math.ceil(diag / lineSpacing);
  const startOffset = -(numLines * lineSpacing) / 2;

  const stepSizeMm = 0.5; // sample resolution along scanline
  const samplesPerLine = Math.ceil(diag / stepSizeMm);

  let currentPhase = (params.phaseShift * Math.PI) / 180;

  for (let l = 0; l <= numLines; l++) {
    const lineOffset = startOffset + l * lineSpacing;
    const path: Path = [];
    const isReversed = params.serpentine && l % 2 === 1;

    let linePhase = currentPhase;

    for (let s = 0; s <= samplesPerLine; s++) {
      const uPos = -diag / 2 + s * stepSizeMm;

      // Unrotated coordinate relative to center
      const rawX = uPos * cosA - lineOffset * sinA;
      const rawY = uPos * sinA + lineOffset * cosA;

      const physicalX = cx + rawX;
      const physicalY = cy + rawY;

      // Check if point falls within physical drawing boundary
      if (
        physicalX < marginMm ||
        physicalX > marginMm + drawWidth ||
        physicalY < marginMm ||
        physicalY > marginMm + drawHeight
      ) {
        if (path.length > 0 && !params.serpentine) {
          rawPaths.push([...path]);
          path.length = 0;
        }
        continue;
      }

      // Map physical coordinate to normalized [0, 1] image coordinate
      const normU = (physicalX - marginMm) / drawWidth;
      const normV = (physicalY - marginMm) / drawHeight;

      // Darkness in [0.0 = white, 1.0 = darkest]
      const darkness = luminanceMap.sampleDarkness(normU, normV);

      // Modulate frequency and amplitude by darkness
      const freq = minFreq + (maxFreq - minFreq) * darkness;
      const amp = maxAmplitude * Math.pow(darkness, 1.2);

      linePhase += freq * stepSizeMm * Math.PI * 2;

      let waveVal = 0;
      switch (params.waveType) {
        case 'sine':
          waveVal = Math.sin(linePhase);
          break;
        case 'triangle':
          waveVal = (2 / Math.PI) * Math.asin(Math.sin(linePhase));
          break;
        case 'square':
          waveVal = Math.sin(linePhase) >= 0 ? 1 : -1;
          break;
        case 'noise':
          // High quality multi-octave pseudo-random deterministic wave
          waveVal =
            0.6 * Math.sin(linePhase) +
            0.3 * Math.sin(linePhase * 2.3 + 1.2) +
            0.1 * Math.sin(linePhase * 5.1 + 2.7);
          break;
      }

      // Offset perpendicular to scanline
      const disp = waveVal * amp;
      const finalX = physicalX - disp * sinA;
      const finalY = physicalY + disp * cosA;

      path.push([finalX, finalY]);
    }

    if (path.length > 1) {
      if (isReversed) {
        path.reverse();
      }
      rawPaths.push(path);
    }
  }

  // If serpentine is enabled, connect endpoints between consecutive lines
  if (params.serpentine && rawPaths.length > 1) {
    const connectedPath: Path = [];
    for (let i = 0; i < rawPaths.length; i++) {
      connectedPath.push(...rawPaths[i]);
    }
    return [connectedPath];
  }

  return rawPaths;
}
