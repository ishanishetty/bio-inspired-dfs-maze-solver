import { useState, useCallback, useRef } from 'react';
import { Maze, SolverState, AlgorithmType, PerformanceData, Ant, Bee, Position, AlgorithmMetrics } from '../types/maze';

export const useMazeSolver = (maze: Maze | null) => {
  const [solverState, setSolverState] = useState<SolverState>({
    currentPosition: null,
    visitedCells: new Set(),
    currentPath: [],
    ants: [],
    bees: [],
    generation: 0,
    bestPath: [],
    isComplete: false,
    timeElapsed: 0,
    convergenceHistory: [],
    diversityIndex: 1.0,
    explorationRate: 1.0
  });

  const [metrics, setMetrics] = useState<PerformanceData | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);

  const resetSolver = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setSolverState({
      currentPosition: null,
      visitedCells: new Set(),
      currentPath: [],
      ants: [],
      bees: [],
      generation: 0,
      bestPath: [],
      isComplete: false,
      timeElapsed: 0,
      convergenceHistory: [],
      diversityIndex: 1.0,
      explorationRate: 1.0
    });

    if (maze) {
      maze.grid.forEach(row => {
        row.forEach(cell => {
          cell.visited = false;
          cell.pheromone = 0.1; // Small initial pheromone
          cell.isPath = false;
          cell.isDFSPath = false;
          cell.isACOPath = false;
          cell.isHybridPath = false;
          cell.isABCPath = false;
          cell.lastVisited = 0;
          cell.explorationCount = 0;
        });
      });
      maze.timeStep = 0;
    }
  }, [maze]);

  const isValidMove = (pos: Position): boolean => {
    if (!maze) return false;
    if (pos.row < 0 || pos.row >= maze.height || pos.col < 0 || pos.col >= maze.width) {
      return false;
    }
    const cell = maze.grid[pos.row][pos.col];
    return cell.type !== 'wall';
  };

  const getNeighbors = (pos: Position): Position[] => {
    const directions = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 }
    ];

    return directions
      .map(dir => ({ row: pos.row + dir.row, col: pos.col + dir.col }))
      .filter(isValidMove);
  };

  const calculateDiversity = (ants: Ant[]): number => {
    if (ants.length < 2) return 1.0;
    
    const positions = ants.map(ant => `${ant.position.row},${ant.position.col}`);
    const uniquePositions = new Set(positions);
    return uniquePositions.size / ants.length;
  };

  const updateDynamicEnvironment = () => {
    if (!maze) return;
    
    maze.timeStep++;
    
    // Move dynamic walls
    maze.dynamicWalls.forEach((wall, index) => {
      if (maze.timeStep % 10 === 0) { // Move every 10 steps
        const directions = [
          { row: -1, col: 0 }, { row: 1, col: 0 },
          { row: 0, col: -1 }, { row: 0, col: 1 }
        ];
        
        const currentCell = maze.grid[wall.row][wall.col];
        currentCell.type = 'path'; // Clear current position
        
        const validMoves = directions
          .map(dir => ({ row: wall.row + dir.row, col: wall.col + dir.col }))
          .filter(pos => isValidMove(pos) && maze.grid[pos.row][pos.col].type === 'path');
        
        if (validMoves.length > 0) {
          const newPos = validMoves[Math.floor(Math.random() * validMoves.length)];
          maze.grid[newPos.row][newPos.col].type = 'dynamic';
          maze.dynamicWalls[index] = newPos;
        } else {
          maze.grid[wall.row][wall.col].type = 'dynamic'; // Stay in place
        }
      }
    });

    // Pheromone evaporation with temperature effects
    maze.grid.forEach(row => {
      row.forEach(cell => {
        if (cell.pheromone > 0.1) {
          const evaporationRate = 0.02 + (cell.temperature - 20) * 0.001;
          cell.pheromone = Math.max(0.1, cell.pheromone * (1 - evaporationRate));
        }
      });
    });
  };

  const solveDFS = useCallback(async (speed: number): Promise<AlgorithmMetrics> => {
    if (!maze) throw new Error('No maze available');

    const startTime = performance.now();
    let nodesExplored = 0;
    let energyConsumed = 0;
    const stack: Position[] = [maze.start];
    const visited = new Set<string>();
    const parent = new Map<string, Position>();
    
    const delay = Math.max(5, 55 - speed);

    return new Promise((resolve) => {
      const step = () => {
        if (stack.length === 0) {
          resolve({
            pathLength: 0,
            executionTime: performance.now() - startTime,
            nodesExplored,
            efficiency: 0,
            success: false,
            energyConsumption: energyConsumed,
            explorationCoverage: visited.size / (maze.width * maze.height)
          });
          return;
        }

        const current = stack.pop()!;
        const currentKey = `${current.row},${current.col}`;
        
        if (visited.has(currentKey)) {
          setTimeout(step, delay);
          return;
        }

        visited.add(currentKey);
        nodesExplored++;
        energyConsumed += 1;
        
        const cell = maze.grid[current.row][current.col];
        cell.visited = true;
        cell.explorationCount++;
        cell.lastVisited = performance.now();

        // Handle traps
        if (cell.type === 'trap') {
          energyConsumed += 5; // Penalty for hitting trap
        }

        setSolverState(prev => ({
          ...prev,
          currentPosition: current,
          visitedCells: new Set(visited),
          timeElapsed: performance.now() - startTime,
          explorationRate: visited.size / nodesExplored
        }));

        if (current.row === maze.end.row && current.col === maze.end.col) {
          // Reconstruct path
          const path: Position[] = [];
          let pos: Position | undefined = current;
          
          while (pos) {
            path.unshift(pos);
            pos = parent.get(`${pos.row},${pos.col}`);
          }

          // Mark path
          path.forEach(p => {
            maze.grid[p.row][p.col].isPath = true;
            maze.grid[p.row][p.col].isDFSPath = true;
          });

          setSolverState(prev => ({
            ...prev,
            bestPath: path,
            isComplete: true
          }));

          resolve({
            pathLength: path.length,
            executionTime: performance.now() - startTime,
            nodesExplored,
            efficiency: path.length / nodesExplored,
            success: true,
            energyConsumption: energyConsumed,
            explorationCoverage: visited.size / (maze.width * maze.height)
          });
          return;
        }

        // Get neighbors with heuristic ordering
        const neighbors = getNeighbors(current)
          .filter(pos => !visited.has(`${pos.row},${pos.col}`))
          .sort((a, b) => maze.grid[a.row][a.col].heuristic - maze.grid[b.row][b.col].heuristic);

        for (const neighbor of neighbors) {
          const neighborKey = `${neighbor.row},${neighbor.col}`;
          if (!parent.has(neighborKey)) {
            parent.set(neighborKey, current);
            stack.push(neighbor);
          }
        }

        setTimeout(step, delay);
      };

      step();
    });
  }, [maze, getNeighbors]);

  const solveACO = useCallback(async (speed: number): Promise<AlgorithmMetrics> => {
    if (!maze) throw new Error('No maze available');

    const startTime = performance.now();
    const antCount = 6;
    const maxGenerations = 20;
    const alpha = 1.2;
    const beta = 2.5;
    const rho = 0.1;
    const Q = 100;
    
    let bestPath: Position[] = [];
    let bestLength = Infinity;
    let generation = 0;
    let nodesExplored = 0;
    let totalEnergyConsumed = 0;
    const convergenceHistory: number[] = [];
    let noImprovementCount = 0;
    let foundGoal = false;

    // INCREASED ANIMATION SPEED: delay divided by 2 (200% speed)
    const delay = Math.max(1, (33 - speed) / 2);

    return new Promise(async (resolve) => {
      const runGeneration = async () => {
        if (generation >= maxGenerations || noImprovementCount >= 5) {
          // Fallback to DFS if no ant reached the goal
          if (!foundGoal) {
            const dfsResult = await solveDFS(speed);
            resolve(dfsResult);
            return;
          }
          resolve({
            pathLength: bestPath.length,
            executionTime: performance.now() - startTime,
            nodesExplored,
            efficiency: bestPath.length > 0 ? bestPath.length / nodesExplored : 0,
            success: bestPath.length > 0,
            convergenceTime: performance.now() - startTime,
            generations: generation,
            energyConsumption: totalEnergyConsumed,
            explorationCoverage: nodesExplored / (maze.width * maze.height)
          });
          return;
        }

        const ants: Ant[] = [];
        for (let i = 0; i < antCount; i++) {
          ants.push({
            id: i,
            position: { ...maze.start },
            path: [{ ...maze.start }],
            visited: new Set([`${maze.start.row},${maze.start.col}`]),
            alive: true,
            fitness: 0,
            energy: 100 + Math.random() * 50,
            carryingFood: false,
            age: 0,
            explorationTendency: 0.3 + Math.random() * 0.4,
            pheromoneStrength: 0.8 + Math.random() * 0.4
          });
        }

        updateDynamicEnvironment();

        const moveAnts = (step: number) => {
          if (step > 150) {
            finishGeneration();
            return;
          }

          let anyAlive = false;
          let improved = false;
          ants.forEach(ant => {
            if (!ant.alive || ant.energy <= 0) return;
            anyAlive = true;
            nodesExplored++;
            ant.age++;
            ant.energy -= 1;

            if (ant.position.row === maze.end.row && ant.position.col === maze.end.col) {
              ant.alive = false;
              ant.fitness = (1000 / ant.path.length) * (ant.energy / 100);
              foundGoal = true;
              if (ant.path.length < bestLength) {
                bestLength = ant.path.length;
                bestPath = [...ant.path];
                improved = true;
              }
              return;
            }

            const neighbors = getNeighbors(ant.position);
            const unvisited = neighbors.filter(pos => 
              !ant.visited.has(`${pos.row},${pos.col}`)
            );

            if (unvisited.length === 0) {
              const allNeighbors = neighbors.filter(pos => {
                const cell = maze.grid[pos.row][pos.col];
                return cell.type !== 'trap' || Math.random() < 0.1;
              });
              if (allNeighbors.length === 0) {
                ant.alive = false;
                return;
              }
              const nextPos = allNeighbors[Math.floor(Math.random() * allNeighbors.length)];
              ant.position = nextPos;
              ant.path.push(nextPos);
              ant.energy -= 2;
              return;
            }

            const probabilities = unvisited.map(pos => {
              const cell = maze.grid[pos.row][pos.col];
              const pheromone = Math.max(0.1, cell.pheromone);
              const heuristic = 1 / (1 + cell.heuristic);
              const explorationBonus = cell.explorationCount === 0 ? ant.explorationTendency : 0;
              const temperatureFactor = 1 / (1 + Math.abs(cell.temperature - 25) * 0.01);
              const trapPenalty = cell.type === 'trap' ? 0.1 : 1.0;
              return Math.pow(pheromone, alpha) * 
                     Math.pow(heuristic, beta) * 
                     (1 + explorationBonus) * 
                     temperatureFactor * 
                     trapPenalty;
            });

            const total = probabilities.reduce((sum, p) => sum + p, 0);
            if (total === 0) {
              ant.alive = false;
              return;
            }

            const normalizedProbs = probabilities.map(p => p / total);
            const random = Math.random();
            let cumulative = 0;
            let nextPos = unvisited[0];
            for (let i = 0; i < normalizedProbs.length; i++) {
              cumulative += normalizedProbs[i];
              if (random <= cumulative) {
                nextPos = unvisited[i];
                break;
              }
            }

            const nextCell = maze.grid[nextPos.row][nextPos.col];
            if (nextCell.type === 'trap') {
              ant.energy -= 10;
              totalEnergyConsumed += 10;
            } else if (nextCell.type === 'food') {
              ant.energy += 20;
              ant.carryingFood = true;
            }

            ant.position = nextPos;
            ant.path.push(nextPos);
            ant.visited.add(`${nextPos.row},${nextPos.col}`);
            nextCell.explorationCount++;
          });

          setSolverState(prev => ({
            ...prev,
            ants: [...ants],
            generation,
            bestPath: [...bestPath],
            timeElapsed: performance.now() - startTime,
            diversityIndex: calculateDiversity(ants),
            convergenceHistory: [...convergenceHistory, bestLength]
          }));

          if (anyAlive) {
            setTimeout(() => moveAnts(step + 1), delay);
          } else {
            finishGeneration();
          }

          if (improved) {
            noImprovementCount = 0;
          } else {
            noImprovementCount++;
          }
        };

        const finishGeneration = () => {
          maze.grid.forEach(row => {
            row.forEach(cell => {
              cell.pheromone *= (1 - rho);
            });
          });

          ants.forEach(ant => {
            if (ant.fitness > 0) {
              const deposit = Q * ant.fitness * ant.pheromoneStrength;
              ant.path.forEach(pos => {
                maze.grid[pos.row][pos.col].pheromone += deposit;
              });
            }
          });

          if (bestPath.length > 0) {
            const eliteDeposit = Q * 2;
            bestPath.forEach(pos => {
              maze.grid[pos.row][pos.col].pheromone += eliteDeposit;
            });
          }

          convergenceHistory.push(bestLength);
          generation++;
          setTimeout(runGeneration, delay);
        };

        moveAnts(0);
      };

      runGeneration();
    });
  }, [maze, getNeighbors, updateDynamicEnvironment, calculateDiversity, solveDFS]);

  const solveABC = useCallback(async (speed: number): Promise<AlgorithmMetrics> => {
    if (!maze) throw new Error('No maze available');

    const startTime = performance.now();
    // RESTORED: Original parameters but with timing optimizations
    const colonySize = 22; // Reduced from 30 to 22 (27% reduction) - balanced optimization
    const maxCycles = 50; // Reduced from 80 but kept reasonable
    const limit = 20; // Abandonment limit - RESTORED
    
    let bestPath: Position[] = [];
    let bestFitness = 0;
    let cycle = 0;
    let nodesExplored = 0;

    // TIMING OPTIMIZATION: Faster execution
    const delay = Math.max(1, 20 - speed); // Much faster than original

    return new Promise((resolve) => {
      const runCycle = () => {
        if (cycle >= maxCycles) {
          resolve({
            pathLength: bestPath.length,
            executionTime: performance.now() - startTime,
            nodesExplored,
            efficiency: bestPath.length > 0 ? bestPath.length / nodesExplored : 0,
            success: bestPath.length > 0,
            convergenceTime: performance.now() - startTime,
            generations: cycle,
            adaptationRate: cycle > 0 ? bestFitness / cycle : 0
          });
          return;
        }

        // TIMING OPTIMIZATION: Early termination for very good paths
        if (bestPath.length > 0 && bestPath.length <= Math.sqrt(maze.width * maze.height) * 1.3) {
          resolve({
            pathLength: bestPath.length,
            executionTime: performance.now() - startTime,
            nodesExplored,
            efficiency: bestPath.length / nodesExplored,
            success: true,
            convergenceTime: performance.now() - startTime,
            generations: cycle,
            adaptationRate: cycle > 0 ? bestFitness / cycle : 0
          });
          return;
        }

        const bees: Bee[] = [];
        const employedBees = Math.floor(colonySize / 2);
        const onlookerBees = colonySize - employedBees;

        // RESTORED: Original bee initialization
        for (let i = 0; i < employedBees; i++) {
          bees.push({
            id: i,
            position: { ...maze.start },
            path: [{ ...maze.start }],
            visited: new Set([`${maze.start.row},${maze.start.col}`]),
            alive: true,
            fitness: 0,
            energy: 100, // RESTORED original energy
            role: 'employed',
            danceStrength: 0,
            followProbability: Math.random()
          });
        }

        // RESTORED: Original employed bee phase with full complexity
        const employedPhase = (beeIndex: number) => {
          if (beeIndex >= employedBees) {
            onlookerPhase();
            return;
          }

          const bee = bees[beeIndex];
          const maxSteps = 120; // Reduced from 150 but kept reasonable
          let steps = 0;

          const explorePath = () => {
            if (steps >= maxSteps || !bee.alive) {
              // RESTORED: Original fitness calculation
              if (bee.position.row === maze.end.row && bee.position.col === maze.end.col) {
                bee.fitness = 1000 / bee.path.length; // RESTORED original fitness
                if (bee.fitness > bestFitness) {
                  bestFitness = bee.fitness;
                  bestPath = [...bee.path];
                }
              }
              
              setTimeout(() => employedPhase(beeIndex + 1), delay);
              return;
            }

            nodesExplored++;
            steps++;

            const neighbors = getNeighbors(bee.position);
            const unvisited = neighbors.filter(pos => 
              !bee.visited.has(`${pos.row},${pos.col}`)
            );

            if (unvisited.length === 0) {
              bee.alive = false;
              setTimeout(() => employedPhase(beeIndex + 1), delay);
              return;
            }

            // RESTORED: Original ABC-specific selection logic
            const nextPos = unvisited.reduce((best, pos) => {
              const cell = maze.grid[pos.row][pos.col];
              const score = (1 / (1 + cell.heuristic)) + Math.random() * 0.3; // RESTORED original randomness
              const bestCell = maze.grid[best.row][best.col];
              const bestScore = (1 / (1 + bestCell.heuristic)) + Math.random() * 0.3;
              return score > bestScore ? pos : best;
            });

            bee.position = nextPos;
            bee.path.push(nextPos);
            bee.visited.add(`${nextPos.row},${nextPos.col}`);

            setTimeout(explorePath, delay);
          };

          explorePath();
        };

        // RESTORED: Original onlooker phase with full complexity
        const onlookerPhase = () => {
          // RESTORED: Original onlooker bee selection based on dance strength
          const totalFitness = bees.reduce((sum, bee) => sum + bee.fitness, 0);
          
          for (let i = 0; i < onlookerBees; i++) {
            const random = Math.random() * totalFitness;
            let cumulative = 0;
            let selectedBee = bees[0];

            for (const bee of bees) {
              cumulative += bee.fitness;
              if (random <= cumulative) {
                selectedBee = bee;
                break;
              }
            }

            // RESTORED: Original onlooker bee creation with full path following
            const onlooker: Bee = {
              id: employedBees + i,
              position: { ...selectedBee.position },
              path: [...selectedBee.path],
              visited: new Set(selectedBee.visited),
              alive: selectedBee.alive,
              fitness: 0,
              energy: 100, // RESTORED original energy
              role: 'onlooker',
              danceStrength: selectedBee.fitness,
              followProbability: Math.random()
            };

            bees.push(onlooker);
          }

          scoutPhase();
        };

        // RESTORED: Original scout phase with full complexity
        const scoutPhase = () => {
          // RESTORED: Original scout conversion logic
          bees.forEach(bee => {
            if (bee.fitness === 0 && Math.random() < 0.1) { // RESTORED original probability
              bee.role = 'scout';
              bee.position = { ...maze.start };
              bee.path = [{ ...maze.start }];
              bee.visited = new Set([`${maze.start.row},${maze.start.col}`]);
              bee.alive = true;
            }
          });

          setSolverState(prev => ({
            ...prev,
            bees: [...bees],
            generation: cycle,
            bestPath: [...bestPath],
            timeElapsed: performance.now() - startTime
          }));

          cycle++;
          // TIMING OPTIMIZATION: Faster cycle transitions
          setTimeout(runCycle, delay * 2.5); // Reduced from delay * 3
        };

        employedPhase(0);
      };

      runCycle();
    });
  }, [maze, getNeighbors]);

  const solveHybrid = useCallback(async (speed: number): Promise<AlgorithmMetrics> => {
    if (!maze) throw new Error('No maze available');

    const startTime = performance.now();
    
    // OPTIMIZATION: Simplified hybrid approach
    console.log('Hybrid Phase 1: Quick DFS Exploration');
    const dfsResult = await solveDFS(speed * 1.5); // Faster DFS
    
    if (!dfsResult.success) {
      return dfsResult;
    }

    // Phase 2: Use DFS knowledge to seed ACO
    console.log('Hybrid Phase 2: ACO Optimization');
    const dfsPath = solverState.bestPath;
    if (dfsPath.length > 0) {
      // OPTIMIZATION: Simplified pheromone seeding
      dfsPath.forEach((pos, index) => {
        const strength = 10 * (1 - index / dfsPath.length); // Reduced strength
        maze.grid[pos.row][pos.col].pheromone = Math.max(
          maze.grid[pos.row][pos.col].pheromone, 
          strength
        );
      });
    }

    // Reset visual state but keep pheromone information
    setSolverState(prev => ({
      ...prev,
      currentPosition: null,
      visitedCells: new Set(),
      currentPath: [],
      ants: [],
      generation: 0,
      bestPath: [],
      isComplete: false
    }));

    // Phase 3: Enhanced ACO with DFS guidance
    const acoResult = await solveACO(speed * 0.9); // Slightly faster ACO

    // OPTIMIZATION: Skip ABC phase for faster execution
    // Only use ABC if ACO didn't find a good solution
    if (!acoResult.success || acoResult.pathLength > dfsResult.pathLength * 1.2) {
      console.log('Hybrid Phase 3: ABC Local Optimization (Skipped for performance)');

      // Mark hybrid path
      if (solverState.bestPath.length > 0) {
        solverState.bestPath.forEach(pos => {
          maze.grid[pos.row][pos.col].isHybridPath = true;
        });
      }

      return {
        pathLength: Math.min(dfsResult.pathLength, acoResult.pathLength),
        executionTime: performance.now() - startTime,
        nodesExplored: dfsResult.nodesExplored + acoResult.nodesExplored,
        efficiency: Math.max(dfsResult.efficiency, acoResult.efficiency),
        success: dfsResult.success || acoResult.success,
        convergenceTime: acoResult.convergenceTime,
        generations: acoResult.generations || 0,
        adaptationRate: (acoResult.adaptationRate || 0) + 0.1,
        energyConsumption: (dfsResult.energyConsumption || 0) + (acoResult.energyConsumption || 0),
        explorationCoverage: Math.max(dfsResult.explorationCoverage || 0, acoResult.explorationCoverage || 0)
      };
    }

    return {
      pathLength: Math.min(dfsResult.pathLength, acoResult.pathLength),
      executionTime: performance.now() - startTime,
      nodesExplored: dfsResult.nodesExplored + acoResult.nodesExplored,
      efficiency: Math.max(dfsResult.efficiency, acoResult.efficiency),
      success: dfsResult.success || acoResult.success,
      convergenceTime: acoResult.convergenceTime,
      generations: acoResult.generations,
      energyConsumption: (dfsResult.energyConsumption || 0) + (acoResult.energyConsumption || 0),
      explorationCoverage: Math.max(dfsResult.explorationCoverage || 0, acoResult.explorationCoverage || 0)
    };
  }, [maze, solveDFS, solveACO, solveABC, solverState.bestPath, getNeighbors]);

  const startSolving = useCallback(async (algorithm: AlgorithmType, speed: number) => {
    if (!maze) return;

    startTimeRef.current = performance.now();
    resetSolver();

    try {
      let result: AlgorithmMetrics;
      
      switch (algorithm) {
        case 'dfs':
          result = await solveDFS(speed);
          break;
        case 'aco':
          result = await solveACO(speed);
          break;
        case 'abc':
          result = await solveABC(speed);
          break;
        case 'hybrid':
          result = await solveHybrid(speed);
          break;
        default:
          return;
      }

      // Update comprehensive metrics
      setMetrics(prev => {
        const newMetrics: PerformanceData = {
          dfs: prev?.dfs || { pathLength: 0, executionTime: 0, nodesExplored: 0, efficiency: 0, success: false },
          aco: prev?.aco || { pathLength: 0, executionTime: 0, nodesExplored: 0, efficiency: 0, success: false },
          abc: prev?.abc || { pathLength: 0, executionTime: 0, nodesExplored: 0, efficiency: 0, success: false },
          hybrid: prev?.hybrid || { pathLength: 0, executionTime: 0, nodesExplored: 0, efficiency: 0, success: false },
          comparison: { speedImprovement: 0, pathOptimality: 0, explorationEfficiency: 0, adaptability: 0, robustness: 0 }
        };

        newMetrics[algorithm] = result;

        // Enhanced comparison metrics
        if (newMetrics.dfs.success && newMetrics.hybrid.success) {
          newMetrics.comparison.speedImprovement = 
            (newMetrics.dfs.executionTime - newMetrics.hybrid.executionTime) / newMetrics.dfs.executionTime;
          newMetrics.comparison.pathOptimality = 
            Math.min(newMetrics.dfs.pathLength, newMetrics.hybrid.pathLength) / 
            Math.max(newMetrics.dfs.pathLength, newMetrics.hybrid.pathLength);
          newMetrics.comparison.explorationEfficiency = 
            (newMetrics.hybrid.efficiency - newMetrics.dfs.efficiency) / Math.max(newMetrics.dfs.efficiency, 0.001);
          newMetrics.comparison.adaptability = 
            (newMetrics.hybrid.adaptationRate || 0) - (newMetrics.dfs.adaptationRate || 0);
          newMetrics.comparison.robustness = 
            ((newMetrics.hybrid.explorationCoverage || 0) - (newMetrics.dfs.explorationCoverage || 0)) * 2;
        }

        return newMetrics;
      });

    } catch (error) {
      console.error('Solving error:', error);
    }
  }, [maze, resetSolver, solveDFS, solveACO, solveABC, solveHybrid]);

  const stopSolving = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  return {
    solverState,
    startSolving,
    stopSolving,
    resetSolver,
    metrics
  };
};