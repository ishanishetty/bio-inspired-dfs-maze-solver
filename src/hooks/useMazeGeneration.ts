import { useState, useCallback } from 'react';
import { Maze, MazeType, Cell, Position } from '../types/maze';

export const useMazeGeneration = () => {
  const [maze, setMaze] = useState<Maze | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const createEmptyMaze = (width: number, height: number): Cell[][] => {
    return Array(height).fill(null).map((_, row) =>
      Array(width).fill(null).map((_, col) => ({
        type: 'wall' as const,
        visited: false,
        distance: Infinity,
        pheromone: 0,
        isPath: false,
        isDFSPath: false,
        isACOPath: false,
        isHybridPath: false,
        isABCPath: false,
        temperature: 20 + Math.random() * 10, // Base temperature variation
        lastVisited: 0,
        explorationCount: 0,
        heuristic: Math.sqrt(Math.pow(row - height + 2, 2) + Math.pow(col - width + 2, 2))
      }))
    );
  };

  const isValidPosition = (row: number, col: number, width: number, height: number): boolean => {
    return row >= 0 && row < height && col >= 0 && col < width;
  };

  const getNeighbors = (row: number, col: number, width: number, height: number): Position[] => {
    const directions = [
      { row: -2, col: 0 },  // Up
      { row: 2, col: 0 },   // Down
      { row: 0, col: -2 },  // Left
      { row: 0, col: 2 }    // Right
    ];

    return directions
      .map(dir => ({ row: row + dir.row, col: col + dir.col }))
      .filter(pos => isValidPosition(pos.row, pos.col, width, height));
  };

  const generateRecursiveBacktracker = (width: number, height: number): Cell[][] => {
    const grid = createEmptyMaze(width, height);
    const stack: Position[] = [];
    const start = { row: 1, col: 1 };
    
    grid[start.row][start.col].type = 'path';
    grid[start.row][start.col].visited = true;
    stack.push(start);

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = getNeighbors(current.row, current.col, width, height)
        .filter(pos => !grid[pos.row][pos.col].visited);

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        // Remove wall between current and next
        const wallRow = (current.row + next.row) / 2;
        const wallCol = (current.col + next.col) / 2;
        
        grid[wallRow][wallCol].type = 'path';
        grid[next.row][next.col].type = 'path';
        grid[next.row][next.col].visited = true;
        
        stack.push(next);
      } else {
        stack.pop();
      }
    }

    return grid;
  };

  const generatePerlinNoise = (width: number, height: number, scale: number = 0.1): number[][] => {
    const noise: number[][] = [];
    for (let y = 0; y < height; y++) {
      noise[y] = [];
      for (let x = 0; x < width; x++) {
        // Simplified Perlin-like noise
        const value = Math.sin(x * scale) * Math.cos(y * scale) + 
                     Math.sin(x * scale * 2) * Math.cos(y * scale * 2) * 0.5 +
                     Math.sin(x * scale * 4) * Math.cos(y * scale * 4) * 0.25;
        noise[y][x] = (value + 1) / 2; // Normalize to 0-1
      }
    }
    return noise;
  };

  const addDynamicFeatures = (
    grid: Cell[][], 
    width: number, 
    height: number, 
    type: MazeType
  ): { traps: Position[], dynamicWalls: Position[], foodSources: Position[] } => {
    const traps: Position[] = [];
    const dynamicWalls: Position[] = [];
    const foodSources: Position[] = [];

    if (type === 'complex') {
      // Add branching paths using cellular automata
      for (let iteration = 0; iteration < 3; iteration++) {
        const newGrid = grid.map(row => [...row]);
        for (let row = 1; row < height - 1; row++) {
          for (let col = 1; col < width - 1; col++) {
            if (grid[row][col].type === 'wall') {
              const pathNeighbors = [
                grid[row-1][col], grid[row+1][col], 
                grid[row][col-1], grid[row][col+1]
              ].filter(cell => cell.type === 'path').length;
              
              if (pathNeighbors >= 2 && Math.random() < 0.3) {
                newGrid[row][col].type = 'path';
              }
            }
          }
        }
        grid = newGrid;
      }
    } else if (type === 'traps') {
      // Strategic trap placement using heat map
      const heatMap = generatePerlinNoise(width, height, 0.05);
      const trapCount = Math.floor(width * height * 0.03);
      
      for (let i = 0; i < trapCount; i++) {
        let bestPos: Position | null = null;
        let bestScore = -1;
        
        for (let attempts = 0; attempts < 50; attempts++) {
          const row = Math.floor(Math.random() * height);
          const col = Math.floor(Math.random() * width);
          
          if (grid[row][col].type === 'path') {
            const score = heatMap[row][col] + Math.random() * 0.3;
            if (score > bestScore) {
              bestScore = score;
              bestPos = { row, col };
            }
          }
        }
        
        if (bestPos) {
          grid[bestPos.row][bestPos.col].type = 'trap';
          traps.push(bestPos);
        }
      }
    } else if (type === 'dynamic') {
      // Moving obstacles with predictable patterns
      const dynamicCount = Math.floor(width * height * 0.02);
      for (let i = 0; i < dynamicCount; i++) {
        const row = Math.floor(Math.random() * height);
        const col = Math.floor(Math.random() * width);
        if (grid[row][col].type === 'path') {
          grid[row][col].type = 'dynamic';
          grid[row][col].temperature = 35 + Math.random() * 15; // Higher temperature for dynamic
          dynamicWalls.push({ row, col });
        }
      }
    } else if (type === 'adaptive') {
      // Add food sources for more realistic foraging behavior
      const foodCount = Math.floor(width * height * 0.01);
      for (let i = 0; i < foodCount; i++) {
        const row = Math.floor(Math.random() * height);
        const col = Math.floor(Math.random() * width);
        if (grid[row][col].type === 'path') {
          grid[row][col].type = 'food';
          foodSources.push({ row, col });
        }
      }
      
      // Add some traps near food sources (realistic danger)
      foodSources.forEach(food => {
        if (Math.random() < 0.4) {
          const neighbors = [
            { row: food.row - 1, col: food.col },
            { row: food.row + 1, col: food.col },
            { row: food.row, col: food.col - 1 },
            { row: food.row, col: food.col + 1 }
          ].filter(pos => 
            isValidPosition(pos.row, pos.col, width, height) && 
            grid[pos.row][pos.col].type === 'path'
          );
          
          if (neighbors.length > 0) {
            const trapPos = neighbors[Math.floor(Math.random() * neighbors.length)];
            grid[trapPos.row][trapPos.col].type = 'trap';
            traps.push(trapPos);
          }
        }
      });
    }

    return { traps, dynamicWalls, foodSources };
  };

  const generateMaze = useCallback(async (type: MazeType) => {
    setIsGenerating(true);
    
    // Simulate realistic generation time
    await new Promise(resolve => setTimeout(resolve, 800));

    const width = type === 'simple' ? 31 : 41;  // Larger for complex mazes
    const height = type === 'simple' ? 21 : 31;
    
    const grid = generateRecursiveBacktracker(width, height);
    const { traps, dynamicWalls, foodSources } = addDynamicFeatures(grid, width, height, type);

    // Set start and end positions with better placement
    const start: Position = { row: 1, col: 1 };
    const end: Position = { row: height - 2, col: width - 2 };
    
    grid[start.row][start.col].type = 'start';
    grid[end.row][end.col].type = 'end';

    // Ensure path to end exists
    const pathToEnd = [
      { row: end.row - 1, col: end.col },
      { row: end.row, col: end.col - 1 },
      { row: end.row - 1, col: end.col - 1 }
    ];
    
    pathToEnd.forEach(pos => {
      if (isValidPosition(pos.row, pos.col, width, height)) {
        if (grid[pos.row][pos.col].type === 'wall') {
          grid[pos.row][pos.col].type = 'path';
        }
      }
    });

    // Calculate heuristic values (distance to goal)
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        grid[row][col].heuristic = Math.sqrt(
          Math.pow(row - end.row, 2) + Math.pow(col - end.col, 2)
        );
      }
    }

    const newMaze: Maze = {
      grid,
      width,
      height,
      start,
      end,
      traps,
      dynamicWalls,
      foodSources,
      timeStep: 0
    };

    setMaze(newMaze);
    setIsGenerating(false);
  }, []);

  return {
    maze,
    generateMaze,
    isGenerating
  };
};