import { Path, MachineSettings, PhysicalDimensions } from '../../types';

export interface GcodeExportOptions {
  machine: MachineSettings;
  dimensions: PhysicalDimensions;
}

/**
 * Standard CAM G-Code (.gcode / .nc) Exporter
 */
export function exportToGcode(paths: Path[], options: GcodeExportOptions): string {
  const { machine, dimensions } = options;
  const prec = machine.coordinatePrecision || 3;
  const fmt = (n: number) => n.toFixed(prec);

  let paperHeightMm = dimensions.paperSize === 'Custom' ? dimensions.customHeightMm : 297;
  let paperWidthMm = dimensions.paperSize === 'Custom' ? dimensions.customWidthMm : 210;

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
  }

  const transformPoint = (pt: [number, number]): [number, number] => {
    let [x, y] = pt;

    if (machine.gcodeOrigin === 'bottom-left') {
      y = paperHeightMm - y;
    } else if (machine.gcodeOrigin === 'center') {
      x = x - paperWidthMm / 2;
      y = paperHeightMm / 2 - y;
    }

    return [x, y];
  };

  const lines: string[] = [];

  // Preamble / Header
  lines.push('; ============================================================');
  lines.push('; VectorPlotter CAM G-Code Export');
  lines.push(`; Paper: ${dimensions.paperSize} (${paperWidthMm}mm x ${paperHeightMm}mm)`);
  lines.push(`; Total Paths (Pen-Downs): ${paths.length}`);
  lines.push(`; Feedrate: ${machine.feedrate} mm/min | Rapid: ${machine.rapidFeedrate} mm/min`);
  lines.push(`; Origin Mode: ${machine.gcodeOrigin}`);
  lines.push('; ============================================================');
  lines.push('');

  // Default metric setup if preamble is empty or custom
  if (machine.preamble && machine.preamble.trim().length > 0) {
    lines.push(machine.preamble.trim());
  } else {
    lines.push('G21 ; Set units to millimeters');
    lines.push('G90 ; Set positioning to absolute');
    lines.push('G92 X0 Y0 Z0 ; Set current position as origin');
  }

  const getPenUpCommands = (): string[] => {
    if (machine.penLiftMethod === 'servo-z') {
      return [`G0 Z${fmt(machine.penUpZ)} ; Pen UP`];
    } else if (machine.penLiftMethod === 'spindle-pwm') {
      return [`M5 ; Spindle/Laser OFF`, `G0 Z${fmt(machine.penUpZ)}`];
    } else if (machine.penLiftMethod === 'custom') {
      return [machine.customPenUpGcode || 'G0 Z3.0'];
    }
    return [`G0 Z${fmt(machine.penUpZ)}`];
  };

  const getPenDownCommands = (): string[] => {
    const cmds: string[] = [];
    if (machine.penLiftMethod === 'servo-z') {
      cmds.push(`G1 Z${fmt(machine.penDownZ)} F1000 ; Pen DOWN`);
    } else if (machine.penLiftMethod === 'spindle-pwm') {
      cmds.push(`M3 S${machine.laserPowerDown} ; Spindle/Laser ON`);
      cmds.push(`G1 Z${fmt(machine.penDownZ)} F1000`);
    } else if (machine.penLiftMethod === 'custom') {
      cmds.push(machine.customPenDownGcode || 'G1 Z0.0 F1000');
    }

    if (machine.penDownDelayMs > 0) {
      cmds.push(`G4 P${machine.penDownDelayMs} ; Dwell settling delay`);
    }
    return cmds;
  };

  // Initial Pen Up
  lines.push('');
  lines.push('; Ensure pen is lifted before starting');
  getPenUpCommands().forEach(c => lines.push(c));
  lines.push('');

  // Path execution
  for (let pIdx = 0; pIdx < paths.length; pIdx++) {
    const path = paths[pIdx];
    if (path.length < 2) continue;

    lines.push(`; --- Path ${pIdx + 1} / ${paths.length} ---`);

    // Rapid travel to start of path
    const [startX, startY] = transformPoint(path[0]);
    lines.push(`G0 X${fmt(startX)} Y${fmt(startY)} F${machine.rapidFeedrate}`);

    // Lower pen
    getPenDownCommands().forEach(c => lines.push(c));

    // Linear cutting / drawing feed
    for (let i = 1; i < path.length; i++) {
      const [px, py] = transformPoint(path[i]);
      lines.push(`G1 X${fmt(px)} Y${fmt(py)} F${machine.feedrate}`);
    }

    // Lift pen
    getPenUpCommands().forEach(c => lines.push(c));
    lines.push('');
  }

  // Postamble
  lines.push('; ============================================================');
  lines.push('; Postamble / Job Finish');
  if (machine.postamble && machine.postamble.trim().length > 0) {
    lines.push(machine.postamble.trim());
  } else {
    lines.push('G0 X0 Y0 F' + machine.rapidFeedrate + ' ; Return to home');
    lines.push('M2 ; End of program');
  }
  lines.push('; ============================================================');

  return lines.join('\n');
}
