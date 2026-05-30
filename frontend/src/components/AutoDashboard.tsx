'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, RadialBarChart, RadialBar } from 'recharts';
import { BarChart2, TrendingUp, PieChart as PieIcon, Sliders, ChevronDown, Check, Columns, Activity, Settings, Info, Network, Percent } from 'lucide-react';

// Suppress noisy Recharts ResponsiveContainer dimensions console warnings
if (typeof window !== 'undefined') {
  const filterWarning = (args: any[]) => {
    return args[0] && 
      typeof args[0] === 'string' && 
      (args[0].includes('width(-1) and height(-1)') || 
       args[0].includes('width(0) and height(0)') || 
       args[0].includes('should be greater than 0') ||
       args[0].includes('ResponsiveContainer'));
  };

  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (filterWarning(args)) return;
    originalWarn(...args);
  };

  const originalError = console.error;
  console.error = (...args) => {
    if (filterWarning(args)) return;
    originalError(...args);
  };
}

interface AutoDashboardProps {
  dataPreview: any[]; // The first N rows or sample
  columns: string[];
}

const COLORS = [
  '#3b82f6', // Bright Blue
  '#10b981', // Emerald Green
  '#f59e0b', // Amber Orange
  '#ec4899', // Hot Pink
  '#8b5cf6', // Deep Purple
  '#06b6d4', // Cyan
  '#ef4444', // Vibrant Red
  '#eab308', // Gold Yellow
  '#14b8a6', // Teal
  '#f43f5e', // Rose
  '#6366f1', // Indigo
  '#84cc16', // Lime Green
  '#f97316', // Bright Orange
  '#d946ef', // Fuchsia
  '#059669', // Forest Green
  '#be123c', // Crimson
  '#0ea5e9', // Sky Blue
  '#34d399', // Mint
  '#a5b4fc', // Soft Violet
  '#64748b'  // Slate Gray
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

const safeParseFloat = (val: any): number => {
  if (val === null || val === undefined || val === '') return -Infinity;
  if (typeof val === 'number') return val;
  // Clean currency symbols, commas, percentage signs, and spaces
  const clean = String(val).replace(/[$,%\s]/g, '').replace(/,/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? -Infinity : num;
};

const robustCompare = (a: any, b: any, key: string) => {
  if (!key) return 0;
  const valA = a[key];
  const valB = b[key];
  
  const numA = safeParseFloat(valA);
  const numB = safeParseFloat(valB);
  
  // If both are valid numbers, sort numerically descending
  if (numA !== -Infinity && numB !== -Infinity) {
    return numB - numA;
  }
  
  // Place valid numbers first, invalid/null numbers last
  if (numA !== -Infinity && numB === -Infinity) return -1;
  if (numA === -Infinity && numB !== -Infinity) return 1;
  
  // Fallback to alphabetical sorting if both are non-numeric strings
  return String(valB || '').localeCompare(String(valA || ''));
};

const LOCATION_COORDINATES: Record<string, { x: number; y: number; label: string }> = {
  // India locations
  'kolkata, india': { x: 72, y: 55, label: 'Kolkata, IN' },
  'kolkata': { x: 72, y: 55, label: 'Kolkata, IN' },
  'mumbai, india': { x: 67, y: 60, label: 'Mumbai, IN' },
  'mumbai': { x: 67, y: 60, label: 'Mumbai, IN' },
  'bangalore, india': { x: 69, y: 65, label: 'Bangalore, IN' },
  'bangalore': { x: 69, y: 65, label: 'Bangalore, IN' },
  'delhi, india': { x: 69, y: 48, label: 'Delhi, IN' },
  'delhi': { x: 69, y: 48, label: 'Delhi, IN' },
  // US locations
  'new york, us': { x: 28, y: 35, label: 'New York, US' },
  'new york': { x: 28, y: 35, label: 'New York, US' },
  'united states': { x: 25, y: 38, label: 'United States' },
  'us': { x: 25, y: 38, label: 'United States' },
  'san francisco': { x: 18, y: 39, label: 'San Francisco, US' },
  'chicago': { x: 23, y: 35, label: 'Chicago, US' },
  // Europe
  'zurich, ch': { x: 48, y: 34, label: 'Zurich, CH' },
  'zurich': { x: 48, y: 34, label: 'Zurich, CH' },
  'london, uk': { x: 45, y: 30, label: 'London, UK' },
  'london': { x: 45, y: 30, label: 'London, UK' },
  'paris, fr': { x: 46, y: 33, label: 'Paris, FR' },
  'paris': { x: 46, y: 33, label: 'Paris, FR' },
  'germany': { x: 49, y: 32, label: 'Germany' },
  'berlin': { x: 50, y: 30, label: 'Berlin, DE' },
  'amsterdam': { x: 47, y: 30, label: 'Amsterdam, NL' },
  // Russia
  'moscow, ru': { x: 57, y: 28, label: 'Moscow, RU' },
  'moscow': { x: 57, y: 28, label: 'Moscow, RU' },
  // Japan
  'japan': { x: 84, y: 40, label: 'Japan' },
  'tokyo': { x: 84, y: 38, label: 'Tokyo, JP' },
  // Other global hubs
  'singapore': { x: 74, y: 64, label: 'Singapore' },
  'sydney': { x: 88, y: 76, label: 'Sydney, AU' },
  'toronto': { x: 26, y: 32, label: 'Toronto, CA' },
  'dubai': { x: 62, y: 46, label: 'Dubai, AE' },
  'cape town': { x: 53, y: 75, label: 'Cape Town, ZA' },
  'sao paulo': { x: 38, y: 70, label: 'São Paulo, BR' }
};

export function AutoDashboard({ dataPreview = [], columns = [] }: AutoDashboardProps) {
  const [isMounted, setIsMounted] = useState(false);
  // Find columns safely using fallback values to avoid TypeErrors during initial render
  const safeDataPreview = dataPreview || [];
  const safeColumns = columns || [];

  const firstRow = safeDataPreview[0] || {};

  let stringCols = safeColumns.filter(col => typeof firstRow[col] === 'string' && safeParseFloat(firstRow[col]) === -Infinity);
  let numCols = safeColumns.filter(col => typeof firstRow[col] === 'number' || safeParseFloat(firstRow[col]) !== -Infinity);

  if (stringCols.length === 0) stringCols = safeColumns.length > 0 ? [safeColumns[0]] : [''];
  if (numCols.length === 0) numCols = safeColumns.length > 1 ? [safeColumns[1]] : (safeColumns.length > 0 ? [safeColumns[0]] : ['']);

  const xCol = stringCols[0] || '';
  const yCol1 = numCols[0] || '';
  const yCol2 = numCols.length > 1 ? numCols[1] : null;

  // Custom Graph Builder State
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'scatter' | 'pie' | 'composed' | 'radial' | 'map'>('bar');
  const [customX, setCustomX] = useState('');
  const [customY, setCustomY] = useState('');
  const [customColor, setCustomColor] = useState('#3b82f6');
  const [customLimit, setCustomLimit] = useState<number>(10);
  
  const [distX, setDistX] = useState('');
  const [distY, setDistY] = useState('');
  const [distLimit, setDistLimit] = useState<number>(10);
  
  const [trendX, setTrendX] = useState('');
  const [trendY, setTrendY] = useState('');
  const [trendLimit, setTrendLimit] = useState<number>(10);
  
  // Sorting options for custom limits (Top N Sorted vs First N Original)
  const [customSort, setCustomSort] = useState<boolean>(true);
  const [distSort, setDistSort] = useState<boolean>(true);
  const [trendSort, setTrendSort] = useState<boolean>(false); // Trend line chart defaults to original sequential order
  
  // Limit mode states for stable UI dropdown selections
  const [customLimitMode, setCustomLimitMode] = useState<'5_sorted' | '5_unsorted' | '10_sorted' | '10_unsorted' | 'all' | 'custom'>('10_sorted');
  const [distLimitMode, setDistLimitMode] = useState<'5_sorted' | '5_unsorted' | '10_sorted' | '10_unsorted' | 'all' | 'custom'>('10_sorted');
  const [trendLimitMode, setTrendLimitMode] = useState<'5_sorted' | '5_unsorted' | '10_sorted' | '10_unsorted' | 'all' | 'custom'>('10_unsorted');
  
  // Custom Section for Interactive Display
  const [showTrendline, setShowTrendline] = useState(false);
  const [showGridlines, setShowGridlines] = useState(true);
  const [movingAverageWindow, setMovingAverageWindow] = useState(0);
  const [graphHeight, setGraphHeight] = useState<number>(450);

  // Dynamic Category Composition State
  const [compCategory, setCompCategory] = useState('');
  const [compMetric, setCompMetric] = useState('');
  const [compChartType, setCompChartType] = useState<'donut' | 'pie' | 'radial'>('donut');
  const [compLimit, setCompLimit] = useState<number>(5);
  const [compSidebarTab, setCompSidebarTab] = useState<'share' | 'metric_profile'>('share');
  
  // Geospatial Location Map States
  const [mapLocation, setMapLocation] = useState('');
  const [mapMetric, setMapMetric] = useState('');
  const [hoveredMapNode, setHoveredMapNode] = useState<any>(null);
  const [hoveredCustomMapNode, setHoveredCustomMapNode] = useState<any>(null);
  
  // Custom states for AI Hypothesis Testing Sandbox
  const [hypothesisTemplate, setHypothesisTemplate] = useState<string>('positive');
  const [hypothesisX, setHypothesisX] = useState('');
  const [hypothesisY, setHypothesisY] = useState('');
  const [customHypothesisText, setCustomHypothesisText] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0.95);
  const [hypothesisResult, setHypothesisResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  
  // Custom states for Auto-Generated Analytical Insights selectors
  const [radarCols, setRadarCols] = useState<string[]>([]);
  const [cumulX, setCumulX] = useState('');
  const [cumulY, setCumulY] = useState('');
  const [cumulLimit, setCumulLimit] = useState<number>(10);

  // Custom Section for Auto-Generated Analytical Insights
  const [auditCol, setAuditCol] = useState('');
  const [auditX, setAuditX] = useState('');
  const [auditChartType, setAuditChartType] = useState<'bar' | 'line' | 'area'>('bar');
  const [auditLimit, setAuditLimit] = useState<number>(10);

  // Interactive 5 KPIs configurations
  const [kpiConfigs, setKpiConfigs] = useState([
    { id: 1, label: '', column: '', operation: 'mean', color: 'text-blue-400', border: 'hover:border-blue-500/30' },
    { id: 2, label: '', column: '', operation: 'max', color: 'text-emerald-400', border: 'hover:border-emerald-500/30' },
    { id: 3, label: '', column: '', operation: 'unique', color: 'text-purple-400', border: 'hover:border-purple-500/30' },
    { id: 4, label: '', column: '', operation: 'sum', color: 'text-amber-400', border: 'hover:border-amber-500/30' },
    { id: 5, label: '', column: '', operation: 'completeness', color: 'text-rose-400', border: 'hover:border-rose-500/30' }
  ]);

  const [activeKpiSettings, setActiveKpiSettings] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Synchronize column selection states when columns load asynchronously
  React.useEffect(() => {
    setIsMounted(true);
    if (safeDataPreview.length > 0 && safeColumns.length > 0) {
      setCustomX(prev => prev || xCol);
      setCustomY(prev => prev || yCol1);
      setDistX(prev => prev || xCol);
      setDistY(prev => prev || yCol1);
      setTrendX(prev => prev || xCol);
      setTrendY(prev => prev || yCol2 || yCol1);
      setCompCategory(prev => prev || xCol);
      setCompMetric(prev => prev || yCol1);
      setCumulX(prev => prev || xCol);
      setCumulY(prev => prev || yCol1);
      setAuditCol(prev => prev || safeColumns[0]);
      
      // Auto-detect a location column
      const locKeywords = ['location', 'store', 'country', 'city', 'region', 'state', 'address', 'nation'];
      const autoLocCol = safeColumns.find(col => locKeywords.some(kw => col.toLowerCase().includes(kw))) || stringCols[0] || safeColumns[0] || '';
      setMapLocation(prev => prev || autoLocCol);
      setMapMetric(prev => prev || yCol1);
      setAuditX(prev => prev || safeColumns[0]);
      setRadarCols(prev => prev.length > 0 ? prev : numCols.slice(0, 5));
      setHypothesisX(prev => prev || numCols[0] || safeColumns[0]);
      setHypothesisY(prev => prev || numCols.length > 1 ? numCols[1] : (numCols[0] || safeColumns[0]));
      
      // Update default KPI configs if they were initialized empty
      setKpiConfigs(prev => prev.map(kpi => {
        if (!kpi.column) {
          const opLabels: { [key: string]: string } = {
            mean: 'Average',
            sum: 'Total Sum',
            max: 'Maximum',
            min: 'Minimum',
            unique: 'Unique Count',
            completeness: 'Completeness %',
            median: 'Median'
          };
          if (kpi.id === 1) return { ...kpi, label: `${opLabels[kpi.operation]} of ${yCol1}`, column: yCol1 };
          if (kpi.id === 2) return { ...kpi, label: `${opLabels[kpi.operation]} of ${yCol1}`, column: yCol1 };
          if (kpi.id === 3) return { ...kpi, label: `${opLabels[kpi.operation]} of ${xCol}`, column: xCol };
          if (kpi.id === 4) return { ...kpi, label: `${opLabels[kpi.operation]} of ${yCol2 || yCol1}`, column: yCol2 || yCol1 };
          if (kpi.id === 5) return { ...kpi, label: `${opLabels[kpi.operation]} of ${yCol1}`, column: yCol1 };
        }
        return kpi;
      }));
    }
  }, [safeDataPreview, safeColumns, xCol, yCol1, yCol2]);

  // Load saved dashboard configuration on mount
  React.useEffect(() => {
    if (safeColumns.length === 0) return;
    const saveKey = 'autodashboard_config_' + safeColumns.join('_');
    const saved = localStorage.getItem(saveKey);
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (config.chartType) setChartType(config.chartType);
        if (config.customX) setCustomX(config.customX);
        if (config.customY) setCustomY(config.customY);
        if (config.customColor) setCustomColor(config.customColor);
        if (config.customLimit !== undefined) setCustomLimit(config.customLimit);
        if (config.customSort !== undefined) setCustomSort(config.customSort);
        if (config.customLimitMode) setCustomLimitMode(config.customLimitMode);
        
        if (config.distX) setDistX(config.distX);
        if (config.distY) setDistY(config.distY);
        if (config.distLimit !== undefined) setDistLimit(config.distLimit);
        if (config.distSort !== undefined) setDistSort(config.distSort);
        if (config.distLimitMode) setDistLimitMode(config.distLimitMode);
        
        if (config.trendX) setTrendX(config.trendX);
        if (config.trendY) setTrendY(config.trendY);
        if (config.trendLimit !== undefined) setTrendLimit(config.trendLimit);
        if (config.trendSort !== undefined) setTrendSort(config.trendSort);
        if (config.trendLimitMode) setTrendLimitMode(config.trendLimitMode);
        
        if (config.showTrendline !== undefined) setShowTrendline(config.showTrendline);
        if (config.showGridlines !== undefined) setShowGridlines(config.showGridlines);
        if (config.movingAverageWindow !== undefined) setMovingAverageWindow(config.movingAverageWindow);
        if (config.graphHeight !== undefined) setGraphHeight(config.graphHeight);
        
        if (config.compCategory) setCompCategory(config.compCategory);
        if (config.compMetric) setCompMetric(config.compMetric);
        if (config.compChartType) setCompChartType(config.compChartType);
        if (config.compLimit !== undefined) setCompLimit(config.compLimit);
        
        if (config.cumulX) setCumulX(config.cumulX);
        if (config.cumulY) setCumulY(config.cumulY);
        if (config.cumulLimit !== undefined) setCumulLimit(config.cumulLimit);
        
        if (config.auditCol) setAuditCol(config.auditCol);
        if (config.auditX) setAuditX(config.auditX);
        if (config.auditChartType) setAuditChartType(config.auditChartType);
        if (config.auditLimit !== undefined) setAuditLimit(config.auditLimit);
        
        if (config.radarCols) setRadarCols(config.radarCols);
        if (config.kpiConfigs) setKpiConfigs(config.kpiConfigs);
        if (config.mapLocation) setMapLocation(config.mapLocation);
        if (config.mapMetric) setMapMetric(config.mapMetric);
        
        console.log('Dashboard config successfully loaded from local storage.');
      } catch (err) {
        console.warn('Failed to parse saved dashboard config:', err);
      }
    }
  }, [safeColumns]);

  // Auto-save dashboard state every 5 seconds (with instant configuration update feedback)
  React.useEffect(() => {
    if (safeColumns.length === 0) return;
    const saveKey = 'autodashboard_config_' + safeColumns.join('_');
    
    setSaveStatus('saving');
    const config = {
      chartType,
      customX,
      customY,
      customColor,
      customLimit,
      customSort,
      customLimitMode,
      distX,
      distY,
      distLimit,
      distSort,
      distLimitMode,
      trendX,
      trendY,
      trendLimit,
      trendSort,
      trendLimitMode,
      showTrendline,
      showGridlines,
      movingAverageWindow,
      graphHeight,
      compCategory,
      compMetric,
      compChartType,
      compLimit,
      cumulX,
      cumulY,
      cumulLimit,
      auditCol,
      auditX,
      auditChartType,
      auditLimit,
      radarCols,
      kpiConfigs,
      mapLocation,
      mapMetric
    };
    
    localStorage.setItem(saveKey, JSON.stringify(config));
    console.log('Dashboard config saved.');
    
    const timer = setTimeout(() => {
      setSaveStatus('saved');
    }, 600);

    return () => clearTimeout(timer);
  }, [
    safeColumns, chartType, customX, customY, customColor, customLimit, customSort, customLimitMode,
    distX, distY, distLimit, distSort, distLimitMode, trendX, trendY, trendLimit, trendSort, trendLimitMode,
    showTrendline, showGridlines, movingAverageWindow, graphHeight, compCategory, compMetric, compChartType,
    compLimit, cumulX, cumulY, cumulLimit, auditCol, auditX, auditChartType, auditLimit, radarCols, kpiConfigs,
    mapLocation, mapMetric
  ]);

  // processedData for Moving Average & Trendline
  const processedData = React.useMemo(() => {
    let result = safeDataPreview;
    
    if (customLimit > 0 && safeDataPreview.length > 0) {
      if (customSort) {
        result = [...safeDataPreview].sort((a, b) => robustCompare(a, b, customY));
      }
      result = result.slice(0, customLimit);
    }

    if (movingAverageWindow > 0 && result.length > 0 && customY) {
      const source = result;
      result = source.map((row, idx) => {
        const windowRows = source.slice(Math.max(0, idx - movingAverageWindow + 1), idx + 1);
        const sum = windowRows.reduce((acc, r) => {
          const parsed = safeParseFloat(r[customY]);
          return acc + (parsed !== -Infinity ? parsed : 0);
        }, 0);
        const avg = sum / windowRows.length;
        return {
          ...row,
          [customY]: avg
        };
      });
    }

    if (showTrendline && result.length > 0 && customY) {
      // Calculate linear regression: y = mx + c
      const n = result.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      for (let i = 0; i < n; i++) {
        const parsed = safeParseFloat(result[i][customY]);
        const val = parsed !== -Infinity ? parsed : 0;
        sumX += i;
        sumY += val;
        sumXY += i * val;
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
  }, [safeDataPreview, customY, movingAverageWindow, showTrendline, customLimit, customSort]);

  const processedDistData = React.useMemo(() => {
    let result = safeDataPreview;
    if (distLimit > 0 && safeDataPreview.length > 0) {
      if (distSort) {
        result = [...safeDataPreview].sort((a, b) => robustCompare(a, b, distY));
      }
      result = result.slice(0, distLimit);
    }
    return result;
  }, [safeDataPreview, distY, distLimit, distSort]);

  const processedTrendData = React.useMemo(() => {
    let result = safeDataPreview;
    if (trendLimit > 0 && safeDataPreview.length > 0) {
      if (trendSort) {
        result = [...safeDataPreview].sort((a, b) => robustCompare(a, b, trendY));
      }
      result = result.slice(0, trendLimit);
    }
    return result;
  }, [safeDataPreview, trendY, trendLimit, trendSort]);

  const processedCumulativeData = React.useMemo(() => {
    let runningTotal = 0;
    const slicedData = safeDataPreview.length > 0
      ? (cumulLimit > 0 && cumulY ? safeDataPreview.slice(0, cumulLimit) : safeDataPreview)
      : [];
    return slicedData.map(d => {
      const val = cumulY ? safeParseFloat(d[cumulY]) : 0;
      const cleanVal = val !== -Infinity ? val : 0;
      runningTotal += cleanVal;
      return {
        category: (cumulX && d[cumulX]) || 'Unknown',
        'Cumulative Sum': runningTotal
      };
    });
  }, [safeDataPreview, cumulY, cumulX, cumulLimit]);

  const processedAuditData = React.useMemo(() => {
    if (auditLimit > 0 && safeDataPreview.length > 0) {
      return safeDataPreview.slice(0, auditLimit);
    }
    return safeDataPreview;
  }, [safeDataPreview, auditLimit]);

  // Generate background dot-matrix world grid points dynamically
  const mapGridPoints = React.useMemo(() => {
    const points: { x: number; y: number }[] = [];
    
    // Abstract continents representation (rough grid coordinates)
    const isInContinent = (x: number, y: number) => {
      // North America
      if (x >= 14 && x <= 32 && y >= 25 && y <= 45) return true;
      // South America
      if (x >= 28 && x <= 40 && y >= 48 && y <= 76) {
        return x - y / 2 < 12; // taper off
      }
      // Europe
      if (x >= 44 && x <= 53 && y >= 24 && y <= 40) return true;
      // Russia / North Asia
      if (x >= 54 && x <= 85 && y >= 18 && y <= 35) return true;
      // Africa
      if (x >= 45 && x <= 58 && y >= 43 && y <= 72) {
        return x > 44 + (y - 43) * 0.3; // taper off
      }
      // Southern Asia / India
      if (x >= 62 && x <= 82 && y >= 36 && y <= 62) return true;
      // Australia
      if (x >= 80 && x <= 92 && y >= 64 && y <= 80) return true;
      
      return false;
    };

    for (let x = 10; x <= 95; x += 3.2) {
      for (let y = 15; y <= 82; y += 3.2) {
        if (isInContinent(x, y)) {
          points.push({ x, y });
        }
      }
    }
    return points;
  }, []);

  // Dynamic geospatial location resolution
  const resolvedMapData = React.useMemo(() => {
    if (!mapLocation || !mapMetric) return [];
    
    // Group and aggregate metrics by location
    const groups: Record<string, number> = {};
    safeDataPreview.forEach(row => {
      const rawLoc = row[mapLocation];
      if (rawLoc === null || rawLoc === undefined || rawLoc === '') return;
      const locStr = String(rawLoc).trim();
      const parsed = safeParseFloat(row[mapMetric]);
      const val = parsed !== -Infinity ? parsed : 0;
      groups[locStr] = (groups[locStr] || 0) + val;
    });

    const totalVal = Object.values(groups).reduce((sum, v) => sum + v, 0) || 1;

    return Object.entries(groups)
      .map(([name, value]) => {
        const key = name.toLowerCase();
        // Resolve coordinates
        const coord = LOCATION_COORDINATES[key] || 
                      Object.entries(LOCATION_COORDINATES).find(([k]) => key.includes(k) || k.includes(key))?.[1] ||
                      { x: 50, y: 50, label: name }; // default middle center
        
        return {
          name,
          value,
          percent: (value / totalVal) * 100,
          x: coord.x,
          y: coord.y,
          displayLabel: coord.label
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [safeDataPreview, mapLocation, mapMetric]);

  // Dynamic custom geospatial location resolution for Graph Workbench
  const resolvedCustomMapData = React.useMemo(() => {
    if (!customX || !customY) return [];
    
    // Group and aggregate metrics by location
    const groups: Record<string, number> = {};
    processedData.forEach(row => {
      const rawLoc = row[customX];
      if (rawLoc === null || rawLoc === undefined || rawLoc === '') return;
      const locStr = String(rawLoc).trim();
      const parsed = safeParseFloat(row[customY]);
      const val = parsed !== -Infinity ? parsed : 0;
      groups[locStr] = (groups[locStr] || 0) + val;
    });

    const totalVal = Object.values(groups).reduce((sum, v) => sum + v, 0) || 1;

    return Object.entries(groups)
      .map(([name, value]) => {
        const key = name.toLowerCase();
        // Resolve coordinates
        const coord = LOCATION_COORDINATES[key] || 
                      Object.entries(LOCATION_COORDINATES).find(([k]) => key.includes(k) || k.includes(key))?.[1] ||
                      { x: 50, y: 50, label: name }; // default middle center
        
        return {
          name,
          value,
          percent: (value / totalVal) * 100,
          x: coord.x,
          y: coord.y,
          displayLabel: coord.label
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [processedData, customX, customY]);

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

    const numericVals = rawVals.map(v => safeParseFloat(v)).filter(v => v !== -Infinity);
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
          .map(d => {
            const valX = safeParseFloat(d[hypothesisX]);
            const valY = safeParseFloat(d[hypothesisY]);
            return { x: valX, y: valY };
          })
          .filter(p => p.x !== -Infinity && p.y !== -Infinity);

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

  if (safeDataPreview.length === 0) {
    return (
      <Card className="dark bg-neutral-900 border-neutral-800 text-neutral-50 p-6 text-center text-neutral-400">
        No preview data available for auto-insights.
      </Card>
    );
  }

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full text-neutral-400 bg-neutral-950/20 backdrop-blur-md rounded-2xl border border-neutral-850 p-12">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-mono text-neutral-500 uppercase tracking-widest animate-pulse">Initializing display canvas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 🚀 Premium Live Auto-Saving Status Indicator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 border border-neutral-800/80 p-4 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Live Analytics Dashboard Studio
          </h2>
          <p className="text-neutral-400 text-xs mt-0.5">Live visualization of dataset: <span className="font-mono text-neutral-300 font-bold bg-neutral-950 px-2 py-0.5 rounded border border-neutral-850">{safeColumns.slice(0, 5).join(', ')}{safeColumns.length > 5 ? '...' : ''}</span></p>
        </div>
        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
          <div className={`flex items-center space-x-2 border px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-300 ${
            saveStatus === 'saving'
              ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5 shadow-md shadow-yellow-500/5'
              : saveStatus === 'saved'
              ? 'text-green-400 border-green-500/20 bg-green-500/5 shadow-md shadow-green-500/5'
              : 'text-neutral-400 border-neutral-850 bg-neutral-950/20'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              saveStatus === 'saving'
                ? 'bg-yellow-500 animate-pulse'
                : saveStatus === 'saved'
                ? 'bg-green-500 shadow-[0_0_8px_#10b981]'
                : 'bg-neutral-600'
            }`} />
            <span className="font-mono text-[10px] uppercase tracking-wider font-extrabold">
              {saveStatus === 'saving'
                ? 'Saving Layout...'
                : saveStatus === 'saved'
                ? 'All Settings Saved'
                : 'Auto-saves every 5s'}
            </span>
          </div>
        </div>
      </div>

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
                {(['bar', 'line', 'area', 'scatter', 'pie', 'composed', 'radial', 'map'] as const).map(type => (
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
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center">
                <Percent className="w-3 h-3 mr-1 text-purple-400" /> Limit Data Points
              </label>
              <div className="relative">
                <select
                  value={customLimitMode}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setCustomLimitMode(val);
                    if (val === '5_sorted') {
                      setCustomLimit(5);
                      setCustomSort(true);
                    } else if (val === '5_unsorted') {
                      setCustomLimit(5);
                      setCustomSort(false);
                    } else if (val === '10_sorted') {
                      setCustomLimit(10);
                      setCustomSort(true);
                    } else if (val === '10_unsorted') {
                      setCustomLimit(10);
                      setCustomSort(false);
                    } else if (val === 'all') {
                      setCustomLimit(0);
                      setCustomSort(false);
                    } else {
                      setCustomLimit(15);
                      setCustomSort(false);
                    }
                  }}
                  className="w-full bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  <option value="5_sorted">Top 5 Rows (Sorted by Y)</option>
                  <option value="5_unsorted">First 5 Rows (Original)</option>
                  <option value="10_sorted">Top 10 Rows (Sorted by Y)</option>
                  <option value="10_unsorted">First 10 Rows (Original)</option>
                  <option value="all">All Rows (Unsorted)</option>
                  <option value="custom">Custom Limit (Original)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
              </div>
              
              {/* Show custom input if custom is selected */}
              {customLimitMode === 'custom' && (
                <div className="pt-1.5 flex items-center space-x-2">
                  <span className="text-[10px] text-neutral-400 font-mono">Row Limit:</span>
                  <input
                    type="number"
                    min="1"
                    max={dataPreview.length}
                    value={customLimit}
                    onChange={(e) => setCustomLimit(Math.max(1, Number(e.target.value)))}
                    className="w-20 bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <span className="text-[10px] text-neutral-500 font-mono">of {dataPreview.length}</span>
                </div>
              )}
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

                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-neutral-400">
                    <span>Custom Graph Height</span>
                    <span className="font-mono text-blue-400">{graphHeight}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="250" 
                    max="700" 
                    value={graphHeight}
                    onChange={e => setGraphHeight(Number(e.target.value))}
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
        <Card className="lg:col-span-2 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800/80 shadow-2xl relative flex flex-col justify-between">
          <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full text-xs font-medium text-blue-400">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            <span>Custom Graph Preview</span>
          </div>

          <CardHeader>
            <CardTitle className="text-lg">Interactive Display: {customY} by {customX}</CardTitle>
            <CardDescription className="text-neutral-400">Calculated custom visual mapping using active accents.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div style={{ height: `${graphHeight}px` }} className="w-full transition-all duration-200">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
                      data={processedData}
                      dataKey={customY}
                      nameKey={customX}
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={45}
                      paddingAngle={2}
                      cornerRadius={4}
                    >
                      {processedData.map((entry, index) => (
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
                ) : chartType === 'radial' ? (
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={10} data={processedData}>
                    <RadialBar
                      label={{ position: 'insideStart', fill: '#fff', fontSize: 9 }}
                      background
                      dataKey={customY}
                    >
                      {processedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </RadialBar>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                  </RadialBarChart>
                ) : (
                  // Highly Premium Map Visualization inside Custom Workbench
                  <div className="relative w-full h-full bg-neutral-950/60 rounded-2xl border border-neutral-850 flex items-center justify-center overflow-hidden">
                    {/* Concentric Sonar Rings */}
                    <div className="absolute w-[220px] h-[220px] border border-neutral-800/10 rounded-full pointer-events-none"></div>
                    <div className="absolute w-[100px] h-[100px] border border-neutral-800/10 rounded-full pointer-events-none"></div>
                    
                    <svg className="w-full h-full relative" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#262626" strokeWidth="0.2" strokeDasharray="1.5 1.5" />
                      <line x1="50" y1="0" x2="50" y2="100" stroke="#262626" strokeWidth="0.2" strokeDasharray="1.5 1.5" />
                      
                      {/* Stylized Continent Matrix Dot Background */}
                      {mapGridPoints.map((pt, pidx) => (
                        <circle key={pidx} cx={`${pt.x}%`} cy={`${pt.y}%`} r="0.55" fill="#404040" opacity="0.45" />
                      ))}

                      {/* Active Location density bubbles */}
                      {resolvedCustomMapData.map((node, nidx) => {
                        const radius = 2.0 + (node.percent / 100) * 5.0; // proportional size
                        
                        return (
                          <g 
                            key={nidx}
                            className="cursor-pointer group/node"
                            onMouseEnter={() => setHoveredCustomMapNode(node)}
                            onMouseLeave={() => setHoveredCustomMapNode(null)}
                          >
                            {/* Pulsing Outer Glow */}
                            <circle 
                              cx={`${node.x}%`} 
                              cy={`${node.y}%`} 
                              r={radius + 2.0} 
                              fill={`${customColor}15`}
                              stroke={`${customColor}40`}
                              strokeWidth="0.4"
                              className="animate-ping"
                              style={{ animationDuration: '3.5s' }}
                            />
                            {/* Core Bubble */}
                            <circle 
                              cx={`${node.x}%`} 
                              cy={`${node.y}%`} 
                              r={radius} 
                              fill={customColor}
                              fillOpacity={0.8}
                              stroke="#ffffff"
                              strokeWidth="0.6"
                              className="shadow-lg hover:fill-white transition-all duration-200"
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {/* Node Hover Tooltip Panel */}
                    {hoveredCustomMapNode && (
                      <div className="absolute bottom-3 left-3 bg-neutral-900/95 border border-neutral-800 p-2.5 rounded-lg text-[10px] font-mono shadow-2xl animate-fade-in z-20">
                        <span className="text-neutral-500 uppercase tracking-wider text-[8px] font-bold">Node Metric Audit</span>
                        <h5 className="font-bold text-neutral-200 mt-0.5">{hoveredCustomMapNode.name}</h5>
                        <div className="flex justify-between gap-4 mt-1.5 border-t border-neutral-850 pt-1">
                          <span className="text-neutral-400">Total volume:</span>
                          <strong style={{ color: customColor }}>{hoveredCustomMapNode.value.toLocaleString(undefined, {maximumFractionDigits: 1})}</strong>
                        </div>
                        <div className="flex justify-between gap-4 mt-0.5">
                          <span className="text-neutral-400">Global Share:</span>
                          <strong style={{ color: customColor }}>{hoveredCustomMapNode.percent.toFixed(1)}%</strong>
                        </div>
                      </div>
                    )}
                  </div>
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
            <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 space-y-0">
              <CardTitle className="text-md flex items-center truncate max-w-xs sm:max-w-md" title={`Distribution: ${distY} by ${distX}`}>
                <BarChart2 className="w-4 h-4 mr-2 text-blue-400 shrink-0" />
                Distribution: <span className="text-neutral-350 ml-1 truncate">{distY} by {distX}</span>
              </CardTitle>
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <select
                  value={distX}
                  onChange={(e) => setDistX(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 text-[10px] text-neutral-300 rounded px-2 py-1.5 focus:outline-none cursor-pointer"
                >
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <select
                  value={distY}
                  onChange={(e) => setDistY(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 text-[10px] text-neutral-300 rounded px-2 py-1.5 focus:outline-none cursor-pointer"
                >
                  {numCols.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <select
                  value={distLimitMode}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setDistLimitMode(val);
                    if (val === '5_sorted') {
                      setDistLimit(5);
                      setDistSort(true);
                    } else if (val === '5_unsorted') {
                      setDistLimit(5);
                      setDistSort(false);
                    } else if (val === '10_sorted') {
                      setDistLimit(10);
                      setDistSort(true);
                    } else if (val === '10_unsorted') {
                      setDistLimit(10);
                      setDistSort(false);
                    } else if (val === 'all') {
                      setDistLimit(0);
                      setDistSort(false);
                    } else {
                      setDistLimit(15);
                      setDistSort(false);
                    }
                  }}
                  className="bg-neutral-950 border border-neutral-850 text-[10px] font-bold text-neutral-300 rounded px-2 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="5_sorted">Top 5 (Sorted)</option>
                  <option value="5_unsorted">First 5 (Original)</option>
                  <option value="10_sorted">Top 10 (Sorted)</option>
                  <option value="10_unsorted">First 10 (Original)</option>
                  <option value="all">All Rows</option>
                  <option value="custom">Custom...</option>
                </select>
                {distLimit !== 5 && distLimit !== 10 && distLimit !== 0 && (
                  <input
                    type="number"
                    min="1"
                    max={dataPreview.length}
                    value={distLimit}
                    onChange={(e) => setDistLimit(Math.max(1, Number(e.target.value)))}
                    className="w-12 bg-neutral-950 border border-neutral-850 text-neutral-200 text-[10px] rounded px-1.5 py-1 focus:outline-none font-mono text-center"
                    title="Custom Row Limit"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
            <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 space-y-0">
              <CardTitle className="text-md flex items-center truncate max-w-xs sm:max-w-md" title={`Linear Trend: ${trendY} over ${trendX}`}>
                <TrendingUp className="w-4 h-4 mr-2 text-emerald-400 shrink-0" />
                Linear Trend: <span className="text-neutral-350 ml-1 truncate">{trendY} over {trendX}</span>
              </CardTitle>
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <select
                  value={trendX}
                  onChange={(e) => setTrendX(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 text-[10px] text-neutral-300 rounded px-2 py-1.5 focus:outline-none cursor-pointer"
                >
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <select
                  value={trendY}
                  onChange={(e) => setTrendY(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 text-[10px] text-neutral-300 rounded px-2 py-1.5 focus:outline-none cursor-pointer"
                >
                  {numCols.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <select
                  value={trendLimitMode}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setTrendLimitMode(val);
                    if (val === '5_sorted') {
                      setTrendLimit(5);
                      setTrendSort(true);
                    } else if (val === '5_unsorted') {
                      setTrendLimit(5);
                      setTrendSort(false);
                    } else if (val === '10_sorted') {
                      setTrendLimit(10);
                      setTrendSort(true);
                    } else if (val === '10_unsorted') {
                      setTrendLimit(10);
                      setTrendSort(false);
                    } else if (val === 'all') {
                      setTrendLimit(0);
                      setTrendSort(false);
                    } else {
                      setTrendLimit(15);
                      setTrendSort(false);
                    }
                  }}
                  className="bg-neutral-950 border border-neutral-850 text-[10px] font-bold text-neutral-300 rounded px-2 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="5_sorted">Top 5 (Sorted)</option>
                  <option value="5_unsorted">First 5 (Original)</option>
                  <option value="10_sorted">Top 10 (Sorted)</option>
                  <option value="10_unsorted">First 10 (Original)</option>
                  <option value="all">All Rows</option>
                  <option value="custom">Custom...</option>
                </select>
                {trendLimit !== 5 && trendLimit !== 10 && trendLimit !== 0 && (
                  <input
                    type="number"
                    min="1"
                    max={dataPreview.length}
                    value={trendLimit}
                    onChange={(e) => setTrendLimit(Math.max(1, Number(e.target.value)))}
                    className="w-12 bg-neutral-950 border border-neutral-850 text-neutral-200 text-[10px] rounded px-1.5 py-1 focus:outline-none font-mono text-center"
                    title="Custom Row Limit"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
                  const parsedVal = safeParseFloat(row[compMetric]);
                  const numVal = parsedVal !== -Infinity ? parsedVal : 0;
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
                      
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
                              .map(row => {
                                const parsedVal = safeParseFloat(row[compMetric]);
                                return parsedVal !== -Infinity ? parsedVal : 0;
                              })
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
                      const values = dataPreview.map(d => safeParseFloat(d[col])).filter(v => v !== -Infinity);
                      const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                      return {
                        subject: col,
                        A: avg,
                        fullMark: Math.max(...values, 1)
                      };
                    });

                    return (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
                <select
                  value={
                    cumulLimit === 5
                      ? '5'
                      : cumulLimit === 10
                      ? '10'
                      : cumulLimit === 0
                      ? 'all'
                      : 'custom'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '5') {
                      setCumulLimit(5);
                    } else if (val === '10') {
                      setCumulLimit(10);
                    } else if (val === 'all') {
                      setCumulLimit(0);
                    } else {
                      setCumulLimit(15);
                    }
                  }}
                  className="bg-neutral-950 border border-neutral-850 text-[10px] font-bold text-neutral-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer mr-1"
                >
                  <option value="5">Top 5</option>
                  <option value="10">Top 10</option>
                  <option value="all">All</option>
                  <option value="custom">Custom...</option>
                </select>
                {cumulLimit !== 5 && cumulLimit !== 10 && cumulLimit !== 0 && (
                  <input
                    type="number"
                    min="1"
                    max={dataPreview.length}
                    value={cumulLimit}
                    onChange={(e) => setCumulLimit(Math.max(1, Number(e.target.value)))}
                    className="w-12 bg-neutral-950 border border-neutral-850 text-neutral-200 text-[10px] rounded px-1 py-0.5 focus:outline-none font-mono text-center"
                    title="Custom Row Limit"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={processedCumulativeData}>
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
              </div>
            </CardContent>
          </Card>

          {/* 🗺️ Premium Live Geospatial Location Density Map Card */}
          {mapLocation && (
            <Card className="dark bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 text-neutral-50 shadow-xl md:col-span-2 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <CardHeader className="pb-4 border-b border-neutral-850 bg-neutral-950/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-md flex items-center font-bold">
                    <Sliders className="w-4.5 h-4.5 mr-2 text-blue-400" />
                    Geospatial Location Density Net
                  </CardTitle>
                  <CardDescription className="text-neutral-400 text-xs">Real-time geospatial plotting of metric weights across resolved coordinates.</CardDescription>
                </div>

                {/* Map Control Dropdowns */}
                <div className="flex flex-wrap items-center gap-2 z-10">
                  {/* Location Column selector */}
                  <div className="flex items-center space-x-1">
                    <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider font-mono">Location</span>
                    <select
                      value={mapLocation}
                      onChange={(e) => setMapLocation(e.target.value)}
                      className="bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-[10px] font-bold text-neutral-300 rounded px-2 py-1 focus:outline-none cursor-pointer"
                    >
                      {columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>

                  {/* Metric Column selector */}
                  <div className="flex items-center space-x-1">
                    <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider font-mono">Metric</span>
                    <select
                      value={mapMetric}
                      onChange={(e) => setMapMetric(e.target.value)}
                      className="bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-[10px] font-bold text-neutral-300 rounded px-2 py-1 focus:outline-none cursor-pointer"
                    >
                      {numCols.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
                  {/* Left: Dynamic SVG Continent Grid Map */}
                  <div className="lg:col-span-3 relative h-80 w-full bg-neutral-950/60 rounded-2xl border border-neutral-850 flex items-center justify-center overflow-hidden">
                    {/* Concentric Sonar Rings */}
                    <div className="absolute w-[250px] h-[250px] border border-neutral-850/20 rounded-full pointer-events-none"></div>
                    <div className="absolute w-[120px] h-[120px] border border-neutral-850/15 rounded-full pointer-events-none"></div>
                    
                    <svg className="w-full h-full relative" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#1f2937" strokeWidth="0.25" strokeDasharray="2 2" />
                      <line x1="50" y1="0" x2="50" y2="100" stroke="#1f2937" strokeWidth="0.25" strokeDasharray="2 2" />
                      
                      {/* Stylized Continent Matrix Dot Background */}
                      {mapGridPoints.map((pt, pidx) => (
                        <circle key={pidx} cx={`${pt.x}%`} cy={`${pt.y}%`} r="0.6" fill="#374151" opacity="0.45" />
                      ))}

                      {/* Active Location density bubbles */}
                      {resolvedMapData.map((node, nidx) => {
                        const radius = 2.5 + (node.percent / 100) * 5.5; // proportional size
                        
                        return (
                          <g 
                            key={nidx}
                            className="cursor-pointer group/node"
                            onMouseEnter={() => setHoveredMapNode(node)}
                            onMouseLeave={() => setHoveredMapNode(null)}
                          >
                            {/* Pulsing Outer Glow */}
                            <circle 
                              cx={`${node.x}%`} 
                              cy={`${node.y}%`} 
                              r={radius + 2.5} 
                              className="fill-blue-500/10 stroke-blue-500/30 stroke-[0.5] animate-ping" 
                              style={{ animationDuration: '3.5s' }}
                            />
                            {/* Core Bubble */}
                            <circle 
                              cx={`${node.x}%`} 
                              cy={`${node.y}%`} 
                              r={radius} 
                              className="fill-blue-500/80 stroke-blue-400 stroke-[1] shadow-lg hover:fill-blue-400 hover:stroke-white transition-all duration-200"
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {/* Node Hover Tooltip Panel */}
                    {hoveredMapNode && (
                      <div className="absolute bottom-3 left-3 bg-neutral-900/95 border border-neutral-800 p-2.5 rounded-lg text-[10px] font-mono shadow-2xl animate-fade-in z-20">
                        <span className="text-neutral-500 uppercase tracking-wider text-[8px] font-bold">Node Metric Audit</span>
                        <h5 className="font-bold text-neutral-200 mt-0.5">{hoveredMapNode.name}</h5>
                        <div className="flex justify-between gap-4 mt-1.5 border-t border-neutral-850 pt-1">
                          <span className="text-neutral-400">Total volume:</span>
                          <strong className="text-blue-400">{hoveredMapNode.value.toLocaleString(undefined, {maximumFractionDigits: 1})}</strong>
                        </div>
                        <div className="flex justify-between gap-4 mt-0.5">
                          <span className="text-neutral-400">Global Share:</span>
                          <strong className="text-blue-400">{hoveredMapNode.percent.toFixed(1)}%</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Detailed Legend Table */}
                  <div className="lg:col-span-2 space-y-3.5 pr-1">
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800 pb-2 mb-2 font-mono flex justify-between items-center">
                      <span>Geographic Split Share</span>
                      <span className="text-[8px] text-neutral-500 bg-neutral-950 border border-neutral-850 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-mono">Location Data</span>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-neutral-850">
                      {resolvedMapData.length === 0 ? (
                        <div className="text-center py-12 text-neutral-550 text-xs">
                          No matching geographic coords found in location column.
                        </div>
                      ) : (
                        resolvedMapData.map((node, idx) => (
                          <div key={idx} className="space-y-1 bg-neutral-950/40 p-2 rounded-xl border border-neutral-850">
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center space-x-2 truncate mr-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]"></div>
                                <span className="font-medium text-neutral-200 truncate font-mono text-[11px]" title={node.name}>{node.name}</span>
                              </div>
                              <div className="flex items-center space-x-2 shrink-0">
                                <span className="font-bold text-neutral-350 text-[11px]">
                                  {node.value > 1e6 ? `${(node.value / 1e6).toFixed(1)}M` : node.value > 1e3 ? `${(node.value / 1e3).toFixed(0)}k` : node.value.toLocaleString(undefined, {maximumFractionDigits: 1})}
                                </span>
                                <span className="text-[9px] text-neutral-400 bg-neutral-800 border border-neutral-750 px-1 py-0.5 rounded font-mono font-extrabold">{node.percent.toFixed(0)}%</span>
                              </div>
                            </div>
                            <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-900">
                              <div 
                                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                                style={{ width: `${node.percent}%` }}
                              ></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">Limit</span>
                  <select
                    value={
                      auditLimit === 5
                        ? '5'
                        : auditLimit === 10
                        ? '10'
                        : auditLimit === 0
                        ? 'all'
                        : 'custom'
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '5') {
                        setAuditLimit(5);
                      } else if (val === '10') {
                        setAuditLimit(10);
                      } else if (val === 'all') {
                        setAuditLimit(0);
                      } else {
                        setAuditLimit(15);
                      }
                    }}
                    className="bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-[10px] font-bold text-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                  >
                    <option value="5">Top 5</option>
                    <option value="10">Top 10</option>
                    <option value="all">All</option>
                    <option value="custom">Custom...</option>
                  </select>
                </div>
                {auditLimit !== 5 && auditLimit !== 10 && auditLimit !== 0 && (
                  <input
                    type="number"
                    min="1"
                    max={dataPreview.length}
                    value={auditLimit}
                    onChange={(e) => setAuditLimit(Math.max(1, Number(e.target.value)))}
                    className="w-12 bg-neutral-950 border border-neutral-850 text-neutral-200 text-[10px] rounded px-1.5 py-1 focus:outline-none font-mono text-center"
                    title="Custom Row Limit"
                  />
                )}
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
              
              const numericVals = vals.map(v => safeParseFloat(v)).filter(v => v !== -Infinity);
              const isNumeric = numericVals.length > 0;
              const avg = isNumeric ? numericVals.reduce((acc, b) => acc + b, 0) / numericVals.length : 0;
              
              // Standard deviation
              const variance = isNumeric ? numericVals.reduce((acc, b) => acc + Math.pow(b - avg, 2), 0) / numericVals.length : 0;
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
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      {auditChartType === 'bar' ? (
                        <BarChart data={processedAuditData}>
                          <XAxis dataKey={auditX} stroke="#737373" fontSize={9} />
                          <YAxis stroke="#737373" fontSize={9} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                          <Bar dataKey={auditCol} fill="#ec4899" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      ) : auditChartType === 'line' ? (
                        <LineChart data={processedAuditData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                          <XAxis dataKey={auditX} stroke="#737373" fontSize={9} />
                          <YAxis stroke="#737373" fontSize={9} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey={auditCol} stroke="#ec4899" strokeWidth={2} />
                        </LineChart>
                      ) : (
                        <AreaChart data={processedAuditData}>
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
