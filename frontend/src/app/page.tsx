'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Database, Sparkles, LineChart, BrainCircuit, ArrowRight, Check, Shield, Lock, Server, Key, ArrowLeft, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [billingInterval, setBillingInterval] = React.useState<'monthly' | 'annually'>('monthly');

  // State History for Undo / Redo
  const [history, setHistory] = React.useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const isApplyingHistoryRef = React.useRef(false);

  const saveStateToHistory = (interval: 'monthly' | 'annually') => {
    if (isApplyingHistoryRef.current) return;
    setHistory(prev => {
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, interval];
    });
    setHistoryIndex(prev => prev + 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      isApplyingHistoryRef.current = true;
      const targetIndex = historyIndex - 1;
      const interval = history[targetIndex];
      setBillingInterval(interval);
      setHistoryIndex(targetIndex);
      isApplyingHistoryRef.current = false;
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isApplyingHistoryRef.current = true;
      const targetIndex = historyIndex + 1;
      const interval = history[targetIndex];
      setBillingInterval(interval);
      setHistoryIndex(targetIndex);
      isApplyingHistoryRef.current = false;
    }
  };

  React.useEffect(() => {
    if (historyIndex === -1 || history[historyIndex] !== billingInterval) {
      saveStateToHistory(billingInterval);
    }
  }, [billingInterval]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_credits');
    localStorage.removeItem('user_plan');
    setIsLoggedIn(false);
    router.push('/');
  };

  const handlePlanSelect = (planName: string, initialCredits: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_plan', planName);
      localStorage.setItem('user_credits', String(initialCredits));
      window.dispatchEvent(new Event('credits-updated'));
    }
    router.push(isLoggedIn ? '/dashboard' : '/register');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col overflow-x-hidden selection:bg-blue-500/30">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full relative z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <Database className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Metrics Flow</span>
        </div>
        
        {isLoggedIn ? (
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-neutral-300 hover:text-white" onClick={handleSignOut}>
              Sign Out
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-x-4">
            <Button variant="ghost" className="text-neutral-300 hover:text-white" onClick={() => router.push('/login')}>
              Sign In
            </Button>
            <Button className="bg-white text-black hover:bg-neutral-200 shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all" onClick={() => router.push('/register')}>
              Get Started
            </Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-8 py-16 md:py-24 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
        
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[100px] -z-10 pointer-events-none translate-x-20" />

        {/* Left Column: Premium Left-Aligned Text Content */}
        <div className="flex-1 text-left space-y-6 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-neutral-900/50 border border-neutral-800 backdrop-blur-md rounded-full px-4 py-1.5 w-fit">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-neutral-300 font-medium font-sans">The Next-Gen Analytics Copilot</span>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-1.5 bg-neutral-900/60 border border-neutral-850 backdrop-blur-md rounded-full px-3.5 py-1.5 text-xs font-semibold text-neutral-300 shadow-md">
              <span>⚡</span> AI Data Cleaning
            </span>
            <span className="inline-flex items-center gap-1.5 bg-neutral-900/60 border border-neutral-850 backdrop-blur-md rounded-full px-3.5 py-1.5 text-xs font-semibold text-neutral-300 shadow-md">
              <span>📊</span> Auto Dashboard Builder
            </span>
            <span className="inline-flex items-center gap-1.5 bg-neutral-900/60 border border-neutral-850 backdrop-blur-md rounded-full px-3.5 py-1.5 text-xs font-semibold text-neutral-300 shadow-md">
              <span>🧠</span> Insights & Predictions
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-400 leading-tight">
            Turn messy data <br className="hidden sm:block"/> into business impact.
          </h1>
          
          <p className="text-md sm:text-lg text-neutral-400 font-light leading-relaxed">
            Upload any dataset. Our AI engine automatically detects anomalies, cleans your data, and generates actionable dashboards and ML predictions in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            {isLoggedIn ? (
              <Button 
                className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-md shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center group cursor-pointer"
                onClick={() => router.push('/dashboard')}
              >
                Enter Studio Dashboard
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button 
                className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-md shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center group cursor-pointer"
                onClick={() => router.push('/register')}
              >
                Start Analyzing Free
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: Premium High-Fidelity Glassmorphic Mockup */}
        <div className="flex-1 w-full max-w-lg relative group">
          {/* Subtle accent glows behind mockup */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none -z-10 group-hover:bg-blue-500/15 transition-all duration-300" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[60px] pointer-events-none -z-10 translate-x-10 translate-y-10 group-hover:bg-purple-500/15 transition-all duration-300" />

          {/* SaaS Interface Card Container */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-neutral-700/60">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                  <Database className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-bold text-neutral-200 font-mono">active_dataset_profile.csv</span>
              </div>
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded text-emerald-400 font-mono font-bold uppercase tracking-wider">
                Active Profile
              </span>
            </div>

            <div className="space-y-4">
              {/* Quality Index KPI Row */}
              <div className="flex justify-between items-center bg-neutral-950/40 p-3 rounded-lg border border-neutral-850">
                <div>
                  <span className="text-[9px] text-neutral-500 uppercase font-mono block">Data Health Score</span>
                  <span className="text-lg font-black text-white">94.2%</span>
                </div>
                <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold font-mono">Grade A</span>
              </div>

              {/* Mini Diagnostic List */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-neutral-400">
                  <span className="text-[10px] text-neutral-500">• Total Records</span>
                  <span className="text-neutral-200">12,504</span>
                </div>
                <div className="flex justify-between items-center text-neutral-400">
                  <span className="text-[10px] text-neutral-500">• Missing Values</span>
                  <span className="text-emerald-400 font-bold">0 Cleaned</span>
                </div>
                <div className="flex justify-between items-center text-neutral-400">
                  <span className="text-[10px] text-neutral-500">• Outliers Isolated</span>
                  <span className="text-yellow-400">14 (IQR Bounds)</span>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
                  <span>CLEANING PROGRESS</span>
                  <span className="text-blue-400 font-bold">100%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-900">
                  <div className="h-full bg-blue-600 rounded-full w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Floated overlapping element to show AI Copilot in action */}
          <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-850 p-4 rounded-xl shadow-2xl flex items-center space-x-3 max-w-[210px] hover:scale-102 transition-transform duration-300">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <span className="text-[8px] text-neutral-500 uppercase font-mono block">AI Copilot</span>
              <span className="text-[10px] font-bold text-neutral-200 leading-tight block">Dataset cleaned & parsed in 0.8s!</span>
            </div>
          </div>
        </div>

      </main>

      {/* Feature Grid & Footer wrapper */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-8 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left border-t border-neutral-900/60 pt-16">
          <div className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-2xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">1-Click Auto Clean</h3>
            <p className="text-neutral-400 leading-relaxed">Instantly resolve missing values, outliers, and duplicates using advanced Pandas interpolation.</p>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-2xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
              <LineChart className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Instant Dashboards</h3>
            <p className="text-neutral-400 leading-relaxed">Watch as charts and KPI cards materialize automatically, visualizing your dataset's distribution and trends.</p>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-2xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center mb-6">
              <BrainCircuit className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Auto ML Predictions</h3>
            <p className="text-neutral-400 leading-relaxed">Train Random Forest models entirely in the background. Uncover the features driving your KPIs.</p>
          </div>
        </div>
      </div>

      {/* Trust & Security Section */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-8 mb-32 border-t border-neutral-900/60 pt-16 text-center">
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold text-blue-400">
            <Shield className="w-3.5 h-3.5 mr-1 animate-pulse" />
            Enterprise-Grade Security Protection
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-400">
            Built for Secure Analytics
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto text-sm leading-relaxed">
            Your data confidentiality is our highest priority. We process datasets entirely within secure sandbox environments.
          </p>
        </div>

        {/* 3 Security Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-neutral-900/40 border border-neutral-850 p-8 rounded-2xl backdrop-blur-sm text-left hover:border-blue-500/20 transition-all duration-300 group">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Lock className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Secure Uploads</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">Encrypted dataset processing.</p>
          </div>

          <div className="bg-neutral-900/40 border border-neutral-850 p-8 rounded-2xl backdrop-blur-sm text-left hover:border-emerald-500/20 transition-all duration-300 group">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Key className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Private Data</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">Your datasets remain isolated.</p>
          </div>

          <div className="bg-neutral-900/40 border border-neutral-850 p-8 rounded-2xl backdrop-blur-sm text-left hover:border-purple-500/20 transition-all duration-300 group">
            <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Server className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Modern Infrastructure</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">Next.js • FastAPI • PostgreSQL • Docker</p>
          </div>
        </div>

        {/* Small Trust Bar */}
        <div className="max-w-4xl mx-auto w-full bg-neutral-900/20 border border-neutral-850/60 rounded-full px-6 py-4 flex flex-wrap items-center justify-center gap-6 md:gap-12 text-xs backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
              <Check className="w-3 h-3 text-emerald-400 font-bold stroke-[4]" />
            </div>
            <span className="font-semibold text-neutral-300">No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
              <Check className="w-3 h-3 text-emerald-400 font-bold stroke-[4]" />
            </div>
            <span className="font-semibold text-neutral-300">Secure Authentication</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
              <Check className="w-3 h-3 text-emerald-400 font-bold stroke-[4]" />
            </div>
            <span className="font-semibold text-neutral-300">Free Developer Sandbox</span>
          </div>
        </div>
      </div>

      {/* Premium Pricing Section */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-8 mb-32 border-t border-neutral-900/60 pt-16 text-center">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-400">
            Simple, Role-Based Monthly Pricing
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto text-sm leading-relaxed">
            Choose the plan that matches your role. Enjoy unlimited row processing limits and rich AI credit balances renewed automatically every 30 days.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Developer Sandbox (Free) */}
          <div className="bg-neutral-900/30 border border-neutral-805 p-8 rounded-2xl backdrop-blur-md flex flex-col justify-between hover:border-neutral-800 transition-colors relative overflow-hidden group">
            <div className="space-y-6">
              <div className="text-left">
                <span className="text-[10px] bg-neutral-800 border border-neutral-700 text-neutral-300 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Tier 1: Free
                </span>
                <h3 className="text-xl font-bold text-white mt-3">Developer Sandbox</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">Perfect for learning, personal projects, and initial dataset exploration.</p>
              </div>

              <div className="text-left flex items-baseline">
                <span className="text-3xl font-extrabold text-white">₹0</span>
                <span className="text-neutral-500 text-xs ml-2 font-mono">/ month</span>
              </div>

              <ul className="text-left space-y-3.5 text-xs border-t border-neutral-850 pt-6">
                {[
                  "Unlimited dataset row capacity",
                  "500 AI compute credits / month",
                  "Plan renewed automatically every 30 days",
                  "Standard 1-Click Pandas cleaning",
                  "Local CSV, JSON, and XLSX uploads",
                  "Interactive custom visual builder (Top 5/10 filter)"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start text-neutral-400 leading-normal">
                    <Check className="w-4 h-4 text-neutral-500 mr-2.5 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <Button
                onClick={() => handlePlanSelect('Developer Sandbox', 500)}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/50 rounded-xl py-5 shadow-lg transition-all"
              >
                {isLoggedIn ? 'Go to Studio Sandbox' : 'Start Sandbox Free'}
              </Button>
            </div>
          </div>

          {/* Card 2: Data Analyst Lite (₹99/mo) - Featured Card */}
          <div className="bg-neutral-900/50 border border-blue-605/40 p-8 rounded-2xl backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.15)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-2xl pointer-events-none -z-10 group-hover:bg-blue-500/10 transition-all duration-300"></div>
            
            <div className="space-y-6">
              <div className="text-left flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-blue-505/15 border border-blue-500/30 text-blue-400 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Tier 2: Analyst
                  </span>
                  <h3 className="text-xl font-bold text-white mt-3">Data Analyst Lite</h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">Tailored for professional business analysts and growing startups.</p>
                </div>
              </div>

              <div className="text-left flex items-baseline">
                <span className="text-4xl font-black text-white">
                  ₹99
                </span>
                <span className="text-neutral-400 text-xs ml-2 font-mono">/ month</span>
              </div>

              <ul className="text-left space-y-3.5 text-xs border-t border-neutral-850 pt-6">
                {[
                  "Unlimited dataset row capacity",
                  "15,000 AI compute credits / month",
                  "Plan renewed automatically every 30 days",
                  "Advanced IQR outlier removals & imputation",
                  "Direct PostgreSQL & Supabase sync connect",
                  "Custom analytical customizer themes"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start text-neutral-300 leading-normal">
                    <Check className="w-4 h-4 text-blue-400 mr-2.5 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <Button
                onClick={() => handlePlanSelect('Data Analyst Lite', 15000)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-5 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all font-semibold"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Upgrade to Analyst Lite'}
              </Button>
            </div>
          </div>

          {/* Card 3: Data Scientist Pro (₹210/mo) */}
          <div className="bg-neutral-900/30 border border-neutral-805 p-8 rounded-2xl backdrop-blur-md flex flex-col justify-between hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/5 rounded-full blur-2xl pointer-events-none -z-10 group-hover:bg-purple-500/10 transition-all duration-300"></div>

            <div className="space-y-6">
              <div className="text-left flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-purple-505/15 border border-purple-500/30 text-purple-400 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Tier 3: Scientist
                  </span>
                  <h3 className="text-xl font-bold text-white mt-3">Data Scientist Pro</h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">For professional data scientists needing complex AutoML clusters.</p>
                </div>
              </div>

              <div className="text-left flex items-baseline">
                <span className="text-4xl font-black text-white">
                  ₹210
                </span>
                <span className="text-neutral-500 text-xs ml-2 font-mono">/ month</span>
              </div>

              <ul className="text-left space-y-3.5 text-xs border-t border-neutral-850 pt-6">
                {[
                  "Unlimited dataset row capacity",
                  "75,000 AI compute credits / month",
                  "Plan renewed automatically every 30 days",
                  "Full AutoML Random Forest prediction engine",
                  "Advanced DB Sync: Snowflake, BigQuery, MySQL",
                  "Dedicated 1-Hour SLA priority queue support"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start text-neutral-400 leading-normal">
                    <Check className="w-4 h-4 text-purple-400 mr-2.5 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <Button
                onClick={() => handlePlanSelect('Data Scientist Pro', 75000)}
                className="w-full bg-neutral-800 hover:bg-purple-600/20 hover:text-purple-300 text-neutral-200 border border-neutral-700/50 hover:border-purple-500/40 rounded-xl py-5 shadow-lg transition-all"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Upgrade to Scientist Pro'}
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Professional Footer */}
      <Footer />

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
  );
}
