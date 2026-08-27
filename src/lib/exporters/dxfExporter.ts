import { Path, PhysicalDimensions } from '../../types';

export interface DxfExportOptions {
  dimensions: PhysicalDimensions;
  invertY?: boolean;
  layerName?: string;
}

/**
 * Clean zero-dependency AutoCAD R12 ASCII DXF Writer
 */
export function exportToDXF(paths: Path[], options: DxfExportOptions): string {
  const { dimensions, invertY = true, layerName = 'PLOTTER_ART' } = options;

  let heightMm = dimensions.paperSize === 'Custom' ? dimensions.customHeightMm : 297;
  if (dimensions.paperSize === 'A4') heightMm = dimensions.orientation === 'landscape' ? 210 : 297;
  else if (dimensions.paperSize === 'A3') heightMm = dimensions.orientation === 'landscape' ? 297 : 420;
  else if (dimensions.paperSize === 'A5') heightMm = dimensions.orientation === 'landscape' ? 148 : 210;
  else if (dimensions.paperSize === 'Letter') heightMm = dimensions.orientation === 'landscape' ? 215.9 : 279.4;

  const lines: string[] = [];

  const add = (code: number | string, val: string | number) => {
    lines.push(code.toString());
    lines.push(val.toString());
  };

  // 1. HEADER SECTION
  add(0, 'SECTION');
  add(2, 'HEADER');
  add(9, '$ACADVER');
  add(1, 'AC1009'); // AutoCAD R12
  add(9, '$INSUNITS');
  add(70, 4); // Millimeters
  add(0, 'ENDSEC');

  // 2. TABLES SECTION
  add(0, 'SECTION');
  add(2, 'TABLES');
  add(0, 'TABLE');
  add(2, 'LAYER');
  add(70, 1);
  add(0, 'LAYER');
  add(2, layerName);
  add(70, 0);
  add(62, 7); // White / Black color
  add(6, 'CONTINUOUS');
  add(0, 'ENDTAB');
  add(0, 'ENDSEC');

  // 3. BLOCKS SECTION
  add(0, 'SECTION');
  add(2, 'BLOCKS');
  add(0, 'ENDSEC');

  // 4. ENTITIES SECTION
  add(0, 'SECTION');
  add(2, 'ENTITIES');

  for (const path of paths) {
    if (path.length < 2) continue;

    // Start 2D Polyline
    add(0, 'POLYLINE');
    add(8, layerName);
    add(66, 1); // Vertices follow
    add(70, 0); // Open polyline

    for (const pt of path) {
      const x = pt[0];
      const y = invertY ? (heightMm - pt[1]) : pt[1];

      add(0, 'VERTEX');
      add(8, layerName);
      add(10, x.toFixed(4));
      add(20, y.toFixed(4));
      add(30, '0.0');
    }

    add(0, 'SEQEND');
  }

  add(0, 'ENDSEC');
  add(0, 'EOF');

  return lines.join('\r\n') + '\r\n';
}
