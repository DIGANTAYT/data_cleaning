'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, LogOut, Database, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem('token')) {
      router.push('/login');
    }
  }, [router]);

  if (!mounted) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-neutral-800 bg-neutral-950 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
            <Database className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Metrics Flow</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/dashboard' || pathname.startsWith('/dashboard/') ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Datasets</span>
          </button>
          <button 
            onClick={() => router.push('/dashboard/settings')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/dashboard/settings' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'}`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-neutral-800 bg-neutral-950 flex items-center justify-end px-8">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
              <User className="w-4 h-4 text-neutral-400" />
            </div>
            <span className="text-sm font-medium text-neutral-300">My Account</span>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-neutral-950 flex flex-col justify-between">
          <div className="flex-1">
            {children}
          </div>

          {/* Professional Platform Footer */}
          <footer className="border-t border-neutral-800 bg-neutral-950/80 backdrop-blur-md px-8 py-8 mt-12">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand Profile and System Health */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                    <Database className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-md font-bold tracking-tight text-neutral-100">Metrics Flow</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                  Metrics Flow is an enterprise-grade AI data preparation, anomaly detection, and automated prediction platform. Empowering teams to audit, clean, and model datasets in seconds.
                </p>
                <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 font-mono">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span>All Cloud Systems Operational</span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Platform Nodes</h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <button onClick={() => router.push('/dashboard')} className="text-neutral-400 hover:text-white transition-colors cursor-pointer text-left">
                      Datasets Studio
                    </button>
                  </li>
                  <li>
                    <button onClick={() => router.push('/dashboard/settings')} className="text-neutral-400 hover:text-white transition-colors cursor-pointer text-left">
                      System Settings
                    </button>
                  </li>
                  <li>
                    <a href="https://neel1817-ai-python-engine.hf.space" target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                      AI FastAPI Docs
                    </a>
                  </li>
                </ul>
              </div>

              {/* Technical Stack Summary */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Architectural Stack</h4>
                <ul className="space-y-2 text-xs text-neutral-500 font-mono">
                  <li>• Next.js 15 (Tailwind App)</li>
                  <li>• Express.js Backend (Node 22)</li>
                  <li>• FastAPI Engine (Python 3.11)</li>
                  <li>• Supabase Cloud (PostgreSQL 15)</li>
                </ul>
              </div>
            </div>

            {/* Copyright & Info panel */}
            <div className="max-w-6xl mx-auto border-t border-neutral-850 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-neutral-500 font-mono">
              <p>© 2026 Metrics Flow AI Corporation. All Rights Reserved.</p>
              <div className="flex space-x-4 mt-2 md:mt-0">
                <span className="text-neutral-600">v1.2.0 (Stable Production)</span>
                <span className="text-neutral-600">|</span>
                <a href="mailto:support@metricsflow.ai" className="hover:text-neutral-300 transition-colors">Support & Dev API</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
