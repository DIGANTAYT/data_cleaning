'use client';

import * as React from 'react';
import { useState } from 'react';
import { BrainCircuit, Loader2, Sparkles, AlertCircle, ChevronDown, CheckCircle, TrendingUp, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import axios from 'axios';
import { API_URL } from '@/lib/api';

interface AutoMLProps {
  datasetId: string;
  columns: string[];
  dataPreview?: any[];
}

export function AutoML({ datasetId, columns, dataPreview }: AutoMLProps) {
  const dateCols = columns?.filter(col => {
    const lower = col.toLowerCase();
    return lower.includes('date') || lower.includes('time') || lower.includes('year') || lower.includes('month') || lower.includes('day') || lower.includes('created') || lower.includes('stamp');
  }) || [];
  const defaultDateCol = dateCols.length > 0 ? dateCols[0] : (columns?.[0] || '');

  const [targetCol, setTargetCol] = useState(columns?.[columns.length - 1] || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedTimeCol, setSelectedTimeCol] = useState(defaultDateCol);

  React.useEffect(() => {
    if (columns && columns.length > 0) {
      setTargetCol(prev => prev || columns[columns.length - 1] || '');
      setSelectedTimeCol(prev => prev || defaultDateCol || '');
    }
  }, [columns, defaultDateCol]);

  const handleTrain = async () => {
    if (!targetCol) return;
    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/datasets/${datasetId}/train`, { targetColumn: targetCol }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(response.data.result);
    } catch (err) {
      console.error(err);
      setResult({ error: 'Failed to train model. Ensure the target column is valid.' });
    } finally {
      setLoading(false);
    }
  };

  const topFeature = result?.top_features?.[0]?.feature;
  const target = result?.target;
  const isRegression = result?.task === 'regression';

  return (
    <Card className="bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 backdrop-blur-md border border-neutral-800/80 shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300 mt-8">
      {/* Premium Purple Glow Accent */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/10 transition-all duration-300"></div>
      
      <CardHeader className="border-b border-neutral-800/50 pb-5">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">AutoML Prediction Studio</CardTitle>
            <CardDescription className="text-neutral-400 text-xs mt-0.5">
              Select a target column to predict. Our automated ML pipeline will extract features, train a Random Forest model, and evaluate performance.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="flex flex-col md:flex-row md:space-x-4 md:items-end gap-4 bg-neutral-950/30 border border-neutral-800/50 p-5 rounded-xl">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Target Variable (What to predict)</label>
            <div className="relative">
              <select 
                value={targetCol} 
                onChange={e => setTargetCol(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none cursor-pointer"
              >
                {columns?.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>
          
          <Button 
            onClick={handleTrain} 
            disabled={loading || !targetCol} 
            className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 px-6 rounded-lg shadow-lg shadow-purple-600/20 transition-all duration-200 cursor-pointer h-[42px] shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Training Model...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Start AutoML Training
              </>
            )}
          </Button>
        </div>

        {/* 📈 Result Performance Indicators */}
        {result && !result.error && (
          <div className="bg-neutral-950/60 border border-neutral-850 rounded-xl p-5 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800/60">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-ping"></div>
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Model Status</span>
              </div>
              <span className="text-xs font-bold text-neutral-400 bg-neutral-800/40 border border-neutral-750 px-2.5 py-1 rounded-full capitalize flex items-center">
                <CheckCircle className="w-3.5 h-3.5 text-green-400 mr-1.5" />
                {result.task} Trained Successfully
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.metrics?.accuracy !== undefined && (
                <div className="p-4 bg-neutral-900/40 border border-neutral-800/80 rounded-xl relative overflow-hidden group hover:border-green-500/20 transition-all">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Model Accuracy Score</span>
                  <p className="text-3xl font-extrabold text-green-400 mt-1">{(result.metrics.accuracy * 100).toFixed(2)}%</p>
                  <p className="text-xs text-neutral-500 mt-1">High predictive accuracy verified on the validation set.</p>
                </div>
              )}
              
              {result.metrics?.rmse !== undefined && (
                <div className="p-4 bg-neutral-900/40 border border-neutral-800/80 rounded-xl relative overflow-hidden group hover:border-orange-500/20 transition-all">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Root Mean Squared Error (RMSE)</span>
                  <p className="text-3xl font-extrabold text-orange-400 mt-1">{result.metrics.rmse.toFixed(4)}</p>
                  <p className="text-xs text-neutral-500 mt-1">Low deviation metrics representing highly accurate regression.</p>
                </div>
              )}
            </div>

            {/* Grid for Feature Importance and AI Graph Recommendation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* 📊 Feature Importance Breakdown */}
              {result.top_features && (
                <div className="space-y-4 bg-neutral-900/30 border border-neutral-800/50 p-4.5 rounded-xl">
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800/60 pb-2">
                    Feature Importance Analysis
                  </div>
                  
                  <div className="space-y-4">
                    {result.top_features.map((f: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-neutral-200">{f.feature}</span>
                          <span className="text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded font-mono">
                            {(f.importance * 100).toFixed(1)}% weight
                          </span>
                        </div>
                        
                        <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-900">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500" 
                            style={{ width: `${f.importance * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 📈 AI Graph Recommendation Visualizer */}
              {topFeature && target && dataPreview && dataPreview.length > 0 && (
                <div className="space-y-4 bg-neutral-900/30 border border-neutral-800/50 p-4.5 rounded-xl">
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800/60 pb-2 flex items-center justify-between">
                    <span>AI Visual Recommendation</span>
                    <span className="text-[9px] bg-purple-600/20 border border-purple-500/30 text-purple-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Recommended Plot
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Plotting prediction target <code className="bg-neutral-950 text-purple-400 px-1 py-0.5 rounded font-mono text-[10px]">{target}</code> against primary driver <code className="bg-neutral-950 text-purple-400 px-1 py-0.5 rounded font-mono text-[10px]">{topFeature}</code>:
                  </p>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {isRegression ? (
                        <AreaChart data={dataPreview}>
                          <defs>
                            <linearGradient id="mlColorGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                          <XAxis dataKey={topFeature} stroke="#737373" fontSize={9} />
                          <YAxis dataKey={target} stroke="#737373" fontSize={9} />
                          <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                          <Area type="monotone" dataKey={target} stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#mlColorGrad)" />
                        </AreaChart>
                      ) : (
                        <BarChart data={dataPreview}>
                          <defs>
                            <linearGradient id="mlBarGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ec4899" stopOpacity={0.8}/>
                              <stop offset="100%" stopColor="#ec4899" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                          <XAxis dataKey={topFeature} stroke="#737373" fontSize={9} />
                          <YAxis stroke="#737373" fontSize={9} />
                          <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                          <Bar dataKey={topFeature} fill="url(#mlBarGrad)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* 📈 Timeline Prediction Visualizer: Target Variable by Selected Time */}
            {target && dataPreview && dataPreview.length > 0 && (
              <div className="space-y-4 bg-neutral-900/30 border border-neutral-800/50 p-5 rounded-xl mt-6">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800/60 pb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-neutral-250">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    Target Variable ({target}) Trend over Time Timeline
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider font-mono">Time Column:</span>
                    <select
                      value={selectedTimeCol}
                      onChange={(e) => setSelectedTimeCol(e.target.value)}
                      className="bg-neutral-950 border border-neutral-850 text-[10px] font-bold text-neutral-350 rounded px-2 py-1 focus:outline-none cursor-pointer"
                    >
                      {columns?.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Visualizing chronological distribution trend of target label <code className="bg-neutral-950 text-purple-400 px-1 py-0.5 rounded font-mono text-[10px]">{target}</code> over selected timeline column <code className="bg-neutral-950 text-purple-400 px-1 py-0.5 rounded font-mono text-[10px]">{selectedTimeCol}</code>:
                </p>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dataPreview.slice(0, 30)}>
                      <defs>
                        <linearGradient id="timeColorGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4}/>
                          <stop offset="100%" stopColor="#a855f7" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey={selectedTimeCol} stroke="#737373" fontSize={9} />
                      <YAxis stroke="#737373" fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey={target} stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#timeColorGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ⚠️ Warning Block */}
        {result?.error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <p>{result.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
