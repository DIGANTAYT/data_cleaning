'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Database, Sparkles, LineChart, BrainCircuit, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

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
    setIsLoggedIn(false);
    router.push('/');
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

      {/* Professional Footer */}
      <Footer />
    </div>
  );
}
