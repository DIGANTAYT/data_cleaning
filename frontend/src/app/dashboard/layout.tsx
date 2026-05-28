'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, LogOut, Database, User, Home } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [credits, setCredits] = useState<number>(500);
  const [plan, setPlan] = useState<string>('Developer Sandbox');

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem('token')) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!mounted) return;
    
    const syncCredits = () => {
      if (typeof window !== 'undefined') {
        const storedCredits = localStorage.getItem('user_credits');
        const storedPlan = localStorage.getItem('user_plan');
        
        if (storedCredits === null) {
          localStorage.setItem('user_credits', '500');
          localStorage.setItem('user_plan', 'Developer Sandbox');
          setCredits(500);
          setPlan('Developer Sandbox');
        } else {
          setCredits(Number(storedCredits));
          setPlan(storedPlan || 'Developer Sandbox');
        }
      }
    };

    syncCredits();

    window.addEventListener('credits-updated', syncCredits);
    window.addEventListener('storage', syncCredits);
    return () => {
      window.removeEventListener('credits-updated', syncCredits);
      window.removeEventListener('storage', syncCredits);
    };
  }, [mounted]);

  if (!mounted) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-neutral-800 bg-neutral-950 flex flex-col hidden md:flex">
        <div 
          onClick={() => router.push('/')}
          className="p-6 flex items-center space-x-2 cursor-pointer hover:opacity-85 transition-opacity"
          title="Back to Landing Page"
        >
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(37,99,235,0.3)]">
            <Database className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Metrics Flow</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => router.push('/')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
          >
            <Home className="w-5 h-5" />
            <span>Home Page</span>
          </button>
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
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between px-8">
          {/* Active Subscription Badge */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-500">PLAN:</span>
            <span className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full border ${
              plan.includes('Scientist') 
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                : plan.includes('Analyst') 
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                  : 'bg-neutral-800 border-neutral-700 text-neutral-450'
            }`}>
              {plan}
            </span>
          </div>

          {/* User Profile & Credits Points Panel */}
          <div className="flex items-center space-x-6">
            {/* Glowing Credits Point Counter */}
            <div className="flex items-center space-x-2 bg-neutral-900 border border-neutral-850 px-3 py-1.5 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">AI Credits:</span>
              <span className="text-xs font-bold font-mono text-white select-none">{credits.toLocaleString()} pts</span>
            </div>

            {/* Account Info */}
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                <User className="w-4 h-4 text-neutral-400" />
              </div>
              <span className="text-sm font-medium text-neutral-300">My Account</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-neutral-950 flex flex-col justify-between min-h-0 pb-16">
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
