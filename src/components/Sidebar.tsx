import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Activity,
  Sliders,
  Cpu,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ImagePanel } from './panels/ImagePanel';
import { AlgorithmPanel } from './panels/AlgorithmPanel';
import { OptimizationPanel } from './panels/OptimizationPanel';
import { MachinePanel } from './panels/MachinePanel';
import { PresetPanel } from './panels/PresetPanel';
import {
  AlgorithmConfig,
  ImageFilters,
  MachineSettings,
  OptimizationParams,
  PhysicalDimensions,
  Preset,
} from '../types';

interface SidebarProps {
  filters: ImageFilters;
  onUpdateFilters: (updater: (prev: ImageFilters) => ImageFilters) => void;
  algorithm: AlgorithmConfig;
  onUpdateAlgorithm: (updater: (prev: AlgorithmConfig) => AlgorithmConfig) => void;
  optimization: OptimizationParams;
  onUpdateOptimization: (updater: (prev: OptimizationParams) => OptimizationParams) => void;
  dimensions: PhysicalDimensions;
  onUpdateDimensions: (updater: (prev: PhysicalDimensions) => PhysicalDimensions) => void;
  machine: MachineSettings;
  onUpdateMachine: (updater: (prev: MachineSettings) => MachineSettings) => void;
  onImageLoaded: (imgData: ImageData, name: string) => void;
  imageName: string;
  onApplyPreset: (preset: Preset) => void;
}

type TabType = 'image' | 'algorithm' | 'optimization' | 'machine' | 'presets';

export const Sidebar: React.FC<SidebarProps> = ({
  filters,
  onUpdateFilters,
  algorithm,
  onUpdateAlgorithm,
  optimization,
  onUpdateOptimization,
  dimensions,
  onUpdateDimensions,
  machine,
  onUpdateMachine,
  onImageLoaded,
  imageName,
  onApplyPreset,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('algorithm');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'image', label: 'Image Prep', icon: <ImageIcon size={16} /> },
    { id: 'algorithm', label: 'Algorithm', icon: <Activity size={16} /> },
    { id: 'optimization', label: 'CAM Opt', icon: <Sliders size={16} /> },
    { id: 'machine', label: 'Machine', icon: <Cpu size={16} /> },
    { id: 'presets', label: 'Presets', icon: <Sparkles size={16} /> },
  ];

  return (
    <div
      className={`relative h-full cad-panel border-r border-cad-border flex transition-all duration-300 z-20 ${
        isCollapsed ? 'w-14' : 'w-88 md:w-96'
      }`}
    >
      {/* Left Icon Navigation Rail */}
      <div className="w-14 h-full border-r border-cad-border flex flex-col items-center py-3 gap-2 bg-cad-panelSub shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (isCollapsed) setIsCollapsed(false);
              }}
              title={tab.label}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-cad-accent text-black font-bold shadow-glow-accent'
                  : 'text-cad-textMuted hover:text-cad-text hover:bg-cad-panel'
              }`}
            >
              {tab.icon}
            </button>
          );
        })}

        <div className="mt-auto">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-cad-textMuted hover:text-cad-text hover:bg-cad-panel transition-colors"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      {!isCollapsed && (
        <div className="flex-1 h-full flex flex-col overflow-hidden">
          {/* Panel Header */}
          <div className="px-4 py-3 border-b border-cad-border flex items-center justify-between bg-cad-panel">
            <span className="font-semibold text-xs text-cad-text uppercase tracking-wider">
              {tabs.find((t) => t.id === activeTab)?.label}
            </span>
            <span className="text-[10px] text-cad-textDim truncate max-w-[150px] font-mono">
              {imageName}
            </span>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 p-4 overflow-y-auto overflow-x-hidden">
            {activeTab === 'image' && (
              <ImagePanel
                filters={filters}
                onUpdateFilters={onUpdateFilters}
                onImageLoaded={onImageLoaded}
                imageName={imageName}
              />
            )}

            {activeTab === 'algorithm' && (
              <AlgorithmPanel
                algorithm={algorithm}
                onUpdateAlgorithm={onUpdateAlgorithm}
              />
            )}

            {activeTab === 'optimization' && (
              <OptimizationPanel
                optimization={optimization}
                onUpdateOptimization={onUpdateOptimization}
                dimensions={dimensions}
                onUpdateDimensions={onUpdateDimensions}
              />
            )}

            {activeTab === 'machine' && (
              <MachinePanel
                machine={machine}
                onUpdateMachine={onUpdateMachine}
              />
            )}

            {activeTab === 'presets' && (
              <PresetPanel
                onApplyPreset={onApplyPreset}
                currentSettings={{ filters, algorithm, optimization, dimensions, machine }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
