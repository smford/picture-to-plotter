import { Path, Point, WoodcutParams } from '../../types';
import { LuminanceMap } from '../image/imageProcessor';

/**
 * 16th-Century Northern Renaissance Woodcut Algorithm (Holbein & Dürer Style)
 * Bold black ink linework, dense parallel cross-hatching, woodblock relief textures & hand-printed borders.
 */
export function generateWoodcutPaths(
  luminanceMap: LuminanceMap,
  params: WoodcutParams,
  bounds: { widthMm: number; heightMm: number; marginMm: number }
): Path[] {
  const { widthMm, heightMm, marginMm } = bounds;
  const drawWidth = widthMm - 2 * marginMm;
  const drawHeight = heightMm - 2 * marginMm;

  if (drawWidth <= 0 || drawHeight <= 0) return [];

  const allPaths: Path[] = [];
  const hatchSpacing = Math.max(0.6, params.hatchSpacing || 1.4);
  const angleRad = ((params.hatchAngle || 45) * Math.PI) / 180;
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);

  const cx = marginMm + drawWidth / 2;
  const cy = marginMm + drawHeight / 2;
  const diag = Math.sqrt(drawWidth * drawWidth + drawHeight * drawHeight);
  const numLines = Math.ceil(diag / hatchSpacing);
  const startOffset = -(numLines * hatchSpacing) / 2;
  const stepSizeMm = 0.45;
  const samplesPerLine = Math.ceil(diag / stepSizeMm);

  // -------------------------------------------------------------
  // 1. BOLD WOODCUT CONTOURS & CARVED OUTLINES (Holbein / Dürer Edges)
  // -------------------------------------------------------------
  if (params.edgeStrength > 0.05) {
    const contourPaths = extractWoodcutEdgeContours(
      luminanceMap,
      params.edgeStrength,
      drawWidth,
      drawHeight,
      marginMm
    );
    allPaths.push(...contourPaths);
  }

  // -------------------------------------------------------------
  // 2. PRIMARY PARALLEL WOODCUT HATCHING (Pass 1)
  // -------------------------------------------------------------
  for (let l = 0; l <= numLines; l++) {
    const lineOffset = startOffset + l * hatchSpacing;
    let currentStroke: Path = [];

    for (let s = 0; s <= samplesPerLine; s++) {
      const uPos = -diag / 2 + s * stepSizeMm;

      const rawX = uPos * cosA - lineOffset * sinA;
      const rawY = uPos * sinA + lineOffset * cosA;

      const physicalX = cx + rawX;
      const physicalY = cy + rawY;

      if (
        physicalX < marginMm ||
        physicalX > marginMm + drawWidth ||
        physicalY < marginMm ||
        physicalY > marginMm + drawHeight
      ) {
        if (currentStroke.length > 2) {
          allPaths.push(currentStroke);
        }
        currentStroke = [];
        continue;
      }

      const normU = (physicalX - marginMm) / drawWidth;
      const normV = (physicalY - marginMm) / drawHeight;
      const rawDarkness = luminanceMap.sampleDarkness(normU, normV);

      // Contrast boost / woodcut tone flattening
      const darkness = Math.pow(rawDarkness, params.contrastBoost || 1.3);

      // Woodcut tonal zones:
      // - Highlights (darkness < 0.20): Pure white uncarved block
      // - Midtones & Shadows (darkness >= 0.20): Drawn
      if (darkness >= 0.20) {
        // Subtle woodcut chisel taper / curve modulation
        let px = physicalX;
        let py = physicalY;

        // Woodblock chisel taper
        const microGouge = Math.sin(s * 0.4 + l * 0.7) * (0.04 * (1 - darkness));
        px -= microGouge * sinA;
        py += microGouge * cosA;

        currentStroke.push([px, py]);
      } else {
        if (currentStroke.length > 2) {
          allPaths.push(currentStroke);
        }
        currentStroke = [];
      }
    }

    if (currentStroke.length > 2) {
      allPaths.push(currentStroke);
    }
  }

  // -------------------------------------------------------------
  // 3. DEEP SHADOW CROSS-HATCHING (Pass 2 - Perpendicular angle)
  // -------------------------------------------------------------
  if (params.crossHatchShadows) {
    const crossAngleRad = angleRad + Math.PI / 2; // perpendicular
    const cosCross = Math.cos(crossAngleRad);
    const sinCross = Math.sin(crossAngleRad);
    const crossSpacing = hatchSpacing * 1.15;
    const numCrossLines = Math.ceil(diag / crossSpacing);
    const startCrossOffset = -(numCrossLines * crossSpacing) / 2;

    for (let l = 0; l <= numCrossLines; l++) {
      const lineOffset = startCrossOffset + l * crossSpacing;
      let currentStroke: Path = [];

      for (let s = 0; s <= samplesPerLine; s++) {
        const uPos = -diag / 2 + s * stepSizeMm;

        const rawX = uPos * cosCross - lineOffset * sinCross;
        const rawY = uPos * sinCross + lineOffset * cosCross;

        const physicalX = cx + rawX;
        const physicalY = cy + rawY;

        if (
          physicalX < marginMm ||
          physicalX > marginMm + drawWidth ||
          physicalY < marginMm ||
          physicalY > marginMm + drawHeight
        ) {
          if (currentStroke.length > 2) {
            allPaths.push(currentStroke);
          }
          currentStroke = [];
          continue;
        }

        const normU = (physicalX - marginMm) / drawWidth;
        const normV = (physicalY - marginMm) / drawHeight;
        const darkness = Math.pow(luminanceMap.sampleDarkness(normU, normV), params.contrastBoost || 1.3);

        // Cross-hatch only in deep shadow regions (darkness > 0.55)
        if (darkness >= 0.55) {
          currentStroke.push([physicalX, physicalY]);
        } else {
          if (currentStroke.length > 2) {
            allPaths.push(currentStroke);
          }
          currentStroke = [];
        }
      }

      if (currentStroke.length > 2) {
        allPaths.push(currentStroke);
      }
    }
  }

  // -------------------------------------------------------------
  // 4. WOODBLOCK RELIEF GOUGES & CHISEL FLECKS
  // -------------------------------------------------------------
  if (params.gougeTexture) {
    const gougePaths = generateWoodblockGouges(
      luminanceMap,
      drawWidth,
      drawHeight,
      marginMm,
      angleRad
    );
    allPaths.push(...gougePaths);
  }

  // -------------------------------------------------------------
  // 5. HAND-CARVED ROUGH WOODBLOCK BORDER (Authentic 1538 Frame)
  // -------------------------------------------------------------
  if (params.handCarvedBorder) {
    const borderPaths = generateHandCarvedBorder(marginMm, drawWidth, drawHeight);
    allPaths.push(...borderPaths);
  }

  // Filter out tiny micro-segments
  const minLen = params.minStrokeLengthMm || 0.4;
  return allPaths.filter(path => {
    if (path.length < 2) return false;
    let len = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const dx = path[i + 1][0] - path[i][0];
      const dy = path[i + 1][1] - path[i][1];
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return len >= minLen;
  });
}

/**
 * Extract bold woodblock silhouette contour strokes
 */
function extractWoodcutEdgeContours(
  luminanceMap: LuminanceMap,
  strength: number,
  drawW: number,
  drawH: number,
  marginMm: number
): Path[] {
  const paths: Path[] = [];
  const resX = 140;
  const resY = Math.round(resX * (drawH / drawW));
  const threshold = 0.18 * (1.1 - strength * 0.5);

  const edges: { x: number; y: number; angle: number }[] = [];

  for (let gy = 1; gy < resY - 1; gy++) {
    for (let gx = 1; gx < resX - 1; gx++) {
      const u = gx / (resX - 1);
      const v = gy / (resY - 1);
      const deltaU = 1 / resX;
      const deltaV = 1 / resY;

      const lumL = luminanceMap.sampleLuminance(u - deltaU, v);
      const lumR = luminanceMap.sampleLuminance(u + deltaU, v);
      const lumT = luminanceMap.sampleLuminance(u, v - deltaV);
      const lumB = luminanceMap.sampleLuminance(u, v + deltaV);

      const dx = lumR - lumL;
      const dy = lumB - lumT;
      const mag = Math.sqrt(dx * dx + dy * dy);

      if (mag > threshold) {
        const edgeAngle = Math.atan2(dy, dx) + Math.PI / 2;
        edges.push({
          x: marginMm + u * drawW,
          y: marginMm + v * drawH,
          angle: edgeAngle,
        });
      }
    }
  }

  // Generate short continuous contour segments
  const strokeLenMm = 1.6;
  for (let i = 0; i < edges.length; i += 2) {
    const e = edges[i];
    const p1: Point = [
      e.x - Math.cos(e.angle) * (strokeLenMm / 2),
      e.y - Math.sin(e.angle) * (strokeLenMm / 2),
    ];
    const p2: Point = [
      e.x + Math.cos(e.angle) * (strokeLenMm / 2),
      e.y + Math.sin(e.angle) * (strokeLenMm / 2),
    ];
    paths.push([p1, [e.x, e.y], p2]);
  }

  return paths;
}

/**
 * Generate woodblock chisel gouge flecks in midtone transition zones
 */
function generateWoodblockGouges(
  luminanceMap: LuminanceMap,
  drawW: number,
  drawH: number,
  marginMm: number,
  baseAngleRad: number
): Path[] {
  const paths: Path[] = [];
  const numGouges = 400;

  for (let i = 0; i < numGouges; i++) {
    const u = Math.random();
    const v = Math.random();
    const darkness = luminanceMap.sampleDarkness(u, v);

    // Gouge flecks appear most prominently in mid-darks (0.35 to 0.70)
    if (darkness >= 0.35 && darkness <= 0.75 && Math.random() < 0.6) {
      const gx = marginMm + u * drawW;
      const gy = marginMm + v * drawH;

      const len = 0.8 + Math.random() * 1.2;
      const angle = baseAngleRad + (Math.random() - 0.5) * 0.4;
      const curve = (Math.random() - 0.5) * 0.3;

      const p0: Point = [gx - Math.cos(angle) * (len / 2), gy - Math.sin(angle) * (len / 2)];
      const pMid: Point = [
        gx + Math.sin(angle) * curve,
        gy - Math.cos(angle) * curve,
      ];
      const p1: Point = [gx + Math.cos(angle) * (len / 2), gy + Math.sin(angle) * (len / 2)];

      paths.push([p0, pMid, p1]);
    }
  }

  return paths;
}

/**
 * Generate authentic 16th-century rough, hand-carved woodblock outer double border
 */
function generateHandCarvedBorder(marginMm: number, drawW: number, drawH: number): Path[] {
  const paths: Path[] = [];

  const left = marginMm;
  const top = marginMm;
  const right = marginMm + drawW;
  const bottom = marginMm + drawH;

  // Outer primary thick border with hand-carved micro-imperfections
  const outerBorder: Path = [];
  const segmentsX = Math.round(drawW / 2);
  const segmentsY = Math.round(drawH / 2);

  // Top edge
  for (let i = 0; i <= segmentsX; i++) {
    const x = left + (i / segmentsX) * drawW;
    const y = top + (Math.sin(i * 0.6) * 0.12);
    outerBorder.push([x, y]);
  }
  // Right edge
  for (let i = 0; i <= segmentsY; i++) {
    const x = right + (Math.cos(i * 0.6) * 0.12);
    const y = top + (i / segmentsY) * drawH;
    outerBorder.push([x, y]);
  }
  // Bottom edge
  for (let i = segmentsX; i >= 0; i--) {
    const x = left + (i / segmentsX) * drawW;
    const y = bottom + (Math.sin(i * 0.7) * 0.12);
    outerBorder.push([x, y]);
  }
  // Left edge
  for (let i = segmentsY; i >= 0; i--) {
    const x = left + (Math.cos(i * 0.7) * 0.12);
    const y = top + (i / segmentsY) * drawH;
    outerBorder.push([x, y]);
  }
  paths.push(outerBorder);

  // Inner secondary fine border (1.8mm inset)
  const inset = 1.8;
  if (drawW > inset * 4 && drawH > inset * 4) {
    const iLeft = left + inset;
    const iTop = top + inset;
    const iRight = right - inset;
    const iBottom = bottom - inset;

    const innerBorder: Path = [
      [iLeft, iTop],
      [iRight, iTop],
      [iRight, iBottom],
      [iLeft, iBottom],
      [iLeft, iTop],
    ];
    paths.push(innerBorder);

    // Corner decorative chisel notches (Renaissance block rosettes)
    const notchSize = 2.2;
    // Top-Left corner notch
    paths.push([[iLeft, iTop + notchSize], [iLeft + notchSize, iTop]]);
    // Top-Right corner notch
    paths.push([[iRight - notchSize, iTop], [iRight, iTop + notchSize]]);
    // Bottom-Right corner notch
    paths.push([[iRight, iBottom - notchSize], [iRight - notchSize, iBottom]]);
    // Bottom-Left corner notch
    paths.push([[iLeft + notchSize, iBottom], [iLeft, iBottom - notchSize]]);
  }

  return paths;
}
