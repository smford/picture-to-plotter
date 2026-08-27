import { useEffect, useRef, useState, useCallback } from 'react';
import {
  AlgorithmConfig,
  ImageFilters,
  OptimizationParams,
  Path,
  TelemetryMetrics,
  WorkerGenerateRequest,
  WorkerMessage,
} from '../types';

export interface UsePlotterWorkerReturn {
  isGenerating: boolean;
  progress: number;
  phase: string;
  rawPaths: Path[];
  optimizedPaths: Path[];
  metrics: TelemetryMetrics | null;
  preprocessedImageData: ImageData | null;
  error: string | null;
  generate: (
    imageData: ImageData,
    filters: ImageFilters,
    algorithm: AlgorithmConfig,
    optimization: OptimizationParams,
    dimensions: { widthMm: number; heightMm: number; marginMm: number; fitMode: any }
  ) => void;
}

export function usePlotterWorker(): UsePlotterWorkerReturn {
  const workerRef = useRef<Worker | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('');
  const [rawPaths, setRawPaths] = useState<Path[]>([]);
  const [optimizedPaths, setOptimizedPaths] = useState<Path[]>([]);
  const [metrics, setMetrics] = useState<TelemetryMetrics | null>(null);
  const [preprocessedImageData, setPreprocessedImageData] = useState<ImageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentJobIdRef = useRef<string>('');

  useEffect(() => {
    // Instantiate Vite Web Worker
    const worker = new Worker(
      new URL('../workers/plotter.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const msg = event.data;
      if (msg.id !== currentJobIdRef.current) return;

      if (msg.type === 'PROGRESS') {
        setProgress(msg.progress);
        setPhase(msg.phase);
      } else if (msg.type === 'SUCCESS') {
        setIsGenerating(false);
        setProgress(1);
        setPhase('Complete');
        setRawPaths(msg.rawPaths);
        setOptimizedPaths(msg.optimizedPaths);
        setMetrics(msg.metrics);
        if (msg.preprocessedImageData) {
          setPreprocessedImageData(msg.preprocessedImageData);
        }
        setError(null);
      } else if (msg.type === 'ERROR') {
        setIsGenerating(false);
        setError(msg.error);
      }
    };

    worker.onerror = (err) => {
      console.error('Worker error:', err);
      setIsGenerating(false);
      setError('Worker encountered an error');
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  const generate = useCallback(
    (
      imageData: ImageData,
      filters: ImageFilters,
      algorithm: AlgorithmConfig,
      optimization: OptimizationParams,
      dimensions: { widthMm: number; heightMm: number; marginMm: number; fitMode: any }
    ) => {
      if (!workerRef.current) return;

      const jobId = `${Date.now()}-${Math.random()}`;
      currentJobIdRef.current = jobId;

      setIsGenerating(true);
      setProgress(0.05);
      setPhase('Starting generation...');
      setError(null);

      const request: WorkerGenerateRequest = {
        type: 'GENERATE',
        id: jobId,
        imageData,
        filters,
        algorithm,
        optimization,
        dimensions,
      };

      workerRef.current.postMessage(request);
    },
    []
  );

  return {
    isGenerating,
    progress,
    phase,
    rawPaths,
    optimizedPaths,
    metrics,
    preprocessedImageData,
    error,
    generate,
  };
}
