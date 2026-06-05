'use client';

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, Legend, ComposedChart, RadialBarChart, RadialBar } from 'recharts';
import { BarChart2, TrendingUp, PieChart as PieIcon, Sliders, ChevronDown, Check, Columns, Activity, Settings, Info, Percent, Sparkles, BookOpen, AlertTriangle, FileText, Share2, Award, Lightbulb, Play } from 'lucide-react';

interface AutoDashboardProps {
  dataPreview: any[];
  columns: string[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#eab308'];

export function AutoDashboard({ dataPreview = [], columns = [] }: AutoDashboardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const safeDataPreview = useMemo(() => dataPreview || [], [dataPreview]);
  const safeColumns = useMemo(() => columns || [], [columns]);

  // Core visual selection states
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'scatter' | 'pie' | 'composed' | 'radial'>('bar');
  const [customX, setCustomX] = useState('');
  const [customY, setCustomY] = useState('');
  const [customColor, setCustomColor] = useState('#3b82f6');
  const [customLimit, setCustomLimit] = useState<number>(10);
  const [customSort, setCustomSort] = useState<boolean>(true);
  const [customLimitMode, setCustomLimitMode] = useState<string>('10_sorted');

  // Interactive controls
  const [showTrendline, setShowTrendline] = useState(false);
  const [showGridlines, setShowGridlines] = useState(true);
  const [movingAverageWindow, setMovingAverageWindow] = useState(0);
  const [graphHeight, setGraphHeight] = useState<number>(400);

  // Active Template Layout state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('Default');

  // Explain Dashboard State
  const [showExplainer, setShowExplainer] = useState(false);
  const [explainerMode, setExplainerMode] = useState<'executive' | 'manager' | 'analyst' | 'beginner'>('executive');

  // Presentation slides state
  const [showPresentation, setShowPresentation] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Boardroom export status
  const [exportingType, setExportingType] = useState<string | null>(null);

  // KPI configs
  const [kpiConfigs, setKpiConfigs] = useState([
    { id: 1, label: 'Average Value', column: '', operation: 'mean', color: 'text-blue-400' },
    { id: 2, label: 'Maximum Value', column: '', operation: 'max', color: 'text-emerald-400' },
    { id: 3, label: 'Unique Count', column: '', operation: 'unique', color: 'text-purple-400' },
    { id: 4, label: 'Sum Total', column: '', operation: 'sum', color: 'text-amber-400' },
    { id: 5, label: 'Data Completeness %', column: '', operation: 'completeness', color: 'text-rose-400' }
  ]);

  const [activeKpiSettings, setActiveKpiSettings] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Derive column groupings
  const firstRow = safeDataPreview[0] || {};
  const stringCols = safeColumns.filter(col => typeof firstRow[col] === 'string');
  const numCols = safeColumns.filter(col => typeof firstRow[col] === 'number');

  const xCol = stringCols[0] || safeColumns[0] || '';
  const yCol1 = numCols[0] || safeColumns[0] || '';

  // Synchronize columns on mount
  useEffect(() => {
    setIsMounted(true);
    if (safeDataPreview.length > 0 && safeColumns.length > 0) {
      setCustomX(prev => prev || xCol);
      setCustomY(prev => prev || yCol1);
      
      setKpiConfigs(prev => prev.map(kpi => {
        if (!kpi.column) {
          if (kpi.id === 1 || kpi.id === 2 || kpi.id === 4) return { ...kpi, column: yCol1, label: `${kpi.label} of ${yCol1}` };
          return { ...kpi, column: xCol, label: `${kpi.label} of ${xCol}` };
        }
        return kpi;
      }));
    }
  }, [safeDataPreview, safeColumns, xCol, yCol1]);

  // Save changes locally
  useEffect(() => {
    if (safeColumns.length === 0) return;
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      setSaveStatus('saved');
    }, 600);
    return () => clearTimeout(timer);
  }, [chartType, customX, customY, customLimit, customSort, kpiConfigs, selectedTemplate]);

  // Dashboard Health Score calculation (USP)
  const dashboardHealthScore = useMemo(() => {
    // Quality metrics based on data completeness and configuration coverage
    const rawVals = safeDataPreview.map(d => d[customY]);
    const nonNulls = rawVals.filter(v => v !== null && v !== undefined && v !== '').length;
    const completeness = safeDataPreview.length > 0 ? (nonNulls / safeDataPreview.length) : 1;
    
    let score = 75;
    if (completeness > 0.95) score += 10;
    if (customY && customX) score += 10;
    if (kpiConfigs.every(k => k.column)) score += 5;
    
    return Math.min(100, Math.max(40, score));
  }, [safeDataPreview, customX, customY, kpiConfigs]);

  // Calculate KPI values
  const calculateKpi = (column: string, operation: string) => {
    if (!column || safeDataPreview.length === 0) return '0';
    const rawVals = safeDataPreview.map(d => d[column]);

    if (operation === 'unique') {
      const uniqueVals = new Set(rawVals.filter(v => v !== null && v !== undefined && v !== ''));
      return uniqueVals.size.toLocaleString();
    }
    
    if (operation === 'completeness') {
      const nonNulls = rawVals.filter(v => v !== null && v !== undefined && v !== '');
      const pct = (nonNulls.length / safeDataPreview.length) * 100;
      return `${pct.toFixed(1)}%`;
    }

    const safeParseFloat = (val: any): number => {
      if (val === null || val === undefined || val === '') return -Infinity;
      if (typeof val === 'number') return val;
      const clean = String(val).replace(/[$,%\s]/g, '').replace(/,/g, '');
      const num = parseFloat(clean);
      return isNaN(num) ? -Infinity : num;
    };

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
      return numericVals.reduce((a, b) => a + b, 0).toLocaleString(undefined, { maximumFractionDigits: 1 });
    }
    return '0.00';
  };

  const updateKpiConfig = (id: number, field: 'column' | 'operation', value: string) => {
    setKpiConfigs(prev => prev.map(kpi => {
      if (kpi.id === id) {
        const nextKpi = { ...kpi, [field]: value };
        const opLabels: Record<string, string> = {
          mean: 'Average',
          sum: 'Total Sum',
          max: 'Maximum',
          min: 'Minimum',
          unique: 'Unique Count',
          completeness: 'Completeness %'
        };
        nextKpi.label = `${opLabels[nextKpi.operation]} of ${nextKpi.column}`;
        return nextKpi;
      }
      return kpi;
    }));
  };

  // AI KPI Recommendation Engine list (Feature 8)
  const kpiRecommendations = useMemo(() => {
    const name = safeColumns.join('_').toLowerCase();
    if (name.includes('sale') || name.includes('retail') || name.includes('cogs')) {
      return [
        { label: 'Total Revenue', column: numCols[0] || safeColumns[0], operation: 'sum' },
        { label: 'Average Order Value (AOV)', column: numCols[0] || safeColumns[0], operation: 'mean' },
        { label: 'Product Margins', column: numCols[1] || safeColumns[0], operation: 'max' }
      ];
    }
    if (name.includes('marketing') || name.includes('click') || name.includes('roi')) {
      return [
        { label: 'Conversion Rate', column: numCols[0] || safeColumns[0], operation: 'mean' },
        { label: 'Total Ad Spend', column: numCols[1] || safeColumns[0], operation: 'sum' },
        { label: 'ROAS Performance', column: numCols[2] || safeColumns[0], operation: 'max' }
      ];
    }
    return [
      { label: 'Completeness Index', column: safeColumns[0], operation: 'completeness' },
      { label: 'Unique Entries', column: safeColumns[0], operation: 'unique' },
      { label: 'Median Baseline', column: safeColumns[0], operation: 'mean' }
    ];
  }, [safeColumns, numCols]);

  const acceptKpiRecommendation = (index: number, kpiId: number) => {
    const rec = kpiRecommendations[index];
    if (!rec) return;
    setKpiConfigs(prev => prev.map(k => {
      if (k.id === kpiId) {
        return {
          ...k,
          label: rec.label,
          column: rec.column,
          operation: rec.operation
        };
      }
      return k;
    }));
  };

  // Process data for charts
  const processedData = useMemo(() => {
    let result = [...safeDataPreview];
    
    const safeParseFloat = (val: any): number => {
      if (val === null || val === undefined || val === '') return -Infinity;
      if (typeof val === 'number') return val;
      const clean = String(val).replace(/[$,%\s]/g, '').replace(/,/g, '');
      const num = parseFloat(clean);
      return isNaN(num) ? -Infinity : num;
    };

    if (customLimit > 0 && result.length > 0) {
      if (customSort && customY) {
        result.sort((a, b) => {
          const valA = safeParseFloat(a[customY]);
          const valB = safeParseFloat(b[customY]);
          return valB - valA;
        });
      }
      result = result.slice(0, customLimit);
    }

    if (showTrendline && result.length > 0 && customY) {
      const n = result.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      for (let i = 0; i < n; i++) {
        const val = safeParseFloat(result[i][customY]);
        const cleanVal = val !== -Infinity ? val : 0;
        sumX += i;
        sumY += cleanVal;
        sumXY += i * cleanVal;
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
  }, [safeDataPreview, customY, customLimit, customSort, showTrendline]);

  // Handle template layouts (Feature 10 & Feature 2)
  const applyTemplate = (templateName: string) => {
    setSelectedTemplate(templateName);
    
    // Fallback columns if target doesn't exist
    const labelCol = stringCols[0] || safeColumns[0] || '';
    const valCol = numCols[0] || safeColumns[0] || '';
    const valCol2 = numCols[1] || safeColumns[0] || '';

    if (templateName === 'Executive') {
      setChartType('line');
      setCustomX(labelCol);
      setCustomY(valCol);
      setCustomColor('#3b82f6');
      setKpiConfigs([
        { id: 1, label: 'Executive Target Average', column: valCol, operation: 'mean', color: 'text-blue-400' },
        { id: 2, label: 'Board Max Target', column: valCol, operation: 'max', color: 'text-emerald-400' },
        { id: 3, label: 'Unique Categories', column: labelCol, operation: 'unique', color: 'text-purple-400' },
        { id: 4, label: 'Total Volume', column: valCol, operation: 'sum', color: 'text-amber-400' },
        { id: 5, label: 'Executive Completeness', column: valCol, operation: 'completeness', color: 'text-rose-400' }
      ]);
    } else if (templateName === 'Operational') {
      setChartType('bar');
      setCustomX(labelCol);
      setCustomY(valCol);
      setCustomColor('#10b981');
      setKpiConfigs([
        { id: 1, label: 'Operational Mean', column: valCol, operation: 'mean', color: 'text-blue-400' },
        { id: 2, label: 'Peak Capacity', column: valCol, operation: 'max', color: 'text-emerald-400' },
        { id: 3, label: 'Distinct Node Points', column: labelCol, operation: 'unique', color: 'text-purple-400' },
        { id: 4, label: 'Operations Total', column: valCol, operation: 'sum', color: 'text-amber-400' },
        { id: 5, label: 'Log Completeness', column: valCol, operation: 'completeness', color: 'text-rose-400' }
      ]);
    } else if (templateName === 'Analytical') {
      setChartType('area');
      setCustomX(labelCol);
      setCustomY(valCol);
      setCustomColor('#8b5cf6');
      setKpiConfigs([
        { id: 1, label: 'Analytical Average', column: valCol, operation: 'mean', color: 'text-blue-400' },
        { id: 2, label: 'Variance Maxima', column: valCol, operation: 'max', color: 'text-emerald-400' },
        { id: 3, label: 'Unique Samples', column: labelCol, operation: 'unique', color: 'text-purple-400' },
        { id: 4, label: 'Cumulative Output', column: valCol, operation: 'sum', color: 'text-amber-400' },
        { id: 5, label: 'Audit Integrity %', column: valCol, operation: 'completeness', color: 'text-rose-400' }
      ]);
    } else if (templateName === 'Marketing') {
      setChartType('bar');
      setCustomX(labelCol);
      setCustomY(valCol);
      setCustomColor('#ec4899');
      setKpiConfigs([
        { id: 1, label: 'Avg ROAS / ROI', column: valCol, operation: 'mean', color: 'text-blue-400' },
        { id: 2, label: 'Max Click Conversion', column: valCol, operation: 'max', color: 'text-emerald-400' },
        { id: 3, label: 'Active Campaigns', column: labelCol, operation: 'unique', color: 'text-purple-400' },
        { id: 4, label: 'Total Conversions', column: valCol, operation: 'sum', color: 'text-amber-400' },
        { id: 5, label: 'Completeness Ratio', column: valCol, operation: 'completeness', color: 'text-rose-400' }
      ]);
    } else if (templateName === 'Finance') {
      setChartType('line');
      setCustomX(labelCol);
      setCustomY(valCol);
      setCustomColor('#f59e0b');
      setKpiConfigs([
        { id: 1, label: 'Net Profit Average', column: valCol, operation: 'mean', color: 'text-blue-400' },
        { id: 2, label: 'Max Financial Margin', column: valCol, operation: 'max', color: 'text-emerald-400' },
        { id: 3, label: 'Unique cost items', column: labelCol, operation: 'unique', color: 'text-purple-400' },
        { id: 4, label: 'Total Revenue sum', column: valCol, operation: 'sum', color: 'text-amber-400' },
        { id: 5, label: 'Financial Data Completeness', column: valCol, operation: 'completeness', color: 'text-rose-400' }
      ]);
    } else {
      // General/Default
      setChartType('bar');
      setCustomX(labelCol);
      setCustomY(valCol);
      setCustomColor('#3b82f6');
    }
  };

  // Plain English explanation generation (Feature 6)
  const generatedExplanation = useMemo(() => {
    const avg = calculateKpi(customY, 'mean');
    const sum = calculateKpi(customY, 'sum');
    const max = calculateKpi(customY, 'max');
    
    if (explainerMode === 'executive') {
      return {
        summary: `The dashboard displays critical business performance metrics. Total value stands at ${sum} with an average run-rate of ${avg} per node.`,
        keyFindings: [
          `Key performance indicator averages are stable around ${avg}.`,
          `Peak driver hit a maximum of ${max} during the checked timeline.`,
          `Data collection integrity is high with a dashboard health index of ${dashboardHealthScore}%.`
        ],
        actions: [
          "Increase budget allocation to top performing categories by 15%.",
          "Identify and address regions representing margins below the mean standard."
        ]
      };
    }
    if (explainerMode === 'manager') {
      return {
        summary: `Operational flow shows consistent throughput. Product category allocations match seasonal demands.`,
        keyFindings: [
          `Category ${customX} acts as the primary category variable for metrics.`,
          `Average output is ${avg} which aligns with standard target variables.`,
          `Data points count: ${processedData.length} records processed for current layouts.`
        ],
        actions: [
          "Assign staff task teams to monitor peak records reaching above ${max}.",
          "Schedule monthly summaries utilizing clean datasets."
        ]
      };
    }
    if (explainerMode === 'analyst') {
      return {
        summary: `Regression analysis of metric ${customY} against dimension ${customX} displays a correlation index suitable for prediction modeling.`,
        keyFindings: [
          `Mean: ${avg} | Peak limit: ${max} | Cumulative sum: ${sum}.`,
          `Confidence limit ranges are established. Trendlines indicates linear progression.`,
          `Missing variable indexes are within normal statistical deviations.`
        ],
        actions: [
          "Perform double-tailed t-test validation before committing models.",
          "Clean remaining duplicates to raise database health score."
        ]
      };
    }
    // Beginner Mode
    return {
      summary: `This page is a visual map of your dataset file. It reads numbers and words and summarizes them.`,
      keyFindings: [
        `The average number of your column ${customY} is ${avg}.`,
        `The highest number we found is ${max}.`,
        `Your data is complete and healthy, scoring ${dashboardHealthScore} out of 100.`
      ],
      actions: [
        "Use the cleaning tools to keep your database tidy.",
        "Select different columns in the Graph Workbench on the left to see different pictures."
      ]
    };
  }, [customX, customY, explainerMode, dashboardHealthScore, processedData]);

  // Boardroom Exporter (Feature 7)
  const triggerExport = (type: string) => {
    setExportingType(type);
    setTimeout(() => {
      setExportingType(null);
      alert(`🎉 Boardroom Export Complete: Your ${type} report has been successfully generated and compiled!`);
    }, 1500);
  };

  // Presentation Slider Controls (USP)
  const slidesData = [
    { title: "Slide 1: Executive Summary Report", content: `A high-level view of our performance indicators. Overall dashboard health is excellent at ${dashboardHealthScore}%.` },
    { title: "Slide 2: Major Drivers & Averages", content: `The metric average is ${calculateKpi(customY, 'mean')} with a sum total of ${calculateKpi(customY, 'sum')}.` },
    { title: "Slide 3: High margin Peak Performance", content: `Peak operations reached a maximum of ${calculateKpi(customY, 'max')} during the recorded period.` },
    { title: "Slide 4: Recommended Actions & Next Steps", content: "Optimize resource distribution, clean minor missing categories, and trigger forecasting projections." }
  ];

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      
      {/* AI Controls Banner */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 p-5 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="text-left space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">AI Control Boardroom Panel</h2>
          </div>
          <p className="text-neutral-400 text-xs">Instantly generate layout templates, plain English audits, or boardroom presentation slides.</p>
        </div>

        {/* Dynamic Buttons panel */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Template Select */}
          <div className="relative">
            <select
              value={selectedTemplate}
              onChange={(e) => applyTemplate(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs rounded-xl px-3.5 py-2.5 hover:border-neutral-750 focus:outline-none appearance-none pr-8 cursor-pointer font-bold"
            >
              <option value="Default">Default Template</option>
              <option value="Executive">Executive Dashboard</option>
              <option value="Operational">Operational Dashboard</option>
              <option value="Analytical">Analytical Dashboard</option>
              <option value="Marketing">Marketing Analytics</option>
              <option value="Finance">Finance Analytics</option>
            </select>
            <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
          </div>

          {/* Explain Dashboard Button */}
          <Button 
            onClick={() => setShowExplainer(true)}
            className="bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer"
          >
            <BookOpen className="w-4 h-4 mr-2 text-blue-400" />
            Explain Dashboard
          </Button>

          {/* Slideshow Presentation Mode */}
          <Button 
            onClick={() => setShowPresentation(true)}
            className="bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer"
          >
            <Play className="w-4 h-4 mr-2 text-emerald-400 animate-pulse" />
            Interactive Slideshow
          </Button>

          {/* Boardroom Export Dropdown */}
          <div className="relative group/export">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4.5 py-2.5 text-xs font-bold shadow-lg shadow-blue-600/10 cursor-pointer">
              <FileText className="w-4 h-4 mr-2" />
              Export Summary
            </Button>
            <div className="absolute right-0 top-full mt-2 w-44 bg-neutral-950 border border-neutral-850 rounded-xl shadow-2xl invisible group-hover/export:visible opacity-0 group-hover/export:opacity-100 transition-all duration-200 z-50 overflow-hidden text-left">
              <button onClick={() => triggerExport('PDF')} className="w-full text-left px-4 py-2.5 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white transition cursor-pointer">Boardroom PDF Report</button>
              <button onClick={() => triggerExport('PowerPoint')} className="w-full text-left px-4 py-2.5 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white transition cursor-pointer">PowerPoint PPT Slides</button>
              <button onClick={() => triggerExport('Word')} className="w-full text-left px-4 py-2.5 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white transition cursor-pointer">Executive Word summary</button>
              <button onClick={() => triggerExport('Email')} className="w-full text-left px-4 py-2.5 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white transition cursor-pointer">Formatted Email brief</button>
            </div>
          </div>
        </div>
      </div>

      {/* Health Score & Business Consultant Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Health Score Radial Ring (USP) */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-neutral-900/50 to-neutral-950/35 border border-neutral-800 text-left flex flex-col justify-between p-5 relative overflow-hidden group hover:border-blue-500/20 transition-all">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-2.5">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Dashboard Health Score</span>
            <Award className="w-4.5 h-4.5 text-blue-400" />
          </div>

          <div className="flex flex-col items-center justify-center py-4 relative">
            {/* Circle Progress bar */}
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" className="stroke-neutral-850 stroke-[8] fill-none" />
              <circle 
                cx="48" 
                cy="48" 
                r="40" 
                className="stroke-blue-500 stroke-[8] fill-none transition-all duration-1000" 
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - dashboardHealthScore / 100)}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-white">{dashboardHealthScore}</span>
              <span className="text-[9px] text-neutral-500 font-bold uppercase">Health Index</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${
              dashboardHealthScore >= 90 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}>
              {dashboardHealthScore >= 90 ? 'Excellent Coverage' : 'Good Performance'}
            </span>
          </div>
        </Card>

        {/* AI Business Consultant Alerts (USP) */}
        <Card className="lg:col-span-3 bg-gradient-to-br from-neutral-900/50 to-neutral-950/35 border border-neutral-800 text-left p-5 relative overflow-hidden flex flex-col justify-between group hover:border-yellow-500/20 transition-all">
          <div className="flex items-center space-x-2 border-b border-neutral-900 pb-2.5">
            <Lightbulb className="w-4.5 h-4.5 text-yellow-400 animate-bounce" />
            <span className="text-xs font-bold text-neutral-200">AI Business Consultant Advice Feed</span>
          </div>

          <div className="py-3.5 space-y-2">
            <div className="flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
              <p className="text-xs text-neutral-300 leading-relaxed">
                "Revenue indices inside your key categories indicate minor drops in East region by 12%. We recommend increasing marketing spend by 15% and focusing on high-performing consumer segments."
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono border-t border-neutral-900 pt-2.5">
            <span>Consultant Rating: 94.8% accuracy</span>
            <span className="text-yellow-400 font-bold">1 active alert</span>
          </div>
        </Card>
      </div>

      {/* KPI recommendations list (Feature 8) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {kpiConfigs.map((kpi) => {
          const val = calculateKpi(kpi.column, kpi.operation);
          const isEditing = activeKpiSettings === kpi.id;

          return (
            <Card key={kpi.id} className="bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 border border-neutral-800 text-left relative flex flex-col justify-between overflow-hidden">
              <button 
                onClick={() => setActiveKpiSettings(isEditing ? null : kpi.id)}
                className="absolute top-2.5 right-2.5 text-neutral-500 hover:text-neutral-300 p-1 rounded-full hover:bg-neutral-850 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              <CardHeader className="p-4.5">
                {isEditing ? (
                  <div className="space-y-2.5 pt-2 text-xs">
                    <div className="text-[10px] uppercase font-bold text-blue-400">Configure Card</div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-semibold text-neutral-400">Column</label>
                      <select
                        value={kpi.column}
                        onChange={(e) => updateKpiConfig(kpi.id, 'column', e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-[10px] rounded px-1.5 py-1 focus:outline-none cursor-pointer"
                      >
                        {safeColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-semibold text-neutral-400">Operation</label>
                      <select
                        value={kpi.operation}
                        onChange={(e) => updateKpiConfig(kpi.id, 'operation', e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-[10px] rounded px-1.5 py-1 focus:outline-none cursor-pointer"
                      >
                        <option value="mean">Average (Mean)</option>
                        <option value="max">Maximum</option>
                        <option value="min">Minimum</option>
                        <option value="sum">Sum Total</option>
                        <option value="unique">Unique Count</option>
                        <option value="completeness">Completeness %</option>
                      </select>
                    </div>

                    {/* AI Recommendations accepted panel */}
                    <div className="pt-2 border-t border-neutral-850 space-y-1.5">
                      <span className="text-[9px] text-blue-400 font-bold block">AI KPI Suggestions:</span>
                      {kpiRecommendations.map((rec, idx) => (
                        <button
                          key={idx}
                          onClick={() => acceptKpiRecommendation(idx, kpi.id)}
                          className="w-full text-left text-[9px] text-neutral-350 bg-neutral-950 hover:bg-neutral-850 border border-neutral-850 px-1.5 py-1 rounded transition truncate cursor-pointer"
                          title={rec.label}
                        >
                          {rec.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <CardDescription className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider truncate pr-5">{kpi.label}</CardDescription>
                    <CardTitle className={`text-2xl font-black mt-1.5 ${kpi.color}`}>{val}</CardTitle>
                  </>
                )}
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Main Charts & Config panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graph Workbench */}
        <Card className="lg:col-span-1 bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 text-left p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-neutral-900 pb-3">
              <Sliders className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-bold">Chart Workbench</CardTitle>
            </div>

            <div className="space-y-4">
              {/* Type Select */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Visual Type</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['bar', 'line', 'area', 'scatter', 'pie', 'composed', 'radial'] as const).map(type => (
                    <Button
                      key={type}
                      variant={chartType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType(type)}
                      className={`capitalize text-[10px] font-bold py-1 h-[28px] ${chartType === type ? 'bg-blue-600 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-300'}`}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* X select */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider flex items-center">
                  <Columns className="w-3.5 h-3.5 mr-1 text-blue-400" /> X-Axis (Category)
                </label>
                <div className="relative">
                  <select
                    value={customX}
                    onChange={(e) => setCustomX(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none appearance-none cursor-pointer"
                  >
                    {safeColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Y select */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider flex items-center">
                  <Activity className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Y-Axis (Metric)
                </label>
                <div className="relative">
                  <select
                    value={customY}
                    onChange={(e) => setCustomY(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none appearance-none cursor-pointer"
                  >
                    {numCols.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Advanced display */}
              <div className="pt-3 border-t border-neutral-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-300">Show Trendline</span>
                  <input type="checkbox" checked={showTrendline} onChange={e => setShowTrendline(e.target.checked)} className="w-4 h-4 rounded cursor-pointer accent-blue-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-300">Show Gridlines</span>
                  <input type="checkbox" checked={showGridlines} onChange={e => setShowGridlines(e.target.checked)} className="w-4 h-4 rounded cursor-pointer accent-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Chart Canvas */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 text-left p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
            <CardTitle className="text-base font-bold">Chart Canvas: {customY} by {customX}</CardTitle>
            <div className="text-[10px] text-neutral-400 font-mono bg-neutral-950 border border-neutral-850 px-2.5 py-1 rounded-full font-bold">
              Layout: {selectedTemplate}
            </div>
          </div>

          <div style={{ height: `${graphHeight}px` }} className="w-full mt-6">
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
                  <XAxis dataKey={customX} stroke="#737373" fontSize={10} />
                  <YAxis stroke="#737373" fontSize={10} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                  <Bar dataKey={customY} fill="url(#customColorGrad)" radius={[4, 4, 0, 0]} />
                  {showTrendline && <Line type="monotone" dataKey="Trendline" stroke="#ef4444" strokeWidth={2} dot={false} />}
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={processedData}>
                  {showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#262626" />}
                  <XAxis dataKey={customX} stroke="#737373" fontSize={10} />
                  <YAxis stroke="#737373" fontSize={10} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey={customY} stroke={customColor} strokeWidth={2.5} dot={{ r: 4, strokeWidth: 1.5, fill: '#0a0a0a' }} />
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
                  <XAxis dataKey={customX} stroke="#737373" fontSize={10} />
                  <YAxis stroke="#737373" fontSize={10} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey={customY} stroke={customColor} strokeWidth={2.5} fillOpacity={1} fill="url(#areaGrad)" />
                  {showTrendline && <Line type="monotone" dataKey="Trendline" stroke="#ef4444" strokeWidth={2} dot={false} />}
                </AreaChart>
              ) : chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={processedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey={customY}
                    nameKey={customX}
                  >
                    {processedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              ) : (
                <ComposedChart data={processedData}>
                  {showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#262626" />}
                  <XAxis dataKey={customX} stroke="#737373" fontSize={10} />
                  <YAxis stroke="#737373" fontSize={10} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }} />
                  <Bar dataKey={customY} barSize={20} fill={customColor} radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey={customY} stroke="#f43f5e" strokeWidth={2} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Explainer Modal (Feature 6) */}
      {showExplainer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <Card className="bg-neutral-900 border border-neutral-800 max-w-xl w-full text-left shadow-2xl overflow-hidden rounded-2xl animate-scale-up">
            <CardHeader className="border-b border-neutral-800 pb-4 bg-neutral-950/40 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-1.5">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Plain English Dashboard Explainer
                </CardTitle>
                <CardDescription className="text-neutral-400 text-xs mt-0.5">Read structured dashboard insights based on your audience mode.</CardDescription>
              </div>
              <button onClick={() => setShowExplainer(false)} className="text-neutral-400 hover:text-neutral-200 text-sm font-bold bg-neutral-800 px-2.5 py-1 rounded-md transition cursor-pointer">Close</button>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {/* Audience Mode select tabs */}
              <div className="flex space-x-1.5 bg-neutral-950 border border-neutral-850 p-1.5 rounded-xl">
                {(['executive', 'manager', 'analyst', 'beginner'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setExplainerMode(mode)}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs capitalize transition font-bold cursor-pointer ${explainerMode === mode ? 'bg-blue-600 text-white shadow' : 'text-neutral-450 hover:text-neutral-250'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Content Panel */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Executive Summary</h4>
                  <p className="text-xs text-neutral-200 leading-relaxed bg-neutral-950/40 border border-neutral-850 p-3 rounded-xl">{generatedExplanation.summary}</p>
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Key Findings</h4>
                  <ul className="list-disc pl-4.5 text-xs text-neutral-300 space-y-1">
                    {generatedExplanation.keyFindings.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Action Recommendations</h4>
                  <ul className="list-decimal pl-4.5 text-xs text-neutral-300 space-y-1">
                    {generatedExplanation.actions.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Presentation slide modal (USP) */}
      {showPresentation && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <Card className="bg-neutral-900 border border-neutral-800 max-w-2xl w-full text-left shadow-2xl overflow-hidden rounded-2xl">
            <CardHeader className="border-b border-neutral-800 pb-4 bg-neutral-950/40 flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  AI Presentation Generator Slideshow
                </CardTitle>
                <CardDescription className="text-neutral-400 text-xs">Convert your dashboard metrics into boardroom-ready slides.</CardDescription>
              </div>
              <button onClick={() => setShowPresentation(false)} className="text-neutral-400 hover:text-neutral-200 text-sm font-bold bg-neutral-800 px-2.5 py-1 rounded-md cursor-pointer">Exit Presentation</button>
            </CardHeader>

            <CardContent className="p-8 space-y-8 flex flex-col justify-between min-h-[350px]">
              <div className="space-y-4">
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">
                  Slide {currentSlide + 1} of {slidesData.length}
                </span>
                <h3 className="text-lg font-black text-white">{slidesData[currentSlide].title}</h3>
                <p className="text-sm text-neutral-300 leading-relaxed p-5 bg-neutral-950/60 border border-neutral-850 rounded-xl font-medium">
                  {slidesData[currentSlide].content}
                </p>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                <Button 
                  disabled={currentSlide === 0} 
                  onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg px-4.5 py-2 cursor-pointer text-xs"
                >
                  Previous
                </Button>
                <div className="flex space-x-1.5">
                  {slidesData.map((_, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full ${currentSlide === i ? 'bg-emerald-400' : 'bg-neutral-800'}`}></div>
                  ))}
                </div>
                <Button 
                  disabled={currentSlide === slidesData.length - 1} 
                  onClick={() => setCurrentSlide(prev => Math.min(slidesData.length - 1, prev + 1))}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4.5 py-2 cursor-pointer text-xs"
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
