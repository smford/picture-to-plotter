import { ImageFilters } from '../../types';

export class LuminanceMap {
  public width: number;
  public height: number;
  public data: Float32Array;

  constructor(width: number, height: number, data?: Float32Array) {
    this.width = width;
    this.height = height;
    this.data = data || new Float32Array(width * height);
  }

  public get(x: number, y: number): number {
    const px = Math.max(0, Math.min(this.width - 1, Math.floor(x)));
    const py = Math.max(0, Math.min(this.height - 1, Math.floor(y)));
    return this.data[py * this.width + px];
  }

  public set(x: number, y: number, val: number): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.data[y * this.width + x] = Math.max(0, Math.min(1, val));
    }
  }

  // Bilinear interpolation for smooth subpixel sampling
  public sampleBilinear(u: number, v: number): number {
    const x = u * (this.width - 1);
    const y = v * (this.height - 1);

    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = Math.min(this.width - 1, x0 + 1);
    const y1 = Math.min(this.height - 1, y0 + 1);

    const fx = x - x0;
    const fy = y - y0;

    const v00 = this.data[y0 * this.width + x0];
    const v10 = this.data[y0 * this.width + x1];
    const v01 = this.data[y1 * this.width + x0];
    const v11 = this.data[y1 * this.width + x1];

    const top = v00 * (1 - fx) + v10 * fx;
    const bottom = v01 * (1 - fx) + v11 * fx;

    return top * (1 - fy) + bottom * fy;
  }

  public sampleLuminance(u: number, v: number): number {
    return this.sampleBilinear(u, v);
  }

  // Returns darkness value [0.0 = white, 1.0 = darkest black]
  public sampleDarkness(u: number, v: number): number {
    return 1.0 - this.sampleBilinear(u, v);
  }
}

/**
 * Apply filters to raw ImageData and extract normalized LuminanceMap
 */
export function processImageToLuminance(
  sourceImageData: ImageData,
  filters: ImageFilters
): { luminanceMap: LuminanceMap; processedImageData: ImageData } {
  const { width, height } = sourceImageData;
  const src = sourceImageData.data;
  const totalPixels = width * height;

  // 1. Initial Rec. 601 Grayscale conversion: L = 0.299R + 0.587G + 0.114B
  const rawLuminance = new Float32Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const r = src[idx];
    const g = src[idx + 1];
    const b = src[idx + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    rawLuminance[i] = lum;
  }

  let current: Float32Array<any> = new Float32Array(rawLuminance);

  // 2. Brightness & Contrast
  const c = Math.max(-100, Math.min(100, filters.contrast));
  const contrastFactor = (259 * (c + 255)) / (255 * (259 - c));
  const brightness = filters.brightness;

  for (let i = 0; i < totalPixels; i++) {
    let val = current[i];
    val += brightness * 2.55;
    val = contrastFactor * (val - 128) + 128;
    if (filters.gamma > 0 && filters.gamma !== 1) {
      val = 255 * Math.pow(Math.max(0, Math.min(255, val)) / 255, 1 / filters.gamma);
    }
    current[i] = Math.max(0, Math.min(255, val));
  }

  // 3. Gaussian Blur
  if (filters.blurRadius > 0) {
    current = applyGaussianBlur(current, width, height, filters.blurRadius);
  }

  // 4. Edge Detection (Sobel filter)
  if (filters.edgeDetection) {
    const edges = applySobelFilter(current, width, height);
    const blend = Math.max(0, Math.min(1, filters.edgeBlend));
    for (let i = 0; i < totalPixels; i++) {
      const edgeDark = 255 - edges[i];
      current[i] = current[i] * (1 - blend) + edgeDark * blend;
    }
  }

  // 5. Thresholding (Binarize)
  if (filters.thresholdEnabled) {
    const thresh = filters.thresholdValue;
    for (let i = 0; i < totalPixels; i++) {
      current[i] = current[i] >= thresh ? 255 : 0;
    }
  }

  // 6. Invert Luminance
  if (filters.invert) {
    for (let i = 0; i < totalPixels; i++) {
      current[i] = 255 - current[i];
    }
  }

  const normalizedData = new Float32Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) {
    normalizedData[i] = current[i] / 255.0;
  }
  const luminanceMap = new LuminanceMap(width, height, normalizedData);

  const outImgData = new ImageData(
    new Uint8ClampedArray(totalPixels * 4),
    width,
    height
  );
  const outDst = outImgData.data;
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const v = Math.round(current[i]);
    outDst[idx] = v;
    outDst[idx + 1] = v;
    outDst[idx + 2] = v;
    outDst[idx + 3] = 255;
  }

  return { luminanceMap, processedImageData: outImgData };
}

/**
 * Fast Separable 1D Gaussian Blur
 */
function applyGaussianBlur(
  src: Float32Array<any>,
  width: number,
  height: number,
  radius: number
): Float32Array<any> {
  const sigma = Math.max(0.5, radius / 2);
  const kSize = Math.ceil(radius * 2) * 2 + 1;
  const half = Math.floor(kSize / 2);
  const kernel = new Float32Array(kSize);

  let sum = 0;
  for (let i = 0; i < kSize; i++) {
    const x = i - half;
    const g = Math.exp(-(x * x) / (2 * sigma * sigma));
    kernel[i] = g;
    sum += g;
  }
  for (let i = 0; i < kSize; i++) {
    kernel[i] /= sum;
  }

  const temp = new Float32Array(width * height);
  const output = new Float32Array(width * height);

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    const yOffset = y * width;
    for (let x = 0; x < width; x++) {
      let acc = 0;
      for (let k = 0; k < kSize; k++) {
        const kx = Math.max(0, Math.min(width - 1, x + k - half));
        acc += src[yOffset + kx] * kernel[k];
      }
      temp[yOffset + x] = acc;
    }
  }

  // Vertical pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let acc = 0;
      for (let k = 0; k < kSize; k++) {
        const ky = Math.max(0, Math.min(height - 1, y + k - half));
        acc += temp[ky * width + x] * kernel[k];
      }
      output[y * width + x] = acc;
    }
  }

  return output;
}

/**
 * Sobel Edge Gradient Magnitude Filter
 */
function applySobelFilter(
  src: Float32Array<any>,
  width: number,
  height: number
): Float32Array<any> {
  const output = new Float32Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p00 = src[(y - 1) * width + (x - 1)];
      const p01 = src[(y - 1) * width + x];
      const p02 = src[(y - 1) * width + (x + 1)];

      const p10 = src[y * width + (x - 1)];
      const p12 = src[y * width + (x + 1)];

      const p20 = src[(y + 1) * width + (x - 1)];
      const p21 = src[(y + 1) * width + x];
      const p22 = src[(y + 1) * width + (x + 1)];

      const gx = -p00 + p02 - 2 * p10 + 2 * p12 - p20 + p22;
      const gy = -p00 - 2 * p01 - p02 + p20 + 2 * p21 + p22;

      const mag = Math.sqrt(gx * gx + gy * gy);
      output[y * width + x] = Math.min(255, mag);
    }
  }

  return output;
}
