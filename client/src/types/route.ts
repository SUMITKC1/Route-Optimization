export type Point = { 
  label: string; 
  lat: number; 
  lng: number; 
};

export interface RouteStep {
  point: Point;
  distance: number;
  cumulativeDistance: number;
  estimatedTime: number;
}

export interface RouteOptimizationResult {
  route: Point[];
  distance: number;
  duration: number;
  executionTime: number;
  steps: string[];
  algorithm: string;
} 