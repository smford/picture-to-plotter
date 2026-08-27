export interface SampleImageMeta {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  generate: () => ImageData;
}

export const SAMPLE_IMAGES: SampleImageMeta[] = [
  {
    id: 'portrait',
    name: 'Classic Portrait',
    category: 'Portraits',
    width: 600,
    height: 750,
    generate: () => generatePortraitImage(600, 750),
  },
  {
    id: 'landscape',
    name: 'Mountain Sunrise',
    category: 'Landscapes',
    width: 800,
    height: 600,
    generate: () => generateLandscapeImage(800, 600),
  },
  {
    id: 'mandala',
    name: 'Sacred Mandala',
    category: 'Geometric',
    width: 650,
    height: 650,
    generate: () => generateMandalaImage(650, 650),
  },
  {
    id: 'architecture',
    name: 'Modern Architecture',
    category: 'Structural',
    width: 700,
    height: 700,
    generate: () => generateArchitectureImage(700, 700),
  },
  {
    id: 'calibration',
    name: 'CAM Test Pattern',
    category: 'Calibration',
    width: 700,
    height: 500,
    generate: () => generateCalibrationImage(700, 500),
  },
];

function generatePortraitImage(w: number, h: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.4, 50, w * 0.5, h * 0.5, w * 0.8);
  bgGrad.addColorStop(0, '#f0f0f4');
  bgGrad.addColorStop(1, '#a8b0c0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Bust / shoulders
  ctx.fillStyle = '#2d3748';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.95, w * 0.45, h * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Neck
  ctx.fillStyle = '#c5b09d';
  ctx.fillRect(w * 0.42, h * 0.55, w * 0.16, h * 0.2);

  // Neck shadow
  const neckShadow = ctx.createLinearGradient(0, h * 0.55, 0, h * 0.7);
  neckShadow.addColorStop(0, 'rgba(40,25,20,0.6)');
  neckShadow.addColorStop(1, 'rgba(40,25,20,0.0)');
  ctx.fillStyle = neckShadow;
  ctx.fillRect(w * 0.42, h * 0.55, w * 0.16, h * 0.2);

  // Head base
  ctx.fillStyle = '#e8d4c3';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.42, w * 0.22, h * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Face lighting / cheek shading
  const faceShade = ctx.createRadialGradient(w * 0.42, h * 0.38, 20, w * 0.5, h * 0.45, w * 0.25);
  faceShade.addColorStop(0, 'rgba(255,255,255,0.6)');
  faceShade.addColorStop(0.6, 'rgba(200,160,140,0.2)');
  faceShade.addColorStop(1, 'rgba(90,60,50,0.6)');
  ctx.fillStyle = faceShade;
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.42, w * 0.22, h * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#1a181b';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.28, w * 0.26, h * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(w * 0.3, h * 0.4, w * 0.08, h * 0.22, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(w * 0.7, h * 0.4, w * 0.08, h * 0.22, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = '#2b1d14';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(w * 0.41, h * 0.36, 25, Math.PI * 1.1, Math.PI * 1.8);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(w * 0.59, h * 0.36, 25, Math.PI * 1.2, Math.PI * 1.9);
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(w * 0.41, h * 0.39, 18, 10, 0, 0, Math.PI * 2);
  ctx.ellipse(w * 0.59, h * 0.39, 18, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#231c16';
  ctx.beginPath();
  ctx.arc(w * 0.41, h * 0.39, 7, 0, Math.PI * 2);
  ctx.arc(w * 0.59, h * 0.39, 7, 0, Math.PI * 2);
  ctx.fill();

  // Eyeliner
  ctx.strokeStyle = '#1a181b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(w * 0.41, h * 0.39, 18, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w * 0.59, h * 0.39, 18, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();

  // Nose
  ctx.strokeStyle = '#855b43';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.38);
  ctx.lineTo(w * 0.51, h * 0.47);
  ctx.lineTo(w * 0.48, h * 0.48);
  ctx.stroke();

  // Lips
  ctx.fillStyle = '#9b4845';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.55, 24, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#4e1e1d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.44, h * 0.55);
  ctx.lineTo(w * 0.56, h * 0.55);
  ctx.stroke();

  return ctx.getImageData(0, 0, w, h);
}

function generateLandscapeImage(w: number, h: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  skyGrad.addColorStop(0, '#0c1d36');
  skyGrad.addColorStop(0.4, '#4a628a');
  skyGrad.addColorStop(0.7, '#d89b62');
  skyGrad.addColorStop(1, '#ffeed4');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Glowing Sun
  const sunGrad = ctx.createRadialGradient(w * 0.5, h * 0.4, 10, w * 0.5, h * 0.4, 120);
  sunGrad.addColorStop(0, '#ffffff');
  sunGrad.addColorStop(0.3, '#ffea78');
  sunGrad.addColorStop(1, 'rgba(255, 180, 50, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.4, 120, 0, Math.PI * 2);
  ctx.fill();

  // Distant Mountain range
  ctx.fillStyle = '#445168';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.55);
  ctx.lineTo(w * 0.15, h * 0.35);
  ctx.lineTo(w * 0.35, h * 0.48);
  ctx.lineTo(w * 0.5, h * 0.3);
  ctx.lineTo(w * 0.7, h * 0.45);
  ctx.lineTo(w * 0.85, h * 0.32);
  ctx.lineTo(w, h * 0.5);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Foreground Mountain range
  ctx.fillStyle = '#1e2638';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.65);
  ctx.lineTo(w * 0.25, h * 0.42);
  ctx.lineTo(w * 0.45, h * 0.58);
  ctx.lineTo(w * 0.65, h * 0.4);
  ctx.lineTo(w * 0.9, h * 0.62);
  ctx.lineTo(w, h * 0.55);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Lake surface
  const waterGrad = ctx.createLinearGradient(0, h * 0.65, 0, h);
  waterGrad.addColorStop(0, '#1a2233');
  waterGrad.addColorStop(0.5, '#2e3d55');
  waterGrad.addColorStop(1, '#111722');
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, h * 0.65, w, h * 0.35);

  // Water reflections of sun
  ctx.fillStyle = 'rgba(255, 230, 150, 0.4)';
  for (let y = h * 0.67; y < h; y += 4) {
    const rw = (y - h * 0.65) * 1.5;
    ctx.fillRect(w * 0.5 - rw / 2, y, rw, 2);
  }

  // Pine trees silhouettes
  ctx.fillStyle = '#0a0d14';
  const drawTree = (tx: number, ty: number, th: number) => {
    ctx.beginPath();
    ctx.moveTo(tx, ty - th);
    ctx.lineTo(tx + th * 0.25, ty);
    ctx.lineTo(tx - th * 0.25, ty);
    ctx.closePath();
    ctx.fill();
  };

  for (let i = 0; i < 20; i++) {
    const tx = (i / 19) * w * 0.4;
    const th = 40 + Math.sin(i * 1.7) * 20;
    drawTree(tx, h * 0.75 + i * 2, th);
  }

  return ctx.getImageData(0, 0, w, h);
}

function generateMandalaImage(w: number, h: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(w, h) * 0.45;

  ctx.strokeStyle = '#111827';
  ctx.fillStyle = '#1f2937';

  // Concentric decorative rings
  for (let r = 30; r < maxR; r += 35) {
    ctx.lineWidth = (r % 70 === 0) ? 4 : 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    const petals = 12 + Math.floor(r / 20) * 4;
    for (let p = 0; p < petals; p++) {
      const angle = (p / petals) * Math.PI * 2;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;

      ctx.beginPath();
      ctx.arc(px, py, 6 + (r % 20), 0, Math.PI * 2);
      if ((p + r) % 3 === 0) {
        ctx.fill();
      } else {
        ctx.stroke();
      }
    }
  }

  // Radial rays
  const rays = 36;
  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2;
    ctx.lineWidth = i % 2 === 0 ? 3 : 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 40, cy + Math.sin(angle) * 40);
    ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
    ctx.stroke();
  }

  return ctx.getImageData(0, 0, w, h);
}

function generateArchitectureImage(w: number, h: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#dbeafe');
  sky.addColorStop(1, '#93c5fd');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Modern angled skyscraper 1
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(w * 0.1, h);
  ctx.lineTo(w * 0.25, h * 0.15);
  ctx.lineTo(w * 0.55, h * 0.25);
  ctx.lineTo(w * 0.5, h);
  ctx.closePath();
  ctx.fill();

  // Glass facade highlights / shadows on Skyscraper 1
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(w * 0.55, h * 0.25);
  ctx.lineTo(w * 0.7, h * 0.35);
  ctx.lineTo(w * 0.65, h);
  ctx.lineTo(w * 0.5, h);
  ctx.closePath();
  ctx.fill();

  // Window grid lines
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  for (let y = h * 0.25; y < h; y += 18) {
    const factor = (y - h * 0.15) / (h * 0.85);
    const xLeft = w * 0.25 - (w * 0.15) * factor;
    const xRight = w * 0.55 - (w * 0.05) * factor;
    ctx.beginPath();
    ctx.moveTo(xLeft, y);
    ctx.lineTo(xRight, y + 15);
    ctx.stroke();
  }

  // Geometric Building 2
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(w * 0.58, h);
  ctx.lineTo(w * 0.65, h * 0.4);
  ctx.lineTo(w * 0.95, h * 0.45);
  ctx.lineTo(w * 0.92, h);
  ctx.closePath();
  ctx.fill();

  return ctx.getImageData(0, 0, w, h);
}

function generateCalibrationImage(w: number, h: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  // Outer border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, w - 40, h - 40);

  // Grayscale step wedge (10 steps from 0% to 100% black)
  const steps = 10;
  const stepW = (w - 80) / steps;
  const stepH = 50;
  const stepY = 50;

  for (let i = 0; i < steps; i++) {
    const val = Math.round((i / (steps - 1)) * 255);
    ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
    ctx.fillRect(40 + i * stepW, stepY, stepW, stepH);
    ctx.strokeRect(40 + i * stepW, stepY, stepW, stepH);
  }

  // Continuous gradient bar
  const grad = ctx.createLinearGradient(40, 0, w - 40, 0);
  grad.addColorStop(0, '#000000');
  grad.addColorStop(0.5, '#888888');
  grad.addColorStop(1, '#ffffff');
  ctx.fillStyle = grad;
  ctx.fillRect(40, stepY + stepH + 20, w - 80, 40);
  ctx.strokeRect(40, stepY + stepH + 20, w - 80, 40);

  // Concentric circles (resolution target)
  const cx = w * 0.3;
  const cy = h * 0.68;
  for (let r = 10; r <= 80; r += 10) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.lineWidth = r % 20 === 0 ? 3 : 1;
    ctx.stroke();
  }

  // Crosshair
  ctx.beginPath();
  ctx.moveTo(cx - 90, cy);
  ctx.lineTo(cx + 90, cy);
  ctx.moveTo(cx, cy - 90);
  ctx.lineTo(cx, cy + 90);
  ctx.stroke();

  // Slanted line frequency test
  const lx = w * 0.65;
  const ly = h * 0.55;
  for (let i = 0; i < 25; i++) {
    const spacing = 2 + Math.pow(i * 0.3, 1.8);
    ctx.beginPath();
    ctx.moveTo(lx + spacing * 4, ly);
    ctx.lineTo(lx + spacing * 4 - 20, ly + 140);
    ctx.lineWidth = 1 + (i % 3) * 0.8;
    ctx.stroke();
  }

  return ctx.getImageData(0, 0, w, h);
}
