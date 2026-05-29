'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, LogOut, Database, User, Home, Shield, LifeBuoy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [credits, setCredits] = useState<number>(500);
  const [plan, setPlan] = useState<string>('Developer Sandbox');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('My Account');
  const [userEmail, setUserEmail] = useState<string>('');
  const [showProfileCard, setShowProfileCard] = useState<boolean>(false);

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
        const storedEmail = localStorage.getItem('user_email') || '';
        const activeEmail = storedEmail || 'anonymous';
        const storedName = localStorage.getItem('user_name') || 'My Account';
        
        setIsAdmin(storedEmail === 'sarkardiganta04@gmail.com');
        setUserName(storedName);
        setUserEmail(storedEmail);

        const userCreditsKey = `credits_${activeEmail}`;
        const userPlanKey = `plan_${activeEmail}`;

        // Get the current session-level values
        const sessionCredits = localStorage.getItem('user_credits');
        const sessionPlan = localStorage.getItem('user_plan');

        // Get the user-specific persisted values
        let userPersistedCredits = localStorage.getItem(userCreditsKey);
        let userPersistedPlan = localStorage.getItem(userPlanKey);

        // If the session changed a value, persist it to the user-specific key
        if (sessionCredits !== null && sessionCredits !== userPersistedCredits) {
          localStorage.setItem(userCreditsKey, sessionCredits);
          userPersistedCredits = sessionCredits;
        }
        if (sessionPlan !== null && sessionPlan !== userPersistedPlan) {
          localStorage.setItem(userPlanKey, sessionPlan);
          userPersistedPlan = sessionPlan;
        }

        // If user-specific persisted values don't exist yet, initialize them
        if (userPersistedCredits === null) {
          userPersistedCredits = sessionCredits !== null ? sessionCredits : '500';
          localStorage.setItem(userCreditsKey, userPersistedCredits);
        }
        if (userPersistedPlan === null) {
          userPersistedPlan = sessionPlan !== null ? sessionPlan : 'Developer Sandbox';
          localStorage.setItem(userPlanKey, userPersistedPlan);
        }

        // Synchronize back to session-level for components that read raw keys directly
        localStorage.setItem('user_credits', userPersistedCredits);
        localStorage.setItem('user_plan', userPersistedPlan);

        setCredits(Number(userPersistedCredits));
        setPlan(userPersistedPlan);
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
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_credits');
    localStorage.removeItem('user_plan');
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
          
          <button 
            onClick={() => router.push('/dashboard/help')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/dashboard/help' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'}`}
          >
            <LifeBuoy className="w-5 h-5 text-blue-400" />
            <span>Docs & Support</span>
          </button>

          {isAdmin && (
            <button 
              onClick={() => router.push('/dashboard/admin')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/dashboard/admin' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'}`}
            >
              <Shield className="w-5 h-5 text-purple-400" />
              <span>Admin Console</span>
            </button>
          )}
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
            {isAdmin ? (
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-500">ROLE:</span>
                <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full border bg-gradient-to-r from-red-500/10 via-purple-500/10 to-indigo-500/10 border-red-500/30 text-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.25)]">
                  Admin
                </span>
              </div>
            ) : (
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
            )}
          </div>

          {/* User Profile & Credits Points Panel */}
          <div className="flex items-center space-x-6">
            {/* Glowing Credits Point Counter */}
            <div className="flex items-center space-x-2 bg-neutral-900 border border-neutral-850 px-3 py-1.5 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">AI Credits:</span>
              <span className="text-xs font-bold font-mono text-white select-none">{credits.toLocaleString()} pts</span>
            </div>

            {/* Account Info with Dropdown Card */}
            <div className="relative">
              <div 
                onClick={() => setShowProfileCard(!showProfileCard)}
                className="flex items-center space-x-3 cursor-pointer hover:opacity-85 transition-all select-none"
              >
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                  <User className="w-4 h-4 text-neutral-400" />
                </div>
                <span className="text-sm font-medium text-neutral-350">{userName}</span>
              </div>

              {/* Floating Profile Info Tooltip Card */}
              {showProfileCard && (
                <div className="absolute right-0 mt-3 w-72 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl z-50 backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-250">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3.5">
                    <span className="text-xs font-bold text-white">Active Profile</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowProfileCard(false);
                      }}
                      className="text-neutral-500 hover:text-white text-[10px] uppercase font-mono font-bold cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  
                  <div className="space-y-3 font-sans text-xs" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Name:</span>
                      <span className="font-semibold text-neutral-200">{userName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Email:</span>
                      <span className="font-mono text-neutral-350 truncate max-w-[170px]" title={userEmail}>{userEmail}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500">Plan Status:</span>
                      <span className="font-semibold text-neutral-250 bg-blue-500/10 px-2 py-0.5 rounded text-[10px] text-blue-400 border border-blue-500/20">{plan}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500">System Role:</span>
                      <span className={`font-semibold px-2 py-0.5 rounded text-[10px] border ${
                        isAdmin ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-neutral-800 border-neutral-750 text-neutral-400'
                      }`}>{isAdmin ? 'Admin' : 'User'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">AI Credits:</span>
                      <span className="font-bold text-white font-mono">{credits.toLocaleString()} pts</span>
                    </div>
                  </div>

                  <div className="border-t border-neutral-800 mt-4 pt-3.5 flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowProfileCard(false);
                        router.push('/dashboard/settings');
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                    >
                      Manage Account
                    </Button>
                  </div>
                </div>
              )}
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
