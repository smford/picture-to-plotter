import React, { useRef } from 'react';
import {
  Upload,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { ImageFilters } from '../../types';
import { SAMPLE_IMAGES } from '../../lib/image/sampleImages';

interface ImagePanelProps {
  filters: ImageFilters;
  onUpdateFilters: (updater: (prev: ImageFilters) => ImageFilters) => void;
  onImageLoaded: (imgData: ImageData, name: string) => void;
  imageName?: string;
}

export const ImagePanel: React.FC<ImagePanelProps> = ({
  filters,
  onUpdateFilters,
  onImageLoaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const imgData = ctx.getImageData(0, 0, w, h);
          onImageLoaded(imgData, file.name);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSampleSelect = (sampleId: string) => {
    const sample = SAMPLE_IMAGES.find((s) => s.id === sampleId);
    if (sample) {
      const imgData = sample.generate();
      onImageLoaded(imgData, sample.name);
    }
  };

  const resetFilters = () => {
    onUpdateFilters(() => ({
      brightness: 0,
      contrast: 0,
      gamma: 1.0,
      invert: false,
      blurRadius: 0,
      thresholdEnabled: false,
      thresholdValue: 128,
      edgeDetection: false,
      edgeBlend: 0.3,
    }));
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-cad-border hover:border-cad-accent rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-cad-panelSub/40 hover:bg-cad-panelSub transition-all group"
      >
        <div className="p-2 rounded-full bg-cad-panel group-hover:bg-cad-accent/20 group-hover:text-cad-accent text-cad-textMuted transition-colors">
          <Upload size={20} />
        </div>
        <div className="text-center">
          <span className="font-medium text-cad-text group-hover:text-cad-accent transition-colors block">
            Click to upload photo
          </span>
          <span className="text-[10px] text-cad-textDim">
            PNG, JPEG, WebP (Drag & Drop)
          </span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Built-in Sample Images */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-cad-textMuted uppercase tracking-wider">
          Built-In Samples
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSampleSelect(sample.id)}
              className="px-2.5 py-1.5 rounded-lg cad-panel-sub hover:border-cad-accent hover:text-cad-accent text-cad-text text-left flex items-center gap-1.5 transition-all truncate"
            >
              <Sparkles size={12} className="text-cad-accent shrink-0" />
              <span className="truncate">{sample.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preprocessing Controls */}
      <div className="flex flex-col gap-3 pt-2 border-t border-cad-border/60">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-cad-textMuted uppercase tracking-wider">
            Image Preprocessing
          </label>
          <button
            onClick={resetFilters}
            className="text-[10px] text-cad-textDim hover:text-cad-accent flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        </div>

        {/* Brightness */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-cad-textMuted font-mono">
            <span>Brightness</span>
            <span className="text-cad-accent">{filters.brightness}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={filters.brightness}
            onChange={(e) =>
              onUpdateFilters((f) => ({ ...f, brightness: parseInt(e.target.value) }))
            }
          />
        </div>

        {/* Contrast */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-cad-textMuted font-mono">
            <span>Contrast</span>
            <span className="text-cad-accent">{filters.contrast}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={filters.contrast}
            onChange={(e) =>
              onUpdateFilters((f) => ({ ...f, contrast: parseInt(e.target.value) }))
            }
          />
        </div>

        {/* Exposure / Gamma */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-cad-textMuted font-mono">
            <span>Gamma / Exposure</span>
            <span className="text-cad-accent">{filters.gamma.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.05"
            value={filters.gamma}
            onChange={(e) =>
              onUpdateFilters((f) => ({ ...f, gamma: parseFloat(e.target.value) }))
            }
          />
        </div>

        {/* Gaussian Blur / Smoothing */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-cad-textMuted font-mono">
            <span>Blur / Smoothing</span>
            <span className="text-cad-accent">{filters.blurRadius.toFixed(1)} px</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={filters.blurRadius}
            onChange={(e) =>
              onUpdateFilters((f) => ({ ...f, blurRadius: parseFloat(e.target.value) }))
            }
          />
        </div>

        {/* Invert Luminance */}
        <div className="flex items-center justify-between py-1">
          <span className="text-cad-text font-medium">Invert Luminance</span>
          <button
            onClick={() => onUpdateFilters((f) => ({ ...f, invert: !f.invert }))}
            className={`w-9 h-5 rounded-full transition-colors relative ${
              filters.invert ? 'bg-cad-accent' : 'bg-cad-panelSub border border-cad-border'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                filters.invert ? 'left-4.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Sobel Edge Detection */}
        <div className="flex flex-col gap-2 pt-2 border-t border-cad-border/40">
          <div className="flex items-center justify-between">
            <span className="text-cad-text font-medium">Sobel Edge Accent</span>
            <button
              onClick={() =>
                onUpdateFilters((f) => ({ ...f, edgeDetection: !f.edgeDetection }))
              }
              className={`w-9 h-5 rounded-full transition-colors relative ${
                filters.edgeDetection ? 'bg-cad-accent' : 'bg-cad-panelSub border border-cad-border'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  filters.edgeDetection ? 'left-4.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {filters.edgeDetection && (
            <div className="flex flex-col gap-1 pl-2 border-l border-cad-accent/40">
              <div className="flex justify-between text-cad-textMuted font-mono">
                <span>Edge Blend</span>
                <span className="text-cad-accent">
                  {(filters.edgeBlend * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={filters.edgeBlend}
                onChange={(e) =>
                  onUpdateFilters((f) => ({ ...f, edgeBlend: parseFloat(e.target.value) }))
                }
              />
            </div>
          )}
        </div>

        {/* Hard Thresholding */}
        <div className="flex flex-col gap-2 pt-2 border-t border-cad-border/40">
          <div className="flex items-center justify-between">
            <span className="text-cad-text font-medium">Binarize Threshold</span>
            <button
              onClick={() =>
                onUpdateFilters((f) => ({ ...f, thresholdEnabled: !f.thresholdEnabled }))
              }
              className={`w-9 h-5 rounded-full transition-colors relative ${
                filters.thresholdEnabled
                  ? 'bg-cad-accent'
                  : 'bg-cad-panelSub border border-cad-border'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  filters.thresholdEnabled ? 'left-4.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {filters.thresholdEnabled && (
            <div className="flex flex-col gap-1 pl-2 border-l border-cad-accent/40">
              <div className="flex justify-between text-cad-textMuted font-mono">
                <span>Threshold Cutoff</span>
                <span className="text-cad-accent">{filters.thresholdValue}</span>
              </div>
              <input
                type="range"
                min="10"
                max="245"
                value={filters.thresholdValue}
                onChange={(e) =>
                  onUpdateFilters((f) => ({
                    ...f,
                    thresholdValue: parseInt(e.target.value),
                  }))
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
