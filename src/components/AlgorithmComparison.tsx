import React from 'react';
import { PerformanceData, AlgorithmType } from '../types/maze';
import { BarChart3, Activity, Award, TrendingUp, Zap } from 'lucide-react';

interface AlgorithmComparisonProps {
  metrics: PerformanceData | null;
  isRunning: boolean;
  currentAlgorithm: AlgorithmType;
}

export const AlgorithmComparison: React.FC<AlgorithmComparisonProps> = ({
  metrics,
  isRunning,
  currentAlgorithm
}) => {
  if (!metrics) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Algorithm Performance Comparison</h2>
        </div>
        
        <div className="text-center text-slate-400 py-12">
          <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Comparison Data Available</h3>
          <p>Run different algorithms to see comprehensive performance comparisons and bio-inspired advantages</p>
        </div>
      </div>
    );
  }

  const algorithms = [
    { key: 'dfs', name: 'DFS', fullName: 'Depth-First Search', color: 'from-purple-500 to-purple-600', type: 'Deterministic' },
    { key: 'aco', name: 'ACO', fullName: 'Ant Colony Optimization', color: 'from-blue-500 to-blue-600', type: 'Bio-Inspired' },
    { key: 'abc', name: 'ABC', fullName: 'Artificial Bee Colony', color: 'from-green-500 to-green-600', type: 'Swarm Intelligence' },
    { key: 'hybrid', name: 'Hybrid', fullName: 'Multi-Algorithm Fusion', color: 'from-emerald-500 to-emerald-600', type: 'Advanced Bio-Inspired' }
  ];

  const getMaxValue = (metric: string) => {
    const values = algorithms
      .map(algo => (metrics as any)[algo.key])
      .filter(data => data && data.success)
      .map(data => {
        switch (metric) {
          case 'time': return data.executionTime;
          case 'path': return data.pathLength;
          case 'nodes': return data.nodesExplored;
          case 'efficiency': return data.efficiency;
          case 'energy': return data.energyConsumption || 0;
          case 'coverage': return data.explorationCoverage || 0;
          default: return 0;
        }
      });
    
    return Math.max(...values, 1); // Avoid division by zero
  };

  const renderMetricBar = (algorithm: any, metric: string, value: number, maxValue: number, unit: string = '', isInverted: boolean = false) => {
    if (!value && value !== 0) return null;
    
    // For inverted metrics (like time), lower is better
    const percentage = isInverted 
      ? ((maxValue - value) / maxValue) * 100 
      : (value / maxValue) * 100;
    
    const displayValue = metric === 'efficiency' || metric === 'coverage' 
      ? `${(value * 100).toFixed(1)}%` 
      : `${value.toLocaleString()}${unit}`;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-slate-300">{algorithm.name}</span>
            <span className="text-xs text-slate-500 px-2 py-1 bg-slate-800 rounded">
              {algorithm.type}
            </span>
          </div>
          <span className="text-white font-medium">{displayValue}</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${algorithm.color} transition-all duration-1000 ease-out relative`}
            style={{ width: `${Math.max(percentage, 2)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  };

  const getSuccessfulAlgorithms = () => {
    return algorithms.filter(algo => {
      const data = (metrics as any)[algo.key];
      return data && data.success;
    });
  };

  const successfulAlgos = getSuccessfulAlgorithms();

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Advanced Algorithm Performance Analysis</h2>
        </div>
        
        {isRunning && (
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-blue-400 font-medium">
              Running {currentAlgorithm.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {successfulAlgos.length === 0 ? (
        <div className="text-center text-slate-400 py-8">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No successful algorithm runs to compare yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Execution Time */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-medium text-white mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span>Execution Time</span>
                <span className="text-xs text-slate-500">(Lower is Better)</span>
              </h3>
              <div className="space-y-3">
                {successfulAlgos.map(algo => {
                  const data = (metrics as any)[algo.key];
                  return renderMetricBar(
                    algo, 
                    'time', 
                    data.executionTime, 
                    getMaxValue('time'),
                    'ms',
                    true // Inverted - lower is better
                  );
                })}
              </div>
            </div>

            {/* Path Length */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-medium text-white mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                <span>Path Length</span>
                <span className="text-xs text-slate-500">(Lower is Better)</span>
              </h3>
              <div className="space-y-3">
                {successfulAlgos.map(algo => {
                  const data = (metrics as any)[algo.key];
                  return renderMetricBar(
                    algo, 
                    'path', 
                    data.pathLength, 
                    getMaxValue('path'),
                    '',
                    true // Inverted - lower is better
                  );
                })}
              </div>
            </div>

            {/* Nodes Explored */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-medium text-white mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span>Nodes Explored</span>
                <span className="text-xs text-slate-500">(Exploration Depth)</span>
              </h3>
              <div className="space-y-3">
                {successfulAlgos.map(algo => {
                  const data = (metrics as any)[algo.key];
                  return renderMetricBar(
                    algo, 
                    'nodes', 
                    data.nodesExplored, 
                    getMaxValue('nodes')
                  );
                })}
              </div>
            </div>

            {/* Efficiency */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-medium text-white mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <span>Path Efficiency</span>
                <span className="text-xs text-slate-500">(Higher is Better)</span>
              </h3>
              <div className="space-y-3">
                {successfulAlgos.map(algo => {
                  const data = (metrics as any)[algo.key];
                  return renderMetricBar(
                    algo, 
                    'efficiency', 
                    data.efficiency, 
                    getMaxValue('efficiency')
                  );
                })}
              </div>
            </div>

            {/* Energy Consumption */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-medium text-white mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Energy Usage</span>
                <span className="text-xs text-slate-500">(Resource Cost)</span>
              </h3>
              <div className="space-y-3">
                {successfulAlgos.map(algo => {
                  const data = (metrics as any)[algo.key];
                  if (!data.energyConsumption) return null;
                  return renderMetricBar(
                    algo, 
                    'energy', 
                    data.energyConsumption, 
                    getMaxValue('energy')
                  );
                })}
              </div>
            </div>

            {/* Exploration Coverage */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-medium text-white mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                <span>Coverage Rate</span>
                <span className="text-xs text-slate-500">(Search Completeness)</span>
              </h3>
              <div className="space-y-3">
                {successfulAlgos.map(algo => {
                  const data = (metrics as any)[algo.key];
                  if (!data.explorationCoverage) return null;
                  return renderMetricBar(
                    algo, 
                    'coverage', 
                    data.explorationCoverage, 
                    getMaxValue('coverage')
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bio-Inspired Advantage Analysis */}
          {metrics.comparison && (
            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl p-6 border border-emerald-400/20">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-white">Bio-Inspired Intelligence Advantage</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                {Object.entries(metrics.comparison).map(([key, value]) => {
                  const isPositive = value > 0;
                  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  
                  return (
                    <div key={key} className="text-center p-3 bg-slate-800/30 rounded-lg">
                      <div className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{(value * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-400/20">
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-white mb-2">Research Findings</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      The hybrid bio-inspired approach demonstrates significant advantages in complex maze environments. 
                      By combining deterministic DFS exploration with adaptive swarm intelligence (ACO/ABC), the system achieves:
                    </p>
                    <ul className="text-slate-300 text-sm mt-2 space-y-1 ml-4">
                      <li>• <strong>Enhanced Adaptability:</strong> Dynamic response to environmental changes</li>
                      <li>• <strong>Improved Robustness:</strong> Better performance in trap-laden environments</li>
                      <li>• <strong>Optimal Resource Usage:</strong> Balanced exploration vs exploitation</li>
                      <li>• <strong>Emergent Intelligence:</strong> Collective behavior surpassing individual algorithms</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Algorithm Characteristics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {algorithms.map(algo => {
              const data = (metrics as any)[algo.key];
              if (!data || !data.success) return null;

              return (
                <div key={algo.key} className={`bg-gradient-to-br ${algo.color} bg-opacity-10 rounded-xl p-4 border border-opacity-20`}>
                  <h4 className="font-semibold text-white mb-2">{algo.fullName}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Type:</span>
                      <span className="text-white">{algo.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Success:</span>
                      <span className="text-green-400">✓ Completed</span>
                    </div>
                    {data.generations && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Generations:</span>
                        <span className="text-white">{data.generations}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Efficiency:</span>
                      <span className="text-white">{(data.efficiency * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};