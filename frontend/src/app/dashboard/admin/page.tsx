'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Shield, Users, BadgeCheck, Zap, ToggleLeft, ToggleRight, Plus, ArrowLeft, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';
import { API_URL } from '@/lib/api';

interface SimulatedUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  role: 'admin' | 'user';
  credits: number;
  status: 'active' | 'suspended';
}

export default function AdminPanel() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Simulated database state
  const [users, setUsers] = useState<SimulatedUser[]>([
    { id: '1', name: 'Diganta Sarkar', email: 'sarkardiganta04@gmail.com', plan: 'Data Scientist Pro', role: 'admin', credits: 75000, status: 'active' },
    { id: '2', name: 'Rohan Sen', email: 'rohan@startup.co', plan: 'Data Analyst Lite', role: 'user', credits: 15000, status: 'active' },
    { id: '3', name: 'Ananya Roy', email: 'ananya@datascience.io', plan: 'Data Scientist Pro', role: 'user', credits: 72400, status: 'active' },
    { id: '4', name: 'Kabir Singh', email: 'kabir@student.in', plan: 'Developer Sandbox', role: 'user', credits: 350, status: 'active' },
    { id: '5', name: 'Priya Patel', email: 'priya@enterprise.net', plan: 'Data Scientist Pro', role: 'user', credits: 90000, status: 'active' },
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('user_email') || '';
      const role = localStorage.getItem('user_role') || '';
      
      // Enforce Admin access boundaries
      if (email === 'sarkardiganta04@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    }
  }, []);

  const handleUpdatePlan = async (userId: string, newPlan: string) => {
    let baseCredits = 500;
    if (newPlan === 'Data Scientist Pro') baseCredits = 75000;
    else if (newPlan === 'Data Analyst Lite') baseCredits = 15000;

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        // Sync local storage if editing the logged in admin user
        if (u.email === 'sarkardiganta04@gmail.com') {
          localStorage.setItem('user_plan', newPlan);
          localStorage.setItem('user_credits', String(baseCredits));
          window.dispatchEvent(new Event('credits-updated'));
          
          const token = localStorage.getItem('token');
          if (token) {
            axios.put(`${API_URL}/api/auth/profile`, { plan: newPlan, credits: baseCredits }, {
              headers: { Authorization: `Bearer ${token}` }
            }).catch(err => console.warn('Could not sync admin plan change to database:', err));
          }
        }
        return { ...u, plan: newPlan, credits: baseCredits };
      }
      return u;
    }));
    toast.success('User plan and credits updated successfully');
  };

  const handleUpdateRole = (userId: string, newRole: 'admin' | 'user') => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        if (u.email === 'sarkardiganta04@gmail.com') {
          localStorage.setItem('user_role', newRole);
        }
        return { ...u, role: newRole };
      }
      return u;
    }));
    toast.success(`User role set to ${newRole}`);
  };

  const handleGrantCredits = async (userId: string, amount: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updatedCredits = u.credits + amount;
        if (u.email === 'sarkardiganta04@gmail.com') {
          localStorage.setItem('user_credits', String(updatedCredits));
          window.dispatchEvent(new Event('credits-updated'));
          
          const token = localStorage.getItem('token');
          if (token) {
            axios.put(`${API_URL}/api/auth/profile`, { credits: updatedCredits }, {
              headers: { Authorization: `Bearer ${token}` }
            }).catch(err => console.warn('Could not sync admin granted credits to database:', err));
          }
        }
        return { ...u, credits: updatedCredits };
      }
      return u;
    }));
    toast.success(`Granted +${amount.toLocaleString()} credits to user.`);
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
    toast.info('User status modified');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background glow grids */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none translate-x-20" />

        <div className="bg-neutral-900/60 border border-neutral-800 p-8 rounded-2xl backdrop-blur-md shadow-2xl max-w-sm w-full space-y-6 text-center relative z-10">
          <div className="relative w-20 h-20 mx-auto">
            {/* Pulsing neon rings */}
            <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute -inset-2 rounded-full border border-t-transparent border-r-indigo-500 border-b-transparent border-l-transparent animate-spin duration-1000 opacity-60" />
            <div className="absolute inset-2 bg-neutral-950 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white tracking-wide">Loading Admin Panel</h3>
            <p className="text-xs text-neutral-400 font-mono animate-pulse">Establishing secure handshake...</p>
          </div>
          
          {/* Faux load stages indicator */}
          <div className="w-full bg-neutral-950 h-1 rounded-full overflow-hidden border border-neutral-900">
            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-pulse" style={{ width: '80%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-neutral-950 px-4 text-center">
        <Card className="w-full max-w-md dark bg-neutral-900 border-red-500/20 text-neutral-50 p-6 shadow-[0_0_50px_rgba(239,68,68,0.05)]">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-2">Access Denied</h2>
          <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
            🔒 This Console is exclusive to metrics administrators. Your account does not possess the permissions required to view user profiles.
          </p>
          <Button onClick={() => router.push('/dashboard')} className="w-full bg-neutral-800 hover:bg-neutral-700">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Studio
          </Button>
        </Card>
      </div>
    );
  }

  // Filter query
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-neutral-950 text-neutral-50 p-8 space-y-8 min-h-screen">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-purple-400" />
            Admin Control Center
          </h1>
          <p className="text-neutral-400">Manage Metrics Flow active users, quotas, and subscription roles.</p>
        </div>
        <Button onClick={() => router.push('/dashboard')} className="bg-neutral-900 border border-neutral-800 text-neutral-350 hover:bg-neutral-850">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
      </div>

      {/* Analytics KPI Panels */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        <Card className="dark bg-neutral-900 border-neutral-800 text-neutral-50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block">Total Accounts</span>
              <span className="text-2xl font-black">{users.length} active</span>
            </div>
          </CardContent>
        </Card>

        <Card className="dark bg-neutral-900 border-neutral-800 text-neutral-50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <BadgeCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block">Platform MRR</span>
              <span className="text-2xl font-black">₹48,250</span>
            </div>
          </CardContent>
        </Card>

        <Card className="dark bg-neutral-900 border-neutral-800 text-neutral-50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block">Credits Granted</span>
              <span className="text-2xl font-black">262,750 pts</span>
            </div>
          </CardContent>
        </Card>

        <Card className="dark bg-neutral-900 border-neutral-800 text-neutral-50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block">Active Pipelines</span>
              <span className="text-2xl font-black">8 online</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Section */}
      <Card className="dark bg-neutral-900 border-neutral-800 text-neutral-50 max-w-6xl mx-auto overflow-hidden">
        <CardHeader className="border-b border-neutral-850 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>User Administration</CardTitle>
            <CardDescription className="text-neutral-400">View profile plans, roles, allocate credits, and manage user statuses.</CardDescription>
          </div>
          <div className="max-w-xs w-full">
            <Input
              type="text"
              placeholder="Filter by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-950 border-neutral-805 text-xs text-neutral-200"
            />
          </div>
        </CardHeader>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs text-neutral-450 bg-neutral-950 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-3 font-semibold">User Details</th>
                <th className="px-6 py-3 font-semibold">Active Plan</th>
                <th className="px-6 py-3 font-semibold">System Role</th>
                <th className="px-6 py-3 font-semibold text-center">Credit Points</th>
                <th className="px-6 py-3 font-semibold text-center">Account Status</th>
                <th className="px-6 py-3 font-semibold text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-neutral-850/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{user.name}</div>
                    <div className="text-xs text-neutral-500 font-mono">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.plan}
                      onChange={(e) => handleUpdatePlan(user.id, e.target.value)}
                      className="bg-neutral-950 border border-neutral-800 text-xs font-semibold rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 text-neutral-250 cursor-pointer"
                    >
                      <option value="Developer Sandbox">Developer Sandbox</option>
                      <option value="Data Analyst Lite">Data Analyst Lite</option>
                      <option value="Data Scientist Pro">Data Scientist Pro</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value as 'admin' | 'user')}
                      className="bg-neutral-950 border border-neutral-800 text-xs font-semibold rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 text-neutral-250 cursor-pointer"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-xs font-bold text-neutral-200">
                    {user.credits.toLocaleString()} pts
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      user.status === 'active' 
                        ? 'bg-green-500/10 border-green-500/25 text-green-400' 
                        : 'bg-red-500/10 border-red-500/25 text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleGrantCredits(user.id, 5000)}
                      className="bg-neutral-800 text-neutral-200 hover:bg-neutral-750 text-xs"
                      title="Grant +5,000 Credits"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> +5K
                    </Button>
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`inline-flex items-center justify-center p-1.5 rounded-md border transition-colors cursor-pointer ${
                        user.status === 'active' 
                          ? 'border-neutral-800 text-neutral-450 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' 
                          : 'border-green-500/25 text-green-400 bg-green-500/5 hover:bg-green-500/10'
                      }`}
                      title={user.status === 'active' ? 'Suspend User' : 'Reactivate User'}
                    >
                      {user.status === 'active' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
