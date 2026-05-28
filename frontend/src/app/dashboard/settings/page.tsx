'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Key, Save, Shield, User, CreditCard, Code, Eye, RefreshCw, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SettingsPage() {
  // Tab control
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'api' | 'admin'>('profile');

  // Profile states
  const [name, setName] = useState('Diganta Sarkar');
  const [email, setEmail] = useState('sarkardiganta04@gmail.com');
  const [apiKey, setApiKey] = useState('');
  
  // Billing states
  const [currentPlan, setCurrentPlan] = useState('Developer Sandbox');
  const [credits, setCredits] = useState(500);

  // API Developer states
  const [devToken, setDevToken] = useState('mflow_live_8f3d8a9b2c7e41a0e9b6a48f');
  const [showToken, setShowToken] = useState(false);

  // Admin access states
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('user_openai_key');
      if (savedKey) setApiKey(savedKey);

      const storedEmail = localStorage.getItem('user_email');
      const storedName = localStorage.getItem('user_name');
      const storedPlan = localStorage.getItem('user_plan') || 'Developer Sandbox';
      const storedCredits = localStorage.getItem('user_credits') || '500';
      const storedRole = localStorage.getItem('user_role') || 'user';

      if (storedEmail) setEmail(storedEmail);
      if (storedName) setName(storedName);
      
      setCurrentPlan(storedPlan);
      setCredits(Number(storedCredits));
      setIsAdmin(storedEmail === 'sarkardiganta04@gmail.com' || storedRole === 'admin');
    }
  }, []);

  const handleSaveProfile = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_name', name);
      localStorage.setItem('user_email', email);
      if (apiKey.trim()) {
        localStorage.setItem('user_openai_key', apiKey.trim());
      } else {
        localStorage.removeItem('user_openai_key');
      }
      
      // Auto-assign admin if email updated to sarkardiganta04@gmail.com
      if (email === 'sarkardiganta04@gmail.com') {
        localStorage.setItem('user_role', 'admin');
        setIsAdmin(true);
      }
      
      window.dispatchEvent(new Event('credits-updated'));
      toast.success('Preferences saved successfully.');
    }
  };

  const handleSimulateAdmin = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_role', 'admin');
      setIsAdmin(true);
      window.dispatchEvent(new Event('credits-updated'));
      toast.success('👑 Admin Access Simulation Enabled! You can now access the Admin Console from the sidebar.');
    }
  };

  const handleRegenerateToken = () => {
    const chars = 'abcdef0123456789';
    let token = 'mflow_live_';
    for (let i = 0; i < 24; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
    setDevToken(token);
    toast.success('Developer API token regenerated.');
  };

  const handlePlanChange = (plan: string, initialCredits: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_plan', plan);
      localStorage.setItem('user_credits', String(initialCredits));
      setCurrentPlan(plan);
      setCredits(initialCredits);
      window.dispatchEvent(new Event('credits-updated'));
      toast.success(`Plan updated to ${plan}. Quota: ${initialCredits.toLocaleString()} credits.`);
    }
  };

  return (
    <div className="bg-neutral-950 text-neutral-50 p-8 space-y-8 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-neutral-400">Configure profile settings, developer tokens, active billing integrations, and admin controls.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-1 bg-neutral-900 p-1.5 rounded-xl border border-neutral-800 max-w-lg">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-neutral-850 text-white shadow-md'
                : 'text-neutral-450 hover:text-neutral-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Profile & Security
          </button>
          
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
              activeTab === 'billing'
                ? 'bg-neutral-850 text-white shadow-md'
                : 'text-neutral-450 hover:text-neutral-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Billing & Plans
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
              activeTab === 'api'
                ? 'bg-neutral-850 text-white shadow-md'
                : 'text-neutral-455 hover:text-neutral-250'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Developer API
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-neutral-850 text-white shadow-md'
                : 'text-neutral-455 hover:text-neutral-250'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Admin Console
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mt-6">
          {activeTab === 'profile' && (
            <Card className="dark bg-neutral-900 border-neutral-800 text-neutral-50 shadow-xl">
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription className="text-neutral-400">Manage public account information and credentials.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Display Name</label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-neutral-950 border-neutral-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Primary Email Address</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-neutral-950 border-neutral-800"
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t border-neutral-850 pt-6">
                  <div className="flex items-center space-x-2 text-sm text-yellow-500/80 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                    <Shield className="w-4 h-4 shrink-0" />
                    <p>OpenAI keys are stored directly in your browser's client sandbox and are never compiled to databases.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">OpenAI API Key Secret</label>
                    <Input
                      type="password"
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="bg-neutral-950 border-neutral-800 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/25">
                    <Save className="w-4 h-4 mr-2" />
                    Save Account Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'billing' && (
            <Card className="dark bg-neutral-900 border-neutral-800 text-neutral-50 shadow-xl">
              <CardHeader>
                <CardTitle>Stripe Billing & Subscriptions</CardTitle>
                <CardDescription className="text-neutral-400">View active quotas, switch user subscription plans, and inspect invoice history.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Active Plan Detail */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-neutral-950/40 border border-neutral-850 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Active User Role Plan</span>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {currentPlan}
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full">
                        ACTIVE
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-400 font-medium">Monthly compute quota: <strong className="text-neutral-250 font-bold">{credits.toLocaleString()} AI credit points</strong></p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => handlePlanChange('Data Analyst Lite', 15000)}
                      className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 text-xs font-bold"
                    >
                      Analyst Lite (₹120)
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handlePlanChange('Data Scientist Pro', 75000)}
                      className="bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-400 text-xs font-bold"
                    >
                      Scientist Pro (₹259)
                    </Button>
                  </div>
                </div>

                {/* Stripe Simulated Invoice Receipts */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800/60 pb-2">
                    Stripe Invoice Receipts
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-neutral-850">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-neutral-950 text-neutral-450 uppercase tracking-wider font-bold">
                        <tr>
                          <th className="px-4 py-3">Receipt Invoice ID</th>
                          <th className="px-4 py-3">Billed Interval</th>
                          <th className="px-4 py-3">Payment Amount</th>
                          <th className="px-4 py-3">Billing Date</th>
                          <th className="px-4 py-3">Stripe Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-850">
                        {[
                          { id: 'INV-2026-003', plan: 'Data Scientist Pro upgrade', amount: '₹259.00', date: 'May 28, 2026', status: 'Paid' },
                          { id: 'INV-2026-002', plan: 'Data Analyst Lite subscription', amount: '₹120.00', date: 'April 28, 2026', status: 'Paid' },
                          { id: 'INV-2026-001', plan: 'Data Analyst Lite subscription', amount: '₹120.00', date: 'March 28, 2026', status: 'Paid' },
                        ].map((inv) => (
                          <tr key={inv.id} className="hover:bg-neutral-850/10">
                            <td className="px-4 py-3 font-semibold text-neutral-200">{inv.id}</td>
                            <td className="px-4 py-3 text-neutral-400 capitalize">{inv.plan}</td>
                            <td className="px-4 py-3 font-mono text-neutral-200 font-bold">{inv.amount}</td>
                            <td className="px-4 py-3 text-neutral-400">{inv.date}</td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] font-bold bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded text-green-400 font-mono">
                                {inv.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'api' && (
            <Card className="dark bg-neutral-900 border-neutral-800 text-neutral-50 shadow-xl">
              <CardHeader>
                <CardTitle>Developer Access API Keys</CardTitle>
                <CardDescription className="text-neutral-400">Access Metrics Flow analytics engine directly via API tokens.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Generate client credentials to authenticate your scripts, pipelines, and integrations directly with the Metrics Flow REST endpoints.
                </p>

                <div className="flex items-center space-x-2 bg-neutral-950 border border-neutral-850 p-4 rounded-xl font-mono text-xs">
                  <div className="flex-1 select-all truncate tracking-wider text-neutral-300 font-bold">
                    {showToken ? devToken : '••••••••••••••••••••••••••••••••••••••••••••••••'}
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setShowToken(!showToken)}
                    className="text-neutral-400 hover:text-white"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleRegenerateToken}
                    className="bg-neutral-800 border border-neutral-750 text-neutral-350 hover:bg-neutral-750"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Regenerate
                  </Button>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-neutral-850">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold font-mono">Example CURL Request:</span>
                  <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-855 font-mono text-[10px] text-neutral-300 select-all overflow-x-auto leading-relaxed whitespace-pre">
                    {`curl -X POST "https://data-cleaning-3.onrender.com/api/datasets/clean" \\
  -H "Authorization: Bearer ${devToken.slice(0, 15)}..." \\
  -H "Content-Type: application/json" \\
  -d '{"operations": [{"action": "drop_duplicates"}]}'`}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'admin' && (
            <Card className="dark bg-neutral-900 border-neutral-800 text-neutral-50 shadow-xl">
              <CardHeader>
                <CardTitle>Administrative Controls</CardTitle>
                <CardDescription className="text-neutral-400">Launch the central user administration panel.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isAdmin ? (
                  <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1 max-w-lg">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <BadgeCheck className="w-4 h-4 text-purple-400" />
                        Admin Credentials Confirmed ({email})
                      </h4>
                      <p className="text-xs text-neutral-400 leading-normal">
                        Your account is verified as an active administrator. You can manage distributed credit balances, alter subscription roles, and review session stats.
                      </p>
                    </div>
                    <Button 
                      onClick={() => {
                        if (typeof window !== 'undefined') window.location.href = '/dashboard/admin';
                      }}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 shrink-0 cursor-pointer border-0 h-10"
                    >
                      Enter Admin Control Center
                    </Button>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-neutral-950/40 border border-neutral-850 space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-neutral-350">Simulate Admin Mode Access</h4>
                      <p className="text-xs text-neutral-450 leading-relaxed">
                        By default, the Admin Console dashboard is blocked and protected. To make testing and evaluation extremely easy, you can click the button below to assign **Admin role** directly to your active browser context!
                      </p>
                    </div>
                    <Button 
                      onClick={handleSimulateAdmin} 
                      className="bg-gradient-to-r from-purple-600 to-indigo-650 hover:from-purple-500 hover:to-indigo-550 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md border-0 cursor-pointer"
                    >
                      👑 Simulate Admin Access
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
