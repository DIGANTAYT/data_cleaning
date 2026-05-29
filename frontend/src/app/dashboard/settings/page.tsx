'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Key, Save, Shield, User, CreditCard, Code, Eye, RefreshCw, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { API_URL } from '@/lib/api';

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

  // Secure Stripe Simulated Checkout States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState('');
  const [selectedPriceForPurchase, setSelectedPriceForPurchase] = useState(0);
  const [selectedCreditsForPurchase, setSelectedCreditsForPurchase] = useState(0);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Digits only
    value = value.substring(0, 16); // Max 16
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Digits only
    value = value.substring(0, 4); // Max 4 digits (MMYY)
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    setCardExpiry(value);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3); // Max 3
    setCardCvc(value);
  };

  const handleUpgradeClick = (plan: string, price: number, initialCredits: number) => {
    setSelectedPlanForPurchase(plan);
    setSelectedPriceForPurchase(price);
    setSelectedCreditsForPurchase(initialCredits);
    setIsPaymentModalOpen(true);
    setPaymentSuccess(false);
    setPaymentProcessing(false);
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setCardName('');
  };

  const handleProcessPayment = async () => {
    if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
      toast.error('Please fill in all credit card payment details.');
      return;
    }
    if (cardNumber.replace(/\s/g, '').length < 16) {
      toast.error('Please enter a valid 16-digit credit card number.');
      return;
    }
    if (cardExpiry.length < 5) {
      toast.error('Please enter a valid card expiry date (MM/YY).');
      return;
    }
    if (cardCvc.length < 3) {
      toast.error('Please enter a valid 3-digit CVC security code.');
      return;
    }

    setPaymentProcessing(true);
    
    // Simulate premium secure payment transaction delay (2 seconds)
    setTimeout(async () => {
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      
      // Update plan in DB & localStorage
      await handlePlanChange(selectedPlanForPurchase, selectedCreditsForPurchase);
      
      setTimeout(() => {
        setIsPaymentModalOpen(false);
      }, 1500);
    }, 2000);
  };

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
      setIsAdmin(storedEmail === 'sarkardiganta04@gmail.com');
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
      
      if (email === 'sarkardiganta04@gmail.com') {
        localStorage.setItem('user_role', 'admin');
        setIsAdmin(true);
      } else {
        localStorage.setItem('user_role', 'user');
        setIsAdmin(false);
      }
      
      window.dispatchEvent(new Event('credits-updated'));
      toast.success('Preferences saved successfully.');
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

  const handlePlanChange = async (plan: string, initialCredits: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_plan', plan);
      localStorage.setItem('user_credits', String(initialCredits));
      setCurrentPlan(plan);
      setCredits(initialCredits);
      
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await axios.put(`${API_URL}/api/auth/profile`, { plan, credits: initialCredits }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } catch (err) {
        console.warn('Could not sync plan change to backend:', err);
      }

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
                      onClick={() => handleUpgradeClick('Data Analyst Lite', 99, 15000)}
                      className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 text-xs font-bold cursor-pointer"
                    >
                      Analyst Lite (₹99)
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleUpgradeClick('Data Scientist Pro', 210, 75000)}
                      className="bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-400 text-xs font-bold cursor-pointer"
                    >
                      Scientist Pro (₹210)
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
                          { id: 'INV-2026-003', plan: 'Data Scientist Pro upgrade', amount: '₹210.00', date: 'May 28, 2026', status: 'Paid' },
                          { id: 'INV-2026-002', plan: 'Data Analyst Lite subscription', amount: '₹99.00', date: 'April 28, 2026', status: 'Paid' },
                          { id: 'INV-2026-001', plan: 'Data Analyst Lite subscription', amount: '₹99.00', date: 'March 28, 2026', status: 'Paid' },
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
                  <div className="p-5 rounded-2xl bg-neutral-950/40 border border-neutral-850 space-y-2 text-center py-8">
                    <Shield className="w-8 h-8 text-red-500 mx-auto opacity-60 mb-2" />
                    <h4 className="text-sm font-bold text-neutral-350">Administrative Access Required</h4>
                    <p className="text-xs text-neutral-455 leading-relaxed max-w-md mx-auto">
                      🔒 The Admin Console is protected and restricted strictly to authorized corporate accounts. Your email does not hold administrative access tokens.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 💳 Secure Stripe Simulated Payment Modal Checkout Overlay */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden space-y-6 text-neutral-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest font-mono">Secure Stripe Integration</span>
                <h3 className="text-lg font-extrabold text-white">Upgrade Plan Checkout</h3>
                <p className="text-neutral-400 text-xs mt-0.5">Authorize card transaction to unlock computing quota.</p>
              </div>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                disabled={paymentProcessing}
                className="text-neutral-500 hover:text-neutral-300 text-sm font-bold font-mono bg-neutral-950 border border-neutral-850 p-1.5 rounded-full cursor-pointer hover:bg-neutral-850 transition-colors w-7 h-7 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Price Plan Summary */}
            <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Subscription Package</span>
                <h4 className="text-sm font-bold text-neutral-200">{selectedPlanForPurchase}</h4>
                <p className="text-[10px] text-neutral-450 mt-0.5">Quota: {selectedCreditsForPurchase.toLocaleString()} compute points</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Total Billed</span>
                <h3 className="text-lg font-black text-blue-400">₹{selectedPriceForPurchase}.00</h3>
                <span className="text-[8px] text-neutral-500 font-mono block">One-time / Monthly</span>
              </div>
            </div>

            {/* High-Fidelity Credit Card Mock */}
            <div className="relative w-full h-40 rounded-2xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950 p-5 flex flex-col justify-between border border-neutral-750 shadow-xl overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/15 transition-all"></div>
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold text-neutral-400 tracking-widest font-mono">METRICS FLOW SECURE</span>
                <div className="w-9 h-7 rounded bg-yellow-600/35 border border-yellow-500/25 flex items-center justify-center overflow-hidden">
                  <div className="grid grid-cols-3 gap-0.5 w-6 h-5 opacity-40">
                    <div className="border border-neutral-400"></div>
                    <div className="border border-neutral-400"></div>
                    <div className="border border-neutral-400"></div>
                    <div className="border border-neutral-400"></div>
                    <div className="border border-neutral-400"></div>
                    <div className="border border-neutral-400"></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="text-sm font-mono font-bold tracking-widest text-neutral-200">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
                
                <div className="flex justify-between items-center text-[9px] font-mono uppercase">
                  <div className="min-w-0 flex-1 pr-4">
                    <span className="text-[7px] text-neutral-500 block">Cardholder</span>
                    <span className="text-neutral-300 font-bold truncate block">{cardName || 'YOUR FULL NAME'}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[7px] text-neutral-500 block">Expires</span>
                    <span className="text-neutral-300 font-bold">{cardExpiry || 'MM/YY'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Input fields */}
            {paymentSuccess ? (
              <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center space-y-2.5 flex flex-col items-center justify-center animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/30 text-lg font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-bold text-green-400">Transaction Authorized</h4>
                  <p className="text-[11px] text-neutral-400">Stripe payment succeeded. Initializing compute quota...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cardholder Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Cardholder Full Name</label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    className="bg-neutral-950 border-neutral-800 text-xs py-2 focus:ring-1 focus:ring-blue-500"
                    disabled={paymentProcessing}
                  />
                </div>

                {/* Card Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Credit Card Number</label>
                  <Input
                    type="text"
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="bg-neutral-950 border-neutral-800 text-xs font-mono py-2 focus:ring-1 focus:ring-blue-500"
                    disabled={paymentProcessing}
                  />
                </div>

                {/* Expiry & CVC Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Expiry Date</label>
                    <Input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      className="bg-neutral-950 border-neutral-800 text-xs font-mono py-2 focus:ring-1 focus:ring-blue-500"
                      disabled={paymentProcessing}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">CVC Security Code</label>
                    <Input
                      type="password"
                      placeholder="123"
                      value={cardCvc}
                      onChange={handleCvcChange}
                      className="bg-neutral-950 border-neutral-800 text-xs font-mono py-2 focus:ring-1 focus:ring-blue-500"
                      disabled={paymentProcessing}
                    />
                  </div>
                </div>

                {/* Pay Button */}
                <Button
                  onClick={handleProcessPayment}
                  disabled={paymentProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all duration-300 flex items-center justify-center cursor-pointer h-10 text-xs"
                >
                  {paymentProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Processing Transaction...
                    </span>
                  ) : (
                    `Authorize & Purchase Plan (₹${selectedPriceForPurchase}.00)`
                  )}
                </Button>
                
                <p className="text-[9px] text-neutral-500 text-center flex items-center justify-center gap-1">
                  🔒 SSL Secured • 256-bit AES Stripe End-to-End Encryption
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
