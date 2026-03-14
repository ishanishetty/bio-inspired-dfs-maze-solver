import React from 'react';
import { PerformanceData } from '../types/maze';
import { Clock, Target, TrendingUp, Zap, Activity, Gauge } from 'lucide-react';

interface PerformanceMetricsProps {
  metrics: PerformanceData | null;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
        <div className="text-center text-slate-400 py-8">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Run an algorithm to see detailed performance data</p>
        </div>
      </div>
    );
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Performance Analytics</h3>
      
      <div className="space-y-6">
        {/* Individual Algorithm Metrics */}
        <div className="space-y-4">
          {Object.entries(metrics).map(([algorithm, data]) => {
            if (algorithm === 'comparison') return null;
            
            const algoData = data as any;
            if (!algoData.success) return null;

            const getAlgorithmColor = (algo: string) => {
              switch (algo) {
                case 'dfs': return 'from-purple-500 to-purple-600';
                case 'aco': return 'from-blue-500 to-blue-600';
                case 'abc': return 'from-green-500 to-green-600';
                case 'hybrid': return 'from-emerald-500 to-emerald-600';
                default: return 'from-gray-500 to-gray-600';
              }
            };

            const getAlgorithmName = (algo: string) => {
              switch (algo) {
                case 'dfs': return 'Depth-First Search';
                case 'aco': return 'Ant Colony Optimization';
                case 'abc': return 'Artificial Bee Colony';
                case 'hybrid': return 'Hybrid Bio-Inspired';
                default: return algo.toUpperCase();
              }
            };

            return (
              <div key={algorithm} className={`bg-gradient-to-r ${getAlgorithmColor(algorithm)} bg-opacity-10 rounded-xl p-5 border border-opacity-20`}>
                <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getAlgorithmColor(algorithm)}`}></div>
                  <span>{getAlgorithmName(algorithm)}</span>
                </h4>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-slate-400">Execution Time</p>
                      <p className="text-white font-semibold">{formatTime(algoData.executionTime)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Target className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-slate-400">Path Length</p>
                      <p className="text-white font-semibold">{algoData.pathLength}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <div>
                      <p className="text-slate-400">Nodes Explored</p>
                      <p className="text-white font-semibold">{formatNumber(algoData.nodesExplored)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="text-slate-400">Efficiency</p>
                      <p className="text-white font-semibold">{formatPercentage(algoData.efficiency)}</p>
                    </div>
                  </div>

                  {algoData.energyConsumption && (
                    <div className="flex items-center space-x-3">
                      <Activity className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <div>
                        <p className="text-slate-400">Energy Used</p>
                        <p className="text-white font-semibold">{formatNumber(algoData.energyConsumption)}</p>
                      </div>
                    </div>
                  )}

                  {algoData.explorationCoverage && (
                    <div className="flex items-center space-x-3">
                      <Gauge className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <div>
                        <p className="text-slate-400">Coverage</p>
                        <p className="text-white font-semibold">{formatPercentage(algoData.explorationCoverage)}</p>
                      </div>
                    </div>
                  )}

                  {algoData.generations && (
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-indigo-400 rounded-full flex-shrink-0"></div>
                      <div>
                        <p className="text-slate-400">Generations</p>
                        <p className="text-white font-semibold">{algoData.generations}</p>
                      </div>
                    </div>
                  )}

                  {algoData.convergenceTime && (
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-pink-400 rounded-full flex-shrink-0"></div>
                      <div>
                        <p className="text-slate-400">Convergence</p>
                        <p className="text-white font-semibold">{formatTime(algoData.convergenceTime)}</p>
                      </div>
                    </div>
                  )}

                  {algoData.adaptationRate && (
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-orange-400 rounded-full flex-shrink-0"></div>
                      <div>
                        <p className="text-slate-400">Adaptation</p>
                        <p className="text-white font-semibold">{formatPercentage(algoData.adaptationRate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Comparison Metrics */}
        {metrics.comparison && (
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-5 border border-blue-400/20">
            <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Bio-Inspired Advantage Analysis</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <span className="text-slate-300 text-sm">Speed Improvement</span>
                <span className={`font-semibold ${
                  metrics.comparison.speedImprovement > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metrics.comparison.speedImprovement > 0 ? '+' : ''}{formatPercentage(metrics.comparison.speedImprovement)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <span className="text-slate-300 text-sm">Path Optimality</span>
                <span className="text-emerald-400 font-semibold">
                  {formatPercentage(metrics.comparison.pathOptimality)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <span className="text-slate-300 text-sm">Exploration Efficiency</span>
                <span className={`font-semibold ${
                  metrics.comparison.explorationEfficiency > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metrics.comparison.explorationEfficiency > 0 ? '+' : ''}{formatPercentage(metrics.comparison.explorationEfficiency)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <span className="text-slate-300 text-sm">Adaptability</span>
                <span className={`font-semibold ${
                  metrics.comparison.adaptability > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metrics.comparison.adaptability > 0 ? '+' : ''}{formatPercentage(metrics.comparison.adaptability)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <span className="text-slate-300 text-sm">Robustness</span>
                <span className={`font-semibold ${
                  metrics.comparison.robustness > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metrics.comparison.robustness > 0 ? '+' : ''}{formatPercentage(metrics.comparison.robustness)}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-lg border border-emerald-400/20">
              <p className="text-slate-300 text-sm leading-relaxed">
                <strong className="text-white">Research Insight:</strong> The hybrid bio-inspired approach demonstrates superior performance in complex environments by combining the systematic exploration of DFS with the adaptive optimization capabilities of swarm intelligence algorithms, resulting in more robust and efficient pathfinding solutions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};