import { useState, useCallback, useRef, MouseEvent, WheelEvent } from 'react';

export interface PanZoomState {
  scale: number;
  panX: number;
  panY: number;
}

export function usePanZoom() {
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
  });

  const onMouseDown = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      // Middle click or Left click
      if (e.button === 1 || e.button === 0) {
        setIsPanning(true);
        dragStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          panX,
          panY,
        };
      }
    },
    [panX, panY]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      if (!isPanning) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPanX(dragStartRef.current.panX + dx);
      setPanY(dragStartRef.current.panY + dy);
    },
    [isPanning]
  );

  const onMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const onWheel = useCallback(
    (e: WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const newScale = Math.max(0.1, Math.min(30, scale * zoomFactor));

      // Zoom centered on cursor position
      const newPanX = cursorX - (cursorX - panX) * (newScale / scale);
      const newPanY = cursorY - (cursorY - panY) * (newScale / scale);

      setScale(newScale);
      setPanX(newPanX);
      setPanY(newPanY);
    },
    [scale, panX, panY]
  );

  const fitToViewport = useCallback(
    (containerW: number, containerH: number, targetWidthMm: number, targetHeightMm: number) => {
      if (containerW <= 0 || containerH <= 0 || targetWidthMm <= 0 || targetHeightMm <= 0) return;

      const padding = 40;
      const availW = containerW - padding * 2;
      const availH = containerH - padding * 2;

      const scaleX = availW / targetWidthMm;
      const scaleY = availH / targetHeightMm;
      const newScale = Math.min(scaleX, scaleY);

      const renderW = targetWidthMm * newScale;
      const renderH = targetHeightMm * newScale;

      const newPanX = (containerW - renderW) / 2;
      const newPanY = (containerH - renderH) / 2;

      setScale(newScale);
      setPanX(newPanX);
      setPanY(newPanY);
    },
    []
  );

  const resetZoom = useCallback(() => {
    setScale(1);
    setPanX(0);
    setPanY(0);
  }, []);

  const zoomIn = useCallback(() => {
    setScale(s => Math.min(30, s * 1.25));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(s => Math.max(0.1, s / 1.25));
  }, []);

  return {
    scale,
    panX,
    panY,
    isPanning,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
    fitToViewport,
    resetZoom,
    zoomIn,
    zoomOut,
    setScale,
    setPanX,
    setPanY,
  };
}
