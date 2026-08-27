import React from 'react';
import { MachineSettings, PenLiftMethod, GcodeOrigin } from '../../types';

interface MachinePanelProps {
  machine: MachineSettings;
  onUpdateMachine: (updater: (prev: MachineSettings) => MachineSettings) => void;
}

export const MachinePanel: React.FC<MachinePanelProps> = ({
  machine,
  onUpdateMachine,
}) => {
  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* 1. SPEEDS & FEEDRATES */}
      <div className="flex flex-col gap-3">
        <label className="text-[11px] font-semibold text-cad-textMuted uppercase tracking-wider">
          Feedrates & Speeds
        </label>

        {/* Draw Feedrate */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-cad-textMuted font-mono">
            <span>Drawing Feedrate (G1)</span>
            <span className="text-cad-accent font-semibold">{machine.feedrate} mm/min</span>
          </div>
          <input
            type="range"
            min="300"
            max="12000"
            step="100"
            value={machine.feedrate}
            onChange={(e) =>
              onUpdateMachine((m) => ({ ...m, feedrate: parseInt(e.target.value) }))
            }
          />
        </div>

        {/* Rapid Feedrate */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-cad-textMuted font-mono">
            <span>Rapid Travel (G0)</span>
            <span className="text-cad-accent font-semibold">{machine.rapidFeedrate} mm/min</span>
          </div>
          <input
            type="range"
            min="1000"
            max="25000"
            step="500"
            value={machine.rapidFeedrate}
            onChange={(e) =>
              onUpdateMachine((m) => ({ ...m, rapidFeedrate: parseInt(e.target.value) }))
            }
          />
        </div>
      </div>

      {/* 2. PEN LIFT MECHANISM */}
      <div className="flex flex-col gap-3 pt-3 border-t border-cad-border/60">
        <label className="text-[11px] font-semibold text-cad-textMuted uppercase tracking-wider">
          Pen Lift Mechanism
        </label>

        <div className="grid grid-cols-3 gap-1">
          {[
            { id: 'servo-z' as PenLiftMethod, label: 'Servo / Z-Axis' },
            { id: 'spindle-pwm' as PenLiftMethod, label: 'Laser / PWM' },
            { id: 'custom' as PenLiftMethod, label: 'Custom Gcode' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => onUpdateMachine((m) => ({ ...m, penLiftMethod: mode.id }))}
              className={`py-1.5 px-2 rounded-lg text-center font-semibold text-[10px] border transition-all ${
                machine.penLiftMethod === mode.id
                  ? 'bg-cad-accent/20 border-cad-accent text-cad-accent'
                  : 'cad-panel-sub border-cad-border text-cad-textMuted'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Servo Z Heights */}
        {machine.penLiftMethod === 'servo-z' && (
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg cad-panel-sub border border-cad-border/60">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-cad-textMuted font-mono">Pen Up Z (mm)</span>
              <input
                type="number"
                step="0.5"
                value={machine.penUpZ}
                onChange={(e) =>
                  onUpdateMachine((m) => ({
                    ...m,
                    penUpZ: parseFloat(e.target.value) || 0,
                  }))
                }
                className="cad-input text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-cad-textMuted font-mono">Pen Down Z (mm)</span>
              <input
                type="number"
                step="0.5"
                value={machine.penDownZ}
                onChange={(e) =>
                  onUpdateMachine((m) => ({
                    ...m,
                    penDownZ: parseFloat(e.target.value) || 0,
                  }))
                }
                className="cad-input text-xs"
              />
            </div>
          </div>
        )}

        {/* Laser PWM */}
        {machine.penLiftMethod === 'spindle-pwm' && (
          <div className="flex flex-col gap-2 p-2.5 rounded-lg cad-panel-sub border border-cad-border/60">
            <div className="flex justify-between text-cad-textMuted font-mono text-[11px]">
              <span>Laser Power (PWM S)</span>
              <span className="text-cad-accent">{machine.laserPowerDown}</span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={machine.laserPowerDown}
              onChange={(e) =>
                onUpdateMachine((m) => ({
                  ...m,
                  laserPowerDown: parseInt(e.target.value),
                }))
              }
            />
          </div>
        )}

        {/* Pen Drop Delay */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-cad-textMuted font-mono">
            <span>Pen Dwell Delay</span>
            <span className="text-cad-accent">{machine.penDownDelayMs} ms</span>
          </div>
          <input
            type="range"
            min="0"
            max="300"
            step="10"
            value={machine.penDownDelayMs}
            onChange={(e) =>
              onUpdateMachine((m) => ({
                ...m,
                penDownDelayMs: parseInt(e.target.value),
              }))
            }
          />
        </div>
      </div>

      {/* 3. COORDINATE SYSTEM & ORIGIN */}
      <div className="flex flex-col gap-3 pt-3 border-t border-cad-border/60">
        <label className="text-[11px] font-semibold text-cad-textMuted uppercase tracking-wider">
          Coordinate System
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-cad-textMuted text-[10px]">Machine Origin (0,0)</span>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'top-left' as GcodeOrigin, label: 'Top-Left' },
              { id: 'bottom-left' as GcodeOrigin, label: 'Bottom-Left' },
              { id: 'center' as GcodeOrigin, label: 'Center' },
            ].map((orig) => (
              <button
                key={orig.id}
                onClick={() => onUpdateMachine((m) => ({ ...m, gcodeOrigin: orig.id }))}
                className={`py-1 rounded font-mono text-[10px] border transition-all ${
                  machine.gcodeOrigin === orig.id
                    ? 'bg-cad-accent/20 border-cad-accent text-cad-accent font-semibold'
                    : 'cad-panel-sub border-cad-border text-cad-textMuted'
                }`}
              >
                {orig.label}
              </button>
            ))}
          </div>
        </div>

        {/* Coordinate precision */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-cad-textMuted font-mono">
            <span>Decimal Precision</span>
            <span className="text-cad-accent">{machine.coordinatePrecision} digits</span>
          </div>
          <input
            type="range"
            min="1"
            max="4"
            value={machine.coordinatePrecision}
            onChange={(e) =>
              onUpdateMachine((m) => ({
                ...m,
                coordinatePrecision: parseInt(e.target.value),
              }))
            }
          />
        </div>
      </div>
    </div>
  );
};
