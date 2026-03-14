import React, { useEffect, useRef, useState } from 'react';
import { Maze, SolverState, AlgorithmType } from '../types/maze';

interface MazeVisualizerProps {
  maze: Maze | null;
  solverState: SolverState;
  isRunning: boolean;
  algorithm: AlgorithmType;
}

export const MazeVisualizer: React.FC<MazeVisualizerProps> = ({
  maze,
  solverState,
  isRunning,
  algorithm
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const handleResize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        setDimensions({
          width: rect.width - 48,
          height: Math.min(rect.width - 48, 650)
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!maze || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // Clear with gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cellWidth = canvas.width / maze.width;
      const cellHeight = canvas.height / maze.height;

      // Draw maze with enhanced visuals
      for (let row = 0; row < maze.height; row++) {
        for (let col = 0; col < maze.width; col++) {
          const cell = maze.grid[row][col];
          const x = col * cellWidth;
          const y = row * cellHeight;

          // Base cell color with temperature effects
          let baseColor: string;
          switch (cell.type) {
            case 'wall':
              const wallShade = Math.floor(55 + cell.temperature);
              baseColor = `rgb(${wallShade}, ${wallShade + 10}, ${wallShade + 15})`;
              break;
            case 'path':
              const pathBrightness = Math.floor(248 - cell.explorationCount * 2);
              baseColor = `rgb(${pathBrightness}, ${pathBrightness + 2}, ${pathBrightness + 4})`;
              break;
            case 'start':
              baseColor = '#10b981';
              break;
            case 'end':
              baseColor = '#f59e0b';
              break;
            case 'trap':
              const trapIntensity = 0.7 + Math.sin(Date.now() * 0.005) * 0.3;
              baseColor = `rgba(239, 68, 68, ${trapIntensity})`;
              break;
            case 'dynamic':
              const dynamicHue = (Date.now() * 0.1 + col * 10 + row * 10) % 360;
              baseColor = `hsl(${dynamicHue}, 70%, 60%)`;
              break;
            case 'food':
              baseColor = '#22c55e';
              break;
            default:
              baseColor = '#f8fafc';
          }

          ctx.fillStyle = baseColor;
          ctx.fillRect(x, y, cellWidth, cellHeight);

          // Enhanced pheromone visualization
          if ((algorithm === 'aco' || algorithm === 'hybrid') && cell.pheromone > 0.1) {
            const intensity = Math.min(cell.pheromone / 50, 0.9);
            const pheromoneGradient = ctx.createRadialGradient(
              x + cellWidth/2, y + cellHeight/2, 0,
              x + cellWidth/2, y + cellHeight/2, cellWidth/2
            );
            pheromoneGradient.addColorStop(0, `rgba(59, 130, 246, ${intensity})`);
            pheromoneGradient.addColorStop(1, `rgba(59, 130, 246, ${intensity * 0.3})`);
            ctx.fillStyle = pheromoneGradient;
            ctx.fillRect(x, y, cellWidth, cellHeight);
          }

          // Visited cells with algorithm-specific colors
          if (cell.visited) {
            let visitedColor: string;
            const visitedAlpha = 0.4 - (cell.explorationCount * 0.05);
            
            switch (algorithm) {
              case 'dfs':
                visitedColor = `rgba(168, 85, 247, ${visitedAlpha})`;
                break;
              case 'aco':
                visitedColor = `rgba(59, 130, 246, ${visitedAlpha})`;
                break;
              case 'abc':
                visitedColor = `rgba(34, 197, 94, ${visitedAlpha})`;
                break;
              case 'hybrid':
                visitedColor = `rgba(16, 185, 129, ${visitedAlpha})`;
                break;
            }
            
            ctx.fillStyle = visitedColor;
            ctx.fillRect(x, y, cellWidth, cellHeight);
          }

          // Path visualization with glow effect
          if (cell.isPath) {
            const pathColor = algorithm === 'dfs' ? '#a855f7' : 
                             algorithm === 'aco' ? '#3b82f6' : 
                             algorithm === 'abc' ? '#22c55e' : '#10b981';
            
            // Glow effect
            ctx.shadowColor = pathColor;
            ctx.shadowBlur = 8;
            ctx.fillStyle = pathColor;
            ctx.fillRect(x + cellWidth * 0.2, y + cellHeight * 0.2, 
                        cellWidth * 0.6, cellHeight * 0.6);
            ctx.shadowBlur = 0;
          }

          // Grid lines with subtle styling
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, cellWidth, cellHeight);
        }
      }

      // Enhanced ant visualization
      if ((algorithm === 'aco' || algorithm === 'hybrid') && solverState.ants.length > 0) {
        solverState.ants.forEach((ant, index) => {
          if (ant.alive) {
            const x = ant.position.col * cellWidth + cellWidth / 2;
            const y = ant.position.row * cellHeight + cellHeight / 2;
            
            // Ant body with energy-based size
            const antSize = (Math.min(cellWidth, cellHeight) / 8) * (ant.energy / 100 + 0.5);
            
            // Ant trail
            if (ant.path.length > 1) {
              ctx.strokeStyle = `hsla(${index * 25}, 70%, 60%, 0.6)`;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ant.path.slice(-10).forEach((pos, i) => {
                const trailX = pos.col * cellWidth + cellWidth / 2;
                const trailY = pos.row * cellHeight + cellHeight / 2;
                if (i === 0) ctx.moveTo(trailX, trailY);
                else ctx.lineTo(trailX, trailY);
              });
              ctx.stroke();
            }
            
            // Ant body
            ctx.beginPath();
            ctx.arc(x, y, antSize, 0, 2 * Math.PI);
            ctx.fillStyle = `hsl(${index * 25}, 70%, 60%)`;
            ctx.fill();
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Energy indicator
            if (ant.energy < 50) {
              ctx.fillStyle = '#ef4444';
              ctx.fillRect(x - antSize, y - antSize - 4, (ant.energy / 100) * (antSize * 2), 2);
            }
          }
        });
      }

      // Enhanced bee visualization
      if (algorithm === 'abc' && solverState.bees.length > 0) {
        solverState.bees.forEach((bee, index) => {
          if (bee.alive) {
            const x = bee.position.col * cellWidth + cellWidth / 2;
            const y = bee.position.row * cellHeight + cellHeight / 2;
            
            // Bee body with role-based styling
            const beeSize = Math.min(cellWidth, cellHeight) / 7;
            let beeColor: string;
            
            switch (bee.role) {
              case 'scout':
                beeColor = '#f59e0b';
                break;
              case 'employed':
                beeColor = '#22c55e';
                break;
              case 'onlooker':
                beeColor = '#3b82f6';
                break;
            }
            
            // Bee wings (animated)
            const wingOffset = Math.sin(Date.now() * 0.02 + index) * 2;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillRect(x - beeSize - wingOffset, y - beeSize/2, beeSize/2, beeSize);
            ctx.fillRect(x + beeSize/2 + wingOffset, y - beeSize/2, beeSize/2, beeSize);
            
            // Bee body
            ctx.beginPath();
            ctx.arc(x, y, beeSize, 0, 2 * Math.PI);
            ctx.fillStyle = beeColor;
            ctx.fill();
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      }

      // Current position for DFS with pulsing effect
      if (algorithm === 'dfs' && solverState.currentPosition) {
        const pos = solverState.currentPosition;
        const x = pos.col * cellWidth + cellWidth / 2;
        const y = pos.row * cellHeight + cellHeight / 2;
        
        const pulseSize = Math.min(cellWidth, cellHeight) / 4 + 
                         Math.sin(Date.now() * 0.01) * 3;
        
        ctx.beginPath();
        ctx.arc(x, y, pulseSize, 0, 2 * Math.PI);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Best path with animated flow
      if (solverState.bestPath.length > 1) {
        const flowOffset = (Date.now() * 0.005) % 1;
        
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -flowOffset * 12;
        ctx.beginPath();
        
        solverState.bestPath.forEach((pos, index) => {
          const x = pos.col * cellWidth + cellWidth / 2;
          const y = pos.row * cellHeight + cellHeight / 2;
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Performance overlay
      if (isRunning) {
        const overlayHeight = 80;
        const overlayGradient = ctx.createLinearGradient(0, 0, 0, overlayHeight);
        overlayGradient.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
        overlayGradient.addColorStop(1, 'rgba(15, 23, 42, 0.7)');
        
        ctx.fillStyle = overlayGradient;
        ctx.fillRect(0, 0, canvas.width, overlayHeight);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Inter, system-ui, sans-serif';
        ctx.fillText(`Generation: ${solverState.generation}`, 10, 20);
        ctx.fillText(`Diversity: ${(solverState.diversityIndex * 100).toFixed(1)}%`, 10, 40);
        ctx.fillText(`Exploration: ${(solverState.explorationRate * 100).toFixed(1)}%`, 10, 60);
        
        if (algorithm === 'aco' || algorithm === 'hybrid') {
          ctx.fillText(`Active Ants: ${solverState.ants.filter(ant => ant.alive).length}`, 150, 20);
        }
        if (algorithm === 'abc') {
          ctx.fillText(`Active Bees: ${solverState.bees.filter(bee => bee.alive).length}`, 150, 20);
        }
      }
    };

    if (isRunning) {
      const animate = () => {
        draw();
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      draw();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [maze, solverState, isRunning, algorithm, dimensions]);

  if (!maze) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-800/30 rounded-xl border border-slate-700">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          <h3 className="text-xl font-semibold text-white mb-2">Generate a Maze</h3>
          <p className="text-slate-400">Click "Generate Maze" to create a new maze for solving</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Enhanced Bio-Inspired Maze Visualization</h2>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-slate-300">Start</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-amber-500 rounded"></div>
            <span className="text-slate-300">End</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded animate-pulse"></div>
            <span className="text-slate-300">Trap</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded animate-pulse"></div>
            <span className="text-slate-300">Dynamic</span>
          </div>
          {(algorithm === 'aco' || algorithm === 'hybrid') && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded opacity-60"></div>
              <span className="text-slate-300">Pheromone</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="relative bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-auto border border-slate-600 rounded-lg"
        />
        
        {isRunning && (
          <div className="absolute top-4 right-4 flex items-center space-x-2 bg-slate-900/80 px-3 py-2 rounded-lg backdrop-blur-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-white font-medium">
              {algorithm === 'dfs' ? 'DFS Running' : 
               algorithm === 'aco' ? 'ACO Running' : 
               algorithm === 'abc' ? 'ABC Running' : 'Hybrid Running'}
            </span>
          </div>
        )}
        
        {solverState.isComplete && (
          <div className="absolute bottom-4 left-4 bg-green-500/90 px-4 py-2 rounded-lg backdrop-blur-sm">
            <span className="text-sm text-white font-medium">
              Path Found! Length: {solverState.bestPath.length} | 
              Time: {(solverState.timeElapsed / 1000).toFixed(2)}s
            </span>
          </div>
        )}
      </div>
    </div>
  );
};