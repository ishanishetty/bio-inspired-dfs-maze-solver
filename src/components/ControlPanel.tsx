import React from 'react';
import { AlgorithmType, MazeType } from '../types/maze';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Grid3X3, 
  Settings,
  Zap,
  Brain,
  Target,
  Shuffle
} from 'lucide-react';

interface ControlPanelProps {
  selectedAlgorithm: AlgorithmType;
  onAlgorithmChange: (algorithm: AlgorithmType) => void;
  mazeType: MazeType;
  onMazeTypeChange: (type: MazeType) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  isRunning: boolean;
  isGenerating: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onGenerateMaze: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedAlgorithm,
  onAlgorithmChange,
  mazeType,
  onMazeTypeChange,
  speed,
  onSpeedChange,
  isRunning,
  isGenerating,
  onStart,
  onStop,
  onReset,
  onGenerateMaze
}) => {
  const algorithms = [
    { 
      value: 'dfs' as AlgorithmType, 
      label: 'DFS Only', 
      description: 'Depth-First Search - Deterministic',
      icon: Target,
      color: 'from-purple-500 to-purple-600'
    },
    { 
      value: 'aco' as AlgorithmType, 
      label: 'ACO Only', 
      description: 'Ant Colony Optimization - Bio-inspired',
      icon: Brain,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      value: 'abc' as AlgorithmType, 
      label: 'ABC Only', 
      description: 'Artificial Bee Colony - Swarm Intelligence',
      icon: Shuffle,
      color: 'from-green-500 to-green-600'
    },
    { 
      value: 'hybrid' as AlgorithmType, 
      label: 'Hybrid', 
      description: 'DFS + ACO + ABC Combined',
      icon: Zap,
      color: 'from-emerald-500 to-emerald-600'
    }
  ];

  const mazeTypes = [
    { 
      value: 'simple' as MazeType, 
      label: 'Simple', 
      description: 'Basic maze structure',
      complexity: 1
    },
    { 
      value: 'complex' as MazeType, 
      label: 'Complex', 
      description: 'Multiple paths and branching',
      complexity: 2
    },
    { 
      value: 'traps' as MazeType, 
      label: 'With Traps', 
      description: 'Strategic trap placement',
      complexity: 3
    },
    { 
      value: 'dynamic' as MazeType, 
      label: 'Dynamic', 
      description: 'Moving obstacles',
      complexity: 4
    },
    { 
      value: 'adaptive' as MazeType, 
      label: 'Adaptive', 
      description: 'Food sources and realistic foraging',
      complexity: 5
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Controls */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Settings className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Controls</h3>
        </div>

        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={isRunning ? onStop : onStart}
              disabled={isGenerating}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isRunning
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-blue-500/25'
              } disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105`}
            >
              {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Stop' : 'Start'}</span>
            </button>

            <button
              onClick={onReset}
              disabled={isGenerating}
              className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-600/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>

          <button
            onClick={onGenerateMaze}
            disabled={isRunning || isGenerating}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg shadow-emerald-500/25"
          >
            <Grid3X3 className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Generate New Maze'}</span>
          </button>
        </div>
      </div>

      {/* Algorithm Selection */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Algorithm Selection</h3>
        <div className="space-y-3">
          {algorithms.map((algo) => {
            const IconComponent = algo.icon;
            return (
              <label
                key={algo.value}
                className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-102 ${
                  selectedAlgorithm === algo.value
                    ? `bg-gradient-to-r ${algo.color} bg-opacity-20 border border-opacity-30 shadow-lg`
                    : 'bg-slate-700/30 hover:bg-slate-600/30 border border-transparent'
                }`}
              >
                <input
                  type="radio"
                  name="algorithm"
                  value={algo.value}
                  checked={selectedAlgorithm === algo.value}
                  onChange={(e) => onAlgorithmChange(e.target.value as AlgorithmType)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-5 h-5 text-white" />
                    <span className="font-medium text-white">{algo.label}</span>
                    {algo.value === 'hybrid' && <Zap className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-sm text-slate-400 mt-1 ml-8">{algo.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                  selectedAlgorithm === algo.value
                    ? 'border-white bg-white'
                    : 'border-slate-500'
                }`}>
                  {selectedAlgorithm === algo.value && (
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Maze Configuration */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Maze Configuration</h3>
        <div className="space-y-3">
          {mazeTypes.map((type) => (
            <label
              key={type.value}
              className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-102 ${
                mazeType === type.value
                  ? 'bg-emerald-500/20 border border-emerald-400/30 shadow-lg'
                  : 'bg-slate-700/30 hover:bg-slate-600/30 border border-transparent'
              }`}
            >
              <input
                type="radio"
                name="mazeType"
                value={type.value}
                checked={mazeType === type.value}
                onChange={(e) => onMazeTypeChange(e.target.value as MazeType)}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-white">{type.label}</span>
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < type.complexity ? 'bg-amber-400' : 'bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-400 mt-1">{type.description}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                mazeType === type.value
                  ? 'border-emerald-400 bg-emerald-400'
                  : 'border-slate-500'
              }`}>
                {mazeType === type.value && (
                  <div className="w-3 h-3 bg-white rounded-full mx-auto mt-0.5"></div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Speed Control */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Animation Speed</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>Slow & Detailed</span>
            <span>Fast & Efficient</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="10"
              max="100"
              value={speed}
              onChange={(e) => onSpeedChange(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div 
              className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg pointer-events-none transition-all duration-200"
              style={{ width: `${speed}%` }}
            />
          </div>
          <div className="text-center">
            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              {speed}% Speed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};