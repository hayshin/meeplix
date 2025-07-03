interface GradientOptions {
  canvas: HTMLCanvasElement | string;
  colors: string[];
  wireframe?: boolean;
  density?: [number, number];
  angle?: number;
  amplitude?: number;
  static?: boolean;
  loadedClass?: string;
  zoom?: number;
  speed?: number;
  rotation?: number;
}

declare class Gradient {
  constructor(options: GradientOptions);
  pause(): void;
  play(): void;
  disconnect(): void;
  resize(): void;
}

declare global {
  interface Window {
    Gradient: typeof Gradient;
  }
}

export {};
