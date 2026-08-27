import React, { useRef } from 'react';
import {
  Sparkles,
  Download,
  Upload,
} from 'lucide-react';
import { Preset } from '../../types';
import { DEFAULT_PRESETS } from '../../lib/presets/defaultPresets';

interface PresetPanelProps {
  onApplyPreset: (preset: Preset) => void;
  currentSettings: any;
}

export const PresetPanel: React.FC<PresetPanelProps> = ({
  onApplyPreset,
  currentSettings,
}) => {
  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExportPreset = () => {
    const jsonStr = JSON.stringify(currentSettings, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plotter-preset-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportPreset = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.algorithm && parsed.filters) {
          onApplyPreset(parsed);
        }
      } catch {
        alert('Invalid preset JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Curated Artist Presets */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-semibold text-cad-textMuted uppercase tracking-wider">
          Curated Plotter Styles
        </label>
        <div className="flex flex-col gap-2">
          {DEFAULT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className="p-3 rounded-xl cad-panel-sub border border-cad-border hover:border-cad-accent text-left flex flex-col gap-1 transition-all group hover:bg-cad-panelSub"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-cad-accent group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-cad-text group-hover:text-cad-accent transition-colors">
                    {preset.name}
                  </span>
                </div>
                <span className="cad-badge bg-cad-accent/10 text-cad-accent uppercase text-[9px]">
                  {preset.category}
                </span>
              </div>
              <span className="text-[11px] text-cad-textDim line-clamp-2">
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Save & Load Custom Preset */}
      <div className="flex flex-col gap-2 pt-3 border-t border-cad-border/60">
        <label className="text-[11px] font-semibold text-cad-textMuted uppercase tracking-wider">
          Preset Management
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportPreset}
            className="p-2.5 rounded-lg cad-panel-sub hover:border-cad-accent hover:text-cad-accent text-cad-text font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download size={13} />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => jsonFileInputRef.current?.click()}
            className="p-2.5 rounded-lg cad-panel-sub hover:border-cad-accent hover:text-cad-accent text-cad-text font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Upload size={13} />
            <span>Load JSON</span>
          </button>
        </div>

        <input
          ref={jsonFileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportPreset}
          className="hidden"
        />
      </div>
    </div>
  );
};
