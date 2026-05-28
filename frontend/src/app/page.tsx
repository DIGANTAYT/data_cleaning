'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Database, Sparkles, LineChart, BrainCircuit, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

export default function LandingPage() {
  const router = useRouter();

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
        <div className="space-x-4">
          <Button variant="ghost" className="text-neutral-300 hover:text-white" onClick={() => router.push('/login')}>
            Sign In
          </Button>
          <Button className="bg-white text-black hover:bg-neutral-200 shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all" onClick={() => router.push('/register')}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 mt-20 mb-32">
        
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[100px] -z-10 pointer-events-none translate-x-20" />

        <div className="inline-flex items-center space-x-2 bg-neutral-900/50 border border-neutral-800 backdrop-blur-md rounded-full px-4 py-1.5 mb-8">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-neutral-300 font-medium">The Next-Gen Analytics Copilot</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-500">
          Turn messy data into <br className="hidden md:block"/> business impact.
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-neutral-400 max-w-2xl font-light">
          Upload any dataset. Our AI engine automatically detects anomalies, cleans your data, and generates actionable dashboards and ML predictions in seconds.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button 
            className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-lg shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all flex items-center group"
            onClick={() => router.push('/register')}
          >
            Start Analyzing Free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full text-left">
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
      </main>

      {/* Professional Footer */}
      <Footer />
    </div>
  );
}
