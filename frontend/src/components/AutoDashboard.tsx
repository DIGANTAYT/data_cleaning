'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, RadialBarChart, RadialBar } from 'recharts';
import { BarChart2, TrendingUp, PieChart as PieIcon, Sliders, ChevronDown, Check, Columns, Activity, Settings, Info, Network, Percent } from 'lucide-react';

interface AutoDashboardProps {
  dataPreview: any[]; // The first N rows or sample
  columns: string[];
}

const COLORS = [
  '#3b82f6', '#6366f1', '#8b5cf6', '#a5b4fc', 
  '#ec4899', '#d946ef', '#be123c', '#f43f5e', 
  '#ef4444', '#f97316', '#f59e0b', '#eab308', 
  '#84cc16', '#10b981', '#34d399', '#059669', 
  '#14b8a6', '#06b6d4', '#0ea5e9', '#64748b'
];
const THEME_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Lavender', value: '#a5b4fc' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Burgundy', value: '#be123c' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Green', value: '#10b981' },
  { name: 'Mint', value: '#34d399' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Slate', value: '#64748b' }
];

export function AutoDashboard({ dataPreview, columns }: AutoDashboardProps) {
  if (!dataPreview || dataPreview.length === 0) return null;

  // Find columns by data types
  let stringCols = columns.filter(col => typeof dataPreview[0][col] === 'string' && isNaN(Number(dataPreview[0][col])));
  let numCols = columns.filter(col => typeof dataPreview[0][col] === 'number' || !isNaN(Number(dataPreview[0][col])));

  if (stringCols.length === 0) stringCols = [columns[0]];
  if (numCols.length === 0) numCols = [columns[1] || columns[0]];

  const xCol = stringCols[0];
  const yCol1 = numCols[0];
  const yCol2 = numCols.length > 1 ? numCols[1] : null;

  // Custom Graph Builder State
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'scatter' | 'pie' | 'composed' | 'radial'>('bar');
  const [customX, setCustomX] = useState(xCol);
  const [customY, setCustomY] = useState(yCol1);
  const [customColor, setCustomColor] = useState('#3b82f6');
  const [customLimit, setCustomLimit] = useState<number>(10);
  
  const [distX, setDistX] = useState(xCol);
  const [distY, setDistY] = useState(yCol1);
  const [distLimit, setDistLimit] = useState<number>(10);
  
  const [trendX, setTrendX] = useState(xCol);
  const [trendY, setTrendY] = useState(yCol2 || yCol1);
  const [trendLimit, setTrendLimit] = useState<number>(10);
  
  // Custom Section for Interactive Display
  const [showTrendline, setShowTrendline] = useState(false);
  const [showGridlines, setShowGridlines] = useState(true);
  const [movingAverageWindow, setMovingAverageWindow] = useState(0);

  // processedData for Moving Average & Trendline
  const processedData = React.useMemo(() => {
    let result = dataPreview;
    
    if (customLimit > 0) {
      result = [...dataPreview]
        .sort((a, b) => (Number(b[customY]) || 0) - (Number(a[customY]) || 0))
        .slice(0, customLimit);
    }

    if (movingAverageWindow > 0) {
      const source = result;
      result = source.map((row, idx) => {
        const windowRows = source.slice(Math.max(0, idx - movingAverageWindow + 1), idx + 1);
        const sum = windowRows.reduce((acc, r) => acc + (Number(r[customY]) || 0), 0);
        const avg = sum / windowRows.length;
        return {
          ...row,
          [customY]: avg
        };
      });
    }

    if (showTrendline) {
      // Calculate linear regression: y = mx + c
      const n = result.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += Number(result[i][customY]) || 0;
        sumXY += i * (Number(result[i][customY]) || 0);
        sumXX += i * i;
      }
      const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
      const c = (sumY - m * sumX) / n;
      
      result = result.map((row, idx) => ({
        ...row,
        'Trendline': m * idx + c
      }));
    }

    return result;
  }, [dataPreview, customY, movingAverageWindow, showTrendline, customLimit]);

  const processedDistData = React.useMemo(() => {
    if (distLimit > 0) {
      return [...dataPreview]
        .sort((a, b) => (Number(b[distY]) || 0) - (Number(a[distY]) || 0))
        .slice(0, distLimit);
    }
    return dataPreview;
  }, [dataPreview, distY, distLimit]);

  const processedTrendData = React.useMemo(() => {
    if (trendLimit > 0) {
      return [...dataPreview]
        .sort((a, b) => (Number(b[trendY]) || 0) - (Number(a[trendY]) || 0))
        .slice(0, trendLimit);
    }
    return dataPreview;
  }, [dataPreview, trendY, trendLimit]);

  // Dynamic Category Composition State
  const [compCategory, setCompCategory] = useState(xCol);
  const [compMetric, setCompMetric] = useState(yCol1);
  const [compChartType, setCompChartType] = useState<'donut' | 'pie' | 'radial'>('donut');
  const [compLimit, setCompLimit] = useState<number>(5);
  const [compSidebarTab, setCompSidebarTab] = useState<'share' | 'metric_profile'>('share');
  
  // Custom states for AI Hypothesis Testing Sandbox
  const [hypothesisTemplate, setHypothesisTemplate] = useState<string>('positive');
  const [hypothesisX, setHypothesisX] = useState(numCols[0] || columns[0]);
  const [hypothesisY, setHypothesisY] = useState(numCols.length > 1 ? numCols[1] : (numCols[0] || columns[0]));
  const [customHypothesisText, setCustomHypothesisText] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0.95);
  const [hypothesisResult, setHypothesisResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  
  // Custom states for Auto-Generated Analytical Insights selectors
  const [radarCols, setRadarCols] = useState<string[]>(numCols.slice(0, 5));
  const [cumulX, setCumulX] = useState(xCol);
  const [cumulY, setCumulY] = useState(yCol1);

  // Custom Section for Auto-Generated Analytical Insights
  const [auditCol, setAuditCol] = useState(columns[0]);
  const [auditX, setAuditX] = useState(columns[0]);
  const [auditChartType, setAuditChartType] = useState<'bar' | 'line' | 'area'>('bar');

  // Interactive 5 KPIs configurations
  const [kpiConfigs, setKpiConfigs] = useState([
    { id: 1, label: `Average of ${yCol1}`, column: yCol1, operation: 'mean', color: 'text-blue-400', border: 'hover:border-blue-500/30' },
    { id: 2, label: `Max of ${yCol1}`, column: yCol1, operation: 'max', color: 'text-emerald-400', border: 'hover:border-emerald-500/30' },
    { id: 3, label: `Unique of ${xCol}`, column: xCol, operation: 'unique', color: 'text-purple-400', border: 'hover:border-purple-500/30' },
    { id: 4, label: `Total of ${yCol2 || yCol1}`, column: yCol2 || yCol1, operation: 'sum', color: 'text-amber-400', border: 'hover:border-amber-500/30' },
    { id: 5, label: `Completeness of ${yCol1}`, column: yCol1, operation: 'completeness', color: 'text-rose-400', border: 'hover:border-rose-500/30' }
  ]);

  const [activeKpiSettings, setActiveKpiSettings] = useState<number | null>(null);

  // Update KPI column/operation
  const updateKpiConfig = (id: number, field: 'column' | 'operation', value: string) => {
    setKpiConfigs(prev => prev.map(kpi => {
      if (kpi.id === id) {
        const nextKpi = { ...kpi, [field]: value };
        const opLabels: { [key: string]: string } = {
          mean: 'Average',
          sum: 'Total Sum',
          max: 'Maximum',
          min: 'Minimum',
          unique: 'Unique Count',
          completeness: 'Completeness %',
          median: 'Median'
        };
        nextKpi.label = `${opLabels[nextKpi.operation]} of ${nextKpi.column}`;
        return nextKpi;
      }
      return kpi;
    }));
  };

  // Perform KPI calculation dynamically
  const calculateKpi = (column: string, operation: string) => {
    const rawVals = dataPreview.map(d => d[column]);
    
    if (operation === 'unique') {
      const uniqueVals = new Set(rawVals.filter(v => v !== null && v !== undefined && v !== ''));
      return uniqueVals.size.toLocaleString();
    }
    
    if (operation === 'completeness') {
      const nonNulls = rawVals.filter(v => v !== null && v !== undefined && v !== '');
      const pct = (nonNulls.length / dataPreview.length) * 100;
      return `${pct.toFixed(1)}%`;
    }

    const numericVals = rawVals.map(v => Number(v)).filter(v => !isNaN(v));
    if (numericVals.length === 0) return '0.00';

    if (operation === 'mean') {
      const sum = numericVals.reduce((a, b) => a + b, 0);
      return (sum / numericVals.length).toFixed(2);
    }
    if (operation === 'max') {
      return Math.max(...numericVals).toFixed(2);
    }
    if (operation === 'min') {
      return Math.min(...numericVals).toFixed(2);
    }
    if (operation === 'sum') {
      return numericVals.reduce((a, b) => a + b, 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    if (operation === 'median') {
      const sorted = [...numericVals].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      return median.toFixed(2);
    }
    
    return '0.00';
  };

  const runHypothesisTest = () => {
    setTesting(true);
    setTimeout(() => {
      try {
        const pairs = dataPreview
          .map(d => ({ x: Number(d[hypothesisX]), y: Number(d[hypothesisY]) }))
          .filter(p => !isNaN(p.x) && !isNaN(p.y));

        const n = pairs.length;
        if (n < 3) {
          setHypothesisResult({ error: 'Need at least 3 rows with valid numeric data to perform test.' });
          setTesting(false);
          return;
        }

        const sumX = pairs.reduce((sum, p) => sum + p.x, 0);
        const sumY = pairs.reduce((sum, p) => sum + p.y, 0);
        const meanX = sumX / n;
        const meanY = sumY / n;

        let num = 0;
        let denX = 0;
        let denY = 0;

        for (let i = 0; i < n; i++) {
          const diffX = pairs[i].x - meanX;
          const diffY = pairs[i].y - meanY;
          num += diffX * diffY;
          denX += diffX * diffX;
          denY += diffY * diffY;
        }

        const r = denX === 0 || denY === 0 ? 0 : num / Math.sqrt(denX * denY);
        
        // Calculate t-statistic
        const r2 = r * r;
        const tStat = r2 === 1 ? 999 : r * Math.sqrt((n - 2) / (1 - r2));
        
        // Approximate p-value
        const z = Math.abs(tStat);
        const pVal = 2 * (1 - (1 / (1 + Math.exp(1.5976 * z * (1 + 0.04417 * z * z)))));

        const alpha = 1 - confidenceLevel;
        const isSignificant = pVal < alpha;

        let strength = 'No correlation';
        const absR = Math.abs(r);
        if (absR >= 0.7) strength = r > 0 ? 'Strong Positive' : 'Strong Negative';
        else if (absR >= 0.4) strength = r > 0 ? 'Moderate Positive' : 'Moderate Negative';
        else if (absR >= 0.1) strength = r > 0 ? 'Weak Positive' : 'Weak Negative';

        let templateVerdict = false;
        let explanation = '';
        
        if (hypothesisTemplate === 'positive') {
          templateVerdict = isSignificant && r > 0.1;
          explanation = templateVerdict 
            ? `Hypothesis CONFIRMED: There is a statistically significant positive correlation (r = ${r.toFixed(3)}, p = ${pVal.toFixed(4)}) between ${hypothesisX} and ${hypothesisY}. As ${hypothesisX} increases, ${hypothesisY} increases systematically.`
            : `Hypothesis REJECTED: No statistically significant positive correlation was found. The correlation coefficient is r = ${r.toFixed(3)} and the p-value is ${pVal.toFixed(4)}, which is above the significance threshold of alpha = ${alpha.toFixed(2)}.`;
        } else if (hypothesisTemplate === 'negative') {
          templateVerdict = isSignificant && r < -0.1;
          explanation = templateVerdict
            ? `Hypothesis CONFIRMED: There is a statistically significant negative correlation (r = ${r.toFixed(3)}, p = ${pVal.toFixed(4)}) between ${hypothesisX} and ${hypothesisY}. As ${hypothesisX} increases, ${hypothesisY} decreases systematically.`
            : `Hypothesis REJECTED: No statistically significant negative correlation was found. The correlation coefficient is r = ${r.toFixed(3)} and the p-value is ${pVal.toFixed(4)}, which is above the significance threshold of alpha = ${alpha.toFixed(2)}.`;
        } else if (hypothesisTemplate === 'independent') {
          templateVerdict = !isSignificant || Math.abs(r) < 0.1;
          explanation = templateVerdict
            ? `Hypothesis CONFIRMED: The variables are statistically independent. The p-value of ${pVal.toFixed(4)} and correlation of r = ${r.toFixed(3)} show no systematic linear relationship.`
            : `Hypothesis REJECTED: The variables are NOT independent. We found a statistically significant correlation of r = ${r.toFixed(3)} (p = ${pVal.toFixed(4)}), showing they are linearly dependent.`;
        } else {
          templateVerdict = isSignificant;
          explanation = templateVerdict
            ? `Custom Hypothesis SUPPORTED: We found a statistically significant linear correlation between the selected variables (r = ${r.toFixed(3)}, p = ${pVal.toFixed(4)}), indicating a strong mathematical pattern.`
            : `Custom Hypothesis UNSUPPORTED: No statistically significant linear pattern was found (r = ${r.toFixed(3)}, p = ${pVal.toFixed(4)}). The null hypothesis cannot be rejected.`;
        }

        setHypothesisResult({
          r,
          absR,
          pVal,
          tStat,
          isSignificant,
          strength,
          templateVerdict,
          explanation,
          sampleCount: n
        });
      } catch (err: any) {
        setHypothesisResult({ error: `Calculation error: ${err.message}` });
      } finally {
        setTesting(false);
      }
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* 🚀 Interactive Summary KPI Grid (5 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {kpiConfigs.map((kpi) => {
          const value = calculateKpi(kpi.column, kpi.operation);
          const isEditing = activeKpiSettings === kpi.id;

          return (
            <Card 
              key={kpi.id} 
              className={`bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 backdrop-blur-md border border-neutral-800/80 shadow-2xl relative overflow-hidden group transition-all duration-300 ${kpi.border} flex flex-col justify-between`}
            >
              {/* Settings Toggle Trigger */}
              <button
                onClick={() => setActiveKpiSettings(isEditing ? null : kpi.id)}
                className="absolute top-2.5 right-2.5 text-neutral-500 hover:text-neutral-300 transition-colors z-10 p-1 rounded-full hover:bg-neutral-850 cursor-pointer"
                title="Customize KPI Metric"
              >
                <Settings className={`w-3.5 h-3.5 ${isEditing ? 'rotate-90 text-blue-400' : ''} transition-transform duration-300`} />
              </button>

              <CardHeader className="pb-2 pt-4 px-4 relative">
                {isEditing ? (
                  // KPI Settings Block
                  <div className="space-y-2.5 pt-2 z-20">
                    <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Configure Card</div>
                    
                    {/* Column Select */}
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-semibold text-neutral-400">Column</label>
                      <select
                        value={kpi.column}
                        onChange={(e) => updateKpiConfig(kpi.id, 'column', e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-[10px] rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        {columns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    {/* Operation Select */}
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-semibold text-neutral-400">Operation</label>
                      <select
                        value={kpi.operation}
                        onChange={(e) => updateKpiConfig(kpi.id, 'operation', e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-[10px] rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="mean">Average (Mean)</option>
                        <option value="max">Maximum</option>
                        <option value="min">Minimum</option>
                        <option value="sum">Sum Total</option>
                        <option value="median">Median</option>
                        <option value="unique">Unique Count</option>
                        <option value="completeness">Completeness %</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  // KPI Display Block
                  <>
                    <CardDescription className="text-neutral-400 text-[10px] font-semibold uppercase tracking-wider truncate pr-5" title={kpi.label}>
                      {kpi.label}
                    </CardDescription>
                    <CardTitle className={`text-2xl font-extrabold mt-1.5 truncate ${kpi.color}`}>
                      {value}
                    </CardTitle>
                  </>
                )}
              </CardHeader>
              
              {!isEditing && (
                <CardContent className="px-4 pb-3 pt-0">
                  <p className="text-[9px] text-neutral-500 flex items-center">
                    <Info className="w-2.5 h-2.5 mr-1 text-neutral-600" />
                    Interactive data sample summary.
                  </p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 🛠️ Dynamic Custom Graph Builder Workbench */}
        <Card className="lg:col-span-1 bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800/90 shadow-2xl flex flex-col justify-between">
          <CardHeader className="border-b border-neutral-800/50 pb-4">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-lg">Graph Workbench</CardTitle>
            </div>
            <CardDescription className="text-xs text-neutral-400 mt-1">Design and render a custom graph in real-time.</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-5 pt-5 flex-1">
            {/* Chart Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Chart Type</label>
              <div className="grid grid-cols-4 gap-2">
                {(['bar', 'line', 'area', 'scatter', 'pie', 'composed', 'radial'] as const).map(type => (
                  <Button
                    key={type}
                    variant={chartType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType(type)}
                    className={`capitalize text-[10px] font-medium py-1 transition-all duration-200 ${chartType === type ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white'}`}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* X Axis Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center">
                <Columns className="w-3 h-3 mr-1 text-blue-400" /> X-Axis (Category)
              </label>
              <div className="relative">
                <select
                  value={customX}
                  onChange={(e) => setCustomX(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Y Axis Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center">
                <Activity className="w-3 h-3 mr-1 text-emerald-400" /> Y-Axis (Metric)
              </label>
              <div className="relative">
                <select
                  value={customY}
                  onChange={(e) => setCustomY(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  {numCols.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Limit Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center">
                <Percent className="w-3 h-3 mr-1 text-purple-400" /> Limit Data Points
              </label>
              <div className="relative">
                <select
                  value={customLimit}
                  onChange={(e) => setCustomLimit(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  <option value={5}>Top 5 Rows (Sorted)</option>
                  <option value={10}>Top 10 Rows (Sorted)</option>
                  <option value={20}>Top 20 Rows (Sorted)</option>
                  <option value={0}>All Rows (Unsorted)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Theme Color Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Palette Accent Grid</label>
              <div className="grid grid-cols-5 gap-2.5">
                {THEME_COLORS.map(color => (
                  <button
                    key={color.value}
                    onClick={() => setCustomColor(color.value)}
                    className="w-8 h-8 rounded-full border border-neutral-800 hover:scale-110 transition-all flex items-center justify-center cursor-pointer relative mx-auto"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {customColor === color.value && (
                      <Check className="w-4 h-4 text-black font-extrabold stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Interactive Settings */}
            <div className="space-y-3 pt-3 border-t border-neutral-800/50">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-blue-400" />
                Advanced Display Customization
              </label>
              
              <div className="flex flex-col gap-2 bg-neutral-950/40 p-3 rounded-lg border border-neutral-850">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-300">Show Trendline</span>
                  <input 
                    type="checkbox" 
                    checked={showTrendline} 
                    onChange={e => setShowTrendline(e.target.checked)}
                    className="w-4 h-4 rounded bg-neutral-950 border-neutral-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-300">Show Gridlines</span>
                  <input 
                    type="checkbox" 
                    checked={showGridlines} 
                    onChange={e => setShowGridlines(e.target.checked)}
                    className="w-4 h-4 rounded bg-neutral-950 border-neutral-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-neutral-400">
                    <span>Moving Average Window</span>
                    <span className="font-mono text-blue-400">{movingAverageWindow} rows</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    value={movingAverageWindow}
                    onChange={e => setMovingAverageWindow(Number(e.target.value))}
                    className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <div className="p-5 border-t border-neutral-800/50 bg-neutral-950/20 text-xs text-neutral-500 rounded-b-lg">
            Interactive parameters build an instant visual model from your dataset sample.
          </div>
        </Card>

        {/* 💻 Custom Workbench Graph Screen */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800/80 shadow-2xl relative">
          <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full text-xs font-medium text-blue-400">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            <span>Custom Graph Preview</span>
          </div>

          <CardHeader>
            <CardTitle className="text-lg">Interactive Display: {customY} by {customX}</CardTitle>
            <CardDescription className="text-neutral-400">Calculated custom visual mapping using active accents.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[310px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={processedData}>
                    <defs>
                      <linearGradient id="customColorGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={customColor} stopOpacity={0.85}/>
                        <stop offset="100%" stopColor={customColor} stopOpacity={0.15}/>
                      </linearGradient>
                    </defs>
                    {showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />}
                    <XAxis dataKey={customX} stroke="#737373" fontSize={11} />
                    <YAxis stroke="#737373" fontSize={11} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                    <Bar dataKey={customY} fill="url(#customColorGrad)" radius={[4, 4, 0, 0]} />
                    {showTrendline && <Line type="monotone" dataKey="Trendline" stroke="#ef4444" strokeWidth={2} dot={false} />}
                  </BarChart>
                ) : chartType === 'line' ? (
                  <LineChart data={processedData}>
                    {showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#262626" />}
                    <XAxis dataKey={customX} stroke="#737373" fontSize={11} />
                    <YAxis stroke="#737373" fontSize={11} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey={customY} stroke={customColor} strokeWidth={2.5} dot={{ r: 5, strokeWidth: 1.5, fill: '#0a0a0a' }} />
                    {showTrendline && <Line type="monotone" dataKey="Trendline" stroke="#ef4444" strokeWidth={2} dot={false} />}
                  </LineChart>
                ) : chartType === 'area' ? (
                  <AreaChart data={processedData}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={customColor} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={customColor} stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    {showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#262626" />}
                    <XAxis dataKey={customX} stroke="#737373" fontSize={11} />
                    <YAxis stroke="#737373" fontSize={11} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey={customY} stroke={customColor} strokeWidth={2.5} fillOpacity={1} fill="url(#areaGrad)" />
                    {showTrendline && <Line type="monotone" dataKey="Trendline" stroke="#ef4444" strokeWidth={2} dot={false} />}
                  </AreaChart>
                ) : chartType === 'scatter' ? (
                  <ScatterChart>
                    {showGridlines && <CartesianGrid stroke="#262626" />}
                    <XAxis type="category" dataKey={customX} stroke="#737373" fontSize={11} />
                    <YAxis type="number" dataKey={customY} stroke="#737373" fontSize={11} />
                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                    <Scatter name={customY} data={processedData} fill={customColor} />
                  </ScatterChart>
                ) : chartType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={processedData.slice(0, 8)}
                      dataKey={customY}
                      nameKey={customX}
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={45}
                      paddingAngle={2}
                      cornerRadius={4}
                    >
                      {processedData.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                  </PieChart>
                ) : chartType === 'composed' ? (
                  <ComposedChart data={processedData}>
                    {showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#262626" />}
                    <XAxis dataKey={customX} stroke="#737373" fontSize={11} />
                    <YAxis stroke="#737373" fontSize={11} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                    <Bar dataKey={customY} fill={customColor} radius={[4, 4, 0, 0]} opacity={0.7} />
                    <Line type="monotone" dataKey={customY} stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                    {showTrendline && <Line type="monotone" dataKey="Trendline" stroke="#ef4444" strokeWidth={2} dot={false} />}
                  </ComposedChart>
                ) : (
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={10} data={processedData.slice(0, 8)}>
                    <RadialBar
                      label={{ position: 'insideStart', fill: '#fff', fontSize: 9 }}
                      background
                      dataKey={customY}
                    >
                      {processedData.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </RadialBar>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                  </RadialBarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 📊 Default Auto-Visualization report cards */}
      <div>
        <h3 className="text-xl font-bold tracking-tight text-neutral-200 mb-5 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-500" /> Auto-Generated Analytical Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="dark bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 text-neutral-50 shadow-xl">
            <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-md flex items-center">
                <BarChart2 className="w-4 h-4 mr-2 text-blue-400" />
                Distribution: {distY} by {distX}
              </CardTitle>
              <div className="flex items-center space-x-1">
                <select
                  value={distX}
                  onChange={(e) => setDistX(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 text-[10px] text-neutral-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                >
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <select
                  value={distY}
                  onChange={(e) => setDistY(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 text-[10px] text-neutral-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                >
                  {numCols.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <select
                  value={distLimit}
                  onChange={(e) => setDistLimit(Number(e.target.value))}
                  className="bg-neutral-950 border border-neutral-850 text-[10px] font-bold text-neutral-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                >
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                  <option value={25}>Top 25</option>
                  <option value={0}>All</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processedDistData}>
                    <defs>
                      <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.85}/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis dataKey={distX} stroke="#737373" fontSize={11} />
                    <YAxis stroke="#737373" fontSize={11} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                    <Bar dataKey={distY} fill="url(#barGrad1)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="dark bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 text-neutral-50 shadow-xl">
            <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-md flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-emerald-400" />
                Linear Trend: {trendY} over {trendX}
              </CardTitle>
              <div className="flex items-center space-x-1">
                <select
                  value={trendX}
                  onChange={(e) => setTrendX(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 text-[10px] text-neutral-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                >
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <select
                  value={trendY}
                  onChange={(e) => setTrendY(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 text-[10px] text-neutral-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                >
                  {numCols.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <select
                  value={trendLimit}
                  onChange={(e) => setTrendLimit(Number(e.target.value))}
                  className="bg-neutral-950 border border-neutral-850 text-[10px] font-bold text-neutral-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                >
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                  <option value={25}>Top 25</option>
                  <option value={0}>All</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey={trendX} stroke="#737373" fontSize={11} />
                    <YAxis stroke="#737373" fontSize={11} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey={trendY} stroke="#10b981" strokeWidth={2.5} dot={{ r: 5, strokeWidth: 1.5, fill: '#0a0a0a' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="dark bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 text-neutral-50 shadow-xl md:col-span-2 relative overflow-hidden">
            <CardHeader className="pb-4 border-b border-neutral-850 bg-neutral-950/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-md flex items-center font-bold">
                  <PieIcon className="w-4.5 h-4.5 mr-2 text-purple-400" />
                  Category Composition Profile (Top {compLimit} Categories)
                </CardTitle>
                <CardDescription className="text-neutral-400 text-xs">Real-time aggregated group composition mapping.</CardDescription>
              </div>

              {/* Custom Options Panel */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Category Column selector */}
                <div className="flex items-center space-x-1">
                  <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider font-mono">By</span>
                  <select
                    value={compCategory}
                    onChange={(e) => setCompCategory(e.target.value)}
                    className="bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-[10px] font-bold text-neutral-300 rounded px-2 py-1 focus:outline-none cursor-pointer"
                  >
                    {stringCols.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                {/* Metric Column selector */}
                <div className="flex items-center space-x-1">
                  <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider font-mono">Metric</span>
                  <select
                    value={compMetric}
                    onChange={(e) => setCompMetric(e.target.value)}
                    className="bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-[10px] font-bold text-neutral-300 rounded px-2 py-1 focus:outline-none cursor-pointer"
                  >
                    {numCols.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                {/* Limit selector */}
                <div className="flex items-center space-x-1">
                  <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider font-mono">Top</span>
                  <select
                    value={compLimit}
                    onChange={(e) => setCompLimit(Number(e.target.value))}
                    className="bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-[10px] font-bold text-neutral-300 rounded px-2 py-1 focus:outline-none cursor-pointer"
                  >
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                    <option value={8}>8</option>
                    <option value={10}>10</option>
                  </select>
                </div>

                {/* Type Selector */}
                <div className="flex items-center space-x-1">
                  <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider font-mono">Type</span>
                  <select
                    value={compChartType}
                    onChange={(e) => setCompChartType(e.target.value as any)}
                    className="bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-[10px] font-bold text-neutral-300 rounded px-2 py-1 focus:outline-none cursor-pointer"
                  >
                    <option value="donut">Donut</option>
                    <option value="pie">Pie</option>
                    <option value="radial">Radial</option>
                  </select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {(() => {
                // Perform dynamic grouped aggregation
                const aggregates: Record<string, number> = {};
                dataPreview.forEach(row => {
                  const catVal = String(row[compCategory] === null || row[compCategory] === undefined || row[compCategory] === '' ? 'Unknown' : row[compCategory]);
                  const numVal = Number(row[compMetric]) || 0;
                  aggregates[catVal] = (aggregates[catVal] || 0) + numVal;
                });

                const sorted = Object.entries(aggregates)
                  .map(([name, value]) => ({ name, value }))
                  .sort((a, b) => b.value - a.value);

                const totalVolume = sorted.reduce((sum, item) => sum + item.value, 0);

                const topN = sorted.slice(0, compLimit);
                const othersSum = sorted.slice(compLimit).reduce((sum, item) => sum + item.value, 0);

                if (othersSum > 0 && sorted.length > compLimit) {
                  topN.push({ name: 'Others', value: othersSum });
                }

                const pieData = topN.map((item, idx) => ({
                  ...item,
                  color: COLORS[idx % COLORS.length]
                }));

                return (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                    {/* Left Side: Dynamic Chart */}
                    <div className="md:col-span-3 relative h-72 w-full flex items-center justify-center">
                      {compChartType !== 'radial' && (
                        <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
                          <span className="text-neutral-500 text-[9px] uppercase font-bold tracking-wider">Total Sum</span>
                          <span className="text-2xl font-black text-neutral-100 mt-0.5">
                            {totalVolume > 1e6 ? `${(totalVolume / 1e6).toFixed(1)}M` : totalVolume > 1e3 ? `${(totalVolume / 1e3).toFixed(0)}k` : totalVolume.toLocaleString()}
                          </span>
                          <span className="text-[8px] text-neutral-500 font-mono mt-0.5 truncate max-w-[120px]">{compMetric}</span>
                        </div>
                      )}
                      
                      <ResponsiveContainer width="100%" height="100%">
                        {compChartType === 'radial' ? (
                          <BarChart data={pieData} layout="vertical" barCategoryGap="20%">
                            <CartesianGrid stroke="#262626" horizontal={false} />
                            <XAxis type="number" stroke="#737373" fontSize={9} />
                            <YAxis type="category" dataKey="name" stroke="#737373" fontSize={9} width={80} />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        ) : (
                          <PieChart>
                            <Pie
                              data={pieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={compChartType === 'donut' ? 70 : 0}
                              outerRadius={95}
                              paddingAngle={2}
                              cornerRadius={4}
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                          </PieChart>
                        )}
                      </ResponsiveContainer>
                    </div>

                    {/* Right Side: Detailed Structured Sidebar Legend / Metric Profile */}
                    <div className="md:col-span-2 space-y-3 pr-2">
                      <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800 pb-1.5 mb-2 font-mono flex justify-between items-center">
                        <span>{compSidebarTab === 'share' ? 'Share Breakdown' : 'Metric Group Profile'}</span>
                        <div className="flex bg-neutral-950 border border-neutral-850 p-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider font-mono">
                          <button
                            onClick={() => setCompSidebarTab('share')}
                            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${compSidebarTab === 'share' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                          >
                            Share
                          </button>
                          <button
                            onClick={() => setCompSidebarTab('metric_profile')}
                            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${compSidebarTab === 'metric_profile' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                          >
                            Profile
                          </button>
                        </div>
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-neutral-850">
                        {compSidebarTab === 'share' ? (
                          pieData.map((item, idx) => {
                            const percent = totalVolume > 0 ? (item.value / totalVolume) * 100 : 0;
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <div className="flex items-center space-x-2 truncate mr-2">
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                                    <span className="font-medium text-neutral-200 truncate font-mono text-[11px]" title={item.name}>{item.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 shrink-0">
                                    <span className="font-bold text-neutral-300 text-[11px]">
                                      {item.value > 1e6 ? `${(item.value / 1e6).toFixed(1)}M` : item.value > 1e3 ? `${(item.value / 1e3).toFixed(0)}k` : item.value.toLocaleString()}
                                    </span>
                                    <span className="text-[9px] text-neutral-400 bg-neutral-800 border border-neutral-750 px-1 py-0.5 rounded font-mono font-extrabold">{percent.toFixed(0)}%</span>
                                  </div>
                                </div>
                                <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-900">
                                  <div 
                                    className="h-full rounded-full transition-all duration-500 ease-out" 
                                    style={{ 
                                      backgroundColor: item.color,
                                      width: `${percent}%`
                                    }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          pieData.map((item, idx) => {
                            const grpValues = dataPreview
                              .filter(row => String(row[compCategory] === null || row[compCategory] === undefined || row[compCategory] === '' ? 'Unknown' : row[compCategory]) === item.name)
                              .map(row => Number(row[compMetric]))
                              .filter(val => !isNaN(val));

                            const grpSum = grpValues.reduce((a, b) => a + b, 0);
                            const grpAvg = grpValues.length > 0 ? grpSum / grpValues.length : 0;
                            const grpMax = grpValues.length > 0 ? Math.max(...grpValues) : 0;
                            const sharePct = totalVolume > 0 ? (grpSum / totalVolume) * 100 : 0;

                            return (
                              <div key={idx} className="bg-neutral-950/50 p-2.5 rounded-lg border border-neutral-850 space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] font-semibold text-neutral-300">
                                  <div className="flex items-center space-x-1.5 truncate mr-2">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                                    <span className="font-mono text-neutral-200 truncate max-w-[125px]" title={item.name}>{item.name}</span>
                                  </div>
                                  <span className="font-mono text-[9px] bg-neutral-900 border border-neutral-800 text-purple-400 px-1 py-0.5 rounded font-bold shrink-0">{sharePct.toFixed(0)}% Share</span>
                                </div>
                                <div className="grid grid-cols-3 gap-1.5 text-[9px] text-neutral-500 font-mono">
                                  <div>
                                    <span className="block text-[8px] text-neutral-600 uppercase">Sum</span>
                                    <span className="font-bold text-neutral-300">{grpSum > 1e6 ? `${(grpSum/1e6).toFixed(1)}M` : grpSum > 1e3 ? `${(grpSum/1e3).toFixed(0)}k` : grpSum.toLocaleString(undefined, {maximumFractionDigits: 1})}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[8px] text-neutral-600 uppercase">Average</span>
                                    <span className="font-bold text-neutral-350">{grpAvg > 1e6 ? `${(grpAvg/1e6).toFixed(1)}M` : grpAvg > 1e3 ? `${(grpAvg/1e3).toFixed(0)}k` : grpAvg.toFixed(1)}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[8px] text-neutral-600 uppercase">Max</span>
                                    <span className="font-bold text-neutral-350">{grpMax > 1e6 ? `${(grpMax/1e6).toFixed(1)}M` : grpMax > 1e3 ? `${(grpMax/1e3).toFixed(0)}k` : grpMax.toFixed(1)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Radar Dimensional Feature Density Net */}
          {numCols.length >= 3 && (
            <Card className="dark bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 text-neutral-50 shadow-xl md:col-span-1 flex flex-col justify-between">
              <div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center font-bold">
                    <Network className="w-4.5 h-4.5 mr-2 text-indigo-400" />
                    Multivariate Feature Performance Net
                  </CardTitle>
                  <CardDescription className="text-neutral-400 text-xs">Radar correlation of primary numeric metrics.</CardDescription>
                </CardHeader>
                <div className="flex flex-wrap gap-1 px-4 py-2 bg-neutral-950/20 border-y border-neutral-850/40">
                  {numCols.slice(0, 8).map(col => {
                    const isActive = radarCols.includes(col);
                    return (
                      <button
                        key={col}
                        onClick={() => {
                          setRadarCols(prev => 
                            prev.includes(col) 
                              ? prev.filter(c => c !== col) 
                              : [...prev, col]
                          );
                        }}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {col}
                      </button>
                    );
                  })}
                </div>
              </div>
              <CardContent className="pt-4 flex-1 flex items-center justify-center">
                <div className="h-72 w-full flex items-center justify-center">
                  {(() => {
                    const activeRadar = radarCols.length >= 3 ? radarCols : numCols.slice(0, 4);
                    const radarData = activeRadar.map(col => {
                      const values = dataPreview.map(d => Number(d[col])).filter(v => !isNaN(v));
                      const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                      return {
                        subject: col,
                        A: avg,
                        fullMark: Math.max(...values, 1)
                      };
                    });

                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid stroke="#262626" />
                          <PolarAngleAxis dataKey="subject" stroke="#737373" fontSize={10} />
                          <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#737373" fontSize={9} />
                          <Radar name="Average value" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cumulative Growth Run-Rate Area Chart */}
          <Card className="dark bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 text-neutral-50 shadow-xl md:col-span-1">
            <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-md flex items-center font-bold">
                <Percent className="w-4.5 h-4.5 mr-2 text-rose-400" />
                Cumulative Growth: {cumulY} over {cumulX}
              </CardTitle>
              <div className="flex items-center space-x-1 shrink-0">
                <select
                  value={cumulX}
                  onChange={(e) => setCumulX(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 text-[10px] text-neutral-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                >
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <select
                  value={cumulY}
                  onChange={(e) => setCumulY(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 text-[10px] text-neutral-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                >
                  {numCols.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                {(() => {
                  let total = 0;
                  const cumulativeData = dataPreview.map(d => {
                    const val = Number(d[cumulY]) || 0;
                    total += val;
                    return {
                      category: d[cumulX] || 'Unknown',
                      'Cumulative Sum': total
                    };
                  });

                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cumulativeData}>
                        <defs>
                          <linearGradient id="cumulGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4}/>
                            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                        <XAxis dataKey="category" stroke="#737373" fontSize={9} />
                        <YAxis stroke="#737373" fontSize={9} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="Cumulative Sum" stroke="#f43f5e" strokeWidth={2.5} fill="url(#cumulGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Custom Section on Auto-Generated Analytical Insights: Custom Feature Audit Sandbox */}
        <Card className="dark bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 backdrop-blur-md border border-neutral-800/80 text-neutral-50 shadow-2xl mt-8 overflow-hidden">
          <CardHeader className="border-b border-neutral-850 pb-4 bg-neutral-950/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-md flex items-center font-bold">
                  <Sliders className="w-4.5 h-4.5 mr-2 text-rose-400" />
                  Custom Feature Audit Sandbox
                </CardTitle>
                <CardDescription className="text-neutral-400 text-xs">Run a customized analytical audit on any column feature in real-time.</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">X-Axis</span>
                  <select
                    value={auditX}
                    onChange={(e) => setAuditX(e.target.value)}
                    className="bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-[10px] font-bold text-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                  >
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">Feature (Y)</span>
                  <select
                    value={auditCol}
                    onChange={(e) => setAuditCol(e.target.value)}
                    className="bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-[10px] font-bold text-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                  >
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">Plot Type</span>
                  <select
                    value={auditChartType}
                    onChange={(e) => setAuditChartType(e.target.value as any)}
                    className="bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-[10px] font-bold text-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                  >
                    <option value="bar">Bar Plot</option>
                    <option value="line">Line Plot</option>
                    <option value="area">Area Plot</option>
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {(() => {
              const vals = dataPreview.map(d => d[auditCol]);
              const total = vals.length;
              const nonNull = vals.filter(v => v !== null && v !== undefined && v !== '').length;
              const missing = total - nonNull;
              const distinct = new Set(vals.filter(v => v !== null && v !== undefined && v !== '')).size;
              
              const numericVals = vals.map(v => Number(v)).filter(v => !isNaN(v));
              const isNumeric = numericVals.length > 0;
              const avg = isNumeric ? numericVals.reduce((acc, b) => acc + Number(b), 0) / numericVals.length : 0;
              
              // Standard deviation
              const variance = isNumeric ? numericVals.reduce((acc, b) => acc + Math.pow(Number(b) - avg, 2), 0) / numericVals.length : 0;
              const stdDev = isNumeric ? Math.sqrt(variance) : 0;

              return (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
                  <div className="lg:col-span-2 space-y-3 bg-neutral-950/40 p-4 rounded-xl border border-neutral-850">
                    <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800/60 pb-1.5 font-mono">
                      Statistical Audit
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-neutral-500 block">Total Checked</span>
                        <span className="font-mono text-sm font-bold text-neutral-200">{total}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Unique Values</span>
                        <span className="font-mono text-sm font-bold text-neutral-200">{distinct}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Missing Values</span>
                        <span className={`font-mono text-sm font-bold ${missing > 0 ? 'text-yellow-400' : 'text-green-400'}`}>{missing}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Completeness</span>
                        <span className="font-mono text-sm font-bold text-neutral-200">{((nonNull / total) * 100).toFixed(1)}%</span>
                      </div>
                      {isNumeric && (
                        <>
                          <div>
                            <span className="text-neutral-500 block">Mean / Average</span>
                            <span className="font-mono text-sm font-bold text-blue-400">{avg.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">Std Dev</span>
                            <span className="font-mono text-sm font-bold text-indigo-400">{stdDev.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-3 h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {auditChartType === 'bar' ? (
                        <BarChart data={dataPreview.slice(0, 15)}>
                          <XAxis dataKey={auditX} stroke="#737373" fontSize={9} />
                          <YAxis stroke="#737373" fontSize={9} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                          <Bar dataKey={auditCol} fill="#ec4899" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      ) : auditChartType === 'line' ? (
                        <LineChart data={dataPreview.slice(0, 15)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                          <XAxis dataKey={auditX} stroke="#737373" fontSize={9} />
                          <YAxis stroke="#737373" fontSize={9} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey={auditCol} stroke="#ec4899" strokeWidth={2} />
                        </LineChart>
                      ) : (
                        <AreaChart data={dataPreview.slice(0, 15)}>
                          <defs>
                            <linearGradient id="auditAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ec4899" stopOpacity={0.4}/>
                              <stop offset="100%" stopColor="#ec4899" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                          <XAxis dataKey={auditX} stroke="#737373" fontSize={9} />
                          <YAxis stroke="#737373" fontSize={9} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                          <Area type="monotone" dataKey={auditCol} stroke="#ec4899" strokeWidth={2} fill="url(#auditAreaGrad)" />
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* 🧠 Premium AI Hypothesis Testing Sandbox */}
        <Card className="dark bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 backdrop-blur-md border border-neutral-800/80 text-neutral-50 shadow-2xl mt-8 overflow-hidden">
          <CardHeader className="border-b border-neutral-850 pb-4 bg-neutral-950/20">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-md font-bold">AI Hypothesis Testing Sandbox</CardTitle>
                <CardDescription className="text-neutral-400 text-xs">Formulate statistical assumptions and let our AI correlation engine test validity in real-time.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end bg-neutral-950/30 border border-neutral-850 p-5 rounded-xl">
              {/* Hypothesis Template */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Hypothesis Model</label>
                <select
                  value={hypothesisTemplate}
                  onChange={(e) => setHypothesisTemplate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="positive">Positive Correlation (X ↗, Y ↗)</option>
                  <option value="negative">Negative Correlation (X ↗, Y ↘)</option>
                  <option value="independent">Independence Test (No Relation)</option>
                  <option value="custom">Custom Sandbox Hypothesis</option>
                </select>
              </div>

              {/* Independent X */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Independent (X)</label>
                <select
                  value={hypothesisX}
                  onChange={(e) => setHypothesisX(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {numCols.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Dependent Y */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Dependent (Y)</label>
                <select
                  value={hypothesisY}
                  onChange={(e) => setHypothesisY(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {numCols.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Action Button */}
              <Button
                onClick={runHypothesisTest}
                disabled={testing}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-6 rounded-lg shadow-lg shadow-indigo-600/20 transition-all duration-200 cursor-pointer h-[40px]"
              >
                {testing ? 'Computing T-Test...' : 'Run Hypothesis Test'}
              </Button>
            </div>

            {/* Custom text if custom is selected */}
            {hypothesisTemplate === 'custom' && (
              <div className="space-y-1 bg-neutral-950/40 p-4 rounded-xl border border-neutral-850">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Enter your custom hypothesis assumption statement</label>
                <input
                  type="text"
                  placeholder="e.g. Higher values of marketing budget yield lower customer acquisition costs."
                  value={customHypothesisText}
                  onChange={(e) => setCustomHypothesisText(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Results Panel */}
            {hypothesisResult && (
              <div className="bg-neutral-950/60 border border-neutral-850 rounded-xl p-5 space-y-6 animate-fade-in">
                {hypothesisResult.error ? (
                  <p className="text-xs text-red-400">{hypothesisResult.error}</p>
                ) : (
                  <>
                    <div className="flex justify-between items-center pb-3 border-b border-neutral-800/60">
                      <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">Verification Verdict</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize flex items-center ${
                        hypothesisResult.templateVerdict 
                          ? 'text-green-400 bg-green-500/10 border-green-500/20' 
                          : 'text-red-400 bg-red-500/10 border-red-500/20'
                      }`}>
                        {hypothesisResult.templateVerdict ? '✓ Hypothesis Confirmed' : '✗ Hypothesis Rejected'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Pearson r */}
                      <div className="p-4 bg-neutral-900/40 border border-neutral-800/80 rounded-xl relative overflow-hidden">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Pearson Correlation (r)</span>
                        <p className={`text-3xl font-extrabold mt-1 ${
                          hypothesisResult.r > 0 ? 'text-blue-400' : hypothesisResult.r < 0 ? 'text-indigo-400' : 'text-neutral-400'
                        }`}>
                          {hypothesisResult.r.toFixed(3)}
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-1.5">Strength: <strong className="text-neutral-200">{hypothesisResult.strength}</strong></p>
                      </div>

                      {/* P-Value */}
                      <div className="p-4 bg-neutral-900/40 border border-neutral-800/80 rounded-xl relative overflow-hidden">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">P-Value Significance</span>
                        <p className={`text-3xl font-extrabold mt-1 ${
                          hypothesisResult.isSignificant ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {hypothesisResult.pVal.toFixed(4)}
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-1.5">Status: <strong className="text-neutral-200">{
                          hypothesisResult.isSignificant ? 'Statistically Significant' : 'Not Significant'
                        }</strong></p>
                      </div>

                      {/* Confidence Level */}
                      <div className="p-4 bg-neutral-900/40 border border-neutral-800/80 rounded-xl relative overflow-hidden">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Confidence Level</span>
                        <p className="text-3xl font-extrabold text-neutral-200 mt-1">{(confidenceLevel * 100)}%</p>
                        <p className="text-[11px] text-neutral-400 mt-1.5">Sample Size: <strong className="text-neutral-200">{hypothesisResult.sampleCount} rows</strong></p>
                      </div>
                    </div>

                    <div className="p-4.5 bg-neutral-900/30 border border-neutral-850 rounded-xl space-y-2">
                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800/60 pb-1.5 font-mono">
                        AI Statistical Interpretation
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">{hypothesisResult.explanation}</p>
                      <p className="text-[11px] text-neutral-400 leading-relaxed mt-1">
                        Statistical proof: The t-statistic score is <code className="bg-neutral-950 px-1 py-0.5 rounded text-[10px] text-indigo-400">{hypothesisResult.tStat.toFixed(4)}</code>, establishing a critical confidence threshold against the null hypothesis standard of <code className="bg-neutral-950 px-1 py-0.5 rounded text-[10px] text-indigo-400">alpha = {(1 - confidenceLevel).toFixed(2)}</code>.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
