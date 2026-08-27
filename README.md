# VectorPlotter CAM

A production-ready, high-performance, 100% client-side web application that converts raster photographs into optimized, CAM-ready vector plotter artwork with instant export to **Plotter-Ready SVG**, **AutoCAD R12 DXF**, and **CNC G-Code (.gcode / .nc)**.

![VectorPlotter CAM Preview](https://raw.githubusercontent.com/smford/picture-to-plotter/main/preview.png)

---

## 🌟 Key Features

### 1. 🖼️ Real-Time Image Preprocessing
- **Drag-and-Drop / File Picker:** Supports PNG, JPEG, and WebP.
- **Built-in Test Patterns & Samples:** Classic Portrait, Mountain Sunrise, Sacred Mandala, Architecture, and CAM Calibration targets.
- **Rec. 601 Grayscale Conversion:** Standard $0.299R + 0.587G + 0.114B$ luminance extraction.
- **Parametric Filters:** Real-time Brightness, Contrast, Gamma/Exposure, Invert Luminance, Separable Gaussian Blur/Smoothing, Sobel Edge Enhancement with blend control, and Binarization Thresholding.

### 2. 🎨 6 Vector Generation Algorithms
- **Squiggle / Waveform:** Horizontal, vertical, or angled scanlines where frequency and amplitude oscillate inversely with luminance. Includes **Serpentine Snake Routing** to connect scanlines into unbroken paths.
- **Adaptive Cross-Hatching:** Multi-pass strokes at configurable angles (45°, 135°, 0°, 90°) with layered darkness thresholds reproducing vintage copperplate engravings.
- **Archimedean Spiral:** A continuous single spiral from center to edge with radial wave modulation (**0 pen lifts**).
- **Stippling & 2-Opt TSP Tour:** Luminance-weighted stipple generator (Floyd-Steinberg error diffusion, rejection sampling, or Lloyd's Voronoi relaxation) connected into a continuous single-stroke tour using a **2-Opt Travelling Salesperson solver**.
- **Topographic Contours:** Marching squares iso-luminance elevation lines with Chaikin curve smoothing.
- **Flow Field Streamlines:** Isophote and gradient vector streamlines following image features.

### 3. ⚙️ CAM & Toolpath Optimization Engine
- **Ramer-Douglas-Peucker (RDP) Polyline Simplification:** Eliminates redundant collinear vertices within user-defined geometric tolerance ($\epsilon = 0.01\text{mm} - 0.5\text{mm}$), reducing vector density by 70–85% without sacrificing visual quality.
- **Greedy Nearest-Neighbor Path Sorter:** Re-orders disconnected strokes in 2D space to minimize rapid pen-up transit. Automatically reverses sub-paths if entering from the opposite end produces shorter travel.
- **Micro-Segment Filtering:** Removes sub-millimeter stutter dots and zero-length movements.

### 4. 📊 Live Machine Telemetry HUD
- **Total Path Count:** Number of pen-downs / individual strokes.
- **Drawing Distance:** Total pen-down distance in meters and millimeters.
- **Rapid Air Transit:** Pen-up travel distance in meters and millimeters.
- **Estimated Plot Time:** Calculated in real-time from feedrate, rapid travel rate, and pen servo dwell delays.
- **RDP Compression & Efficiency:** Live vertex reduction metrics and drawing vs air transit efficiency score.

### 5. 🖥️ Interactive CAD Viewport
- **Pan & Zoom:** Smooth cursor-anchored wheel zoom, mouse drag pan, fit to screen, and 100% zoom reset.
- **Layer Overlays:** Toggle Vector paths, Preprocessed Image overlay with opacity slider, Pen-Up rapid travel lines (dashed red vectors), RDP vertices, Machine Bed Grid, and Physical Millimeter Rulers.
- **Plot Simulation Mode:** Real-time animated scrubber with Play/Pause, speed multipliers (1x–50x), and live toolhead coordinate crosshair tracking pen state (drawing green vs flying red).

### 6. 💾 Standard CAM Exporters
- **Plotter-Ready SVG:** Pure `M` and `L` commands, physical millimeter units (`width="...mm"`, `viewBox="0 0 W H"`), zero extraneous metadata layers, and optional pen-up transit layer.
- **AutoCAD R12 ASCII DXF:** Zero-dependency DXF writer outputting `POLYLINE` and `VERTEX` entities on layer `0` or `PLOTTER_ART` with selectable Y-axis orientation.
- **Universal G-Code (.gcode / .nc):** Configurable `G0` (rapid travel) and `G1` (draw feed) commands with support for **Servo Z-axis** (`G0 Z...` / `G1 Z...`), **Laser/Spindle PWM** (`M3 S...` / `M5`), or **Custom G-code**. Includes coordinate origin selection (Top-Left, Bottom-Left, Center) and built-in code previewer.

---

## 🚀 Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/smford/picture-to-plotter.git
cd picture-to-plotter

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Concurrency:** Native Web Worker with Transferable typed arrays and `OffscreenCanvas` for 60 FPS UI performance
- **Icons:** `lucide-react`
- **Geometry & Math:** Computational Geometry (RDP, 2-Opt TSP, Marching Squares, Voronoi Relaxation, Bilinear Interpolation, Rec. 601 Luminance)
- **Exporters:** Zero-dependency SVG, AutoCAD R12 DXF, and G-Code generators

---

## 📄 License

MIT License. Crafted with precision for pen plotters, laser engravers, and CNC artists.
