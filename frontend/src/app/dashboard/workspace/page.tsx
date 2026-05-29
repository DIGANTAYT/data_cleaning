'use client';

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Sparkles, UploadCloud, Download, Share2, History, Undo2, Redo2, 
  LayoutDashboard, BarChart3, PieChart, TrendingUp, Activity, Grid, Trash2, 
  Copy, Sliders, Settings, Search, ArrowUpDown, Check, FileSpreadsheet, 
  FileImage, FileText, Eye, Star, Folder, Calendar, Info, Send, Terminal, 
  ChevronRight, Maximize2, Palette, Shield, Lock, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { API_URL } from '@/lib/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, 
  AreaChart, Area, ScatterChart, Scatter, Legend, ComposedChart, RadialBarChart, RadialBar 
} from 'recharts';

interface Widget {
  id: string;
  type: 'kpi' | 'bar' | 'pie' | 'line' | 'area' | 'table' | 'scatter' | 'text' | 'filter';
  title: string;
  w: string; // width class e.g. 'col-span-1', 'col-span-2', 'col-span-3'
  metric: string;
  category: string;
  color: string;
  starred?: boolean;
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
}

const PALETTES = [
  { name: 'Corporate Blue', primary: '#3b82f6', secondary: '#60a5fa' },
  { name: 'Emerald Mint', primary: '#10b981', secondary: '#34d399' },
  { name: 'Cyberpunk Violet', primary: '#8b5cf6', secondary: '#ec4899' },
  { name: 'Golden Amber', primary: '#f59e0b', secondary: '#fbbf24' },
  { name: 'Crimson Rose', primary: '#f43f5e', secondary: '#fda4af' }
];

export default function DashboardWorkspace() {
  // Page Tabs: 'home' | 'builder' | 'ai-generator' | 'copilot'
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'home' | 'builder' | 'ai-generator' | 'copilot'>('home');

  // Search & Filter state on Landing
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'modified'>('recent');

  // Builder States
  const [dashboardName, setDashboardName] = useState('Global Operations Revenue Hub');
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [activeCanvasTab, setActiveCanvasTab] = useState<'Summary' | 'Performance Analytics'>('Summary');
  const [activeTheme, setActiveTheme] = useState<'dark' | 'light' | 'corporate'>('dark');
  const [globalDateFilter, setGlobalDateFilter] = useState('Last 30 Days');

  // Database active states
  const [activeDashboardId, setActiveDashboardId] = useState<string | null>(null);
  const [dbDashboards, setDbDashboards] = useState<any[]>([]);
  const [loadingDashboards, setLoadingDashboards] = useState(false);

  const fetchDashboards = async () => {
    setLoadingDashboards(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/dashboards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDbDashboards(res.data);
    } catch (error) {
      console.error('Failed to load dashboards from Postgres', error);
    } finally {
      setLoadingDashboards(false);
    }
  };

  const saveDashboardToDb = async () => {
    try {
      const token = localStorage.getItem('token');
      const configData = { widgets, activeTheme };
      
      setExportNotification({ status: 'loading', message: 'Synchronizing layout configuration with database...' });
      
      if (activeDashboardId) {
        await axios.put(`${API_URL}/api/dashboards/${activeDashboardId}`, {
          name: dashboardName,
          config: configData
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExportNotification({ status: 'success', message: `Dashboard "${dashboardName}" successfully saved.` });
      } else {
        const res = await axios.post(`${API_URL}/api/dashboards`, {
          name: dashboardName,
          config: configData
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const savedId = res.data.dashboard.id;
        setActiveDashboardId(savedId);
        setExportNotification({ status: 'success', message: `Dashboard "${dashboardName}" created & saved.` });
      }
      fetchDashboards(); // Refresh lists
      setTimeout(() => setExportNotification({ status: 'idle', message: '' }), 3000);
    } catch (error) {
      console.error('Failed to save dashboard to DB', error);
      setExportNotification({ status: 'loading', message: 'Failed to synchronize with database.' });
      setTimeout(() => setExportNotification({ status: 'idle', message: '' }), 3000);
    }
  };

  const loadDashboardFromDb = (dbItem: any) => {
    setActiveDashboardId(dbItem.id);
    setDashboardName(dbItem.name);
    try {
      const parsed = typeof dbItem.config === 'string' ? JSON.parse(dbItem.config) : dbItem.config;
      if (parsed.widgets) setWidgets(parsed.widgets);
      if (parsed.activeTheme) setActiveTheme(parsed.activeTheme);
    } catch (e) {
      console.error('Failed to parse dashboard config', e);
    }
    setActiveWorkspaceTab('builder');
  };

  const deleteDashboardFromDb = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this dashboard from the database?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/dashboards/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (activeDashboardId === id) {
        setActiveDashboardId(null);
        setDashboardName('New Analytics Dashboard');
        setWidgets([]);
      }
      fetchDashboards();
    } catch (error) {
      console.error('Failed to delete dashboard from DB', error);
    }
  };

  const resolvedDashboards = useMemo(() => {
    if (dbDashboards && dbDashboards.length > 0) {
      return dbDashboards.map((db: any) => ({
        id: db.id,
        name: db.name,
        desc: `PostgreSQL synced layout with ${
          typeof db.config === 'string' 
            ? (JSON.parse(db.config).widgets?.length || 0) 
            : (db.config.widgets?.length || 0)
        } resizable charts.`,
        type: 'Database Synced',
        star: true,
        raw: db
      }));
    }
    return [
      { id: 'mock-1', name: 'Global Sales Summary', desc: 'Real-time corporate deal allocations & operational health score.', type: 'Recent Dashboard', star: true, raw: null },
      { id: 'mock-2', name: 'SaaS Churn & Health Index', desc: 'AutoML predicted risk margins with Gini impurities and metrics.', type: 'AI Generated Draft', star: true, raw: null },
      { id: 'mock-3', name: 'Marketing ROI Matrix', desc: 'Visual distribution of platform ad-spends and conversion pings.', type: 'Team Dashboard', raw: null },
      { id: 'mock-4', name: 'Standard Financial Audit template', desc: 'Presorted tabular layout for business sales run-rate forecasting.', type: 'Dashboard Template', raw: null }
    ];
  }, [dbDashboards]);

  useEffect(() => {
    fetchDashboards();
  }, []);

  // Undo/Redo States
  const [undoStack, setUndoStack] = useState<Widget[][]>([]);
  const [redoStack, setRedoStack] = useState<Widget[][]>([]);

  // Interactive Widgets State
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 'w-1', type: 'kpi', title: 'Total Enterprise Sales', w: 'col-span-1', metric: 'SalesAmount', category: '', color: '#3b82f6', starred: true },
    { id: 'w-2', type: 'kpi', title: 'Average Deal Size', w: 'col-span-1', metric: 'DealSize', category: '', color: '#10b981' },
    { id: 'w-3', type: 'kpi', title: 'Customer Health Score', w: 'col-span-1', metric: 'HealthIndex', category: '', color: '#8b5cf6' },
    { id: 'w-4', type: 'bar', title: 'Revenue Share by Category', w: 'col-span-2', metric: 'Revenue', category: 'Category', color: '#3b82f6' },
    { id: 'w-5', type: 'pie', title: 'Client Geolocation Density', w: 'col-span-1', metric: 'UsersCount', category: 'Region', color: '#8b5cf6' },
    { id: 'w-6', type: 'line', title: 'Sales Run-Rate Trajectory', w: 'col-span-3', metric: 'SalesAmount', category: 'Date', color: '#10b981' }
  ]);

  // Mock Datasets
  const [selectedDatasetName, setSelectedDatasetName] = useState('customer_metrics_unclean.csv');
  const [availableDatasets] = useState([
    { name: 'customer_metrics_unclean.csv', rows: 12504, columns: ['SalesAmount', 'DealSize', 'HealthIndex', 'Category', 'Region', 'Date'] },
    { name: 'fintech_fraud_records.xlsx', rows: 7997, columns: ['RiskScore', 'TransactionAmount', 'FraudRatio', 'CardType', 'Country', 'Timestamp'] },
    { name: 'marketing_spend_audit.csv', rows: 3000, columns: ['ROI', 'AdSpend', 'Clicks', 'Impressions', 'Platform', 'Campaign'] }
  ]);

  // Selected Dataset Info
  const activeDataset = useMemo(() => {
    return availableDatasets.find(d => d.name === selectedDatasetName) || availableDatasets[0];
  }, [selectedDatasetName, availableDatasets]);

  // Selected Widget
  const selectedWidget = useMemo(() => {
    return widgets.find(w => w.id === selectedWidgetId) || null;
  }, [widgets, selectedWidgetId]);

  // Mock Chart Data Generator
  const chartData = useMemo(() => {
    if (selectedDatasetName.includes('marketing')) {
      return [
        { Category: 'Google Ads', Region: 'North America', Date: 'Q1', SalesAmount: 45000, DealSize: 3200, HealthIndex: 78, Revenue: 45000, UsersCount: 120 },
        { Category: 'Meta Ads', Region: 'Europe', Date: 'Q2', SalesAmount: 58000, DealSize: 4100, HealthIndex: 85, Revenue: 58000, UsersCount: 190 },
        { Category: 'YouTube Video', Region: 'Asia-Pacific', Date: 'Q3', SalesAmount: 32000, DealSize: 2800, HealthIndex: 69, Revenue: 32000, UsersCount: 95 },
        { Category: 'LinkedIn Sponsored', Region: 'Latin America', Date: 'Q4', SalesAmount: 67000, DealSize: 5200, HealthIndex: 91, Revenue: 67000, UsersCount: 230 },
        { Category: 'Newsletter Blast', Region: 'Middle East', Date: 'Q5', SalesAmount: 21000, DealSize: 1950, HealthIndex: 72, Revenue: 21000, UsersCount: 65 }
      ];
    }
    return [
      { Category: 'Enterprise Cloud SaaS', Region: 'New York, US', Date: '2026-05-24', SalesAmount: 12500, DealSize: 12500, HealthIndex: 94.2, Revenue: 62500, UsersCount: 15 },
      { Category: 'Developer Compute Tier', Region: 'Zurich, CH', Date: '2026-05-25', SalesAmount: 99, DealSize: 4500, HealthIndex: 92.5, Revenue: 9900, UsersCount: 110 },
      { Category: 'Enterprise Support SLA', Region: 'London, UK', Date: '2026-05-26', SalesAmount: 48000, DealSize: 24000, HealthIndex: 88.0, Revenue: 96000, UsersCount: 4 },
      { Category: 'Local Storage Sync', Region: 'Mumbai, IN', Date: '2026-05-27', SalesAmount: 1450, DealSize: 1450, HealthIndex: 96.1, Revenue: 29000, UsersCount: 45 },
      { Category: 'Data Cleaning Studio', Region: 'Singapore, SG', Date: '2026-05-28', SalesAmount: 32000, DealSize: 16000, HealthIndex: 95.0, Revenue: 64000, UsersCount: 22 }
    ];
  }, [selectedDatasetName]);

  // Cross-Filtering states
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('All Regions');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All Categories');

  // Export notification state
  const [exportNotification, setExportNotification] = useState<{ status: 'idle' | 'loading' | 'success'; message: string }>({ status: 'idle', message: '' });

  // Dynamic dropdown categories
  const uniqueRegions = useMemo(() => {
    const items = (chartData as any[]).map(d => String(d.Region || d.Country || ''));
    return ['All Regions', ...Array.from(new Set(items.filter(Boolean)))];
  }, [chartData]);

  const uniqueCategories = useMemo(() => {
    const items = (chartData as any[]).map(d => String(d.Category || d.CardType || d.Platform || ''));
    return ['All Categories', ...Array.from(new Set(items.filter(Boolean)))];
  }, [chartData]);

  // Reset filters if active dataset changes to prevent empty fits
  useEffect(() => {
    setSelectedRegionFilter('All Regions');
    setSelectedCategoryFilter('All Categories');
  }, [selectedDatasetName]);

  // Derived filtered chart data
  const filteredChartData = useMemo(() => {
    let data = chartData as any[];
    if (selectedRegionFilter !== 'All Regions') {
      data = data.filter(d => String(d.Region || d.Country || '') === selectedRegionFilter);
    }
    if (selectedCategoryFilter !== 'All Categories') {
      data = data.filter(d => String(d.Category || d.CardType || d.Platform || '') === selectedCategoryFilter);
    }
    return data;
  }, [chartData, selectedRegionFilter, selectedCategoryFilter]);

  // Dynamic KPI aggregator
  const getKpiValue = (widget: Widget) => {
    const agg = widget.aggregation || 'sum';
    const values = filteredChartData.map(d => Number(d[widget.metric as keyof typeof d]) || 0);
    
    if (agg === 'sum') {
      return values.reduce((a, b) => a + b, 0);
    }
    if (agg === 'avg') {
      return values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0;
    }
    if (agg === 'min') {
      return values.length ? Math.min(...values) : 0;
    }
    if (agg === 'max') {
      return values.length ? Math.max(...values) : 0;
    }
    if (agg === 'count') {
      return values.length;
    }
    return 0;
  };

  // Mock export handler
  const triggerExport = (format: 'PDF' | 'PNG' | 'Excel' | 'Share') => {
    setExportNotification({ status: 'loading', message: `Initializing ${format} compilation & compiling schemas...` });
    
    setTimeout(() => {
      let completeMsg = '';
      if (format === 'PDF') completeMsg = `Dashboard "${dashboardName}" successfully compiled to PDF format.`;
      if (format === 'PNG') completeMsg = `Canvas viewport rendered as raw PNG. Check Downloads folder.`;
      if (format === 'Excel') completeMsg = `Exported ${filteredChartData.length} records to local Excel spreadsheet.`;
      if (format === 'Share') completeMsg = `Copied secure workspace link: http://metricsflow.io/share/x9F82a`;
      
      setExportNotification({ status: 'success', message: completeMsg });
      
      setTimeout(() => {
        setExportNotification({ status: 'idle', message: '' });
      }, 4000);
    }, 1800);
  };

  // Dynamic HSL Theme mappings for maximum aesthetic customization
  const themeStyles = useMemo(() => {
    if (activeTheme === 'light') {
      return {
        canvasBg: 'bg-neutral-50 text-neutral-900 border-neutral-250',
        cardBg: 'bg-white border-neutral-200 text-neutral-900 shadow-md',
        cardHeader: 'border-neutral-100',
        subText: 'text-neutral-500 font-semibold',
        headingText: 'text-neutral-900 font-extrabold',
        gridLine: '#e5e7eb',
        textColor: '#171717',
        borderAccent: 'border-neutral-200',
        tooltipStyle: { backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#171717', borderRadius: '6px' }
      };
    }
    if (activeTheme === 'corporate') {
      return {
        canvasBg: 'bg-slate-950 text-slate-50 border-slate-900',
        cardBg: 'bg-gradient-to-br from-slate-900/90 to-slate-950/60 border-slate-800 shadow-[0_4px_20px_rgba(59,130,246,0.06)]',
        cardHeader: 'border-slate-900/50',
        subText: 'text-slate-400 font-semibold',
        headingText: 'text-slate-100 font-extrabold',
        gridLine: '#1e293b',
        textColor: '#cbd5e1',
        borderAccent: 'border-slate-800',
        tooltipStyle: { backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9', borderRadius: '6px' }
      };
    }
    // Default Dark Mode
    return {
      canvasBg: 'bg-neutral-950 text-neutral-50 border-neutral-900',
      cardBg: 'bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 border-neutral-850 shadow-2xl',
      cardHeader: 'border-neutral-900/50',
      subText: 'text-neutral-450 font-semibold',
      headingText: 'text-white font-extrabold',
      gridLine: '#1f2937',
      textColor: '#d4d4d4',
      borderAccent: 'border-neutral-850',
      tooltipStyle: { backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '6px' }
    };
  }, [activeTheme]);

  // AI Generator Pipeline States
  const [generatorStage, setGeneratorStage] = useState<'idle' | 'analyzing' | 'schema' | 'recommend' | 'complete'>('idle');
  const [generatorProgress, setGeneratorProgress] = useState(0);

  // Copilot States
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: 'ai', text: "Welcome to Analytics Copilot! Type a request like *'Generate sales dashboard'* or *'Predict revenue'* to create instant dashboard workspaces.", time: '15:20' }
  ]);

  // Sync state helpers
  const saveToUndo = (currentWidgets: Widget[]) => {
    setUndoStack(prev => [...prev, currentWidgets]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, widgets]);
    setWidgets(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, widgets]);
    setWidgets(next);
  };

  // Add Widget
  const addWidget = (type: Widget['type']) => {
    saveToUndo(widgets);
    const newId = `w-${Date.now()}`;
    const titles: Record<string, string> = {
      kpi: 'New KPI Performance Metric',
      bar: 'Categorical Volume Distribution',
      pie: 'Segment Proportion Breakdown',
      line: 'Timeline Run-rate Trajectory',
      area: 'Cumulative sum Profile',
      table: 'Data Records Sheet',
      scatter: 'Outlier Scatter Variance',
      text: 'Custom Analyst Insights Block',
      filter: 'Interactive Global Filter'
    };
    const defaultY = activeDataset.columns.find(col => col.includes('Amount') || col.includes('Spend') || col.includes('Score') || col.includes('Size') || col.includes('ROI')) || activeDataset.columns[0];
    const defaultX = activeDataset.columns.find(col => col.includes('Category') || col.includes('Country') || col.includes('Region') || col.includes('Date') || col.includes('Platform')) || activeDataset.columns[1];

    const newWidget: Widget = {
      id: newId,
      type,
      title: titles[type] || 'Custom Widget Block',
      w: type === 'kpi' || type === 'filter' ? 'col-span-1' : type === 'line' || type === 'area' || type === 'table' ? 'col-span-3' : 'col-span-2',
      metric: defaultY,
      category: defaultX,
      color: PALETTES[widgets.length % PALETTES.length].primary,
      aggregation: 'sum'
    };

    setWidgets(prev => [...prev, newWidget]);
    setSelectedWidgetId(newId);
  };

  // Duplicate Widget
  const duplicateWidget = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const source = widgets.find(w => w.id === id);
    if (!source) return;
    saveToUndo(widgets);
    const newWidget: Widget = {
      ...source,
      id: `w-${Date.now()}`,
      title: `${source.title} (Copy)`
    };
    setWidgets(prev => [...prev, newWidget]);
  };

  // Delete Widget
  const deleteWidget = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveToUndo(widgets);
    setWidgets(prev => prev.filter(w => w.id !== id));
    if (selectedWidgetId === id) setSelectedWidgetId(null);
  };

  // Update Widget Setting
  const updateWidget = (updated: Widget) => {
    saveToUndo(widgets);
    setWidgets(prev => prev.map(w => w.id === updated.id ? updated : w));
  };

  // Auto-Save Workspace Configuration
  useEffect(() => {
    const key = 'metricsflow_workspace_widgets';
    localStorage.setItem(key, JSON.stringify(widgets));
  }, [widgets]);

  // AI Pipeline Runner
  const runAiGenerator = () => {
    setGeneratorStage('analyzing');
    setGeneratorProgress(15);
    
    const timers = [
      setTimeout(() => { setGeneratorProgress(45); setGeneratorStage('schema'); }, 1200),
      setTimeout(() => { setGeneratorProgress(75); setGeneratorStage('recommend'); }, 2400),
      setTimeout(() => { 
        setGeneratorProgress(100); 
        setGeneratorStage('complete');
        // Inject AI Dashboards
        setWidgets([
          { id: 'ai-1', type: 'kpi', title: 'Target Conversion Rate', w: 'col-span-1', metric: activeDataset.columns[0], category: '', color: '#10b981' },
          { id: 'ai-2', type: 'kpi', title: 'Average Performance Cap', w: 'col-span-1', metric: activeDataset.columns[1], category: '', color: '#3b82f6' },
          { id: 'ai-3', type: 'area', title: 'AI Predicted Variance Spread', w: 'col-span-2', metric: activeDataset.columns[0], category: activeDataset.columns[3] || activeDataset.columns[1], color: '#8b5cf6' },
          { id: 'ai-4', type: 'bar', title: 'AI Segment Share Allocation', w: 'col-span-1', metric: activeDataset.columns[1], category: activeDataset.columns[4] || activeDataset.columns[1], color: '#f59e0b' }
        ]);
      }, 3800)
    ];

    return () => timers.forEach(t => clearTimeout(t));
  };

  // Copilot Message Submissions
  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = { sender: 'user', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Answer mock OLS predictions
    setTimeout(() => {
      let aiText = "I have successfully compiled local regressions. Let's analyze.";
      let newWidgetType: Widget['type'] | null = null;
      let newWidgetTitle = "AI Insight Card";

      const query = chatInput.toLowerCase();
      if (query.includes('sales') || query.includes('dashboard') || query.includes('create')) {
        aiText = "Understood. Creating a dedicated Sales Performance Chart in the custom dashboard layout with high-fidelity aggregations...";
        newWidgetType = 'bar';
        newWidgetTitle = 'AI Analytics: sales by Segment';
      } else if (query.includes('predict') || query.includes('revenue') || query.includes('trend')) {
        aiText = "Solved Ordinary Least Squares trend parameters. Generating a temporal Line Chart to predict run-rates...";
        newWidgetType = 'line';
        newWidgetTitle = 'AI Prediction: Projected Trendline';
      } else if (query.includes('churn') || query.includes('risk') || query.includes('health')) {
        aiText = "Analyzed customer clusters using Gini Impurities. Rerouting standard deviation KPI card to workspace...";
        newWidgetType = 'kpi';
        newWidgetTitle = 'AI Health: Churn Threat Metrics';
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: aiText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      
      if (newWidgetType) {
        saveToUndo(widgets);
        const defaultY = activeDataset.columns.find(col => col.includes('Amount') || col.includes('Spend') || col.includes('Score') || col.includes('Size') || col.includes('ROI')) || activeDataset.columns[0];
        const defaultX = activeDataset.columns.find(col => col.includes('Category') || col.includes('Country') || col.includes('Region') || col.includes('Date')) || activeDataset.columns[1];
        setWidgets(prev => [
          ...prev,
          {
            id: `w-ai-${Date.now()}`,
            type: newWidgetType!,
            title: newWidgetTitle,
            w: newWidgetType === 'kpi' ? 'col-span-1' : 'col-span-2',
            metric: defaultY,
            category: defaultX,
            color: '#8b5cf6'
          }
        ]);
      }
    }, 1000);
  };

  return (
    <div className="bg-neutral-950 text-neutral-50 min-h-screen flex flex-col font-sans select-none antialiased">
      {/* 🚀 Segment Tabs Router Bar */}
      <div className="border-b border-neutral-900 bg-neutral-950/60 p-4 sticky top-0 z-30 backdrop-blur-md flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex items-center space-x-2 shrink-0">
          <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center shadow-[0_0_8px_rgba(37,99,235,0.4)]">
            <LayoutDashboard className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">Dashboard Workspace</span>
        </div>

        <div className="flex space-x-1.5 bg-neutral-900 p-1.5 rounded-xl border border-neutral-850 self-end sm:self-center">
          {[
            { id: 'home', label: 'Dashboard Home', icon: Grid },
            { id: 'builder', label: 'Custom Builder', icon: Sliders },
            { id: 'ai-generator', label: 'AI Auto Creator', icon: Sparkles },
            { id: 'copilot', label: 'Analytics Copilot', icon: Terminal }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveWorkspaceTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeWorkspaceTab === tab.id
                    ? 'bg-neutral-800 text-white shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 📂 SCREEN 1: DASHBOARD HOME (LANDING PAGE) */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeWorkspaceTab === 'home' && (
        <div className="p-8 max-w-6xl mx-auto w-full space-y-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Metrics Flow Workspace</h1>
              <p className="text-xs text-neutral-400">Select templates, manage team portfolios, or generate layout grids with AI.</p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2.5">
              <Button 
                onClick={() => { setActiveWorkspaceTab('builder'); addWidget('kpi'); }}
                className="bg-blue-600 text-white hover:bg-blue-500 text-xs font-semibold shadow-lg shadow-blue-600/10 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Dashboard
              </Button>
              <Button 
                onClick={() => setActiveWorkspaceTab('ai-generator')}
                className="bg-purple-600 text-white hover:bg-purple-500 text-xs font-semibold shadow-lg shadow-purple-600/10 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate AI Dashboard
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-neutral-900/40 border border-neutral-850 p-4 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dashboard templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-850 text-xs rounded-xl pl-10 pr-4 py-2.5 text-neutral-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-neutral-500"
              />
            </div>
            
            <div className="flex items-center space-x-3 shrink-0 self-end md:self-center">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold font-mono">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-neutral-950 border border-neutral-850 text-xs text-neutral-300 rounded-lg px-3 py-2 focus:outline-none cursor-pointer font-semibold"
              >
                <option value="recent">Recent Activity</option>
                <option value="name">Alphabetical (A-Z)</option>
                <option value="modified">Last Modified</option>
              </select>
            </div>
          </div>

          {/* Grid Layouts */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-900 pb-2 font-mono flex items-center">
              <Folder className="w-4 h-4 mr-2 text-blue-400" /> Active Workspace Dashboards
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resolvedDashboards.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())).map((db, idx) => (
                <Card 
                  key={db.id || idx}
                  onClick={() => db.raw ? loadDashboardFromDb(db.raw) : setActiveWorkspaceTab('builder')}
                  className="bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 border border-neutral-850 hover:border-neutral-800 transition-all duration-300 shadow-xl cursor-pointer group flex flex-col justify-between"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] bg-neutral-950 border border-neutral-850 px-2 py-0.5 rounded text-neutral-400 font-mono tracking-wider font-extrabold uppercase">
                        {db.type}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        {db.star && (
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        )}
                        {db.raw && (
                          <button
                            onClick={(e) => deleteDashboardFromDb(db.id, e)}
                            className="text-neutral-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                            title="Delete from Database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-md mt-4 group-hover:text-blue-400 transition-colors">{db.name}</CardTitle>
                    <CardDescription className="text-neutral-400 text-xs leading-relaxed mt-1.5">{db.desc}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0 pb-4 border-t border-neutral-900/50 mt-4 flex justify-between items-center text-[10px] text-neutral-500 font-mono">
                    <span>Modified recently</span>
                    <span className="flex items-center text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform">
                      Open in Builder <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 💻 SCREEN 2: CUSTOM DASHBOARD BUILDER */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeWorkspaceTab === 'builder' && (
        <div className="flex-1 flex overflow-hidden min-h-0 animate-fade-in">
          {/* LEFT SIDEBAR: COMPONENT PALETTE */}
          <div className="w-64 border-r border-neutral-900 bg-neutral-950/40 backdrop-blur-md flex flex-col overflow-y-auto px-4 py-6 shrink-0 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest font-mono">
                Dataset Metrics Source
              </span>
              <select
                value={selectedDatasetName}
                onChange={(e) => setSelectedDatasetName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-850 hover:border-neutral-805 text-neutral-300 text-xs rounded-lg px-2.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-mono font-semibold"
              >
                {availableDatasets.map(d => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Layout Components List */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-neutral-455 uppercase tracking-widest font-mono">
                Component Palette
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {[
                  { label: 'KPI Card', type: 'kpi', icon: Activity },
                  { label: 'Bar Chart', type: 'bar', icon: BarChart3 },
                  { label: 'Pie Chart', type: 'pie', icon: RechartsPieChart },
                  { label: 'Line Chart', type: 'line', icon: TrendingUp },
                  { label: 'Area Chart', type: 'area', icon: Layers },
                  { label: 'Data Table', type: 'table', icon: FileSpreadsheet },
                  { label: 'Scatter Graph', type: 'scatter', icon: Maximize2 },
                  { label: 'Text Insights', type: 'text', icon: FileText }
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      onClick={() => addWidget(item.type as any)}
                      className="flex flex-col items-center gap-1.5 bg-neutral-900 border border-neutral-850 hover:border-neutral-800 rounded-lg p-2.5 transition-colors cursor-pointer group hover:bg-neutral-850/30"
                    >
                      <Icon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-neutral-300">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dataset Fields Explorer */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-neutral-455 uppercase tracking-widest font-mono">
                Dimensions & Measures
              </span>
              
              <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-3 space-y-3 max-h-56 overflow-y-auto scrollbar-thin">
                <div className="space-y-1.5">
                  <div className="text-[9px] uppercase font-bold text-purple-400 font-mono tracking-wider">Dimensions (X-Axis)</div>
                  {activeDataset.columns.filter(col => col.includes('Category') || col.includes('Region') || col.includes('Country') || col.includes('Date') || col.includes('Platform') || col.includes('CardType')).map(col => (
                    <div key={col} className="text-[10px] bg-neutral-900 border border-neutral-850/60 px-2 py-1.5 rounded font-mono text-neutral-300 flex items-center gap-1.5 select-all">
                      <span className="text-[8px] bg-purple-500/10 text-purple-400 px-1 rounded font-black font-mono">A</span>
                      <span>{col}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-1.5">
                  <div className="text-[9px] uppercase font-bold text-emerald-400 font-mono tracking-wider">Measures (Y-Metric)</div>
                  {activeDataset.columns.filter(col => col.includes('Amount') || col.includes('Spend') || col.includes('Score') || col.includes('Size') || col.includes('ROI') || col.includes('Ratio') || col.includes('Index') || col.includes('UsersCount') || col.includes('Revenue')).map(col => (
                    <div key={col} className="text-[10px] bg-neutral-900 border border-neutral-850/60 px-2 py-1.5 rounded font-mono text-neutral-300 flex items-center gap-1.5 select-all">
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 rounded font-black font-mono">#</span>
                      <span>{col}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MAIN INTERACTIVE BUILDER CANVAS */}
          <div className={`flex-1 flex flex-col min-h-0 overflow-y-auto px-8 py-6 transition-colors duration-300 ${themeStyles.canvasBg}`}>
            {/* Top Editor Bar Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-900 pb-4 mb-6 gap-4">
              <div className="flex items-center space-x-3 min-w-0">
                <input 
                  type="text" 
                  value={dashboardName}
                  onChange={(e) => setDashboardName(e.target.value)}
                  className="bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-blue-500 focus:outline-none text-lg font-bold text-white tracking-tight truncate max-w-sm"
                />
              </div>

              {/* Undo/Redo & Utility Panel */}
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                <Button 
                  onClick={handleUndo} 
                  disabled={undoStack.length === 0} 
                  variant="outline" 
                  size="sm" 
                  className="bg-neutral-900 border-neutral-850 text-neutral-350 disabled:opacity-40"
                  title="Undo Changes"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  onClick={handleRedo} 
                  disabled={redoStack.length === 0} 
                  variant="outline" 
                  size="sm" 
                  className="bg-neutral-900 border-neutral-850 text-neutral-350 disabled:opacity-40"
                  title="Redo Changes"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </Button>

                <div className="h-6 w-[1px] bg-neutral-850 mx-1"></div>

                {/* Export dropdown */}
                <div className="relative group">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-neutral-900 border-neutral-850 text-xs font-semibold text-neutral-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" /> Export <ChevronRight className="w-3 h-3 rotate-90" />
                  </Button>
                  
                  <div className="absolute right-0 mt-1.5 w-44 bg-neutral-900 border border-neutral-800 rounded-xl p-1.5 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-45">
                    {[
                      { id: 'PDF', label: 'Export as PDF', format: 'PDF', icon: FileText },
                      { id: 'PNG', label: 'Export as PNG', format: 'PNG', icon: FileImage },
                      { id: 'Excel', label: 'Export as Excel Data', format: 'Excel', icon: FileSpreadsheet },
                      { id: 'Share', label: 'Copy Share Link', format: 'Share', icon: Share2 }
                    ].map(opt => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => triggerExport(opt.format as any)}
                          className="w-full flex items-center gap-2 text-left text-[11px] text-neutral-300 hover:text-white hover:bg-neutral-800 px-2.5 py-2 rounded-lg cursor-pointer transition-colors"
                        >
                          <Icon className="w-3.5 h-3.5 text-blue-400" />
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button 
                  onClick={saveDashboardToDb}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/10 cursor-pointer"
                >
                  Save Dashboard
                </Button>
              </div>
            </div>

            {/* Export Notification Toast */}
            {exportNotification.status !== 'idle' && (
              <div className="bg-neutral-900 border border-neutral-800 px-5 py-3.5 rounded-2xl mb-6 shadow-2xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center space-x-3">
                  {exportNotification.status === 'loading' ? (
                    <div className="w-4 h-4 rounded-full border-2 border-t-blue-500 border-neutral-800 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 animate-bounce">
                      <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
                    </div>
                  )}
                  <span className="text-xs text-neutral-300 font-semibold">{exportNotification.message}</span>
                </div>
                
                <button
                  onClick={() => setExportNotification({ status: 'idle', message: '' })}
                  className="text-neutral-500 hover:text-neutral-300 text-[10px] uppercase font-mono font-bold"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Canvas Multi-Tab controls */}
            <div className="flex space-x-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-850 max-w-xs mb-6 text-xs">
              {['Summary', 'Performance Analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveCanvasTab(tab as any)}
                  className={`flex-1 py-1.5 rounded-lg font-semibold tracking-wide transition-all cursor-pointer ${
                    activeCanvasTab === tab
                      ? 'bg-neutral-800 text-white shadow-md'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Global Cross-Filtering controls */}
            <div className="bg-neutral-900/60 border border-neutral-850 p-4 rounded-2xl mb-6 flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Sliders className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <span className="text-xs font-bold text-neutral-300">Global Cross-Filters:</span>
              </div>
              
              <div className="flex space-x-3 items-center">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider font-mono">Region:</span>
                <select
                  value={selectedRegionFilter}
                  onChange={(e) => setSelectedRegionFilter(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 text-xs text-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer font-semibold"
                >
                  {uniqueRegions.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 items-center">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider font-mono">Category:</span>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 text-xs text-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer font-semibold"
                >
                  {uniqueCategories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Clear filters trigger */}
              {(selectedRegionFilter !== 'All Regions' || selectedCategoryFilter !== 'All Categories') && (
                <button
                  onClick={() => { setSelectedRegionFilter('All Regions'); setSelectedCategoryFilter('All Categories'); }}
                  className="text-[10px] text-blue-450 hover:text-blue-300 font-bold font-mono underline cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* RENDER DYNAMIC CANVAS WIDGETS */}
            {widgets.length === 0 ? (
              <div className="border border-dashed border-neutral-850 rounded-2xl p-24 text-center text-neutral-400 flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto mt-12 bg-neutral-950/40">
                <LayoutDashboard className="w-10 h-10 text-neutral-600 animate-pulse" />
                <h4 className="text-md font-bold text-neutral-200">The Canvas is Empty</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">Drag or click on elements in the left Component Palette to add resizable KPI metrics and interactive charts to your workspace!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {widgets.map((widget) => {
                  const isSelected = selectedWidgetId === widget.id;
                  
                  return (
                    <Card
                      key={widget.id}
                      onClick={() => setSelectedWidgetId(widget.id)}
                      className={`backdrop-blur-sm border transition-all duration-300 relative group flex flex-col justify-between select-none ${
                        widget.w
                      } ${
                        isSelected 
                          ? 'border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.15)] bg-neutral-900/90' 
                          : `${themeStyles.cardBg}`
                      }`}
                    >
                      {/* Top Widget Edit Icons */}
                      <div className="absolute top-2.5 right-2.5 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button
                          onClick={(e) => duplicateWidget(widget.id, e)}
                          className="text-neutral-500 hover:text-neutral-300 transition-colors p-1 rounded hover:bg-neutral-800 cursor-pointer"
                          title="Duplicate Widget"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => deleteWidget(widget.id, e)}
                          className="text-neutral-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-neutral-800 cursor-pointer"
                          title="Delete Widget"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <CardHeader className={`pb-3 pt-4 px-5 border-b ${themeStyles.cardHeader}`}>
                        <div className="flex items-center space-x-1.5">
                          {widget.starred && (
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                          )}
                          <CardTitle className={`text-xs font-bold truncate max-w-[200px] ${themeStyles.headingText}`} title={widget.title}>
                            {widget.title}
                          </CardTitle>
                        </div>
                        <CardDescription className={`text-[9px] font-mono uppercase tracking-wider mt-0.5 ${themeStyles.subText}`}>
                          {widget.type} chart • Y-Metric: {widget.metric}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="px-5 pb-5 pt-3">
                        {/* KPI WIDGET */}
                        {widget.type === 'kpi' && (
                          <div className="py-2.5">
                            <h2 className={`text-2xl font-black leading-none tracking-tight ${themeStyles.headingText}`}>
                              {getKpiValue(widget).toLocaleString()}
                            </h2>
                            <p className={`text-[10px] mt-2 font-mono flex items-center gap-1 leading-normal ${themeStyles.subText}`}>
                              <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                              Real-time calculated {widget.aggregation || 'sum'} metric.
                            </p>
                          </div>
                        )}

                        {/* BAR CHART WIDGET */}
                        {widget.type === 'bar' && (
                          <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={filteredChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={themeStyles.gridLine} vertical={false} />
                                <XAxis dataKey={widget.category} stroke={activeTheme === 'light' ? '#737373' : '#a3a3a3'} fontSize={9} />
                                <YAxis stroke={activeTheme === 'light' ? '#737373' : '#a3a3a3'} fontSize={9} />
                                <RechartsTooltip contentStyle={themeStyles.tooltipStyle} />
                                <Bar dataKey={widget.metric} fill={widget.color} radius={[3, 3, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* PIE CHART WIDGET */}
                        {widget.type === 'pie' && (
                          <div className="h-44 w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={filteredChartData}
                                  dataKey={widget.metric}
                                  nameKey={widget.category}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={65}
                                  innerRadius={30}
                                  paddingAngle={2}
                                >
                                  {filteredChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PALETTES[index % PALETTES.length].primary} />
                                  ))}
                                </Pie>
                                <RechartsTooltip contentStyle={themeStyles.tooltipStyle} />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* LINE CHART WIDGET */}
                        {widget.type === 'line' && (
                          <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={filteredChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={themeStyles.gridLine} />
                                <XAxis dataKey={widget.category} stroke={activeTheme === 'light' ? '#737373' : '#a3a3a3'} fontSize={9} />
                                <YAxis stroke={activeTheme === 'light' ? '#737373' : '#a3a3a3'} fontSize={9} />
                                <RechartsTooltip contentStyle={themeStyles.tooltipStyle} />
                                <Line type="monotone" dataKey={widget.metric} stroke={widget.color} strokeWidth={2} dot={{ r: 3 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* AREA CHART WIDGET */}
                        {widget.type === 'area' && (
                          <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={filteredChartData}>
                                <defs>
                                  <linearGradient id={`areaGrad-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={widget.color} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={widget.color} stopOpacity={0.0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={themeStyles.gridLine} />
                                <XAxis dataKey={widget.category} stroke={activeTheme === 'light' ? '#737373' : '#a3a3a3'} fontSize={9} />
                                <YAxis stroke={activeTheme === 'light' ? '#737373' : '#a3a3a3'} fontSize={9} />
                                <RechartsTooltip contentStyle={themeStyles.tooltipStyle} />
                                <Area type="monotone" dataKey={widget.metric} stroke={widget.color} fillOpacity={1} fill={`url(#areaGrad-${widget.id})`} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* SCATTER CHART WIDGET */}
                        {widget.type === 'scatter' && (
                          <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <ScatterChart>
                                <CartesianGrid stroke={themeStyles.gridLine} />
                                <XAxis type="category" dataKey={widget.category} stroke={activeTheme === 'light' ? '#737373' : '#a3a3a3'} fontSize={9} />
                                <YAxis type="number" dataKey={widget.metric} stroke={activeTheme === 'light' ? '#737373' : '#a3a3a3'} fontSize={9} />
                                <RechartsTooltip contentStyle={themeStyles.tooltipStyle} />
                                <Scatter name={widget.metric} data={filteredChartData} fill={widget.color} />
                              </ScatterChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* TABLE SHEET WIDGET */}
                        {widget.type === 'table' && (
                          <div className="max-h-44 overflow-y-auto text-left text-[10px] font-mono scrollbar-thin">
                            <table className={`w-full border-collapse border ${themeStyles.borderAccent}`}>
                              <thead>
                                <tr className={`bg-neutral-950/20 border-b ${themeStyles.cardHeader}`}>
                                  <th className={`p-2 border-r font-bold ${themeStyles.borderAccent}`}>{widget.category || 'Category'}</th>
                                  <th className="p-2 font-bold">{widget.metric}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredChartData.map((row, idx) => (
                                  <tr key={idx} className={`border-b hover:bg-neutral-800/10 transition-colors ${themeStyles.cardHeader}`}>
                                    <td className={`p-2 border-r ${themeStyles.borderAccent}`}>{String((row as any)[widget.category] || 'N/A')}</td>
                                    <td className="p-2 font-semibold">{(row as any)[widget.metric]}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* TEXT BOX INSIGHT WIDGET */}
                        {widget.type === 'text' && (
                          <p className={`text-xs leading-relaxed text-left ${themeStyles.subText}`}>
                            <strong>Analyst Audit:</strong> The distribution of {widget.metric} by {widget.category || 'Dimensions'} shows consistent growth indices. Outliers have been safely trimmed, ensuring model stability.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: PROPERTIES EDITOR PANEL */}
          <div className="w-72 border-l border-neutral-900 bg-neutral-950/40 backdrop-blur-md flex flex-col overflow-y-auto px-5 py-6 shrink-0 space-y-6">
            <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest font-mono">
              Workspace Themes
            </span>

            {/* Global Theme select */}
            <div className="space-y-2">
              <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Canvas Workspace Theme</label>
              <div className="flex gap-2">
                {[
                  { id: 'dark', label: 'Dark Slate' },
                  { id: 'light', label: 'Light Clean' },
                  { id: 'corporate', label: 'Corporate Blue' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTheme(t.id as any)}
                    className={`flex-1 py-2 px-1.5 border rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      activeTheme === t.id
                        ? 'bg-blue-600 border-blue-505 text-white shadow-md'
                        : 'bg-neutral-900 border-neutral-850 text-neutral-450 hover:bg-neutral-850/50 hover:text-neutral-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[1px] bg-neutral-900 w-full" />

            <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest font-mono">
              Widget Properties
            </span>

            {selectedWidget ? (
              <div className="space-y-5">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Widget Label</label>
                  <input
                    type="text"
                    value={selectedWidget.title}
                    onChange={(e) => updateWidget({ ...selectedWidget, title: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Sizing class */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Widget Width Sizing</label>
                  <select
                    value={selectedWidget.w}
                    onChange={(e) => updateWidget({ ...selectedWidget, w: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-850 text-xs text-neutral-350 rounded-lg px-2.5 py-2 focus:outline-none cursor-pointer"
                  >
                    <option value="col-span-1">Narrow (1 Column)</option>
                    <option value="col-span-2">Medium (2 Columns)</option>
                    <option value="col-span-3">Full Width (3 Columns)</option>
                  </select>
                </div>

                {/* Chart type swapper */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Visual Chart Type</label>
                  <select
                    value={selectedWidget.type}
                    onChange={(e) => updateWidget({ ...selectedWidget, type: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-850 text-xs text-neutral-350 rounded-lg px-2.5 py-2 focus:outline-none cursor-pointer font-semibold"
                  >
                    <option value="kpi">KPI Card</option>
                    <option value="bar">Bar Chart</option>
                    <option value="pie">Pie Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="area">Area Chart</option>
                    <option value="table">Data Table</option>
                    <option value="scatter">Scatter Graph</option>
                    <option value="text">Text Insights</option>
                  </select>
                </div>

                {/* Metric select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Metric (Y-Axis)</label>
                  <select
                    value={selectedWidget.metric}
                    onChange={(e) => updateWidget({ ...selectedWidget, metric: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-850 text-xs text-neutral-350 rounded-lg px-2.5 py-2 focus:outline-none cursor-pointer font-mono"
                  >
                    {activeDataset.columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                {/* Category select */}
                {selectedWidget.type !== 'kpi' && selectedWidget.type !== 'text' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Dimension (X-Axis)</label>
                    <select
                      value={selectedWidget.category}
                      onChange={(e) => updateWidget({ ...selectedWidget, category: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-850 text-xs text-neutral-350 rounded-lg px-2.5 py-2 focus:outline-none cursor-pointer font-mono"
                    >
                      {activeDataset.columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Aggregation select */}
                {selectedWidget.type === 'kpi' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Aggregation Type</label>
                    <select
                      value={selectedWidget.aggregation || 'sum'}
                      onChange={(e) => updateWidget({ ...selectedWidget, aggregation: e.target.value as any })}
                      className="w-full bg-neutral-950 border border-neutral-850 text-xs text-neutral-350 rounded-lg px-2.5 py-2 focus:outline-none cursor-pointer font-semibold"
                    >
                      <option value="sum">Sum Total</option>
                      <option value="avg">Arithmetic Mean (Average)</option>
                      <option value="min">Minimum Value</option>
                      <option value="max">Maximum Value</option>
                      <option value="count">Count Records</option>
                    </select>
                  </div>
                )}

                {/* Theme Accents */}
                <div className="space-y-2">
                  <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Accent Theme Color</label>
                  <div className="grid grid-cols-5 gap-2 pt-1">
                    {PALETTES.map(p => (
                      <button
                        key={p.primary}
                        onClick={() => updateWidget({ ...selectedWidget, color: p.primary })}
                        className={`w-7 h-7 rounded-full border flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${
                          selectedWidget.color === p.primary ? 'border-white' : 'border-neutral-850'
                        }`}
                        style={{ backgroundColor: p.primary }}
                        title={p.name}
                      >
                        {selectedWidget.color === p.primary && (
                          <Check className="w-3.5 h-3.5 text-black stroke-[3.5]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Starred */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-900">
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Highlight (Star)</span>
                  <button
                    onClick={() => updateWidget({ ...selectedWidget, starred: !selectedWidget.starred })}
                    className="text-neutral-500 hover:text-amber-500 transition-colors p-1"
                  >
                    <Star className={`w-5 h-5 ${selectedWidget.starred ? 'text-amber-500 fill-amber-500' : ''}`} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-neutral-500 text-xs leading-relaxed max-w-[200px] mx-auto border border-dashed border-neutral-900 rounded-xl bg-neutral-950/20">
                <Info className="w-5 h-5 mx-auto mb-2 text-neutral-600" />
                Select any widget on the canvas to configure axes, metric parameters, and themes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* ✨ SCREEN 3: AI AUTO DASHBOARD SECTION */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeWorkspaceTab === 'ai-generator' && (
        <div className="p-8 max-w-4xl mx-auto w-full space-y-8 animate-fade-in">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" /> AI Auto-Dashboard Builder
            </h1>
            <p className="text-xs text-neutral-400 mt-1">Let our machine learning engine analyze dataset variables and format a premium dashboard grid automatically.</p>
          </div>

          <div className="bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 border border-neutral-850 p-8 rounded-2xl space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest font-mono">Select Dataset Target</label>
              <select
                value={selectedDatasetName}
                onChange={(e) => setSelectedDatasetName(e.target.value)}
                className="bg-neutral-950 border border-neutral-850 text-xs text-neutral-300 rounded-lg px-3 py-3 w-full focus:outline-none cursor-pointer font-mono font-bold"
              >
                {availableDatasets.map(d => (
                  <option key={d.name} value={d.name}>{d.name} ({d.rows} records • {d.columns.length} columns)</option>
                ))}
              </select>
            </div>

            {/* AI pipeline simulation stages */}
            {generatorStage !== 'idle' && (
              <div className="space-y-5 bg-neutral-950/50 p-6 rounded-xl border border-neutral-850/80 animate-fade-in">
                <div className="flex justify-between text-[10px] text-neutral-400 font-bold font-mono">
                  <span className="uppercase">AI Pipeline Running: {generatorStage}</span>
                  <span className="text-purple-400">{generatorProgress}%</span>
                </div>
                
                {/* Progress bar */}
                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-850">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500" 
                    style={{ width: `${generatorProgress}%` }}
                  />
                </div>

                {/* Text prompts */}
                <div className="text-[10px] text-purple-300 font-mono space-y-1">
                  {generatorStage === 'analyzing' && <p>• Invoking Pandas shape diagnostics on FastAPI engine...</p>}
                  {generatorStage === 'schema' && <p>• Found schema target. Parsing measures and dimensions...</p>}
                  {generatorStage === 'recommend' && <p>• Recommending optimal charts and laying out KPI grids...</p>}
                  {generatorStage === 'complete' && <p className="text-emerald-400 font-bold">✓ Generation successfully completed! Canvas loaded.</p>}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-900">
              <Button
                onClick={runAiGenerator}
                disabled={generatorStage === 'analyzing' || generatorStage === 'schema' || generatorStage === 'recommend'}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/10 cursor-pointer"
              >
                {generatorStage === 'idle' ? 'Generate Auto-Dashboard' : generatorStage === 'complete' ? 'Regenerate Dashboard' : 'Processing Layout...'}
              </Button>

              {generatorStage === 'complete' && (
                <Button
                  onClick={() => setActiveWorkspaceTab('builder')}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold"
                >
                  Edit Generated Layout
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 🧠 SCREEN 4: ANALYTICS COPILOT PANEL */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeWorkspaceTab === 'copilot' && (
        <div className="p-8 max-w-3xl mx-auto w-full flex flex-col h-[650px] animate-fade-in space-y-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Terminal className="w-6 h-6 text-indigo-400" /> AI Analytics Copilot
            </h1>
            <p className="text-xs text-neutral-400 mt-1">Interact with your database in plain English. Request charts, predict deal metrics, or automate dashboards.</p>
          </div>

          <div className="flex-1 bg-neutral-900/60 border border-neutral-850 rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-sm">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'self-end ml-auto items-end' : 'self-start mr-auto items-start'}`}
                >
                  <div className="flex items-center space-x-1.5 mb-1 text-[9px] text-neutral-500 font-mono">
                    <span className="font-bold uppercase tracking-wider">{msg.sender === 'ai' ? 'Copilot AI' : 'User'}</span>
                    <span>{msg.time}</span>
                  </div>
                  
                  <div 
                    className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white font-medium shadow-md rounded-tr-none'
                        : 'bg-neutral-950 border border-neutral-850 text-neutral-300 rounded-tl-none font-mono'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-neutral-850/80 bg-neutral-950/40 flex items-center gap-3">
              <input
                type="text"
                placeholder="Type 'Generate sales dashboard' or 'Predict revenue'..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                className="flex-1 bg-neutral-950 border border-neutral-850 text-xs rounded-xl px-4 py-3 text-neutral-200 focus:outline-none focus:border-indigo-500 placeholder-neutral-500 font-mono"
              />
              <Button
                onClick={sendChatMessage}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3.5 rounded-xl shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
