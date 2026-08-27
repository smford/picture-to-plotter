import React, { useRef, useEffect, useCallback } from 'react';
import { Path, PhysicalDimensions, SimulationState, ViewportSettings } from '../../types';

interface CadCanvasProps {
  paths: Path[];
  rawPaths?: Path[];
  dimensions: PhysicalDimensions;
  viewportSettings: ViewportSettings;
  preprocessedImage: ImageData | null;
  simulationState: SimulationState;
  scale: number;
  panX: number;
  panY: number;
  isPanning: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onWheel: (e: React.WheelEvent<HTMLCanvasElement>) => void;
}

export const CadCanvas: React.FC<CadCanvasProps> = ({
  paths,
  dimensions,
  viewportSettings,
  preprocessedImage,
  simulationState,
  scale,
  panX,
  panY,
  isPanning,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Cache preprocessed image onto an offscreen canvas
  useEffect(() => {
    if (!preprocessedImage) return;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = preprocessedImage.width;
    offCanvas.height = preprocessedImage.height;
    const ctx = offCanvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(preprocessedImage, 0, 0);
      imageCanvasRef.current = offCanvas;
    }
  }, [preprocessedImage]);

  // Calculate paper dimensions in mm
  let paperWidthMm = dimensions.paperSize === 'Custom' ? dimensions.customWidthMm : 210;
  let paperHeightMm = dimensions.paperSize === 'Custom' ? dimensions.customHeightMm : 297;

  if (dimensions.paperSize === 'A4') {
    paperWidthMm = dimensions.orientation === 'landscape' ? 297 : 210;
    paperHeightMm = dimensions.orientation === 'landscape' ? 210 : 297;
  } else if (dimensions.paperSize === 'A3') {
    paperWidthMm = dimensions.orientation === 'landscape' ? 420 : 297;
    paperHeightMm = dimensions.orientation === 'landscape' ? 297 : 420;
  } else if (dimensions.paperSize === 'A5') {
    paperWidthMm = dimensions.orientation === 'landscape' ? 210 : 148;
    paperHeightMm = dimensions.orientation === 'landscape' ? 148 : 210;
  } else if (dimensions.paperSize === 'Letter') {
    paperWidthMm = dimensions.orientation === 'landscape' ? 279.4 : 215.9;
    paperHeightMm = dimensions.orientation === 'landscape' ? 215.9 : 279.4;
  } else if (dimensions.paperSize === 'Square') {
    paperWidthMm = 200;
    paperHeightMm = 200;
  }

  // Draw CAD Viewport
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Clear background
    ctx.fillStyle = '#0a0c10';
    ctx.fillRect(0, 0, width, height);

    // 2. Viewport background grid
    if (viewportSettings.showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const bgGridSize = 20;
      ctx.beginPath();
      for (let x = 0; x < width; x += bgGridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += bgGridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    }

    // Apply Pan and Zoom transformation
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(scale, scale);

    // 3. Render Machine Bed / Paper Sheet
    const paperPixelW = paperWidthMm;
    const paperPixelH = paperHeightMm;

    // Paper Drop Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 15 / scale;
    ctx.shadowOffsetX = 4 / scale;
    ctx.shadowOffsetY = 4 / scale;

    ctx.fillStyle = viewportSettings.paperColor || '#ffffff';
    ctx.fillRect(0, 0, paperPixelW, paperPixelH);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Paper Border
    ctx.strokeStyle = '#2a3140';
    ctx.lineWidth = 0.5 / scale;
    ctx.strokeRect(0, 0, paperPixelW, paperPixelH);

    // 4. Paper Margins box
    if (dimensions.marginMm > 0) {
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
      ctx.lineWidth = 0.5 / scale;
      ctx.setLineDash([2 / scale, 2 / scale]);
      ctx.strokeRect(
        dimensions.marginMm,
        dimensions.marginMm,
        paperPixelW - 2 * dimensions.marginMm,
        paperPixelH - 2 * dimensions.marginMm
      );
      ctx.setLineDash([]);
    }

    // 5. Paper mm Grid
    if (viewportSettings.showGrid) {
      ctx.lineWidth = 0.2 / scale;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.beginPath();
      for (let x = 10; x < paperPixelW; x += 10) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, paperPixelH);
      }
      for (let y = 10; y < paperPixelH; y += 10) {
        ctx.moveTo(0, y);
        ctx.lineTo(paperPixelW, y);
      }
      ctx.stroke();

      ctx.lineWidth = 0.4 / scale;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      for (let x = 50; x < paperPixelW; x += 50) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, paperPixelH);
      }
      for (let y = 50; y < paperPixelH; y += 50) {
        ctx.moveTo(0, y);
        ctx.lineTo(paperPixelW, y);
      }
      ctx.stroke();
    }

    // 6. Original / Preprocessed Image Overlay
    if (viewportSettings.showOriginalImage && imageCanvasRef.current && viewportSettings.imageOpacity > 0) {
      ctx.save();
      ctx.globalAlpha = viewportSettings.imageOpacity;
      const m = dimensions.marginMm;
      ctx.drawImage(
        imageCanvasRef.current,
        m,
        m,
        paperPixelW - 2 * m,
        paperPixelH - 2 * m
      );
      ctx.restore();
    }

    // Determine how many paths to render based on simulation scrub
    const simProgress = simulationState.progress;
    let pathsToRender = paths;
    let partialLastPath: Path | null = null;

    if (simProgress < 1.0 && paths.length > 0) {
      const totalPaths = paths.length;
      const targetPathIdx = Math.floor(simProgress * totalPaths);
      pathsToRender = paths.slice(0, targetPathIdx);

      if (targetPathIdx < totalPaths) {
        const fullCurrentPath = paths[targetPathIdx];
        const subProgress = (simProgress * totalPaths) - targetPathIdx;
        const targetPtCount = Math.max(2, Math.floor(subProgress * fullCurrentPath.length));
        partialLastPath = fullCurrentPath.slice(0, targetPtCount);
      }
    }

    // 7. Pen-Up Rapid Travel Vectors (Dashed red lines)
    if (viewportSettings.showRapidTravel && pathsToRender.length > 1) {
      ctx.save();
      ctx.strokeStyle = viewportSettings.travelColor || 'rgba(255, 61, 113, 0.6)';
      ctx.lineWidth = 0.25 / scale;
      ctx.setLineDash([1.5 / scale, 1.5 / scale]);
      ctx.beginPath();

      if (pathsToRender.length > 0) {
        ctx.moveTo(0, 0);
        ctx.lineTo(pathsToRender[0][0][0], pathsToRender[0][0][1]);
      }

      for (let i = 0; i < pathsToRender.length - 1; i++) {
        const pEnd = pathsToRender[i][pathsToRender[i].length - 1];
        const pNext = pathsToRender[i + 1][0];
        ctx.moveTo(pEnd[0], pEnd[1]);
        ctx.lineTo(pNext[0], pNext[1]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 8. Vector Artwork Paths
    if (viewportSettings.showVectorPaths && paths.length > 0) {
      ctx.save();
      ctx.strokeStyle = viewportSettings.penColor || '#111827';
      ctx.lineWidth = (viewportSettings.penWidthMm || 0.3);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      for (const path of pathsToRender) {
        if (path.length < 2) continue;
        ctx.moveTo(path[0][0], path[0][1]);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i][0], path[i][1]);
        }
      }

      if (partialLastPath && partialLastPath.length >= 2) {
        ctx.moveTo(partialLastPath[0][0], partialLastPath[0][1]);
        for (let i = 1; i < partialLastPath.length; i++) {
          ctx.lineTo(partialLastPath[i][0], partialLastPath[i][1]);
        }
      }

      ctx.stroke();
      ctx.restore();
    }

    // 9. Vertices dots (if toggled)
    if (viewportSettings.showVertices && paths.length > 0) {
      ctx.fillStyle = '#00e5ff';
      const dotSize = 0.4;
      for (const path of pathsToRender) {
        for (const pt of path) {
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 10. Simulation Toolhead Cursor
    if (paths.length > 0) {
      let headX = 0;
      let headY = 0;
      let isPenDown = false;

      if (simProgress >= 1.0) {
        const lastP = paths[paths.length - 1];
        const lastPt = lastP[lastP.length - 1];
        headX = lastPt[0];
        headY = lastPt[1];
      } else if (partialLastPath && partialLastPath.length > 0) {
        const curPt = partialLastPath[partialLastPath.length - 1];
        headX = curPt[0];
        headY = curPt[1];
        isPenDown = true;
      } else if (pathsToRender.length > 0) {
        const lastP = pathsToRender[pathsToRender.length - 1];
        const lastPt = lastP[lastP.length - 1];
        headX = lastPt[0];
        headY = lastPt[1];
      }

      ctx.save();
      ctx.lineWidth = 1.2 / scale;
      ctx.strokeStyle = isPenDown ? '#00e676' : '#ff3d71';
      ctx.fillStyle = isPenDown ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 61, 113, 0.4)';

      const ringR = 4 / scale;
      ctx.beginPath();
      ctx.arc(headX, headY, ringR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(headX - 8 / scale, headY);
      ctx.lineTo(headX + 8 / scale, headY);
      ctx.moveTo(headX, headY - 8 / scale);
      ctx.lineTo(headX, headY + 8 / scale);
      ctx.stroke();
      ctx.restore();
    }

    // 11. Machine Origin (0,0) Marker
    ctx.save();
    ctx.strokeStyle = '#ffb300';
    ctx.fillStyle = '#ffb300';
    ctx.lineWidth = 1 / scale;
    ctx.beginPath();
    ctx.arc(0, 0, 3 / scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(15 / scale, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 15 / scale);
    ctx.stroke();
    ctx.restore();

    ctx.restore(); // restore pan/zoom transform

    // 12. Viewport Rulers (Top & Left)
    if (viewportSettings.showRulers) {
      renderRulers(ctx, width, height, scale, panX, panY, paperWidthMm, paperHeightMm);
    }

    ctx.restore(); // restore dpr
  }, [
    paths,
    dimensions,
    viewportSettings,
    simulationState,
    scale,
    panX,
    panY,
    paperWidthMm,
    paperHeightMm,
  ]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      render();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [render]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-cad-canvasBg overflow-hidden select-none cursor-crosshair"
    >
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onWheel={onWheel}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
};

function renderRulers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  panX: number,
  panY: number,
  paperW: number,
  paperH: number
) {
  const rulerThickness = 20;

  ctx.fillStyle = '#12151c';
  ctx.fillRect(0, 0, width, rulerThickness);
  ctx.fillRect(0, 0, rulerThickness, height);

  ctx.strokeStyle = '#2a3140';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, width, rulerThickness);
  ctx.strokeRect(0, 0, rulerThickness, height);

  ctx.fillStyle = '#181b22';
  ctx.fillRect(0, 0, rulerThickness, rulerThickness);
  ctx.fillStyle = '#00e5ff';
  ctx.font = '9px JetBrains Mono, monospace';
  ctx.fillText('mm', 4, 14);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px JetBrains Mono, monospace';

  const stepMm = scale > 2 ? 10 : scale > 0.8 ? 20 : 50;

  for (let mm = 0; mm <= paperW + 50; mm += stepMm) {
    const screenX = panX + mm * scale;
    if (screenX >= rulerThickness && screenX <= width) {
      const isMajor = mm % 50 === 0;
      const tickH = isMajor ? 12 : 6;
      ctx.strokeStyle = isMajor ? '#64748b' : '#384257';
      ctx.beginPath();
      ctx.moveTo(screenX, rulerThickness - tickH);
      ctx.lineTo(screenX, rulerThickness);
      ctx.stroke();

      if (isMajor) {
        ctx.fillText(`${mm}`, screenX + 2, 12);
      }
    }
  }

  for (let mm = 0; mm <= paperH + 50; mm += stepMm) {
    const screenY = panY + mm * scale;
    if (screenY >= rulerThickness && screenY <= height) {
      const isMajor = mm % 50 === 0;
      const tickW = isMajor ? 12 : 6;
      ctx.strokeStyle = isMajor ? '#64748b' : '#384257';
      ctx.beginPath();
      ctx.moveTo(rulerThickness - tickW, screenY);
      ctx.lineTo(rulerThickness, screenY);
      ctx.stroke();

      if (isMajor) {
        ctx.save();
        ctx.translate(12, screenY - 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(`${mm}`, 0, 0);
        ctx.restore();
      }
    }
  }
}
