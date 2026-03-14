import React, { useState, useCallback } from 'react';
import { MazeVisualizer } from './components/MazeVisualizer';
import { ControlPanel } from './components/ControlPanel';
import { PerformanceMetrics } from './components/PerformanceMetrics';
import { AlgorithmComparison } from './components/AlgorithmComparison';
import { useMazeGeneration } from './hooks/useMazeGeneration';
import { useMazeSolver } from './hooks/useMazeSolver';
import { MazeType, AlgorithmType } from './types/maze';
import { Activity, Zap, Brain, Sparkles, Target } from 'lucide-react';

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('hybrid');
  const [mazeType, setMazeType] = useState<MazeType>('adaptive');
  const [speed, setSpeed] = useState(65);

  const {
    maze,
    generateMaze,
    isGenerating
  } = useMazeGeneration();

  const {
    solverState,
    startSolving,
    stopSolving,
    resetSolver,
    metrics
  } = useMazeSolver(maze);

  const handleStart = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      startSolving(selectedAlgorithm, speed);
    }
  }, [isRunning, selectedAlgorithm, speed, startSolving]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    stopSolving();
  }, [stopSolving]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    resetSolver();
    generateMaze(mazeType);
  }, [resetSolver, generateMaze, mazeType]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-2xl shadow-lg">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                  Advanced Bio-Inspired Maze Solver
                </h1>
                <p className="text-blue-200 mt-2 text-lg">
                  DFS + ACO + ABC Hybrid Intelligence • Real-time Performance Analysis
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-blue-200 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-400/20">
                <Activity className="w-4 h-4" />
                <span>Live Algorithm Comparison</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-emerald-200 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-400/20">
                <Sparkles className="w-4 h-4" />
                <span>Dynamic Environment</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-purple-200 bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-400/20">
                <Target className="w-4 h-4" />
                <span>Research-Grade Implementation</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Maze Visualizer - Takes up most space */}
            <div className="xl:col-span-3">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl">
                <MazeVisualizer
                  maze={maze}
                  solverState={solverState}
                  isRunning={isRunning}
                  algorithm={selectedAlgorithm}
                />
              </div>
            </div>

            {/* Control Panel */}
            <div className="space-y-6">
              <ControlPanel
                selectedAlgorithm={selectedAlgorithm}
                onAlgorithmChange={setSelectedAlgorithm}
                mazeType={mazeType}
                onMazeTypeChange={setMazeType}
                speed={speed}
                onSpeedChange={setSpeed}
                isRunning={isRunning}
                isGenerating={isGenerating}
                onStart={handleStart}
                onStop={handleStop}
                onReset={handleReset}
                onGenerateMaze={() => generateMaze(mazeType)}
              />

              <PerformanceMetrics metrics={metrics} />
            </div>
          </div>

          {/* Algorithm Comparison */}
          <div className="mt-8">
            <AlgorithmComparison
              metrics={metrics}
              isRunning={isRunning}
              currentAlgorithm={selectedAlgorithm}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Powered by Advanced Swarm Intelligence & Machine Learning</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Real-time Bio-inspired Pathfinding</span>
              <span>•</span>
              <span>Production-Ready Implementation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;