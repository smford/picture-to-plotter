import React from 'react';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Grid,
  Ruler,
  Compass,
  CircleDot,
  PenTool,
} from 'lucide-react';
import { ViewportSettings } from '../../types';

interface ViewportToolbarProps {
  settings: ViewportSettings;
  onUpdateSettings: (updater: (prev: ViewportSettings) => ViewportSettings) => void;
  onFitToScreen: () => void;
  onResetZoom: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  scale: number;
}

export const ViewportToolbar: React.FC<ViewportToolbarProps> = ({
  settings,
  onUpdateSettings,
  onFitToScreen,
  onResetZoom,
  onZoomIn,
  onZoomOut,
  scale,
}) => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full cad-panel border border-cad-border shadow-2xl">
      {/* Zoom Controls */}
      <button
        title="Fit to Screen"
        onClick={onFitToScreen}
        className="p-1.5 rounded-md hover:bg-cad-panelSub text-cad-text hover:text-cad-accent transition-colors"
      >
        <Maximize2 size={16} />
      </button>

      <button
        title="Zoom In"
        onClick={onZoomIn}
        className="p-1.5 rounded-md hover:bg-cad-panelSub text-cad-text hover:text-cad-accent transition-colors"
      >
        <ZoomIn size={16} />
      </button>

      <button
        title="Zoom Out"
        onClick={onZoomOut}
        className="p-1.5 rounded-md hover:bg-cad-panelSub text-cad-text hover:text-cad-accent transition-colors"
      >
        <ZoomOut size={16} />
      </button>

      <button
        title="Reset 100%"
        onClick={onResetZoom}
        className="px-2 py-1 rounded text-xs font-mono text-cad-textMuted hover:text-cad-accent transition-colors"
      >
        {(scale * 100).toFixed(0)}%
      </button>

      <div className="h-4 w-px bg-cad-border mx-1" />

      {/* Layer Toggles */}
      <button
        title={settings.showVectorPaths ? "Hide Vector Paths" : "Show Vector Paths"}
        onClick={() => onUpdateSettings(s => ({ ...s, showVectorPaths: !s.showVectorPaths }))}
        className={`p-1.5 rounded-md transition-colors ${
          settings.showVectorPaths
            ? 'bg-cad-accent/20 text-cad-accent'
            : 'text-cad-textDim hover:text-cad-text'
        }`}
      >
        <PenTool size={16} />
      </button>

      <button
        title={settings.showOriginalImage ? "Hide Image Overlay" : "Show Image Overlay"}
        onClick={() => onUpdateSettings(s => ({ ...s, showOriginalImage: !s.showOriginalImage }))}
        className={`p-1.5 rounded-md transition-colors ${
          settings.showOriginalImage
            ? 'bg-cad-accent/20 text-cad-accent'
            : 'text-cad-textDim hover:text-cad-text'
        }`}
      >
        {settings.showOriginalImage ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>

      <button
        title={settings.showRapidTravel ? "Hide Rapid Pen-Up Travel" : "Show Rapid Pen-Up Travel"}
        onClick={() => onUpdateSettings(s => ({ ...s, showRapidTravel: !s.showRapidTravel }))}
        className={`p-1.5 rounded-md transition-colors ${
          settings.showRapidTravel
            ? 'bg-cad-danger/20 text-cad-danger'
            : 'text-cad-textDim hover:text-cad-text'
        }`}
      >
        <Compass size={16} />
      </button>

      <button
        title={settings.showVertices ? "Hide Vertices" : "Show RDP Vertices"}
        onClick={() => onUpdateSettings(s => ({ ...s, showVertices: !s.showVertices }))}
        className={`p-1.5 rounded-md transition-colors ${
          settings.showVertices
            ? 'bg-cad-accent/20 text-cad-accent'
            : 'text-cad-textDim hover:text-cad-text'
        }`}
      >
        <CircleDot size={16} />
      </button>

      <button
        title={settings.showGrid ? "Hide Grid" : "Show Grid"}
        onClick={() => onUpdateSettings(s => ({ ...s, showGrid: !s.showGrid }))}
        className={`p-1.5 rounded-md transition-colors ${
          settings.showGrid
            ? 'bg-cad-accent/20 text-cad-accent'
            : 'text-cad-textDim hover:text-cad-text'
        }`}
      >
        <Grid size={16} />
      </button>

      <button
        title={settings.showRulers ? "Hide Rulers" : "Show Rulers"}
        onClick={() => onUpdateSettings(s => ({ ...s, showRulers: !s.showRulers }))}
        className={`p-1.5 rounded-md transition-colors ${
          settings.showRulers
            ? 'bg-cad-accent/20 text-cad-accent'
            : 'text-cad-textDim hover:text-cad-text'
        }`}
      >
        <Ruler size={16} />
      </button>

      <div className="h-4 w-px bg-cad-border mx-1" />

      {/* Pen Color Selector */}
      <div className="flex items-center gap-1.5 pr-1">
        <label className="text-[11px] text-cad-textMuted font-mono">Pen:</label>
        <input
          type="color"
          value={settings.penColor}
          onChange={(e) => onUpdateSettings(s => ({ ...s, penColor: e.target.value }))}
          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
        />
      </div>
    </div>
  );
};
