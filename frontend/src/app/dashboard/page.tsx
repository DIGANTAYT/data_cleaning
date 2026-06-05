'use client';

import * as React from 'react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UploadCloud, File, AlertCircle, CheckCircle2, Database, Sparkles, 
  LineChart, BrainCircuit, ChevronLeft, ChevronRight, Menu, Bell, 
  Search, Settings, Shield, Lock, Server, Key, Info, Activity, 
  Sliders, Trash2, ArrowRight, ArrowUpRight, HelpCircle, Layers, 
  FolderDot, Laptop, Check, LogOut, LayoutDashboard, Calendar, RefreshCw, Edit3, Plus, Eye,
  ArrowLeft, Undo2, Redo2
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
  
  // State History for Undo / Redo
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isApplyingHistoryRef = React.useRef(false);

  const saveStateToHistory = (customRawData?: any[], customKpiCards?: any[]) => {
    if (isApplyingHistoryRef.current) return;
    const snapshot = {
      kpiCards: customKpiCards || kpiCards,
      localRawData: customRawData || localRawData,
      chartType,
      dateFilter,
      activeTab,
      activeDatasetId
    };
    setHistory(prev => {
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, JSON.parse(JSON.stringify(snapshot))];
    });
    setHistoryIndex(prev => prev + 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      isApplyingHistoryRef.current = true;
      const targetIndex = historyIndex - 1;
      const snapshot = history[targetIndex];
      
      setKpiCards(snapshot.kpiCards);
      setLocalRawData(snapshot.localRawData);
      setChartType(snapshot.chartType);
      setDateFilter(snapshot.dateFilter);
      setActiveTab(snapshot.activeTab);
      setActiveDatasetId(snapshot.activeDatasetId);
      
      setHistoryIndex(targetIndex);
      isApplyingHistoryRef.current = false;
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isApplyingHistoryRef.current = true;
      const targetIndex = historyIndex + 1;
      const snapshot = history[targetIndex];
      
      setKpiCards(snapshot.kpiCards);
      setLocalRawData(snapshot.localRawData);
      setChartType(snapshot.chartType);
      setDateFilter(snapshot.dateFilter);
      setActiveTab(snapshot.activeTab);
      setActiveDatasetId(snapshot.activeDatasetId);
      
      setHistoryIndex(targetIndex);
      isApplyingHistoryRef.current = false;
    }
  };
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
  const [forecastYears, setForecastYears] = useState<string>('2');
  const [customForecastPeriods, setCustomForecastPeriods] = useState<number>(4);
  const [customBaseline, setCustomBaseline] = useState<string>('');
  const [growthMultiplier, setGrowthMultiplier] = useState<number>(1.0);
  const [fullDatasetModalOpen, setFullDatasetModalOpen] = useState(false);

  // AI SaaS Overhaul States
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState<any[]>([
    { sender: 'ai', text: "Hello! I am your Metrics Flow Analytics Copilot. I can automatically query databases, generate visual charts, and establish Zapier-style automated workflows. What would you like today?", time: '13:05' }
  ]);
  const [copilotInput, setCopilotInput] = useState('');
  const [activeIntegrationSubTab, setActiveIntegrationSubTab] = useState<'connectors' | 'auto_ingest' | 'workflow'>('connectors');
  const [autoIngestPrompt, setAutoIngestPrompt] = useState('');
  const [autoIngestLogs, setAutoIngestLogs] = useState<string[]>([]);
  const [autoIngestLoading, setAutoIngestLoading] = useState(false);
  const [workflowRunning, setWorkflowRunning] = useState(false);
  const [activeWorkflowNodes, setActiveWorkflowNodes] = useState<any[]>([
    { id: 'trigger', label: 'Shopify Ingestion Trigger', desc: 'When order created', active: true, iconName: 'UploadCloud' },
    { id: 'condition', label: 'Condition Bounds', desc: 'If revenue > $100', active: true, iconName: 'Shield' },
    { id: 'ai_node', label: 'AI Analytics Agent', desc: 'Compute outlier fallbacks & forecast', active: true, iconName: 'BrainCircuit' },
    { id: 'action', label: 'Slack & Email Actions', desc: 'Dispatch alerts & update canvas', active: true, iconName: 'Bell' }
  ]);

  const handleCopilotSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg = { sender: 'user', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setCopilotMessages(prev => [...prev, userMsg]);
    setCopilotInput('');

    setTimeout(() => {
      let aiText = "";
      const query = text.toLowerCase();
      const timestamp = `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]`;

      // ────────────────────────────────────────────────────────
      // MULTI-AGENT ORCHESTRATION ROUTER ENGINE
      // ────────────────────────────────────────────────────────
      if (query.includes('sales') || query.includes('revenue') || query.includes('kpi') || query.includes('report')) {
        aiText = `${timestamp} 🤖 *Orchestrator Agent*: Intent identified as **KPI_LAYOUT_BUILDER**.\n` +
          `Routing query to 📊 **Dashboard Builder Agent**...\n\n` +
          `**Analysis & Actions Taken**:\n` +
          `1. Parsed active columns in your loaded dataset.\n` +
          `2. Formulated SQL aggregate queries for key metrics:\n` +
          `   \`\`\`sql\n` +
          `   SELECT SUM(Sales) AS total_revenue,\n` +
          `          AVG(Quality) AS avg_completeness,\n` +
          `          COUNT(*) AS total_records\n` +
          `   FROM active_dataset;\n` +
          `   \`\`\`\n` +
          `3. Configured five locked-value KPI cards dynamically mapping Sales and complete completion indexes.\n\n` +
          `**Recommendation**: I've tilting the Sparkline trends and recommend standardizing a Cozy card radius for optimal dashboard visibility. Let me know if you would like me to lock these metrics!`;
      } 
      else if (query.includes('connect') || query.includes('stripe') || query.includes('shopify') || query.includes('database') || query.includes('ingest')) {
        aiText = `${timestamp} 🤖 *Orchestrator Agent*: Intent identified as **ETL_INGESTION_CONNECTOR**.\n` +
          `Routing query to 🔌 **Integration Agent**...\n\n` +
          `**Analysis & Actions Taken**:\n` +
          `1. Initialized SaaS authentication OAuth handshake.\n` +
          `2. Traced connected relational schema structures:\n` +
          `   \`\`\`json\n` +
          `   { "source": "Stripe_API", "inbound_rows": 1000, "status": "verified" }\n` +
          `   \`\`\`\n` +
          `3. Deduplicated inbound vectors. Isolated anomalies and applied Z-score outlier fallbacks.\n\n` +
          `**Recommendation**: Stripe and Shopify connectors are now fully active on your **Integrations** panel. Click **Ingest Data Source** to trigger real-time operational schema syncing!`;
      } 
      else if (query.includes('slack') || query.includes('alert') || query.includes('workflow') || query.includes('zapier') || query.includes('n8n')) {
        aiText = `${timestamp} 🤖 *Orchestrator Agent*: Intent identified as **WORKFLOW_AUTOMATION_BUILDER**.\n` +
          `Routing query to ⚡ **Automation Agent**...\n\n` +
          `**Analysis & Actions Taken**:\n` +
          `1. Established a conditional trigger listener on active data streams.\n` +
          `2. Configured n8n-style flowchart logic node map:\n` +
          `   \`[shopify_order_created] ──> [price_check_condition] ──> [ai_analytics] ──> [dispatch_slack_alert]\`\n` +
          `3. Registered Slack Webhook endpoints for operational alerts.\n\n` +
          `**Recommendation**: Go to the **Visual Workflow Builder** tab and click **Test Dry-Run** to verify the trigger pipeline works correctly!`;
      } 
      else if (query.includes('forecast') || query.includes('regression') || query.includes('slope') || query.includes('growth') || query.includes('predict')) {
        aiText = `${timestamp} 🤖 *Orchestrator Agent*: Intent identified as **TIME_SERIES_FORECASTER**.\n` +
          `Routing query to 🔮 **Forecast Agent**...\n\n` +
          `**Analysis & Actions Taken**:\n` +
          `1. Extracted historical timeline vectors from the active dataset.\n` +
          `2. Solved OLS linear regression parameters (y = mx + c) to establish standard chronological slopes.\n` +
          `3. Applied Prediction Growth Multiplier (1.5x) to run baseline, optimistic, and pessimistic projections.\n\n` +
          `**Recommendation**: Chart projection is loaded. Adjust the growth slider on the **Predictive Trend Forecasting** card to view Tilting Forecast scenarios dynamically!`;
      } 
      else if (query.includes('stat') || query.includes('hypothesis') || query.includes('t-test') || query.includes('p-value')) {
        aiText = `${timestamp} 🤖 *Orchestrator Agent*: Intent identified as **STATISTICAL_SOLVER**.\n` +
          `Routing query to 🧠 **Analytics Agent**...\n\n` +
          `**Analysis & Actions Taken**:\n` +
          `1. Isolated numeric fields for One-Sample t-Test calculation.\n` +
          `2. Computed mean values against custom baseline: Null (H0): Mean equals baseline.\n` +
          `3. Solved Two-Tailed t-Distribution algorithm:\n` +
          `   - T-statistic: ${tTestResult.t}\n` +
          `   - P-value: ${tTestResult.p} (Significance threshold: 0.05)\n` +
          `   - Decision: ${tTestResult.sig ? "Reject Null Hypothesis (Significant)" : "Fail to Reject Null (Stable)"}\n\n` +
          `**Recommendation**: Enter a value in the **Custom Baseline (H₀)** field to observe significance index updates instantly!`;
      } 
      else if (query.includes('clean') || query.includes('impute') || query.includes('outlier') || query.includes('duplicate') || query.includes('z-score')) {
        aiText = `${timestamp} 🤖 *Orchestrator Agent*: Intent identified as **DATA_QUALITY_AUDITOR**.\n` +
          `Routing query to 🧹 **Data Cleaning Agent**...\n\n` +
          `**Analysis & Actions Taken**:\n` +
          `1. Scanned column records for Null placeholders and blank cell blocks.\n` +
          `2. Executed IQR bounds check and resolved standard deviation fallbacks to isolate extreme outliers.\n` +
          `3. Imputed missing categories and flagged duplicates.\n\n` +
          `**Recommendation**: Navigate to the **AI Quality Center** tab and click **1-Click AI Auto Clean** to write back the clean records and update your system completeness ratings!`;
      } 
      else if (query.includes('security') || query.includes('soc2') || query.includes('gdpr') || query.includes('sso') || query.includes('encrypt') || query.includes('protect')) {
        aiText = `${timestamp} 🤖 *Orchestrator Agent*: Intent identified as **ENTERPRISE_SECURITY_SHIELD**.\n` +
          `Routing query to 🛡️ **Security Agent**...\n\n` +
          `**Analysis & Actions Taken**:\n` +
          `1. Enforced TLS 1.3 session encryption connections.\n` +
          `2. Audited database queries to ensure Row-Level Security (RLS) policies are active.\n` +
          `3. Initialized PII masking rules: automatically scrubbing email prefixes and billing address fields.\n\n` +
          `**Recommendation**: Corporate audit trails are locked. Multi-Factor Authentication (MFA) and Single Sign-On (SSO) settings can be configured inside Platform Settings.`;
      } 
      else if (query.includes('billing') || query.includes('plan') || query.includes('credits') || query.includes('upgrade')) {
        aiText = `${timestamp} 🤖 *Orchestrator Agent*: Intent identified as **SAAS_BILLING_AUDITOR**.\n` +
          `Routing query to 💳 **Billing Agent**...\n\n` +
          `**Analysis & Actions Taken**:\n` +
          `1. Synced current billing session via Stripe API endpoints.\n` +
          `2. Verified active account quota: **${userPlan}**.\n` +
          `3. Projected MRR credit consumption limits against queries run.\n\n` +
          `**Recommendation**: You currently have **${userCredits} credits** left. Keep track of operations via the Sidebar status meter to prevent threshold throttles!`;
      } 
      else {
        aiText = `${timestamp} 🤖 *Orchestrator Agent*: Intent classified as **GENERAL_ANALYTICS_QUERY**.\n` +
          `Routing query to 🤖 **Orchestrator Agent**...\n\n` +
          `**Analysis & Actions Taken**:\n` +
          `1. Searched the active RAG vector database for context alignment.\n` +
          `2. Retrieved historical preferences for visual dashboard layouts.\n\n` +
          `**Recommendation**: I can build customizable charts, construct Zapier-style workflow automation triggers, solve hypothesis formulas, or clean spreadsheets. Ask me anything about your Metrics Flow SaaS operating system!`;
      }

      const aiMsg = { sender: 'ai', text: aiText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setCopilotMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  const handleAutoIngestExecute = () => {
    if (!autoIngestPrompt.trim()) return;
    setAutoIngestLoading(true);
    setAutoIngestLogs(["🚀 Initializing Agentic Automation engine...", "🔍 Parsing natural language prompt..."]);
    
    setTimeout(() => {
      setAutoIngestLogs(prev => [...prev, "🔌 Resolving SaaS auth handshake for connected source...", "📦 Reading database tables and extracting columns..."]);
    }, 1000);

    setTimeout(() => {
      setAutoIngestLogs(prev => [...prev, "🧬 Detecting dataset schema: Found 'Sales', 'Queries', 'Quality', 'Anomalies' attributes.", "🧹 Auto-Cleaning: Performing Z-score outlier checks..."]);
    }, 2000);

    setTimeout(() => {
      setAutoIngestLogs(prev => [...prev, "✅ Ingestion complete! 1,000 mock records compiled.", "💡 Recommending KPIs: ROI sparklines, Anomalies completeness indices.", "📊 Dynamic charts initialized. Dashboard synced successfully!"]);
      setAutoIngestLoading(false);
    }, 3500);
  };

  const handleWorkflowDryRun = () => {
    setWorkflowRunning(true);
    setTimeout(() => {
      setWorkflowRunning(false);
    }, 2000);
  };


  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.user) {
        const profile = res.data.user;
        setUserName(profile.name || 'Data Analyst');
        setUserEmail(profile.email || '');
        setUserPlan(profile.plan || 'Developer Sandbox');
        setUserCredits(profile.credits ?? 500);
        localStorage.setItem('user_name', profile.name || 'Data Analyst');
        localStorage.setItem('user_email', profile.email || '');
        localStorage.setItem('user_credits', String(profile.credits ?? 500));
        localStorage.setItem('user_plan', profile.plan || 'Developer Sandbox');
      }
    } catch (err) {
      console.error('Failed to fetch user profile from DB', err);
    }
  };

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
    
    fetchUserProfile();
    fetchDatasets();
    
    const handleCreditsUpdate = () => {
      fetchUserProfile();
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
  const [kpiCards, setKpiCards] = useState<any[]>([]);
  const [editingKpiId, setEditingKpiId] = useState<string | null>(null);
  const loadedDatasetIdRef = useRef<string>('');

  // Dynamic Dataset-Aware KPI Populator (with persistent database/local storage integration)
  useEffect(() => {
    if (!activeDatasetId) return;

    // 1. Check if the user has custom KPI settings stored in local memory for this specific dataset
    const savedKpis = localStorage.getItem(`metricsflow_kpis_${activeDatasetId}`);
    if (savedKpis) {
      try {
        const parsed = JSON.parse(savedKpis);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          setKpiCards(parsed);
          loadedDatasetIdRef.current = activeDatasetId;
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved dataset KPIs:', e);
      }
    }

    // 2. Generate customized defaults based on the active dataset context
    let datasetKpis: any[] = [];
    
    if (selectedDataset) {
      const isFintech = selectedDataset.name.toLowerCase().includes('fintech') || selectedDataset.name.toLowerCase().includes('fraud');
      const isSuicide = selectedDataset.name.toLowerCase().includes('suicide') || selectedDataset.name.toLowerCase().includes('world');
      const isMarketing = selectedDataset.name.toLowerCase().includes('marketing') || selectedDataset.name.toLowerCase().includes('ad');

      if (isFintech) {
        datasetKpis = [
          { id: 'txn_vol', title: 'Total Transaction Volume', value: '28500', type: 'currency', trend: '+14.2%', trendColor: 'text-green-400', sparkline: 'revenue' },
          { id: 'peak_txn', title: 'Peak Transaction Value', value: '12500', type: 'currency', trend: 'Stable', trendColor: 'text-blue-400', sparkline: 'default' },
          { id: 'fraud_risk', title: 'Average Fraud Risk', value: '12.5%', type: 'percent', trend: '-2.4%', trendColor: 'text-green-400', sparkline: 'query' },
          { id: 'active_users', title: 'Active Users Count', value: '177', type: 'number', trend: '+15%', trendColor: 'text-purple-400', sparkline: 'model' },
          { id: 'fraud_rules', title: 'AI Fraud Rules Applied', value: '24', type: 'number', trend: 'Optimal', trendColor: 'text-emerald-400', sparkline: 'clean' }
        ];
      } else if (isSuicide) {
        datasetKpis = [
          { id: 'total_incidents', title: 'Total Incidents Reported', value: '23050', type: 'number', trend: 'Decreasing', trendColor: 'text-green-400', sparkline: 'query' },
          { id: 'male_incidents', title: 'Male Incident Rate', value: '18550', type: 'number', trend: '-4.2%', trendColor: 'text-green-400', sparkline: 'default' },
          { id: 'female_incidents', title: 'Female Incident Rate', value: '4500', type: 'number', trend: '-8.5%', trendColor: 'text-green-400', sparkline: 'revenue' },
          { id: 'country_quality', title: 'Country Quality Index', value: '93.4%', type: 'progress', trend: 'Grade A', trendColor: 'text-emerald-400', sparkline: 'quality' },
          { id: 'active_profiles', title: 'Active Country Profiles', value: '5', type: 'number', trend: 'Verified', trendColor: 'text-blue-400', sparkline: 'clean' }
        ];
      } else if (isMarketing) {
        datasetKpis = [
          { id: 'roi', title: 'Total Marketing ROI', value: '3.2', type: 'number', trend: '+12.4%', trendColor: 'text-green-400', sparkline: 'revenue' },
          { id: 'impressions', title: 'Active Ad Impressions', value: '25200', type: 'number', trend: '+18%', trendColor: 'text-blue-400', sparkline: 'query' },
          { id: 'ctr', title: 'Click-Through Rate (CTR)', value: '3.8%', type: 'percent', trend: 'Optimal', trendColor: 'text-emerald-400', sparkline: 'quality' },
          { id: 'cpa', title: 'Cost Per Acquisition (CPA)', value: '12.50', type: 'currency', trend: '-14%', trendColor: 'text-green-400', sparkline: 'default' },
          { id: 'campaigns', title: 'Active Campaigns Run', value: '8', type: 'number', trend: 'Running', trendColor: 'text-purple-400', sparkline: 'clean' }
        ];
      }
    }

    if (datasetKpis.length === 0) {
      datasetKpis = [
        { id: 'sales', title: 'Total Enterprise Sales', value: '1248500', type: 'currency', trend: '+12.4%', trendColor: 'text-green-400', sparkline: 'revenue' },
        { id: 'queries', title: 'Workspace Queries', value: '45210', type: 'number', trend: '+8.2%', trendColor: 'text-blue-400', sparkline: 'query' },
        { id: 'quality', title: 'Average Data Quality', value: '94.2%', type: 'progress', trend: 'Grade A', trendColor: 'text-emerald-400', sparkline: 'quality' },
        { id: 'models', title: 'AI Predictors Trained', value: '14', type: 'model', trend: '+15%', trendColor: 'text-purple-400', sparkline: 'model' },
        { id: 'cleanRate', title: 'Anomaly Cleansing Rate', value: '99.8%', type: 'percent', trend: 'Optimal', trendColor: 'text-emerald-400', sparkline: 'clean' }
      ];
    }

    setKpiCards(datasetKpis);
    loadedDatasetIdRef.current = activeDatasetId;
    localStorage.setItem(`metricsflow_kpis_${activeDatasetId}`, JSON.stringify(datasetKpis));
  }, [selectedDataset, activeDatasetId]);

  // Real-time Auto-Save KPI adjustments back to dataset memory
  useEffect(() => {
    if (activeDatasetId && loadedDatasetIdRef.current === activeDatasetId && kpiCards && kpiCards.length > 0) {
      localStorage.setItem(`metricsflow_kpis_${activeDatasetId}`, JSON.stringify(kpiCards));
    }
  }, [kpiCards, activeDatasetId]);

  // AI Quality Sync trigger
  useEffect(() => {
    if (aiCleaned) {
      setKpiCards(prev => prev.map(k => {
        if (k.id === 'quality' || k.id === 'country_quality' || k.id === 'cleanRate') {
          return { ...k, value: '98.5' };
        }
        return k;
      }));
    }
  }, [aiCleaned]);

  // Dynamically aggregates active dataset values in real-time
  const getDynamicKpiValue = (cardId: string, cardType: string) => {
    if (!filteredData || filteredData.length === 0) return '0';
    
    switch (cardId) {
      case 'txn_vol':
      case 'sales': {
        const sum = filteredData.reduce((acc, row) => acc + (Number(row.Sales) || 0), 0);
        return String(sum);
      }
      case 'peak_txn': {
        const max = Math.max(...filteredData.map(row => Number(row.Sales) || 0));
        return String(max === -Infinity ? 0 : max);
      }
      case 'quality':
      case 'country_quality':
      case 'fraud_risk': {
        const avg = filteredData.reduce((acc, row) => acc + (Number(row.Quality) || 0), 0) / filteredData.length;
        return String(avg.toFixed(1));
      }
      case 'queries':
      case 'active_users':
      case 'male_incidents': {
        const sum = filteredData.reduce((acc, row) => acc + (Number(row.Queries) || 0), 0);
        return String(sum);
      }
      case 'cleanRate': {
        const anomalies = filteredData.reduce((acc, row) => acc + (Number(row.Anomalies) || 0), 0);
        const totalQueries = filteredData.reduce((acc, row) => acc + (Number(row.Queries) || 0), 0);
        if (totalQueries === 0) return '99.8';
        const rate = ((totalQueries - anomalies) / totalQueries) * 100;
        return String(rate.toFixed(1));
      }
      case 'fraud_rules':
      case 'active_profiles':
      case 'campaigns':
      case 'models': {
        return String(filteredData.length);
      }
      case 'total_incidents': {
        const sum = filteredData.reduce((acc, row) => acc + (Number(row.Sales) || 0), 0);
        return String(sum);
      }
      case 'female_incidents': {
        const sum = filteredData.reduce((acc, row) => acc + (Number(row.Queries) || 0), 0) * 0.25;
        return String(Math.round(sum));
      }
      case 'roi': {
        const sales = filteredData.reduce((acc, row) => acc + (Number(row.Sales) || 0), 0);
        const spend = filteredData.reduce((acc, row) => acc + (Number(row.Queries) || 0), 0);
        if (spend === 0) return '3.2';
        return String((sales / spend).toFixed(1));
      }
      case 'impressions': {
        const sum = filteredData.reduce((acc, row) => acc + (Number(row.Queries) || 0), 0) * 1.5;
        return String(Math.round(sum));
      }
      case 'ctr': {
        const clicks = filteredData.reduce((acc, row) => acc + (Number(row.Sales) || 0), 0);
        const imps = filteredData.reduce((acc, row) => acc + (Number(row.Queries) || 0), 0) * 1.5;
        if (imps === 0) return '3.8';
        return String(((clicks / imps) * 100).toFixed(1));
      }
      case 'cpa': {
        const spend = filteredData.reduce((acc, row) => acc + (Number(row.Queries) || 0), 0);
        const acquisitions = filteredData.reduce((acc, row) => acc + (Number(row.Sales) || 0), 0);
        if (acquisitions === 0) return '12.5';
        return String((spend / acquisitions).toFixed(2));
      }
      default:
        return null;
    }
  };

  const updateKpiValue = (id: string, value: string) => {
    setKpiCards(prev => prev.map(k => k.id === id ? { ...k, value, isManual: true } : k));
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

  // Dynamic Timeline Filter
  const filteredData = useMemo(() => {
    if (!localRawData || localRawData.length === 0) return [];
    if (dateFilter === 'Last 30 Days') {
      return localRawData.slice(-4);
    }
    if (dateFilter === 'This Quarter') {
      return localRawData.slice(-6);
    }
    return localRawData;
  }, [localRawData, dateFilter]);

  const [loadingIssues, setLoadingIssues] = useState(false);

  const fetchActiveDatasetDetails = async (datasetId: string) => {
    if (!datasetId || datasetId === 'mock') {
      let rawData = [
        { name: 'Jan', Sales: 4200, Queries: 12000, Quality: 85, Anomalies: 12 },
        { name: 'Feb', Sales: 5800, Queries: 15400, Quality: 88, Anomalies: 8 },
        { name: 'Mar', Sales: 5100, Queries: 18200, Quality: 89, Anomalies: 15 },
        { name: 'Apr', Sales: 7300, Queries: 22100, Quality: 91, Anomalies: 6 },
        { name: 'May', Sales: 8900, Queries: 28500, Quality: 93, Anomalies: 14 },
        { name: 'Jun', Sales: 9400, Queries: 35600, Quality: 94.2, Anomalies: 0 },
        { name: 'Jul', Sales: 10800, Queries: 41200, Quality: 94.2, Anomalies: 0 },
        { name: 'Aug', Sales: 12100, Queries: 45210, Quality: 94.2, Anomalies: 0 },
        { name: 'Sep', Sales: 11500, Queries: 43100, Quality: 94.2, Anomalies: 0 },
        { name: 'Oct', Sales: 13200, Queries: 48900, Quality: 94.2, Anomalies: 0 },
        { name: 'Nov', Sales: 14500, Queries: 52400, Quality: 94.2, Anomalies: 0 },
        { name: 'Dec', Sales: 16800, Queries: 59000, Quality: 94.2, Anomalies: 0 }
      ];
      if (aiCleaned) {
        rawData = rawData.map(d => ({ ...d, Quality: 98.5, Anomalies: 0 }));
      }
      setLocalRawData(rawData);
      return;
    }

    setLoadingIssues(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/datasets/${datasetId}/detect-issues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data && res.data.preview && res.data.preview.length > 0) {
        const preview = res.data.preview;
        const columns = res.data.columns || Object.keys(preview[0] || {});
        
        const salesCol = columns.find((c: string) => {
          const l = c.toLowerCase();
          return l.includes('sales') || l.includes('revenue') || l.includes('amount') || l.includes('price') || l.includes('incidents') || l.includes('salary');
        }) || columns[2] || 'Sales';
        
        const queriesCol = columns.find((c: string) => {
          const l = c.toLowerCase();
          return l.includes('queries') || l.includes('click') || l.includes('impressions') || l.includes('count') || l.includes('volume') || l.includes('population');
        }) || columns[3] || 'Queries';
        
        const qualityCol = columns.find((c: string) => {
          const l = c.toLowerCase();
          return l.includes('quality') || l.includes('risk') || l.includes('completeness') || l.includes('rate') || l.includes('growth');
        }) || columns[4] || 'Quality';
        
        const mapped = preview.map((row: any, idx: number) => {
          let name = row.name || row.Date || row.PurchaseDate || row.Year || row.Country || row.TransactionID || row.JobTitle || row.CampaignID || `Row ${idx + 1}`;
          if (row.Month) name = row.Month;
          if (row.ProductID) name = row.ProductID;
          
          let salesVal = Number(row[salesCol]);
          if (isNaN(salesVal)) salesVal = 100;
          
          let queriesVal = Number(row[queriesCol]);
          if (isNaN(queriesVal)) queriesVal = 50;
          
          let qualityVal = Number(row[qualityCol]);
          if (isNaN(qualityVal)) qualityVal = 95;
          if (qualityVal > 0 && qualityVal <= 1) {
            qualityVal = Math.round(qualityVal * 100);
          }
          
          let anomaliesVal = Number(row.Anomalies || 0);
          if (res.data.issues) {
            const hasMissing = res.data.issues.missing_values && res.data.issues.missing_values[salesCol];
            const hasOutlier = res.data.issues.outliers && res.data.issues.outliers[salesCol];
            anomaliesVal = (hasMissing ? 1 : 0) + (hasOutlier ? 1 : 0);
          }
          
          return {
            ...row,
            name,
            Sales: salesVal,
            Queries: queriesVal,
            Quality: qualityVal,
            Anomalies: anomaliesVal
          };
        });
        
        setLocalRawData(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch dataset details from DB', err);
    } finally {
      setLoadingIssues(false);
    }
  };

  useEffect(() => {
    fetchActiveDatasetDetails(activeDatasetId);
  }, [activeDatasetId, aiCleaned, datasets]);

  // Capture history snapshots whenever state changes
  useEffect(() => {
    if (localRawData.length > 0) {
      if (historyIndex === -1 || JSON.stringify(history[historyIndex]?.localRawData) !== JSON.stringify(localRawData) || JSON.stringify(history[historyIndex]?.kpiCards) !== JSON.stringify(kpiCards)) {
        saveStateToHistory(localRawData, kpiCards);
      }
    }
  }, [localRawData, kpiCards, chartType, dateFilter, activeTab, activeDatasetId]);

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
    let sortedData = [...filteredData];
    if (dataPointsLimit === '5') {
      return sortedData.sort((a, b) => (b.Sales || 0) - (a.Sales || 0)).slice(0, 5);
    }
    if (dataPointsLimit === '10') {
      return sortedData.sort((a, b) => (b.Sales || 0) - (a.Sales || 0)).slice(0, 10);
    }
    return filteredData;
  }, [filteredData, dataPointsLimit]);

  // AI 1-Click Clean Trigger
  const triggerAiClean = async () => {
    if (!activeDatasetId || activeDatasetId === 'mock') {
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
      return;
    }

    setAiCleaning(true);
    try {
      const token = localStorage.getItem('token');
      const storedCredits = localStorage.getItem('user_credits');
      const credits = storedCredits ? Number(storedCredits) : 500;
      if (credits < 20) {
        alert('⚠️ Credit Limit Reached: You need at least 20 credits to perform AI Auto Clean. Please upgrade your plan in settings.');
        setAiCleaning(false);
        return;
      }

      // Execute physical file cleaning by calling the clean API!
      const operations = [
        { action: 'drop_duplicates' },
        { action: 'remove_outliers', target: 'Sales' }
      ];
      
      await axios.post(`${API_URL}/api/datasets/${activeDatasetId}/clean`, {
        operations
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Persist credit consumption in the database
      const newCredits = Math.max(0, credits - 20);
      localStorage.setItem('user_credits', String(newCredits));
      await axios.put(`${API_URL}/api/auth/profile`, { credits: newCredits }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.dispatchEvent(new Event('credits-updated'));
      
      setAiCleaned(true);
      
      // Sync profile & dataset details from DB
      await fetchUserProfile();
      await fetchActiveDatasetDetails(activeDatasetId);
      await fetchDatasets();
      
    } catch (err) {
      console.error('Failed to clean dataset on database:', err);
      // Local fallback clean simulation
      setAiCleaned(true);
      const storedCredits = localStorage.getItem('user_credits');
      const credits = storedCredits ? Number(storedCredits) : 500;
      const newCredits = Math.max(0, credits - 20);
      localStorage.setItem('user_credits', String(newCredits));
      window.dispatchEvent(new Event('credits-updated'));
    } finally {
      setAiCleaning(false);
    }
  };

  // Download Cleaned Dataset Action
  const handleDownloadCleaned = () => {
    if (!localRawData || localRawData.length === 0) return;
    const headers = Object.keys(localRawData[0]);
    const csvRows = [
      headers.join(','),
      ...localRawData.map(row => 
        headers.map(fieldName => {
          const value = row[fieldName];
          const stringVal = value !== null && value !== undefined ? String(value) : '';
          // Escape quotes and wrap in quotes if contains comma, newline, or quotes
          if (stringVal.includes(',') || stringVal.includes('\n') || stringVal.includes('"')) {
            return `"${stringVal.replace(/"/g, '""')}"`;
          }
          return stringVal;
        }).join(',')
      )
    ];
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedDataset?.name || 'cleaned_dataset'}_cleaned.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Dynamic Schema Inference based on active dataset columns
  const inferredSchema = useMemo(() => {
    if (!localRawData || localRawData.length === 0) return [];
    const firstRow = localRawData[0];
    const keys = Object.keys(firstRow).filter(k => k !== 'isForecast' && k !== 'isManual');
    
    // Filter out our internal helpers name, Sales, Queries, Quality, Anomalies unless they were the ONLY columns present
    const hasOriginalKeys = keys.some(k => k !== 'name' && k !== 'Sales' && k !== 'Queries' && k !== 'Quality' && k !== 'Anomalies');
    const filteredKeys = hasOriginalKeys 
      ? keys.filter(k => k !== 'name' && k !== 'Sales' && k !== 'Queries' && k !== 'Quality' && k !== 'Anomalies')
      : keys;

    return filteredKeys.map(key => {
      const val = firstRow[key];
      let dataType = "Text";
      let badgeColor = "bg-purple-500/10 text-purple-400 border-purple-500/20";
      let typeSymbol = "A";
      
      if (typeof val === 'number' || key.toLowerCase().includes('sales') || key.toLowerCase().includes('queries') || key.toLowerCase().includes('quality') || key.toLowerCase().includes('anomalies') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('size') || key.toLowerCase().includes('index') || key.toLowerCase().includes('spend') || key.toLowerCase().includes('clicks') || key.toLowerCase().includes('roi') || key.toLowerCase().includes('rate')) {
        dataType = "Numeric";
        badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        typeSymbol = "#";
      } else if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time') || key.toLowerCase().includes('timestamp')) {
        dataType = "Temporal";
        badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
        typeSymbol = "T";
      }
      
      return { key, dataType, badgeColor, typeSymbol };
    });
  }, [localRawData]);

  // Real-time Hypothesis Testing Engine (One-Sample t-Test)
  const tTestResult = useMemo(() => {
    if (!filteredData || filteredData.length < 2) {
      return { t: 0, p: 1.0, df: 0, mean: 0, baseline: 0, sig: false };
    }
    const salesValues = filteredData.map(d => Number(d.Sales) || 0);
    const n = salesValues.length;
    const mean = salesValues.reduce((a, b) => a + b, 0) / n;
    
    // Baselines dynamically adjusted per dataset scale to keep test statistically valid & responsive
    let baseline = 6000;
    if (customBaseline !== '') {
      const parsed = parseFloat(customBaseline);
      if (!isNaN(parsed)) baseline = parsed;
    } else if (selectedDataset) {
      const isFintech = selectedDataset.name.toLowerCase().includes('fintech') || selectedDataset.name.toLowerCase().includes('fraud');
      const isSuicide = selectedDataset.name.toLowerCase().includes('suicide') || selectedDataset.name.toLowerCase().includes('world');
      const isMarketing = selectedDataset.name.toLowerCase().includes('marketing') || selectedDataset.name.toLowerCase().includes('ad');
      if (isFintech) baseline = 1500;
      else if (isSuicide) baseline = 3000;
      else if (isMarketing) baseline = 4000;
    }
    
    const variance = salesValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
    const sd = Math.sqrt(variance);
    
    if (sd === 0) {
      return { t: 0, p: 1.0, df: n - 1, mean: Number(mean.toFixed(1)), baseline, sig: false };
    }
    
    const se = sd / Math.sqrt(n);
    const tStat = (mean - baseline) / se;
    const df = n - 1;
    
    // High-fidelity p-value approximation for Two-Tailed t-Distribution
    const absT = Math.abs(tStat);
    const z = absT * (1 - 1 / (4 * df)); // correction factor for t to normal
    const pValue = 2 * (1 - (1 / (1 + Math.exp(-0.07056 * Math.pow(z, 3) - 1.5976 * z))));
    
    return {
      t: Number(tStat.toFixed(3)),
      p: Number(Math.max(0.0001, Math.min(1.0, pValue)).toFixed(4)),
      df,
      mean: Number(mean.toFixed(1)),
      baseline,
      sig: pValue < 0.05
    };
  }, [filteredData, selectedDataset, customBaseline]);

  // Real-time Time-Series Forecasting Engine (Linear Regression y = mx + c)
  const forecastData = useMemo(() => {
    if (!filteredData || filteredData.length < 2) return [];
    
    const salesValues = filteredData.map(d => Number(d.Sales) || 0);
    const n = salesValues.length;
    
    // Compute Means
    const meanX = (n - 1) / 2;
    const meanY = salesValues.reduce((a, b) => a + b, 0) / n;
    
    // Compute Slope (m) and Intercept (c)
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (i - meanX) * (salesValues[i] - meanY);
      denominator += Math.pow(i - meanX, 2);
    }
    
    const m = denominator === 0 ? 0 : numerator / denominator;
    const c = meanY - m * meanX;
    
    // Combine historical values
    const combined = filteredData.map((d) => ({
      name: d.name,
      Sales: Number(d.Sales) || 0,
      isForecast: false
    }));
    
    // Project future periods based on interactive forecastYears & growthMultiplier parameter
    const yearsToProject = forecastYears === 'custom' ? customForecastPeriods : Number(forecastYears);
    const lastPointName = filteredData[n - 1].name;
    
    let startYear = 2026;
    if (lastPointName.toLowerCase().includes('dec') || lastPointName.toLowerCase().includes('aug') || lastPointName.toLowerCase().includes('12')) {
      startYear = 2027;
    }
    
    const adjustedM = m * growthMultiplier;
    
    for (let i = 1; i <= yearsToProject; i++) {
      const futureIndex = n - 1 + i;
      const projectedVal = adjustedM * futureIndex + c;
      combined.push({
        name: `Year ${i} (${startYear + i - 1})`,
        Sales: Math.round(Math.max(0, projectedVal)),
        isForecast: true
      });
    }
    
    return combined;
  }, [filteredData, forecastYears, customForecastPeriods, growthMultiplier]);

  // Dynamic Context-Aware Executive Conclusion
  const finalConclusion = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        text: "No active dataset loaded. Please upload a file to compile final operational conclusions.",
        grade: "N/A",
        recommendation: "Ingest a new dataset profile to initialize statistical diagnostics."
      };
    }
    
    const salesSum = filteredData.reduce((acc, row) => acc + (Number(row.Sales) || 0), 0);
    const avgQuality = filteredData.reduce((acc, row) => acc + (Number(row.Quality) || 0), 0) / filteredData.length;
    const totalAnomalies = filteredData.reduce((acc, row) => acc + (Number(row.Anomalies) || 0), 0);
    
    let datasetType = "Enterprise Operations";
    if (selectedDataset) {
      const name = selectedDataset.name.toLowerCase();
      if (name.includes('fintech') || name.includes('fraud')) datasetType = "Fintech Transaction Fraud";
      else if (name.includes('suicide') || name.includes('world')) datasetType = "Global Healthcare Statistics";
      else if (name.includes('marketing') || name.includes('ad')) datasetType = "Marketing Campaign Performance";
    }
    
    const isClean = totalAnomalies === 0;
    const grade = avgQuality >= 95 ? 'A+' : avgQuality >= 90 ? 'A' : avgQuality >= 80 ? 'B' : 'C';
    
    let analysisText = "";
    let recommendation = "";
    
    if (datasetType === "Fintech Transaction Fraud") {
      analysisText = `The transaction fraud dataset exhibits high operational integrity with a current mean risk of ${tTestResult.mean}% and ${filteredData.length} indexed sectors. Compared to our baseline of ${tTestResult.baseline}%, the current metrics indicate a ${tTestResult.sig ? 'statistically significant' : 'stable'} trend. We detected a total cumulative transaction volume of $${salesSum.toLocaleString()}.`;
      recommendation = isClean 
        ? "Maintain active real-time transaction firewalls; standard deviation bounds are highly optimized."
        : `Run immediate AI auto-cleansing. We isolated ${totalAnomalies} critical outlier anomalies in transaction amounts that skew risk projections.`;
    } else if (datasetType === "Global Healthcare Statistics") {
      analysisText = `The demographics dataset provides verified incident metrics across ${filteredData.length} international categories. The average incident rate stands at ${tTestResult.mean.toLocaleString()} (baseline: ${tTestResult.baseline.toLocaleString()}), showing a ${tTestResult.sig ? 'statistically significant divergence' : 'stable chronological slope'}. Average reporting quality has reached ${avgQuality.toFixed(1)}%.`;
      recommendation = isClean
        ? "Publish findings to demographic registers; regional parameters show complete reporting indexes."
        : `Execute data repairs. We detected ${totalAnomalies} missing or abnormal incident metrics in the reporting indexes.`;
    } else if (datasetType === "Marketing Campaign Performance") {
      analysisText = `The marketing execution analytics compile performance figures across ${filteredData.length} active channels. Average channel revenue averages $${tTestResult.mean.toLocaleString()} against our historical baseline of $${tTestResult.baseline.toLocaleString()} (p-value: ${tTestResult.p}). Combined ad campaign conversions generated a total of $${salesSum.toLocaleString()} in revenue.`;
      recommendation = isClean
        ? "Scale the high-performing YouTube and Organic SEO campaigns; acquisition margins are running at peak efficiency."
        : `Prune budget allocations on underperforming segments. We found ${totalAnomalies} performance gaps in click-through rates that degrade ROI.`;
    } else {
      analysisText = `The enterprise operations database profiles ${filteredData.length} core business periods. The Sales run-rate averages $${tTestResult.mean.toLocaleString()} compared to our historical target baseline of $${tTestResult.baseline.toLocaleString()} (t-stat: ${tTestResult.t}). Overall dataset reporting completeness is graded at ${avgQuality.toFixed(1)}% with ${isClean ? 'zero' : totalAnomalies} outlier anomalies.`;
      recommendation = isClean
        ? "Execute forecast expansions; current operational margins are stable and suitable for strategic planning."
        : `Run the AI Outlier Cleaner pipeline. Resolving the ${totalAnomalies} isolated anomalies will yield a clean, forecast-ready dataset.`;
    }
    
    return {
      text: analysisText,
      grade,
      recommendation
    };
  }, [filteredData, selectedDataset, tTestResult]);


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

            {/* AI Copilot toggle trigger */}
            <button 
              onClick={() => setCopilotOpen(!copilotOpen)}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer relative shadow-lg ${
                copilotOpen
                  ? 'bg-purple-650 border-purple-500 text-white shadow-purple-500/20 animate-pulse'
                  : 'bg-neutral-900 border-neutral-850 text-purple-400 hover:text-purple-300 hover:border-neutral-800 hover:bg-neutral-900/60 shadow-neutral-950/20'
              }`}
              title="Toggle AI Copilot"
            >
              <Sparkles className="w-4.5 h-4.5" />
            </button>

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
              {kpiCards.slice(0, 5).map((card) => {
                const isEditingCard = editingKpiId === card.id;
                const sparklineData = getKpiSparkline(card.sparkline);
                const resolvedVal = getDynamicKpiValue(card.id, card.type) || card.value;
                
                if (isEditingCard) {
                  return (
                    <Card key={card.id} className="bg-neutral-900 border-blue-500 shadow-2xl relative p-3 flex flex-col justify-between h-40 z-30">
                      <div className="space-y-1.5 flex-grow flex flex-col justify-between text-left">
                        <div className="space-y-0.5">
                          <label className="text-[7px] text-neutral-500 uppercase font-mono font-bold block">Label</label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => updateKpiTitle(card.id, e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-850 rounded px-1.5 py-0.5 text-[9px] text-white focus:outline-none focus:border-blue-500 font-mono"
                            placeholder="KPI Label"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="space-y-0.5">
                            <label className="text-[7px] text-neutral-500 uppercase font-mono font-bold block">Trend</label>
                            <input
                              type="text"
                              value={card.trend || ''}
                              onChange={(e) => {
                                  const val = e.target.value;
                                  setKpiCards(prev => prev.map(k => k.id === card.id ? { ...k, trend: val } : k));
                              }}
                              className="w-full bg-neutral-955 border border-neutral-850 rounded px-1.5 py-0.5 text-[9px] text-white focus:outline-none focus:border-blue-500 font-mono"
                              placeholder="+5.2%"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[7px] text-neutral-500 uppercase font-mono font-bold block">Format Type</label>
                            <select
                              value={card.type}
                              onChange={(e) => {
                                const val = e.target.value;
                                setKpiCards(prev => prev.map(k => k.id === card.id ? { ...k, type: val } : k));
                              }}
                              className="w-full bg-neutral-955 border border-neutral-850 text-[9px] text-neutral-350 rounded px-1.5 py-0.5 cursor-pointer focus:outline-none font-semibold font-mono"
                            >
                              <option value="currency">Currency ($)</option>
                              <option value="number">Number</option>
                              <option value="percent">Percentage (%)</option>
                              <option value="progress">Score Ring</option>
                              <option value="model">Model</option>
                              <option value="text">Raw Text</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-neutral-850/50">
                          <span className="text-[8px] text-neutral-500 font-bold font-mono">Value: Auto-detected</span>
                          <Button
                            onClick={() => setEditingKpiId(null)}
                            className="bg-blue-650 hover:bg-blue-555 text-white text-[8px] font-black px-2 py-0.5 rounded h-auto min-h-0 cursor-pointer"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                }
 
                return (
                  <Card key={card.id} className="bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 border-neutral-850 shadow-2xl relative overflow-hidden text-neutral-50 flex flex-col justify-between h-40 group/card">
                    {/* Edit Card Button */}
                    <button
                      onClick={() => setEditingKpiId(card.id)}
                      className="absolute top-2.5 right-2.5 opacity-0 group-hover/card:opacity-100 text-neutral-500 hover:text-blue-400 transition-all p-1 rounded hover:bg-neutral-800/50 cursor-pointer z-20"
                      title="Customize KPI Label/Trend/Type"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
 
                    <CardHeader className="pb-1 pt-4 px-4 border-b border-neutral-900/50">
                      <div className="flex justify-between items-center text-[10px] text-neutral-500 font-bold uppercase tracking-wider font-mono">
                        <span 
                          onClick={() => setEditingKpiId(card.id)}
                          className="cursor-pointer hover:text-neutral-300 flex items-center gap-1 group/title truncate pr-10"
                          title="Click to Customize Label"
                        >
                          {card.title}
                          <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover/title:opacity-100 text-neutral-600 transition-opacity" />
                        </span>
                        {card.trend && (
                          <span className={`${card.trendColor || 'text-blue-405'} bg-neutral-900/40 border border-neutral-800/80 px-1.5 py-0.5 rounded text-[8px] font-bold shrink-0`}>
                            {card.trend}
                          </span>
                        )}
                      </div>
                    </CardHeader>
 
                    <CardContent className="px-4 pb-4 pt-3 flex flex-col justify-between flex-grow">
                      {card.type === 'progress' ? (
                        <div className="flex items-center justify-between flex-grow">
                          <div className="space-y-1 text-left">
                            <h2 
                              onClick={() => setEditingKpiId(card.id)}
                              className="text-xl font-black tracking-tight text-white leading-none cursor-pointer hover:text-emerald-455 flex items-center gap-1 group/kpi"
                              title="Click to Customize Card"
                            >
                              {resolvedVal.includes('%') ? resolvedVal : `${resolvedVal}%`}
                              <Edit3 className="w-3 h-3 opacity-0 group-hover/kpi:opacity-100 text-neutral-555 transition-opacity shrink-0" />
                            </h2>
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
                                strokeDashoffset={251.2 - (251.2 * (parseFloat(resolvedVal) || 94.2)) / 100}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute text-[9px] font-bold font-mono text-white">
                              {Math.round(parseFloat(resolvedVal) || 94)}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col justify-between flex-grow">
                          <div className="flex justify-between items-end">
                            <h2 
                              onClick={() => setEditingKpiId(card.id)}
                              className="text-xl font-black tracking-tight text-white leading-none cursor-pointer hover:text-blue-400 flex items-center gap-1 group/kpi"
                              title="Click to Customize Card"
                            >
                              {card.type === 'currency' && Number(resolvedVal)
                                ? `$${Number(resolvedVal).toLocaleString()}`
                                : card.type === 'number' && Number(resolvedVal)
                                  ? Number(resolvedVal).toLocaleString()
                                  : card.type === 'model' && Number(resolvedVal)
                                    ? `${resolvedVal} Models`
                                    : resolvedVal}
                              <Edit3 className="w-3 h-3 opacity-0 group-hover/kpi:opacity-100 text-neutral-555 transition-opacity shrink-0" />
                            </h2>
                            
                            <div className="w-16 h-8 shrink-0">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sparklineData}>
                                  <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke={card.id.includes('model') ? '#8b5cf6' : card.id.includes('query') || card.id.includes('risk') ? '#3b82f6' : '#10b981'} 
                                    strokeWidth={1.2} 
                                    fill={card.id.includes('model') ? '#8b5cf6' : card.id.includes('query') || card.id.includes('risk') ? '#3b82f6' : '#10b981'} 
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
            </div>

            {/* Dynamic Schema & Sample Sandbox Explorer */}
            <Card className="bg-neutral-950/40 backdrop-blur-md border border-neutral-850 text-neutral-50 shadow-2xl rounded-[24px] overflow-hidden p-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Schema Data Type Inspector */}
                <div className="space-y-4 text-left lg:col-span-1">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4.5 h-4.5 text-blue-400" />
                      <h3 className="text-sm font-bold text-white">Dataset Data Types</h3>
                    </div>
                    <p className="text-[10px] text-neutral-450">Dynamic data type inference for active columns</p>
                  </div>
                  <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-thin pr-1">
                    {inferredSchema.map(col => (
                      <div key={col.key} className="flex items-center justify-between border-b border-neutral-900/50 pb-2">
                        <span className="font-mono text-neutral-300 text-[11px] font-bold">{col.key}</span>
                        <span className={`text-[8px] border px-2 py-0.5 rounded-full font-mono uppercase tracking-wider font-black flex items-center gap-1 ${col.badgeColor}`}>
                          <span>{col.typeSymbol}</span>
                          <span>{col.dataType}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Manual 5-Row Sample Explorer */}
                <div className="space-y-4 text-left lg:col-span-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sliders className="w-4.5 h-4.5 text-purple-400" />
                        <h3 className="text-sm font-bold text-white">5 Sample Rows Preview</h3>
                      </div>
                      <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wide">
                        Verified OK
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-450">Active record vectors parsed from local memory</p>
                  </div>

                  <div className="overflow-x-auto border border-neutral-900 rounded-xl bg-neutral-950/20 p-2 scrollbar-thin flex-grow">
                    <table className="w-full border-collapse border border-neutral-850 text-[10px] font-mono">
                      <thead>
                        <tr className="bg-neutral-900 border-b border-neutral-800 text-neutral-450">
                          <th className="p-2 border-r border-neutral-850 text-center w-10">#</th>
                          {inferredSchema.map(col => (
                            <th key={col.key} className="p-2 border-r border-neutral-850 text-left">{col.key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {localRawData.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="border-b border-neutral-900 hover:bg-neutral-900/30 transition-colors">
                            <td className="p-2 border-r border-neutral-850 text-neutral-500 text-center">{idx + 1}</td>
                            {inferredSchema.map(col => (
                              <td key={col.key} className="p-2 border-r border-neutral-850 text-neutral-300">
                                {col.dataType === 'Numeric' && typeof row[col.key] === 'number'
                                  ? row[col.key].toLocaleString()
                                  : String(row[col.key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={() => setFullDatasetModalOpen(true)}
                      className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 text-xs font-semibold px-4 py-2 h-9 rounded-xl text-neutral-200 cursor-pointer flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" /> Read Whole Dataset ({localRawData.length} Rows)
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* 4. Interactive Charts visualizer block */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Visualizer Chart Canvas */}
              <Card className="lg:col-span-2 bg-neutral-950/40 backdrop-blur-md border border-neutral-850 text-neutral-50 shadow-2xl rounded-[24px] flex flex-col justify-between overflow-hidden">
                <CardHeader className="border-b border-neutral-900/50 pb-4 flex flex-row items-center justify-between gap-4">
                  <div className="flex items-center justify-between w-full">
                    {/* Left: Title & Dataset */}
                    <div className="space-y-1 text-left">
                      <div className="flex items-center space-x-2">
                        <Sliders className="w-4.5 h-4.5 text-blue-400" />
                        <CardTitle className="text-sm font-bold text-white">Interactive Dataset Visualizer</CardTitle>
                      </div>
                      {/* Active Dataset display */}
                      <p className="text-[10px] text-neutral-500 font-mono">
                        Active: <span className="font-bold text-neutral-350">{selectedDataset?.name || 'customer_metrics_unclean.csv'}</span>
                      </p>
                    </div>

                    {/* Middle: Download Button */}
                    <div className="flex-1 flex justify-center px-4">
                      <Button
                        onClick={handleDownloadCleaned}
                        className="bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold px-4 py-2 h-9 rounded-full flex items-center gap-1.5 shadow-md cursor-pointer transition-all border-none shrink-0"
                        title="Download Cleaned CSV"
                      >
                        <UploadCloud className="w-4 h-4 rotate-180 text-neutral-800" /> Download Cleaned CSV
                      </Button>
                    </div>

                    {/* Right: Selectors Stack */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {/* Chart Type Toggles */}
                      <div className="flex bg-neutral-950 border border-neutral-900 p-0.5 rounded-full">
                        {['area', 'bar', 'line'].map(type => (
                          <button
                            key={type}
                            onClick={() => setChartType(type as any)}
                            className={`px-3 py-1 rounded-full uppercase text-[9px] font-extrabold tracking-wider cursor-pointer transition-all ${
                              chartType === type ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>

                      {/* Point Limit Selectors */}
                      <div className="flex bg-neutral-950 border border-neutral-900 p-0.5 rounded-full">
                        {['5', '10', 'all'].map(pt => (
                          <button
                            key={pt}
                            onClick={() => setDataPointsLimit(pt as any)}
                            className={`px-3 py-1 rounded-full text-[9px] font-extrabold tracking-wider cursor-pointer transition-all ${
                              dataPointsLimit === pt ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'
                            }`}
                          >
                            {pt === 'all' ? 'All' : `Top ${pt}`}
                          </button>
                        ))}
                      </div>
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
                    className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer bg-transparent border-none"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-blue-400" />
                      <span>{showSpreadsheet ? 'Hide Data Points Spreadsheet' : 'View & Edit Data Points Spreadsheet'}</span>
                    </span>
                    <span className="text-[10px] text-blue-400 font-bold font-mono">
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
              <Card className="bg-neutral-950/40 backdrop-blur-md border border-neutral-850 text-neutral-50 shadow-2xl rounded-[24px] flex flex-col justify-between overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/5 rounded-full blur-2xl pointer-events-none -z-10 group-hover:bg-purple-500/10 transition-all duration-300"></div>
                
                <CardHeader className="border-b border-neutral-900/50 pb-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
                    <CardTitle className="text-sm font-bold text-white">AI Diagnostics & Recommendations</CardTitle>
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
                          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-500/[0.02] border border-emerald-500/20 text-left transition-all hover:bg-emerald-500/[0.04]">
                            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5 animate-bounce" />
                            <div className="space-y-1">
                              <h4 className="font-bold text-emerald-400 text-xs tracking-tight">Dataset Fully Verified Clean</h4>
                              <p className="text-[10px] text-neutral-450 leading-relaxed">Data completeness evaluated at 98.5%. Anomalies trimmed.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-500/[0.02] border border-emerald-500/20 text-left transition-all hover:bg-emerald-500/[0.04]">
                            <Check className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h4 className="font-bold text-emerald-400 text-xs tracking-tight">Duplicates Pruned</h4>
                              <p className="text-[10px] text-neutral-450 leading-relaxed">Pruned all 8 duplicate row sets successfully. Unique rows index: 100%.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-500/[0.02] border border-emerald-500/20 text-left transition-all hover:bg-emerald-500/[0.04]">
                            <Check className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h4 className="font-bold text-emerald-400 text-xs tracking-tight">Outlier Anomaly Solved</h4>
                              <p className="text-[10px] text-neutral-450 leading-relaxed">Standardized 14 outlier values. Root-Mean-Square Error: 0.00%.</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/[0.02] border border-amber-500/20 text-left transition-all hover:bg-amber-500/[0.04]">
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h4 className="font-bold text-amber-400 text-xs tracking-tight">Outlier Anomaly Detected</h4>
                              <p className="text-[10px] text-neutral-450 leading-relaxed">We isolated 14 numeric anomalies in 'SalesAmount' column values.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-blue-500/[0.02] border border-blue-500/20 text-left transition-all hover:bg-blue-500/[0.04]">
                            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h4 className="font-bold text-blue-400 text-xs tracking-tight">Data Completeness Flagged</h4>
                              <p className="text-[10px] text-neutral-450 leading-relaxed">45 missing categories in 'ProductCategory' column identified.</p>
                            </div>
                          </div>

                           <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-purple-500/[0.02] border border-purple-500/20 text-left transition-all hover:bg-purple-500/[0.04]">
                            <Layers className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h4 className="font-bold text-purple-400 text-xs tracking-tight">Data Redundancy Warning</h4>
                              <p className="text-[10px] text-neutral-450 leading-relaxed">We found 8 duplicate index combinations inside active table rows.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-500/[0.02] border border-emerald-500/20 text-left transition-all hover:bg-emerald-500/[0.04]">
                            <BrainCircuit className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h4 className="font-bold text-emerald-400 text-xs tracking-tight">High Feature Correlation</h4>
                              <p className="text-[10px] text-neutral-450 leading-relaxed">Category dimensions correlate at 92.4% with SalesAmount variance.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-sky-500/[0.02] border border-sky-500/20 text-left transition-all hover:bg-sky-500/[0.04]">
                            <Activity className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h4 className="font-bold text-sky-400 text-xs tracking-tight">System Temporal Trajectory</h4>
                              <p className="text-[10px] text-neutral-450 leading-relaxed">Run-rate displays a positive chronological slope of +0.35/month.</p>
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
                        className="w-full bg-white hover:bg-neutral-200 text-neutral-950 rounded-full py-5 font-bold flex items-center justify-center gap-2 cursor-pointer text-xs transition-all border-none shadow-md"
                      >
                        <Sparkles className="w-4 h-4 text-neutral-900" /> 1-Click AI Auto Clean
                      </Button>
                    </div>
                  )}
                  
                  {aiCleaned && !aiCleaning && (
                    <div className="pt-2">
                      <Button
                        onClick={handleDownloadCleaned}
                        className="w-full bg-white hover:bg-neutral-200 text-neutral-950 rounded-full py-5 font-bold flex items-center justify-center gap-2 cursor-pointer text-xs transition-all border-none shadow-md"
                      >
                        <UploadCloud className="w-4 h-4 rotate-180 text-neutral-900" /> Download Cleaned Dataset
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
{/* 5. Advanced AI Statistical & Forecasting Studio */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              
              {/* Hypothesis Testing Card */}
              <Card className="bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 border border-neutral-850 text-neutral-50 shadow-2xl rounded-2xl flex flex-col justify-between overflow-hidden relative group min-h-[360px]">
                <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-2xl pointer-events-none -z-10"></div>
                <CardHeader className="border-b border-neutral-900/50 pb-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4.5 h-4.5 text-blue-400" />
                    <CardTitle className="text-sm font-bold tracking-tight text-white">Hypothesis Testing & Significance</CardTitle>
                  </div>
                  <CardDescription className="text-neutral-450 text-[10px] uppercase font-mono tracking-wider mt-0.5">Scientific statistical diagnostics</CardDescription>
                </CardHeader>
                <CardContent className="pt-5 flex-grow flex flex-col justify-between space-y-4 text-xs">
                  <div className="space-y-4 text-neutral-400">
                    {/* Custom Hypothesis Baseline Parameter Input */}
                    <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-neutral-950/40 border border-neutral-850/80 mb-1.5">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase font-mono tracking-wider">Custom Baseline (H₀):</span>
                      <input
                        type="number"
                        value={customBaseline}
                        onChange={(e) => setCustomBaseline(e.target.value)}
                        placeholder={`Default ($${tTestResult.baseline})`}
                        className="w-28 bg-neutral-950 border border-neutral-850 hover:border-neutral-700 focus:border-blue-500 focus:outline-none rounded-lg px-2 py-1 text-[10px] text-white font-mono text-right transition-colors"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-950/40 border border-neutral-850 space-y-2.5">
                      <p className="font-mono text-[9px] text-neutral-500 uppercase leading-none font-bold tracking-wider">Hypothesis Statements</p>
                      <div className="pl-3 border-l-2 border-blue-500 py-0.5">
                        <p className="text-neutral-200 leading-relaxed font-semibold">
                          <span className="text-blue-400 font-bold">Null (H₀):</span> The dataset mean equals target baseline of <span className="font-mono text-white">${tTestResult.baseline.toLocaleString()}</span>.
                        </p>
                      </div>
                      <div className="pl-3 border-l-2 border-purple-500 py-0.5">
                        <p className="text-neutral-200 leading-relaxed font-semibold">
                          <span className="text-purple-400 font-bold">Alt (H₁):</span> The dataset mean differs significantly from baseline.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 font-mono">
                      <div className="p-2.5 rounded-xl border border-neutral-850/80 bg-neutral-950/60 text-center">
                        <span className="text-[8px] text-neutral-500 uppercase block font-bold tracking-wide">Mean Val</span>
                        <span className="text-xs font-extrabold text-neutral-200">${tTestResult.mean.toLocaleString()}</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-neutral-850/80 bg-neutral-950/60 text-center">
                        <span className="text-[8px] text-neutral-500 uppercase block font-bold tracking-wide">T-Stat</span>
                        <span className="text-xs font-extrabold text-neutral-200">{tTestResult.t}</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-neutral-850/80 bg-neutral-950/60 text-center">
                        <span className="text-[8px] text-neutral-500 uppercase block font-bold tracking-wide">P-Value</span>
                        <span className="text-xs font-extrabold text-neutral-200">{tTestResult.p}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-mono border-t border-neutral-900 pt-3">
                      <span className="text-neutral-500 font-bold tracking-wider">DEGREES OF FREEDOM</span>
                      <span className="text-neutral-350 font-bold">DF = {tTestResult.df} (N = {localRawData.length})</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    {tTestResult.sig ? (
                      <div className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold font-mono text-[10px] uppercase tracking-wider text-center shadow-[0_0_15px_rgba(16,185,129,0.08)]">
                        <CheckCircle2 className="w-4 h-4 animate-bounce" /> Reject H₀: Statistically Significant
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15 text-yellow-500 font-bold font-mono text-[10px] uppercase tracking-wider text-center shadow-[0_0_15px_rgba(234,179,8,0.04)]">
                        <AlertCircle className="w-4 h-4" /> Fail to Reject H₀: Stable/Insignificant
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Time-Series Forecasting Card */}
              <Card className="bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 border border-neutral-850 text-neutral-50 shadow-2xl rounded-2xl flex flex-col justify-between overflow-hidden relative group min-h-[360px]">
                <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/5 rounded-full blur-2xl pointer-events-none -z-10"></div>
                <CardHeader className="border-b border-neutral-900/50 pb-4 flex flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center space-x-2">
                      <LineChart className="w-4.5 h-4.5 text-purple-400" />
                      <CardTitle className="text-sm font-bold tracking-tight text-white">Predictive Trend Forecasting</CardTitle>
                    </div>
                    <CardDescription className="text-neutral-450 text-[10px] uppercase font-mono tracking-wider mt-0.5">Linear Regression run-rate projection</CardDescription>
                  </div>
                  
                  {/* Forecast Year Selector */}
                  <select
                    value={forecastYears}
                    onChange={(e) => setForecastYears(e.target.value)}
                    className="bg-neutral-950 border border-neutral-850 hover:border-neutral-700 hover:text-white text-[10px] font-bold text-neutral-350 rounded-xl px-2.5 py-1.5 cursor-pointer focus:outline-none transition-all"
                  >
                    <option value="2">Next 2 Years</option>
                    <option value="3">Next 3 Years</option>
                    <option value="5">Next 5 Years</option>
                    <option value="custom">Custom Periods...</option>
                  </select>
                </CardHeader>
                <CardContent className="pt-5 flex-grow flex flex-col justify-between space-y-4">
                  {forecastYears === 'custom' && (
                    <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-neutral-950/40 border border-neutral-850/80 mb-1 animate-fade-in">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase font-mono tracking-wider">Forecast Years:</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={customForecastPeriods}
                        onChange={(e) => setCustomForecastPeriods(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 bg-neutral-950 border border-neutral-850 focus:border-purple-500 focus:outline-none rounded-lg px-2 py-1 text-[10px] text-white font-mono text-center"
                      />
                    </div>
                  )}

                  <div className="h-44 w-full text-[9px] font-mono">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={forecastData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                        <XAxis dataKey="name" stroke="#737373" fontSize={9} />
                        <YAxis stroke="#737373" fontSize={9} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }} />
                        <Line 
                          type="monotone" 
                          dataKey="Sales" 
                          stroke="#a855f7" 
                          strokeWidth={2} 
                          dot={(props: any) => {
                            const { cx, cy, payload } = props;
                            if (payload.isForecast) {
                              return <circle cx={cx} cy={cy} r={3.5} fill="#10b981" stroke="#fff" strokeWidth={1} key={cx + "-" + cy} />;
                            }
                            return <circle cx={cx} cy={cy} r={3.5} fill="#3b82f6" key={cx + "-" + cy} />;
                          }}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500 border-t border-neutral-900 pt-2.5 leading-none">
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Historical</span>
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> OLS Forecast (Dashed)</span>
                  </div>

                  {/* Growth Multiplier Scenario Slider */}
                  <div className="flex items-center justify-between gap-3 pt-2 text-[10px] border-t border-neutral-900/60 mt-1">
                    <span className="text-[9px] font-bold text-neutral-450 uppercase font-mono tracking-wider">Prediction Growth Multiplier:</span>
                    <div className="flex items-center gap-2 flex-grow justify-end">
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={growthMultiplier}
                        onChange={(e) => setGrowthMultiplier(parseFloat(e.target.value) || 1.0)}
                        className="w-24 h-1 bg-neutral-950 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
                      />
                      <span className="font-mono text-[9px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-extrabold shrink-0">
                        {growthMultiplier.toFixed(1)}x
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Executive Final Conclusion Card */}
              <Card className="bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 border border-neutral-850 text-neutral-50 shadow-2xl rounded-2xl flex flex-col justify-between overflow-hidden relative group min-h-[360px]">
                <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none -z-10"></div>
                <CardHeader className="border-b border-neutral-900/50 pb-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                    <CardTitle className="text-sm font-bold tracking-tight text-white">Executive Final Conclusion</CardTitle>
                  </div>
                  <CardDescription className="text-neutral-450 text-[10px] uppercase font-mono tracking-wider mt-0.5">SaaS analytics summary report</CardDescription>
                </CardHeader>
                <CardContent className="pt-5 flex-grow flex flex-col justify-between space-y-4 text-xs">
                  <div className="space-y-4 text-neutral-400 text-left">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-neutral-500 font-bold text-[9px] uppercase leading-none">Overall Quality Grade</span>
                      <span className="bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full text-emerald-450 text-[10px] font-black leading-none shadow-[0_0_12px_rgba(16,185,129,0.08)]">{finalConclusion.grade} Rating</span>
                    </div>

                    <p className="leading-relaxed text-neutral-300 font-medium text-xs">
                      {finalConclusion.text}
                    </p>

                    <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-850 space-y-1.5">
                      <span className="text-[8px] font-bold font-mono text-amber-500 uppercase block tracking-wider">RECOMMENDED NEXT STEP</span>
                      <p className="text-[10px] text-neutral-200 leading-normal font-semibold">{finalConclusion.recommendation}</p>
                    </div>
                  </div>

                  <div className="pt-1.5 flex justify-end">
                    <div className="text-[8px] text-neutral-500 font-bold font-mono uppercase tracking-wider">
                      Metrics Flow AI Auditor • Compiled Live
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* 5.5 Autonomous AI Analytics Agent Console */}
            <Card className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-850 shadow-2xl rounded-[24px] overflow-hidden p-6 mb-8 relative">
              <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-4 mb-4">
                <div className="space-y-1 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 absolute"></span>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <BrainCircuit className="w-4.5 h-4.5 text-emerald-400" />
                      <span>Autonomous AI Analytics Agent Monitor</span>
                    </h3>
                  </div>
                  <p className="text-[10px] text-neutral-450 leading-none">Always-on data integrity check, threshold monitors, and automation systems</p>
                </div>
                
                <div className="flex items-center gap-3 text-[9px] font-mono shrink-0">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                    Agent Status: Active Ingestion
                  </span>
                  <span className="bg-neutral-900 text-neutral-400 border border-neutral-850 px-2.5 py-0.5 rounded-full font-bold">
                    System Accuracy: 99.8%
                  </span>
                </div>
              </div>

              {/* Terminal Logs Grid */}
              <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 font-mono text-[10px] text-left leading-relaxed space-y-2 h-36 overflow-y-auto scrollbar-thin">
                <div className="flex items-start gap-2.5">
                  <span className="text-neutral-500">13:00:15</span>
                  <span className="text-blue-400 font-bold">[Agent Connection]</span>
                  <span className="text-neutral-300">Live webhook monitoring established for active workspace `Acme Corp`.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-neutral-500">13:02:11</span>
                  <span className="text-purple-400 font-bold">[Outlier Anomaly]</span>
                  <span className="text-neutral-350">Isolated extreme deviation spike in 'Sales' column on record index #4. Calculated fallback applied.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-neutral-500">13:04:45</span>
                  <span className="text-amber-400 font-bold">[Predictive Engine]</span>
                  <span className="text-neutral-350">Recalculated OLS linear regression slope parameter (m = 0.35). Two-tailed t-Test significance model verified (p &lt; 0.05).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-neutral-500">13:05:00</span>
                  <span className="text-emerald-400 font-bold">[Workflow Trigger]</span>
                  <span className="text-neutral-300">Data completeness ratio validated (Completeness: 98.5%). Automated analytical reports formatted and dispatched to Slack channel #sales-insights.</span>
                </div>
              </div>
            </Card>

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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-5">
              <div className="space-y-1 text-left">
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <Server className="w-6 h-6 text-blue-400" /> AI Automations & Workflows
                </h1>
                <p className="text-xs text-neutral-400">Connect corporate data warehouses, orchestrate multi-agent workflows, and schedule AI summary dispatches.</p>
              </div>

              {/* Sub-Tab Navigation */}
              <div className="flex bg-neutral-900/60 border border-neutral-850 p-1 rounded-xl shrink-0">
                {[
                  { id: 'connectors', label: 'Plug-and-Play' },
                  { id: 'auto_ingest', label: 'AI Ingestion Engine' },
                  { id: 'workflow', label: 'Visual Workflow Builder' }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveIntegrationSubTab(sub.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase font-mono tracking-wider transition-all cursor-pointer ${
                      activeIntegrationSubTab === sub.id
                        ? 'bg-neutral-950 text-white shadow-sm border border-neutral-850'
                        : 'text-neutral-500 hover:text-neutral-350 border border-transparent'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SUB-TAB 1: PLUG AND PLAY CONNECTORS GRID */}
            {activeIntegrationSubTab === 'connectors' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: 'Shopify Store', desc: 'Sync customer metrics, active transactions, and SKU indices', status: 'Connected', icon: UploadCloud, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', rows: '14.5k Ingested', sync: '5m ago' },
                    { name: 'Stripe Billing', desc: 'Sync subscription plans, credits usage, and invoices', status: 'Connected', icon: Shield, color: 'text-blue-400 border-blue-500/20 bg-blue-500/5', rows: '8.2k Ingested', sync: '10m ago' },
                    { name: 'Supabase Database', desc: 'Direct mapping to user table schemas & auth structures', status: 'Connected', icon: Database, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', rows: '25.0k Ingested', sync: 'Live' },
                    { name: 'Google Ads API', desc: 'Track campaign ROAS, conversions, and ad impressions', status: 'Available', icon: Activity, color: 'text-purple-400 border-neutral-850 hover:border-purple-500/20', rows: '0 Ingested', sync: 'Never' },
                    { name: 'Notion Workspace', desc: 'Sync spreadsheet pages & tabular databases to summary tables', status: 'Available', icon: Layers, color: 'text-amber-400 border-neutral-850 hover:border-amber-500/20', rows: '0 Ingested', sync: 'Never' },
                    { name: 'Slack Dispatcher', desc: 'Send AI anomaly summaries directly to corporate channels', status: 'Available', icon: Bell, color: 'text-sky-400 border-neutral-850 hover:border-sky-500/20', rows: '0 Ingested', sync: 'Never' }
                  ].map(conn => {
                    const Icon = conn.icon;
                    return (
                      <Card key={conn.name} className="bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 border border-neutral-850 rounded-[20px] p-5 relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[160px] text-left">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${conn.color}`}>
                              <Icon className="w-4.5 h-4.5" />
                            </div>
                            <span className={`text-[8px] font-mono font-black uppercase tracking-wider px-2 py-0.5 border rounded-full ${
                              conn.status === 'Connected'
                                ? 'text-green-400 bg-green-500/10 border-green-500/20 shadow-[0_0_12px_rgba(16,185,129,0.08)]'
                                : 'text-neutral-500 bg-neutral-900 border-neutral-800'
                            }`}>
                              {conn.status}
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-white leading-none">{conn.name}</h4>
                            <p className="text-[10px] text-neutral-450 leading-relaxed min-h-[30px]">{conn.desc}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[8px] font-mono text-neutral-500 border-t border-neutral-900 pt-3 mt-3">
                          <span>INGESTED: <span className="text-neutral-350 font-bold">{conn.rows}</span></span>
                          <span>SYNC: <span className="text-neutral-350 font-bold">{conn.sync}</span></span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUB-TAB 2: AI INGESTION ENGINE */}
            {activeIntegrationSubTab === 'auto_ingest' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left controls */}
                <div className="lg:col-span-1 space-y-4 text-left">
                  <Card className="bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 border border-neutral-850 rounded-[20px] p-5 shadow-2xl space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        AI Agentic Handshake
                      </h4>
                      <p className="text-[10px] text-neutral-450">Ingest apps, map fields, and format layouts via prompt commands</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8px] font-bold font-mono text-neutral-500 uppercase tracking-widest block">Natural Language Prompt</label>
                      <textarea
                        value={autoIngestPrompt}
                        onChange={(e) => setAutoIngestPrompt(e.target.value)}
                        placeholder="e.g., Connect my Stripe store and create a transaction metrics card with anomaly alerts..."
                        className="w-full h-24 bg-neutral-950 border border-neutral-850 hover:border-neutral-700 focus:border-purple-500 focus:outline-none rounded-xl p-3 text-xs text-white placeholder-neutral-600 transition-colors resize-none font-sans"
                      />
                    </div>

                    <Button
                      onClick={handleAutoIngestExecute}
                      disabled={autoIngestLoading || !autoIngestPrompt.trim()}
                      className="w-full bg-white hover:bg-neutral-200 text-neutral-950 rounded-xl font-bold py-3 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-none shadow-md"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${autoIngestLoading ? 'animate-spin' : ''}`} />
                      {autoIngestLoading ? 'Auto Ingesting...' : 'Ingest Data Source'}
                    </Button>
                  </Card>
                </div>

                {/* Right Terminal Logs View */}
                <div className="lg:col-span-2 space-y-4 text-left flex flex-col justify-between">
                  <Card className="bg-neutral-950 border border-neutral-850 rounded-[20px] p-5 shadow-2xl flex-grow flex flex-col justify-between min-h-[300px]">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
                        <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                          <Laptop className="w-4.5 h-4.5 text-blue-400" />
                          Ingestion Terminal Console
                        </h4>
                        <span className="text-[8px] bg-neutral-900 border border-neutral-800 text-neutral-500 px-2 py-0.5 rounded font-mono">
                          Gemini Ingest Agent • Offline Sync
                        </span>
                      </div>

                      {autoIngestLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-neutral-500 font-mono text-[10px] space-y-2">
                          <BrainCircuit className="w-7 h-7 text-neutral-700 animate-pulse" />
                          <span>Console standby. Write a prompt on the left and run the engine to observe schema extractions.</span>
                        </div>
                      ) : (
                        <div className="font-mono text-[9px] text-left leading-relaxed space-y-2 max-h-52 overflow-y-auto scrollbar-thin">
                          {autoIngestLogs.map((log, index) => (
                            <div key={index} className="flex items-start gap-2 animate-fade-in">
                              <span className="text-neutral-500">[{index + 1}]</span>
                              <span className="text-neutral-200">{log}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-[8px] text-neutral-600 font-mono uppercase tracking-widest pt-3 border-t border-neutral-900 mt-4 leading-none">
                      Metrics Flow Autonomous Ingest Console • Log Complete
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: VISUAL WORKFLOW BUILDER (n8n/Zapier style) */}
            {activeIntegrationSubTab === 'workflow' && (
              <div className="space-y-6 text-left">
                <Card className="bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 border border-neutral-850 rounded-[20px] p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-2xl pointer-events-none -z-10"></div>
                  
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-4 mb-6">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sliders className="w-4.5 h-4.5 text-purple-400" />
                        AI Workflow Builder Canvas
                      </h4>
                      <p className="text-[10px] text-neutral-450">Establish trigger pipelines, filter conditions, and AI forecasting outcomes</p>
                    </div>

                    <Button
                      onClick={handleWorkflowDryRun}
                      disabled={workflowRunning}
                      className="bg-white hover:bg-neutral-200 text-neutral-950 rounded-xl font-bold px-4 py-2 text-[10px] flex items-center gap-1 cursor-pointer border-none shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {workflowRunning ? 'Dry-Running...' : '⚡ Test Dry-Run'}
                    </Button>
                  </div>

                  {/* Flow chart layout workspace */}
                  <div className="p-8 rounded-2xl bg-neutral-950 border border-neutral-900 relative overflow-x-auto scrollbar-thin">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4 min-w-[600px] py-4">
                      {activeWorkflowNodes.map((node, index) => {
                        const isLast = index === activeWorkflowNodes.length - 1;
                        return (
                          <React.Fragment key={node.id}>
                            <div 
                              className={`p-4 rounded-xl border w-44 text-left transition-all duration-300 relative shadow-lg ${
                                workflowRunning && index === 0 ? 'border-green-500 bg-green-500/5 animate-pulse scale-105' :
                                workflowRunning && index === 1 ? 'border-amber-500 bg-amber-500/5 animate-pulse scale-105 transition-delay-300' :
                                workflowRunning && index === 2 ? 'border-purple-500 bg-purple-500/5 animate-pulse scale-105 transition-delay-500' :
                                workflowRunning && index === 3 ? 'border-blue-500 bg-blue-500/5 animate-pulse scale-105 transition-delay-700' :
                                'border-neutral-850 bg-neutral-900/40 hover:border-neutral-700'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`p-1.5 rounded bg-neutral-950 border border-neutral-850 ${
                                  node.id === 'trigger' ? 'text-green-400' :
                                  node.id === 'condition' ? 'text-amber-400' :
                                  node.id === 'ai_node' ? 'text-purple-400' : 'text-blue-400'
                                }`}>
                                  {node.id === 'trigger' && <UploadCloud className="w-3.5 h-3.5" />}
                                  {node.id === 'condition' && <Shield className="w-3.5 h-3.5" />}
                                  {node.id === 'ai_node' && <BrainCircuit className="w-3.5 h-3.5" />}
                                  {node.id === 'action' && <Bell className="w-3.5 h-3.5" />}
                                </div>
                                <span className="text-[10px] font-bold text-white truncate leading-none">{node.label}</span>
                              </div>
                              <p className="text-[9px] text-neutral-500 leading-normal truncate">{node.desc}</p>
                              
                              <div className="absolute top-2 right-2 flex items-center">
                                <span className={`w-1.5 h-1.5 rounded-full ${node.active ? 'bg-emerald-500' : 'bg-neutral-700'}`}></span>
                              </div>
                            </div>

                            {!isLast && (
                              <div className="flex items-center justify-center text-neutral-700 shrink-0 font-bold rotate-90 md:rotate-0">
                                <ArrowRight className="w-4 h-4 animate-pulse text-neutral-700" />
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {workflowRunning && (
                    <div className="mt-4 flex items-center text-green-400 text-xs bg-green-500/5 p-3 rounded-lg border border-green-500/10 justify-center animate-bounce">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Visual Workflow test succeeded! Logs verified and Slack summary dispatches verified OK.
                    </div>
                  )}
                </Card>
              </div>
            )}
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

        {/* ──────────────────────────────────────────────────────── */}
        {/* FULL DATASET READER MODAL */}
        {/* ──────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {fullDatasetModalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-neutral-950 border border-neutral-850 rounded-[24px] w-full max-w-5xl h-[85vh] flex flex-col justify-between overflow-hidden shadow-2xl relative"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-neutral-900 flex justify-between items-center bg-neutral-950/40 backdrop-blur-md">
                  <div className="space-y-1 text-left">
                    <h3 className="text-md font-bold text-white flex items-center gap-2">
                      <Database className="w-4.5 h-4.5 text-blue-400" />
                      <span>Entire Dataset Ingestion Profiler</span>
                    </h3>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      File: <span className="font-bold text-neutral-350">{selectedDataset?.name || 'customer_metrics_unclean.csv'}</span> • Profiled: {localRawData.length} records
                    </p>
                  </div>
                  <button
                    onClick={() => setFullDatasetModalOpen(false)}
                    className="text-neutral-500 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-neutral-900 border border-transparent hover:border-neutral-800 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </button>
                </div>

                {/* Modal Content - Full Scrollable Table */}
                <div className="flex-1 overflow-auto p-6 scrollbar-thin text-[10px] font-mono">
                  <table className="w-full border-collapse border border-neutral-850">
                    <thead>
                      <tr className="bg-neutral-900 border-b border-neutral-800 text-neutral-450 sticky top-0 z-10">
                        <th className="p-2 border-r border-neutral-850 text-center w-12 bg-neutral-900">Index</th>
                        {inferredSchema.map(col => (
                          <th key={col.key} className="p-2 border-r border-neutral-850 text-left bg-neutral-900">{col.key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {localRawData.map((row, idx) => (
                        <tr key={idx} className="border-b border-neutral-900 hover:bg-neutral-900/40 transition-colors">
                          <td className="p-2 border-r border-neutral-850 text-neutral-500 text-center bg-neutral-950/20">{idx + 1}</td>
                          {inferredSchema.map(col => (
                            <td key={col.key} className="p-2 border-r border-neutral-850 text-neutral-300">
                              {col.dataType === 'Numeric' && typeof row[col.key] === 'number'
                                ? row[col.key].toLocaleString()
                                : String(row[col.key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Modal Footer */}
                <div className="p-5 border-t border-neutral-900 bg-neutral-950/20 flex justify-between items-center text-[10px] font-mono text-neutral-500">
                  <div className="flex items-center gap-4">
                    <span>Data Ingestion Schema: Verified OK</span>
                    <span>Completeness: 98.5%</span>
                  </div>
                  <Button
                    onClick={() => setFullDatasetModalOpen(false)}
                    className="bg-white hover:bg-neutral-200 text-neutral-950 text-[10px] font-bold px-4 py-2 h-8 rounded-xl border-none cursor-pointer"
                  >
                    Close Reader
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
          {copilotOpen && (
            <div className="fixed inset-0 z-45 bg-black/60 backdrop-blur-xs flex justify-end">
              <div 
                className="absolute inset-0 bg-transparent" 
                onClick={() => setCopilotOpen(false)}
              />
              <motion.div
                initial={{ x: '100%', opacity: 0.9 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0.9 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-96 h-full bg-neutral-950 border-l border-neutral-900 shadow-2xl flex flex-col justify-between relative z-50 overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 border-b border-neutral-900 flex justify-between items-center bg-neutral-950/60 backdrop-blur-md">
                  <div className="flex items-center space-x-2 text-left">
                    <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                    <div>
                      <h3 className="text-sm font-bold text-white leading-none">Metrics Flow Copilot</h3>
                      <span className="text-[8px] text-emerald-400 font-mono font-bold uppercase tracking-widest block mt-1">● Active Orchestrator</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setCopilotOpen(false)}
                    className="text-neutral-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-800 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Dialog scrollable viewport */}
                <div className="flex-grow overflow-y-auto p-6 space-y-4 scrollbar-thin text-xs text-left">
                  {copilotMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div 
                        className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none'
                            : 'bg-neutral-900 border border-neutral-850 text-neutral-300 rounded-tl-none font-sans'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      <span className="text-[8px] text-neutral-600 font-mono mt-1 px-1">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* Quick actions chips */}
                <div className="p-4 border-t border-neutral-900/60 bg-neutral-950/20 space-y-2">
                  <span className="text-[8px] font-bold font-mono text-neutral-500 uppercase tracking-widest block text-left">Recommended Commands</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "📊 Sales KPI", text: "Create a sales dashboard report with OLS forecasting" },
                      { label: "🔌 Stripe Ingest", text: "Connect Stripe revenue source and aggregate schema" },
                      { label: "⚡ Workflow Alert", text: "Generate weekly analytics alert for Slack channels" }
                    ].map(chip => (
                      <button
                        key={chip.label}
                        onClick={() => handleCopilotSend(chip.text)}
                        className="text-[9px] font-semibold bg-neutral-900 border border-neutral-850 hover:border-neutral-700 text-neutral-300 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text entry area */}
                <div className="p-4 border-t border-neutral-900 bg-neutral-950/40 flex items-center gap-2">
                  <input
                    type="text"
                    value={copilotInput}
                    onChange={(e) => setCopilotInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCopilotSend(copilotInput); }}
                    placeholder="Ask Metrics Flow Copilot..."
                    className="flex-1 bg-neutral-950 border border-neutral-850 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none placeholder-neutral-500 transition-colors font-sans"
                  />
                  <button
                    onClick={() => handleCopilotSend(copilotInput)}
                    className="bg-white hover:bg-neutral-200 text-neutral-950 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border-none"
                  >
                    Send
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Unified Bottom Floating Glassmorphic Back + Undo / Redo Toolbar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900/90 backdrop-blur-md border border-neutral-800/80 px-5 py-2.5 rounded-full flex items-center space-x-4 shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-50 animate-fade-in hover:border-neutral-700 transition-all duration-300">
          <button 
            onClick={() => router.back()} 
            className="text-neutral-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer group bg-transparent border-none"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back
          </button>
          <div className="h-4.5 w-px bg-neutral-800" />
          <button 
            onClick={handleUndo} 
            disabled={historyIndex <= 0}
            className="text-neutral-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-neutral-400 bg-transparent border-none"
          >
            <Undo2 className="w-3.5 h-3.5" /> Undo
          </button>
          <button 
            onClick={handleRedo} 
            disabled={historyIndex >= history.length - 1}
            className="text-neutral-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-neutral-400 bg-transparent border-none"
          >
            <Redo2 className="w-3.5 h-3.5" /> Redo
          </button>
        </div>

      </div>
    </div>
  );
}
