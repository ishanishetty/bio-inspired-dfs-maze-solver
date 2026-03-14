export type CellType = 'wall' | 'path' | 'start' | 'end' | 'trap' | 'dynamic' | 'food';

export type AlgorithmType = 'dfs' | 'aco' | 'hybrid' | 'abc';

export type MazeType = 'simple' | 'complex' | 'traps' | 'dynamic' | 'adaptive';

export interface Position {
  row: number;
  col: number;
}

export interface Cell {
  type: CellType;
  visited: boolean;
  distance: number;
  pheromone: number;
  isPath: boolean;
  isDFSPath: boolean;
  isACOPath: boolean;
  isHybridPath: boolean;
  isABCPath: boolean;
  temperature: number; // For dynamic obstacles
  lastVisited: number;
  explorationCount: number;
  heuristic: number;
}

export interface Maze {
  grid: Cell[][];
  width: number;
  height: number;
  start: Position;
  end: Position;
  traps: Position[];
  dynamicWalls: Position[];
  foodSources: Position[];
  timeStep: number;
}

export interface Ant {
  id: number;
  position: Position;
  path: Position[];
  visited: Set<string>;
  alive: boolean;
  fitness: number;
  energy: number;
  carryingFood: boolean;
  age: number;
  explorationTendency: number;
  pheromoneStrength: number;
}

export interface Bee {
  id: number;
  position: Position;
  path: Position[];
  visited: Set<string>;
  alive: boolean;
  fitness: number;
  energy: number;
  role: 'scout' | 'employed' | 'onlooker';
  danceStrength: number;
  followProbability: number;
}

export interface SolverState {
  currentPosition: Position | null;
  visitedCells: Set<string>;
  currentPath: Position[];
  ants: Ant[];
  bees: Bee[];
  generation: number;
  bestPath: Position[];
  isComplete: boolean;
  timeElapsed: number;
  convergenceHistory: number[];
  diversityIndex: number;
  explorationRate: number;
}

export interface AlgorithmMetrics {
  pathLength: number;
  executionTime: number;
  nodesExplored: number;
  efficiency: number;
  success: boolean;
  convergenceTime?: number;
  generations?: number;
  diversityMaintained?: number;
  adaptationRate?: number;
  energyConsumption?: number;
  explorationCoverage?: number;
}

export interface PerformanceData {
  dfs: AlgorithmMetrics;
  aco: AlgorithmMetrics;
  hybrid: AlgorithmMetrics;
  abc: AlgorithmMetrics;
  comparison: {
    speedImprovement: number;
    pathOptimality: number;
    explorationEfficiency: number;
    adaptability: number;
    robustness: number;
  };
}

export interface DynamicEnvironment {
  obstacles: Position[];
  movingWalls: Array<{
    position: Position;
    direction: Position;
    speed: number;
  }>;
  weatherConditions: {
    windDirection: Position;
    windStrength: number;
    temperature: number;
  };
  timeOfDay: number;
}