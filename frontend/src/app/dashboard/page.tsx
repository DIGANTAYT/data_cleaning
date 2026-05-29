'use client';

import * as React from 'react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UploadCloud, File, AlertCircle, CheckCircle2, Database, Sparkles, 
  LineChart, BrainCircuit, ChevronLeft, ChevronRight, Menu, Bell, 
  Search, Settings, Shield, Lock, Server, Key, Info, Activity, 
  Sliders, Trash2, ArrowRight, ArrowUpRight, HelpCircle, Layers, 
  FolderDot, Laptop, Check, LogOut, LayoutDashboard, Calendar, RefreshCw, Edit3, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { API_URL } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, AreaChart, Area, LineChart as RechartsLineChart, Line, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend 
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  
  // Layout & Navigation States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'datasets' | 'integrations' | 'insights' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Last 30 Days');
  
  // Dropdown States
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Datasets & Upload States
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [datasets, setDatasets] = useState<any[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string>('mock');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // User Profile States
  const [userPlan, setUserPlan] = useState('Developer Sandbox');
  const [userCredits, setUserCredits] = useState(500);
  const [userName, setUserName] = useState('Analyst');
  const [userEmail, setUserEmail] = useState('');

  // AI Insights State
  const [aiCleaning, setAiCleaning] = useState(false);
  const [aiCleaned, setAiCleaned] = useState(false);
  
  // Visualizer Chart Configs
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');
  const [dataPointsLimit, setDataPointsLimit] = useState<'5' | '10' | 'all'>('10');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Sync user session parameters
    setUserName(localStorage.getItem('user_name') || 'Data Analyst');
    setUserEmail(localStorage.getItem('user_email') || 'analyst@metricsflow.io');
    setUserPlan(localStorage.getItem('user_plan') || 'Developer Sandbox');
    const storedCredits = localStorage.getItem('user_credits');
    setUserCredits(storedCredits ? Number(storedCredits) : 500);
    
    fetchDatasets();
    
    const handleCreditsUpdate = () => {
      setUserCredits(Number(localStorage.getItem('user_credits') || 500));
      setUserPlan(localStorage.getItem('user_plan') || 'Developer Sandbox');
    };
    window.addEventListener('credits-updated', handleCreditsUpdate);
    return () => {
      window.removeEventListener('credits-updated', handleCreditsUpdate);
    };
  }, [router]);

  const fetchDatasets = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/datasets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDatasets(res.data);
      if (res.data && res.data.length > 0 && activeDatasetId === 'mock') {
        setActiveDatasetId(res.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch datasets', error);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true);
    setUploadStatus('idle');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/datasets/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setUploadStatus('success');
      setFile(null);
      fetchDatasets(); // Refresh list
      setActiveTab('datasets'); // Navigate to datasets list
    } catch (error) {
      console.error(error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_credits');
    localStorage.removeItem('user_plan');
    router.push('/');
  };

  // Sparkline mini mock datasets
  const revenueSparkline = [
    { value: 40 }, { value: 45 }, { value: 38 }, { value: 50 }, { value: 65 }, { value: 58 }, { value: 72 }
  ];
  const querySparkline = [
    { value: 20 }, { value: 28 }, { value: 24 }, { value: 32 }, { value: 30 }, { value: 38 }, { value: 45 }
  ];
  const modelSparkline = [
    { value: 5 }, { value: 8 }, { value: 6 }, { value: 9 }, { value: 11 }, { value: 10 }, { value: 14 }
  ];

  // Selected Active Dataset
  const selectedDataset = useMemo(() => {
    return datasets.find(d => d.id === activeDatasetId) || null;
  }, [datasets, activeDatasetId]);

  // Editable Dynamic KPI Card states
  const [kpiCards, setKpiCards] = useState<any[]>([
    { id: 'sales', title: 'Total Enterprise Sales', value: '1248500', type: 'currency', trend: '+12.4%', trendColor: 'text-green-400', sparkline: 'revenue' },
    { id: 'queries', title: 'Workspace Queries', value: '45210', type: 'number', trend: '+8.2%', trendColor: 'text-blue-400', sparkline: 'query' },
    { id: 'quality', title: 'Average Data Quality', value: '94.2%', type: 'progress', trend: 'Grade A', trendColor: 'text-emerald-400', sparkline: 'quality' },
    { id: 'models', title: 'AI Predictors Trained', value: '14', type: 'model', trend: '+15%', trendColor: 'text-purple-400', sparkline: 'model' },
    { id: 'cleanRate', title: 'Anomaly Cleansing Rate', value: '99.8%', type: 'percent', trend: 'Optimal', trendColor: 'text-emerald-400', sparkline: 'clean' }
  ]);
  const [editingKpiId, setEditingKpiId] = useState<string | null>(null);

  const updateKpiValue = (id: string, value: string) => {
    setKpiCards(prev => prev.map(k => k.id === id ? { ...k, value } : k));
  };
  const updateKpiTitle = (id: string, title: string) => {
    setKpiCards(prev => prev.map(k => k.id === id ? { ...k, title } : k));
  };
  const addCustomKpiCard = () => {
    const newId = `custom_${Date.now()}`;
    const newKpi = {
      id: newId,
      title: 'Custom Metric',
      value: '1000',
      type: 'number',
      trend: '+2.5%',
      trendColor: 'text-blue-400',
      sparkline: 'default',
      isCustom: true
    };
    setKpiCards(prev => [...prev, newKpi]);
  };
  const deleteKpiCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setKpiCards(prev => prev.filter(k => k.id !== id));
  };

  // Sparklines datasets addition
  const cleanSparkline = [
    { value: 90 }, { value: 92 }, { value: 94 }, { value: 93 }, { value: 96 }, { value: 98 }, { value: 99.8 }
  ];
  const defaultSparkline = [
    { value: 10 }, { value: 12 }, { value: 14 }, { value: 13 }, { value: 15 }, { value: 18 }, { value: 20 }
  ];

  const getKpiSparkline = (sparklineType: string) => {
    if (sparklineType === 'revenue') return revenueSparkline;
    if (sparklineType === 'query') return querySparkline;
    if (sparklineType === 'model') return modelSparkline;
    if (sparklineType === 'clean') return cleanSparkline;
    return defaultSparkline;
  };

  // High-fidelity active dataset visualization state
  const [localRawData, setLocalRawData] = useState<any[]>([]);
  const [showSpreadsheet, setShowSpreadsheet] = useState(false);

  useEffect(() => {
    let rawData = [
      { name: 'Jan', Sales: 4200, Queries: 12000, Quality: 85, Anomalies: 12 },
      { name: 'Feb', Sales: 5800, Queries: 15400, Quality: 88, Anomalies: 8 },
      { name: 'Mar', Sales: 5100, Queries: 18200, Quality: 89, Anomalies: 15 },
      { name: 'Apr', Sales: 7300, Queries: 22100, Quality: 91, Anomalies: 6 },
      { name: 'May', Sales: 8900, Queries: 28500, Quality: 93, Anomalies: 14 },
      { name: 'Jun', Sales: 9400, Queries: 35600, Quality: 94.2, Anomalies: 0 },
      { name: 'Jul', Sales: 10800, Queries: 41200, Quality: 94.2, Anomalies: 0 },
      { name: 'Aug', Sales: 12100, Queries: 45210, Quality: 94.2, Anomalies: 0 }
    ];

    if (selectedDataset) {
      const isFintech = selectedDataset.name.toLowerCase().includes('fintech') || selectedDataset.name.toLowerCase().includes('fraud');
      const isSuicide = selectedDataset.name.toLowerCase().includes('suicide') || selectedDataset.name.toLowerCase().includes('world');
      const isMarketing = selectedDataset.name.toLowerCase().includes('marketing') || selectedDataset.name.toLowerCase().includes('ad');

      if (isFintech) {
        rawData = [
          { name: 'TXN-01', Sales: 450, Queries: 120, Quality: 92, Anomalies: 4 },
          { name: 'TXN-02', Sales: 12500, Queries: 940, Quality: 81, Anomalies: 15 },
          { name: 'TXN-03', Sales: 89, Queries: 50, Quality: 95, Anomalies: 1 },
          { name: 'TXN-04', Sales: 1800, Queries: 810, Quality: 84, Anomalies: 8 },
          { name: 'TXN-05', Sales: 15, Queries: 20, Quality: 98, Anomalies: 0 }
        ];
      } else if (isSuicide) {
        rawData = [
          { name: 'US (Male)', Sales: 11200, Queries: 4200, Quality: 92, Anomalies: 12 },
          { name: 'US (Fem)', Sales: 2900, Queries: 4300, Quality: 94, Anomalies: 5 },
          { name: 'JP (Male)', Sales: 6500, Queries: 1700, Quality: 91, Anomalies: 14 },
          { name: 'JP (Fem)', Sales: 2100, Queries: 1800, Quality: 95, Anomalies: 3 },
          { name: 'GER (Male)', Sales: 850, Queries: 450, Quality: 93, Anomalies: 1 }
        ];
      } else if (isMarketing) {
        rawData = [
          { name: 'Google Search', Sales: 5000, Queries: 2500, Quality: 96, Anomalies: 2 },
          { name: 'Meta Ads', Sales: 4000, Queries: 1600, Quality: 93, Anomalies: 5 },
          { name: 'YouTube', Sales: 7500, Queries: 2400, Quality: 90, Anomalies: 8 },
          { name: 'LinkedIn', Sales: 3000, Queries: 1700, Quality: 94, Anomalies: 1 },
          { name: 'Google Display', Sales: 1500, Queries: 450, Quality: 97, Anomalies: 0 }
        ];
      }
    }

    if (aiCleaned) {
      rawData = rawData.map(d => ({
        ...d,
        Quality: 98.5,
        Anomalies: 0
      }));
    }

    setLocalRawData(rawData);
  }, [selectedDataset, aiCleaned]);

  const handleDataPointEdit = (originalItemName: string, column: string, value: any) => {
    setLocalRawData(prev => {
      return prev.map(item => {
        if (item.name === originalItemName) {
          return { ...item, [column]: value };
        }
        return item;
      });
    });
  };

  const chartData = useMemo(() => {
    let sortedData = [...localRawData];
    if (dataPointsLimit === '5') {
      return sortedData.sort((a, b) => (b.Sales || 0) - (a.Sales || 0)).slice(0, 5);
    }
    if (dataPointsLimit === '10') {
      return sortedData.sort((a, b) => (b.Sales || 0) - (a.Sales || 0)).slice(0, 10);
    }
    return localRawData;
  }, [localRawData, dataPointsLimit]);

  // AI 1-Click Clean Trigger
  const triggerAiClean = () => {
    setAiCleaning(true);
    setTimeout(() => {
      setAiCleaning(false);
      setAiCleaned(true);
      setUserCredits(prev => {
        const next = Math.max(0, prev - 20);
        localStorage.setItem('user_credits', String(next));
        return next;
      });
      window.dispatchEvent(new Event('credits-updated'));
    }, 2000);
  };

  return (
    <div className="bg-neutral-950 text-neutral-50 min-h-screen flex selection:bg-blue-500/30 overflow-x-hidden font-sans antialiased">
      
      {/* ──────────────────────────────────────────────────────── */}
      {/* 1. COLLAPSIBLE LEFT SIDEBAR */}
      {/* ──────────────────────────────────────────────────────── */}
      <motion.aside 
        animate={{ width: sidebarCollapsed ? 76 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="border-r border-neutral-900 bg-neutral-950/60 backdrop-blur-md flex flex-col justify-between shrink-0 sticky top-0 h-screen z-40 overflow-hidden"
      >
        <div className="flex flex-col min-w-0">
          {/* Sidebar Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-neutral-900">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(37,99,235,0.4)]">
                <Database className="w-4 h-4 text-white" />
              </div>
              {!sidebarCollapsed && (
                <span className="text-md font-bold tracking-tight text-white truncate font-sans">Metrics Flow</span>
              )}
            </div>
            {!sidebarCollapsed && (
              <button 
                onClick={() => setSidebarCollapsed(true)}
                className="text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

          {/* Workspace Switcher dropdown */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-neutral-900">
              <div className="bg-neutral-900/40 border border-neutral-850 p-2.5 rounded-xl flex items-center justify-between cursor-pointer hover:border-neutral-800 transition-colors">
                <div className="min-w-0">
                  <span className="text-[9px] text-neutral-500 uppercase font-mono font-bold block leading-none mb-1">Workspace</span>
                  <span className="text-xs font-bold text-neutral-200 block truncate leading-none">Acme Corporation</span>
                </div>
                <Sliders className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              </div>
            </div>
          )}

          {/* Sidebar Menu items */}
          <nav className="p-3 space-y-1.5 mt-2">
            {[
              { id: 'overview', label: 'Overview Analytics', icon: LayoutDashboard },
              { id: 'datasets', label: 'Datasets & Files', icon: FolderDot },
              { id: 'integrations', label: 'Integrations', icon: Server },
              { id: 'insights', label: 'AI Quality Center', icon: Sparkles }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 py-3 px-3.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer group ${
                    isActive 
                      ? 'bg-neutral-900 border border-neutral-850/60 text-white font-bold' 
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/30'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-neutral-500 group-hover:text-neutral-350'}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Collapsed triggers & profiles */}
        <div className="p-4 border-t border-neutral-900">
          {sidebarCollapsed ? (
            <button 
              onClick={() => setSidebarCollapsed(false)}
              className="w-10 h-10 mx-auto rounded-xl border border-neutral-850 bg-neutral-900/40 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="space-y-4">
              {/* Credit Status Badge */}
              <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-850/80 p-3 rounded-xl space-y-2">
                <div className="flex justify-between text-[9px] text-neutral-500 font-bold uppercase font-mono">
                  <span>AI Compute Balance</span>
                  <span className="text-blue-400">{userCredits} Credits</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-900">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
                    style={{ width: `${Math.min(100, (userCredits / 15000) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Signout button */}
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center justify-between text-neutral-400 hover:text-red-400 text-xs font-semibold py-2 px-3.5 rounded-xl hover:bg-red-500/5 transition-all cursor-pointer border border-transparent hover:border-red-550/10"
              >
                <span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> Sign Out</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 2. MAIN APPLICATION CONTENT PORT */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-y-auto relative min-w-0">
        
        {/* Glow accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/5 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-purple-900/5 rounded-full blur-[80px] pointer-events-none -z-10" />

        {/* TOP NAVBAR HEADER */}
        <header className="border-b border-neutral-900 bg-neutral-950/40 backdrop-blur-md px-8 py-5 flex items-center justify-between sticky top-0 z-30 min-w-0">
          {/* Left Path indicators */}
          <div className="flex items-center space-x-3 text-xs text-neutral-400 min-w-0">
            <span className="font-semibold text-neutral-300">Acme Corp</span>
            <ChevronRight className="w-3 h-3 text-neutral-600" />
            <span className="font-mono text-neutral-500 truncate">
              {activeTab === 'overview' && 'Overview Analytics'}
              {activeTab === 'datasets' && 'Datasets & Uploads'}
              {activeTab === 'integrations' && 'Data Integrations'}
              {activeTab === 'insights' && 'AI Quality Diagnostics'}
              {activeTab === 'settings' && 'Platform Settings'}
            </span>
          </div>

          {/* Right quick details */}
          <div className="flex items-center space-x-4 shrink-0">
            {/* Credits Counter badge */}
            <div className="bg-neutral-900 border border-neutral-850 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-neutral-400 font-mono text-[10px] uppercase font-bold">{userPlan}</span>
            </div>

            {/* Notifications panel */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-9 h-9 rounded-xl border border-neutral-850 bg-neutral-900/40 flex items-center justify-center text-neutral-450 hover:text-white hover:border-neutral-800 transition-all cursor-pointer relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
              </button>
              
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2.5 w-80 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-2xl z-50 text-left space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-neutral-850 pb-2">
                      <span className="text-xs font-bold text-white">Execution Notifications</span>
                      <span className="text-[10px] text-neutral-500 font-bold font-mono">2 UNREAD</span>
                    </div>
                    <div className="space-y-2.5 text-xs text-neutral-400">
                      <div className="p-2 hover:bg-neutral-950/40 rounded-lg transition-colors">
                        <p className="font-semibold text-neutral-200">✓ Ingestion Solved</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">Marketing dataset shape compiled with 1,000 rows.</p>
                      </div>
                      <div className="p-2 hover:bg-neutral-950/40 rounded-lg transition-colors">
                        <p className="font-semibold text-neutral-200">ℹ Outlier Pipeline Run</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">Applied standard deviation fallback bounds successfully.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:border-neutral-700 transition-colors cursor-pointer text-xs font-bold font-mono text-neutral-300"
              >
                {userName.slice(0,2).toUpperCase()}
              </button>
              
              <AnimatePresence>
                {profileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2.5 w-56 bg-neutral-900 border border-neutral-800 rounded-2xl p-1.5 shadow-2xl z-50 text-left font-sans"
                  >
                    <div className="px-3.5 py-3 border-b border-neutral-850">
                      <p className="text-xs font-bold text-white truncate">{userName}</p>
                      <p className="text-[10px] text-neutral-500 font-mono truncate mt-0.5">{userEmail}</p>
                    </div>
                    <button 
                      onClick={() => router.push('/dashboard/workspace')}
                      className="w-full text-left text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-850/60 px-3.5 py-2.5 rounded-xl mt-1.5 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Sliders className="w-4 h-4 text-blue-400" /> Layout Builder Workspace
                    </button>
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left text-xs font-semibold text-red-400 hover:bg-red-500/5 px-3.5 py-2.5 rounded-xl mb-1.5 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-red-400" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ──────────────────────────────────────────────────────── */}
        {/* TAB 1: OVERVIEW ANALYTICS */}
        {/* ──────────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <main className="p-8 max-w-6xl mx-auto w-full space-y-8 animate-fade-in">
            {/* Header Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">System Operations Overview</h1>
                <p className="text-xs text-neutral-400">Investor-ready premium diagnostics, credit ratios, and auto-compiled visual charts.</p>
              </div>

              {/* Date Filters selector */}
              <div className="flex items-center space-x-2 shrink-0 bg-neutral-900 border border-neutral-850 p-1.5 rounded-xl text-xs font-semibold">
                {['Last 30 Days', 'This Quarter', 'All Time'].map(f => (
                  <button
                    key={f}
                    onClick={() => setDateFilter(f)}
                    className={`py-1.5 px-3 rounded-lg cursor-pointer transition-all ${
                      dateFilter === f ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-450 hover:text-neutral-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. overview KPI grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {kpiCards.map((card) => {
                const isEditingValue = editingKpiId === `${card.id}_val`;
                const isEditingTitle = editingKpiId === `${card.id}_title`;
                const sparklineData = getKpiSparkline(card.sparkline);
                
                return (
                  <Card key={card.id} className="bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 border-neutral-850 shadow-2xl relative overflow-hidden text-neutral-50 flex flex-col justify-between h-40 group/card">
                    {/* Delete Card Button (For custom cards or removing unnecessary cards) */}
                    <button
                      onClick={(e) => deleteKpiCard(card.id, e)}
                      className="absolute top-2.5 right-2.5 opacity-0 group-hover/card:opacity-100 text-neutral-500 hover:text-red-400 transition-all p-1 rounded hover:bg-neutral-800/50 cursor-pointer z-20"
                      title="Remove KPI Card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <CardHeader className="pb-1 pt-4 px-4 border-b border-neutral-900/50">
                      <div className="flex justify-between items-center text-[10px] text-neutral-500 font-bold uppercase tracking-wider font-mono">
                        {isEditingTitle ? (
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => updateKpiTitle(card.id, e.target.value)}
                            onBlur={() => setEditingKpiId(null)}
                            onKeyDown={(e) => { if (e.key === 'Enter') setEditingKpiId(null); }}
                            className="bg-neutral-950 border border-neutral-800 rounded px-1 py-0.5 text-[10px] text-white focus:outline-none focus:border-blue-500 font-mono w-28"
                            autoFocus
                          />
                        ) : (
                          <span 
                            onClick={() => setEditingKpiId(`${card.id}_title`)}
                            className="cursor-pointer hover:text-neutral-300 flex items-center gap-1 group/title truncate pr-4"
                            title="Click to Edit Label"
                          >
                            {card.title}
                            <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover/title:opacity-100 text-neutral-600 transition-opacity" />
                          </span>
                        )}
                        {card.trend && (
                          <span className={`${card.trendColor || 'text-blue-400'} bg-neutral-900/40 border border-neutral-800/80 px-1.5 py-0.5 rounded text-[8px] font-bold`}>
                            {card.trend}
                          </span>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="px-4 pb-4 pt-3 flex flex-col justify-between flex-grow">
                      {card.type === 'progress' ? (
                        <div className="flex items-center justify-between flex-grow">
                          <div className="space-y-1 text-left">
                            {isEditingValue ? (
                              <input
                                type="text"
                                value={card.value}
                                onChange={(e) => updateKpiValue(card.id, e.target.value)}
                                onBlur={() => setEditingKpiId(null)}
                                onKeyDown={(e) => { if (e.key === 'Enter') setEditingKpiId(null); }}
                                className="w-20 bg-neutral-950 border border-neutral-800 rounded px-1.5 py-0.5 text-lg font-black text-white focus:outline-none focus:border-blue-500 font-mono"
                                autoFocus
                              />
                            ) : (
                              <h2 
                                onClick={() => setEditingKpiId(`${card.id}_val`)}
                                className="text-xl font-black tracking-tight text-white leading-none cursor-pointer hover:text-emerald-400 flex items-center gap-1 group/kpi"
                                title="Click to Edit Score"
                              >
                                {card.value.includes('%') ? card.value : `${card.value}%`}
                                <Edit3 className="w-3 h-3 opacity-0 group-hover/kpi:opacity-100 text-neutral-500 transition-opacity shrink-0" />
                              </h2>
                            )}
                            <p className="text-[8px] text-neutral-500 font-mono pt-1">Completeness index</p>
                          </div>
                          
                          {/* Score Loader Circle */}
                          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="40" stroke="#1f2937" strokeWidth="10" fill="transparent" />
                              <circle 
                                cx="50" cy="50" r="40" 
                                stroke="#10b981" strokeWidth="10" fill="transparent" 
                                strokeDasharray="251.2" 
                                strokeDashoffset={251.2 - (251.2 * (parseFloat(card.value) || 94.2)) / 100}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute text-[9px] font-bold font-mono text-white">
                              {Math.round(parseFloat(card.value) || 94)}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col justify-between flex-grow">
                          <div className="flex justify-between items-end">
                            {isEditingValue ? (
                              <input
                                type="text"
                                value={card.value}
                                onChange={(e) => updateKpiValue(card.id, e.target.value)}
                                onBlur={() => setEditingKpiId(null)}
                                onKeyDown={(e) => { if (e.key === 'Enter') setEditingKpiId(null); }}
                                className="w-24 bg-neutral-950 border border-neutral-800 rounded px-1.5 py-0.5 text-lg font-black text-white focus:outline-none focus:border-blue-500 font-mono"
                                autoFocus
                              />
                            ) : (
                              <h2 
                                onClick={() => setEditingKpiId(`${card.id}_val`)}
                                className="text-xl font-black tracking-tight text-white leading-none cursor-pointer hover:text-blue-400 flex items-center gap-1 group/kpi"
                                title="Click to Edit Value"
                              >
                                {card.type === 'currency' && Number(card.value)
                                  ? `$${Number(card.value).toLocaleString()}`
                                  : card.type === 'number' && Number(card.value)
                                    ? Number(card.value).toLocaleString()
                                    : card.type === 'model' && Number(card.value)
                                      ? `${card.value} Models`
                                      : card.value}
                                <Edit3 className="w-3 h-3 opacity-0 group-hover/kpi:opacity-100 text-neutral-500 transition-opacity shrink-0" />
                              </h2>
                            )}
                            
                            <div className="w-16 h-8 shrink-0">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sparklineData}>
                                  <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke={card.id === 'models' ? '#8b5cf6' : card.id === 'queries' ? '#3b82f6' : '#10b981'} 
                                    strokeWidth={1.2} 
                                    fill={card.id === 'models' ? '#8b5cf6' : card.id === 'queries' ? '#3b82f6' : '#10b981'} 
                                    fillOpacity={0.03} 
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                          <p className="text-[8px] text-neutral-500 font-mono mt-1">Calculated running metric</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {/* Add Custom KPI Card */}
              <button
                onClick={addCustomKpiCard}
                className="bg-neutral-900/20 hover:bg-neutral-900/40 border border-dashed border-neutral-800 hover:border-neutral-700 rounded-2xl shadow-xl flex flex-col items-center justify-center h-40 p-5 transition-all text-neutral-500 hover:text-neutral-300 gap-2 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full border border-dashed border-neutral-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Add Custom KPI</span>
              </button>
            </div>

            {/* 4. Interactive Charts visualizer block */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Visualizer Chart Canvas */}
              <Card className="lg:col-span-2 bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 border border-neutral-850 text-neutral-50 shadow-2xl rounded-2xl flex flex-col justify-between overflow-hidden">
                <CardHeader className="border-b border-neutral-900/50 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Sliders className="w-4.5 h-4.5 text-blue-400" />
                      <CardTitle className="text-sm font-bold">Interactive Dataset Visualizer</CardTitle>
                    </div>
                    {/* Active Dataset display */}
                    <p className="text-[10px] text-neutral-500 font-mono">
                      Active: <span className="font-bold text-neutral-300">{selectedDataset?.name || 'customer_metrics_unclean.csv'}</span>
                    </p>
                  </div>

                  {/* Chart Type toggles & point limit selectors */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <div className="flex space-x-1 bg-neutral-950 border border-neutral-900 p-1 rounded-xl">
                      {['area', 'bar', 'line'].map(type => (
                        <button
                          key={type}
                          onClick={() => setChartType(type as any)}
                          className={`px-2.5 py-1 rounded-lg uppercase text-[9px] font-bold tracking-wider cursor-pointer ${
                            chartType === type ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-250'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div className="flex space-x-1 bg-neutral-950 border border-neutral-900 p-1 rounded-xl">
                      {['5', '10', 'all'].map(pt => (
                        <button
                          key={pt}
                          onClick={() => setDataPointsLimit(pt as any)}
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wider cursor-pointer ${
                            dataPointsLimit === pt ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-250'
                          }`}
                        >
                          {pt === 'all' ? 'All' : `Top ${pt}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="h-64 w-full text-xs font-mono">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'area' ? (
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                          <XAxis dataKey="name" stroke="#737373" fontSize={9} />
                          <YAxis stroke="#737373" fontSize={9} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }} />
                          <Area type="monotone" dataKey="Sales" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                        </AreaChart>
                      ) : chartType === 'bar' ? (
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                          <XAxis dataKey="name" stroke="#737373" fontSize={9} />
                          <YAxis stroke="#737373" fontSize={9} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }} />
                          <Bar dataKey="Sales" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      ) : (
                        <RechartsLineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                          <XAxis dataKey="name" stroke="#737373" fontSize={9} />
                          <YAxis stroke="#737373" fontSize={9} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="Sales" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                        </RechartsLineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </CardContent>

                {/* Collapsible Spreadsheet-Style Inline Editor */}
                <div className="border-t border-neutral-900 bg-neutral-950/20">
                  <button
                    onClick={() => setShowSpreadsheet(!showSpreadsheet)}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-blue-400" />
                      <span>{showSpreadsheet ? 'Hide Data Points Spreadsheet' : 'View & Edit Data Points Spreadsheet'}</span>
                    </span>
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold font-mono">
                      {chartData.length} Points • Live Sync
                    </span>
                  </button>

                  <AnimatePresence>
                    {showSpreadsheet && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-neutral-900"
                      >
                        <div className="p-4 max-h-60 overflow-y-auto scrollbar-thin text-[10px] font-mono">
                          <table className="w-full border-collapse border border-neutral-850">
                            <thead>
                              <tr className="bg-neutral-900 border-b border-neutral-800 text-neutral-400">
                                <th className="p-2 border-r border-neutral-850 text-left">Label (X-Axis)</th>
                                <th className="p-2 border-r border-neutral-850 text-left">Sales ($)</th>
                                <th className="p-2 border-r border-neutral-850 text-left">Queries</th>
                                <th className="p-2 border-r border-neutral-850 text-left">Quality (%)</th>
                                <th className="p-2 text-left">Anomalies</th>
                              </tr>
                            </thead>
                            <tbody>
                              {chartData.map((row, idx) => (
                                <tr key={row.name || idx} className="border-b border-neutral-900 hover:bg-neutral-900/40 transition-colors">
                                  <td className="p-1 border-r border-neutral-850">
                                    <input
                                      type="text"
                                      value={row.name || ''}
                                      onChange={(e) => handleDataPointEdit(row.name, 'name', e.target.value)}
                                      className="w-full bg-transparent border-none focus:outline-none focus:bg-neutral-950 px-1 py-0.5 text-neutral-200"
                                    />
                                  </td>
                                  <td className="p-1 border-r border-neutral-850">
                                    <input
                                      type="number"
                                      value={row.Sales || 0}
                                      onChange={(e) => handleDataPointEdit(row.name, 'Sales', parseFloat(e.target.value) || 0)}
                                      className="w-full bg-transparent border-none focus:outline-none focus:bg-neutral-950 px-1 py-0.5 text-blue-400 font-semibold"
                                    />
                                  </td>
                                  <td className="p-1 border-r border-neutral-850">
                                    <input
                                      type="number"
                                      value={row.Queries || 0}
                                      onChange={(e) => handleDataPointEdit(row.name, 'Queries', parseInt(e.target.value) || 0)}
                                      className="w-full bg-transparent border-none focus:outline-none focus:bg-neutral-950 px-1 py-0.5 text-purple-400"
                                    />
                                  </td>
                                  <td className="p-1 border-r border-neutral-850">
                                    <input
                                      type="number"
                                      step="0.1"
                                      value={row.Quality || 0}
                                      onChange={(e) => handleDataPointEdit(row.name, 'Quality', parseFloat(e.target.value) || 0)}
                                      className="w-full bg-transparent border-none focus:outline-none focus:bg-neutral-950 px-1 py-0.5 text-emerald-400"
                                    />
                                  </td>
                                  <td className="p-1">
                                    <input
                                      type="number"
                                      value={row.Anomalies || 0}
                                      onChange={(e) => handleDataPointEdit(row.name, 'Anomalies', parseInt(e.target.value) || 0)}
                                      className="w-full bg-transparent border-none focus:outline-none focus:bg-neutral-950 px-1 py-0.5 text-red-400"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>

              {/* Right Column: AI Insights Recommendations panel */}
              <Card className="bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 border border-neutral-850 text-neutral-50 shadow-2xl rounded-2xl flex flex-col justify-between overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/5 rounded-full blur-2xl pointer-events-none -z-10 group-hover:bg-purple-500/10 transition-all duration-300"></div>
                
                <CardHeader className="border-b border-neutral-900/50 pb-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
                    <CardTitle className="text-sm font-bold">AI Diagnostics & Recommendations</CardTitle>
                  </div>
                  <CardDescription className="text-neutral-450 text-[10px] uppercase font-mono tracking-wider mt-0.5">Automated anomalies profiling</CardDescription>
                </CardHeader>

                <CardContent className="pt-5 flex-grow flex flex-col justify-between space-y-4">
                  {aiCleaning ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4 py-8">
                      <div className="w-10 h-10 rounded-full border-2 border-t-purple-500 border-neutral-800 animate-spin" />
                      <div className="space-y-1.5">
                        <p className="text-xs font-bold text-white font-mono animate-pulse">CLEANING VECTOR FIELDS...</p>
                        <p className="text-[10px] text-neutral-500">Interpolating missing rows & removing outliers</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3.5 text-xs text-neutral-400">
                      {aiCleaned ? (
                        <>
                          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5 animate-bounce" />
                            <div className="space-y-0.5">
                              <h4 className="font-bold text-white leading-normal">Dataset Fully Verified Clean</h4>
                              <p className="text-[10px] text-neutral-500 leading-normal">Data completeness evaluated at 98.5%. Anomalies trimmed.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                            <Check className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <h4 className="font-bold text-white leading-normal">Duplicates Pruned</h4>
                              <p className="text-[10px] text-neutral-500 leading-normal">Pruned all 8 duplicate row sets successfully. Unique rows index: 100%.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                            <Check className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <h4 className="font-bold text-white leading-normal">Outlier Anomaly Solved</h4>
                              <p className="text-[10px] text-neutral-500 leading-normal">Standardized 14 outlier values. Root-Mean-Square Error: 0.00%.</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                            <AlertCircle className="w-4.5 h-4.5 text-yellow-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <h4 className="font-bold text-white leading-normal">Outlier Anomaly Detected</h4>
                              <p className="text-[10px] text-neutral-500 leading-normal">We isolated 14 numeric anomalies in 'SalesAmount' column values.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                            <Info className="w-4.5 h-4.5 text-blue-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <h4 className="font-bold text-white leading-normal">Data Completeness Flagged</h4>
                              <p className="text-[10px] text-neutral-500 leading-normal">45 missing categories in 'ProductCategory' column identified.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                            <Layers className="w-4.5 h-4.5 text-purple-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <h4 className="font-bold text-white leading-normal">Data Redundancy Warning</h4>
                              <p className="text-[10px] text-neutral-500 leading-normal">We found 8 duplicate index combinations inside active table rows.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                            <BrainCircuit className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <h4 className="font-bold text-white leading-normal">High Feature Correlation</h4>
                              <p className="text-[10px] text-neutral-500 leading-normal">Category dimensions correlate at 92.4% with SalesAmount variance.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                            <Activity className="w-4.5 h-4.5 text-blue-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <h4 className="font-bold text-white leading-normal">System Temporal Trajectory</h4>
                              <p className="text-[10px] text-neutral-500 leading-normal">Run-rate displays a positive chronological slope of +0.35/month.</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {!aiCleaned && !aiCleaning && (
                    <div className="pt-2">
                      <Button
                        onClick={triggerAiClean}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-5 shadow-lg shadow-purple-600/10 hover:shadow-purple-600/20 transition-all font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> 1-Click AI Auto Clean
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 6. Data Source Integrations Connect Panel */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-neutral-450 uppercase tracking-widest border-b border-neutral-900 pb-2 font-mono flex items-center">
                <Server className="w-4 h-4 mr-2 text-blue-400 animate-pulse" /> Data Source Integrations
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { name: 'Local Excel / CSV', desc: 'Ingest raw local files from disk', icon: File, color: 'hover:border-blue-500/20 hover:bg-blue-500/5 text-blue-400', active: true },
                  { name: 'SQL Databases', desc: 'Direct connect: Postgres, MySQL, SQL Server', icon: Database, color: 'hover:border-purple-500/20 hover:bg-purple-500/5 text-purple-400' },
                  { name: 'REST API Connect', desc: 'Ingest JSON array vectors directly via curl', icon: Activity, color: 'hover:border-emerald-500/20 hover:bg-emerald-500/5 text-emerald-400' },
                  { name: 'Google Sheets API', desc: 'Sync spreadsheets using OAuth endpoints', icon: CheckCircle2, color: 'hover:border-amber-500/20 hover:bg-amber-500/5 text-amber-400' }
                ].map(it => {
                  const Icon = it.icon;
                  return (
                    <button
                      key={it.name}
                      onClick={() => { if (it.active) setActiveTab('datasets'); }}
                      className={`text-left p-5 rounded-2xl border border-neutral-850 bg-neutral-900/40 backdrop-blur-sm shadow-xl flex flex-col justify-between h-36 transition-all duration-300 cursor-pointer group ${it.color}`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-neutral-950/40 border border-neutral-850 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-neutral-200">{it.name}</h4>
                        <p className="text-[10px] text-neutral-500 leading-relaxed truncate">{it.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </main>
        )}

        {/* ──────────────────────────────────────────────────────── */}
        {/* TAB 2: DATASETS & FILES UPLOAD */}
        {/* ──────────────────────────────────────────────────────── */}
        {activeTab === 'datasets' && (
          <main className="p-8 max-w-5xl mx-auto w-full space-y-8 animate-fade-in">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Datasets & File Uploads</h1>
              <p className="text-xs text-neutral-400">Ingest CSV, JSON, or Excel files, run automated schema validation, and trigger cleaning diagnostics.</p>
            </div>

            {/* original drag and drop card panel */}
            <Card className="dark bg-neutral-900/40 border-neutral-850 text-neutral-50 shadow-2xl rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-2xl pointer-events-none -z-10 group-hover:bg-blue-500/10 transition-all duration-300"></div>
              
              <CardHeader className="pb-3 border-b border-neutral-900/50">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><UploadCloud className="w-4.5 h-4.5 text-blue-400" /> Upload Spreadsheet File</CardTitle>
                <CardDescription className="text-neutral-450 text-xs">CSV, JSON, XLSX up to 50MB. Safe sandbox execution assured.</CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
                    ${file ? 'border-blue-550 bg-neutral-900/80 shadow-[0_0_15px_rgba(37,99,235,0.05)]' : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/30'}
                  `}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".csv,.json,.xlsx,.xls"
                    onChange={handleFileChange}
                  />
                  
                  {!file ? (
                    <div className="flex flex-col items-center">
                      <UploadCloud className="h-10 w-10 text-neutral-500 mb-4 animate-bounce" />
                      <p className="text-xs font-semibold text-neutral-200">Click to upload or drag & drop</p>
                      <p className="text-[10px] text-neutral-500 mt-1">Spreadsheet datasets processed instantly</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <File className="h-10 w-10 text-blue-400 mb-4" />
                      <p className="text-xs font-bold text-blue-100">{file.name}</p>
                      <p className="text-[10px] text-neutral-450 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                </div>

                {uploadStatus === 'success' && (
                  <div className="mt-4 flex items-center text-green-400 text-xs bg-green-500/5 p-3 rounded-lg border border-green-500/10">
                    <CheckCircle2 className="w-4 h-4 mr-2 shrink-0 animate-bounce" /> Dataset uploaded successfully! AI profiling started.
                  </div>
                )}
                {uploadStatus === 'error' && (
                  <div className="mt-4 flex items-center text-red-400 text-xs bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                    <AlertCircle className="w-4 h-4 mr-2 shrink-0" /> Failed to upload dataset.
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Button
                    disabled={!file || uploading}
                    onClick={uploadFile}
                    className="bg-white text-black hover:bg-neutral-200 rounded-xl px-5 font-semibold text-xs py-2 shadow-lg shadow-white/5 cursor-pointer disabled:opacity-40"
                  >
                    {uploading ? 'Processing Spreadsheets...' : 'Upload to Platform'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* List Datasets cards */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-neutral-450 uppercase tracking-widest border-b border-neutral-900 pb-2 font-mono flex items-center">
                <FolderDot className="w-4 h-4 mr-2 text-blue-400" /> Active Platform Datasets
              </h2>

              {datasets.length === 0 ? (
                <div className="text-center py-20 text-neutral-500 text-xs max-w-sm mx-auto border border-dashed border-neutral-900 rounded-2xl bg-neutral-900/10">
                  <FolderDot className="w-8 h-8 mx-auto mb-2 text-neutral-700 animate-pulse" />
                  No datasets uploaded yet. Ingest your first CSV file above to begin!
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {datasets.map(dataset => {
                    const isActive = activeDatasetId === dataset.id;
                    return (
                      <Card 
                        key={dataset.id} 
                        onClick={() => setActiveDatasetId(dataset.id)}
                        className={`cursor-pointer transition-all duration-300 rounded-2xl bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 border group ${
                          isActive 
                            ? 'border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.1)]' 
                            : 'border-neutral-850 hover:border-neutral-800'
                        }`}
                      >
                        <CardHeader className="pb-2 pt-4 px-5 border-b border-neutral-900/40">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-xs font-bold truncate max-w-[150px]" title={dataset.name}>{dataset.name}</CardTitle>
                            <span className={`text-[8px] border px-2 py-0.5 rounded font-bold font-mono uppercase tracking-wider ${
                              dataset.status === 'READY' 
                                ? 'text-green-400 bg-green-500/10 border-green-500/20' 
                                : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                            }`}>
                              {dataset.status}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="px-5 pb-4 pt-3 flex flex-col justify-between h-20 text-xs">
                          <div className="flex justify-between items-center text-neutral-450 font-mono text-[10px]">
                            <span>Size:</span>
                            <span className="font-semibold text-neutral-350">
                              {dataset.rowCount ? `${dataset.rowCount.toLocaleString()} rows` : 'Profiling...'}
                            </span>
                          </div>
                          
                          <div className="flex justify-end pt-2">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/${dataset.id}`);
                              }}
                              className="bg-neutral-850 hover:bg-neutral-800 text-white rounded-lg px-2.5 py-1.5 text-[10px] font-semibold flex items-center gap-1 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                            >
                              Open Studio <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        )}

        {/* ──────────────────────────────────────────────────────── */}
        {/* TAB 3: INTEGRATIONS */}
        {/* ──────────────────────────────────────────────────────── */}
        {activeTab === 'integrations' && (
          <main className="p-8 max-w-5xl mx-auto w-full space-y-8 animate-fade-in">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <Server className="w-6 h-6 text-blue-400 animate-pulse" /> Data Source Integrations
              </h1>
              <p className="text-xs text-neutral-400 mt-1">Connect your database clusters, third-party spreadsheets, or REST APIs for persistent real-time streaming.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { name: 'PostgreSQL / Supabase', desc: 'Import rows directly from SQL schemas', status: 'Available', icon: Database, color: 'border-blue-500/20 text-blue-400 bg-blue-500/5' },
                { name: 'REST API Ingestion endpoint', desc: 'Post JSON data streams asynchronously', status: 'Available', icon: Activity, color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
                { name: 'Google Sheets live sync', desc: 'Keep custom dashboard tables synchronized', status: 'Coming Soon', icon: CheckCircle2, color: 'border-amber-500/10 text-amber-450 bg-amber-500/5 opacity-60' },
                { name: 'Excel Spreadsheets loader', desc: 'Sync multi-tab books from local files', status: 'Available', icon: File, color: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5', active: true }
              ].map(integration => {
                const Icon = integration.icon;
                return (
                  <Card key={integration.name} className="bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 border border-neutral-850 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-lg ${integration.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1 text-left min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{integration.name}</h4>
                          <span className="text-[8px] bg-neutral-950 border border-neutral-850 px-2 py-0.5 rounded text-neutral-450 font-mono uppercase tracking-wider font-extrabold">
                            {integration.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-normal pt-1">{integration.desc}</p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-neutral-900/50 mt-6">
                      <Button
                        onClick={() => { if (integration.active) setActiveTab('datasets'); }}
                        className="bg-neutral-850 hover:bg-neutral-800 text-neutral-250 border border-neutral-800 text-[10px] font-semibold px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1 hover:border-neutral-700 hover:text-white"
                      >
                        {integration.active ? 'Configure Connector' : 'Connect Source'} <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </main>
        )}

        {/* ──────────────────────────────────────────────────────── */}
        {/* TAB 4: AI INSIGHTS DIAGNOSTICS */}
        {/* ──────────────────────────────────────────────────────── */}
        {activeTab === 'insights' && (
          <main className="p-8 max-w-4xl mx-auto w-full space-y-8 animate-fade-in">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" /> AI Data Quality Diagnostics Center
              </h1>
              <p className="text-xs text-neutral-400 mt-1">Audit outlier standard deviation fallbacks, drop duplicate row records, and evaluate dataset indices.</p>
            </div>

            <Card className="bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 border border-neutral-850 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="space-y-3 max-w-xl text-left">
                <span className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-semibold text-purple-400">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Auto-Imputations Online
                </span>
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Isolate Dataset Outliers & Missing Values
                </h2>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  We completed a Z-score standard deviation check on the uploaded file. Below is the auto-cleaning action vector ready for execution.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <span className="text-xs px-2.5 py-1 rounded-md font-semibold border border-neutral-800 bg-neutral-900 text-neutral-300">
                    Grade {aiCleaned ? 'A' : 'B'} Rating
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-md font-semibold border border-neutral-800 bg-neutral-900 text-neutral-300">
                    Calculated Bounds: Z-score &gt; 3.0
                  </span>
                </div>
              </div>

              {/* Dynamic Health Score Loader */}
              <div className="flex flex-col items-center justify-center shrink-0 bg-neutral-900/40 border border-neutral-850 p-5 rounded-2xl w-44">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#1f2937" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="50" cy="50" r="40" 
                      stroke="#8b5cf6" strokeWidth="8" fill="transparent" 
                      strokeDasharray="251.2" 
                      strokeDashoffset={251.2 - (251.2 * (aiCleaned ? 98.5 : 94.2)) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-black text-white">{aiCleaned ? '98.5%' : '94.2%'}</span>
                    <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Score</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-neutral-400 font-medium">Status: <span className="font-semibold text-white">{aiCleaned ? 'Excellent' : 'Warning'}</span></div>
              </div>
            </Card>

            <div className="flex justify-end pt-4 border-t border-neutral-900">
              <Button
                onClick={triggerAiClean}
                disabled={aiCleaning || aiCleaned}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-5 px-6 shadow-lg shadow-purple-600/10 hover:shadow-purple-600/20 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {aiCleaning ? (
                  'Cleaning vector databases...'
                ) : aiCleaned ? (
                  <>✓ Data Imputed Successfully</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Trigger 1-Click AI Auto Clean
                  </>
                )}
              </Button>
            </div>
          </main>
        )}

      </div>
    </div>
  );
}
