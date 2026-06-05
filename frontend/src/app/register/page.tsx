'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Undo2, Redo2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { API_URL } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // State History for Undo / Redo
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isApplyingHistoryRef = React.useRef(false);

  const saveStateToHistory = (currName: string, currEmail: string, currPassword: string) => {
    if (isApplyingHistoryRef.current) return;
    setHistory(prev => {
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, { name: currName, email: currEmail, password: currPassword }];
    });
    setHistoryIndex(prev => prev + 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      isApplyingHistoryRef.current = true;
      const targetIndex = historyIndex - 1;
      const snapshot = history[targetIndex];
      setName(snapshot.name);
      setEmail(snapshot.email);
      setPassword(snapshot.password);
      setHistoryIndex(targetIndex);
      isApplyingHistoryRef.current = false;
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isApplyingHistoryRef.current = true;
      const targetIndex = historyIndex + 1;
      const snapshot = history[targetIndex];
      setName(snapshot.name);
      setEmail(snapshot.email);
      setPassword(snapshot.password);
      setHistoryIndex(targetIndex);
      isApplyingHistoryRef.current = false;
    }
  };

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (name || email || password) {
        const lastSnap = history[historyIndex];
        if (!lastSnap || lastSnap.name !== name || lastSnap.email !== email || lastSnap.password !== password) {
          saveStateToHistory(name, email, password);
        }
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [name, email, password]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
      if (response.data.token) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_name', user?.name || name);
        localStorage.setItem('user_plan', user?.plan || 'Developer Sandbox');
        localStorage.setItem('user_credits', String(user?.credits ?? 500));
        if (email === 'sarkardiganta04@gmail.com') {
          localStorage.setItem('user_role', 'admin');
        } else {
          localStorage.setItem('user_role', 'user');
        }
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-neutral-950 px-4">
      <Card className="w-full max-w-sm dark bg-neutral-900 border-neutral-800 text-neutral-50">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription className="text-neutral-400">
            Enter your email below to create your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                className="bg-neutral-950 border-neutral-800"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                className="bg-neutral-950 border-neutral-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                className="bg-neutral-950 border-neutral-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full bg-white text-black hover:bg-neutral-200">
              Sign up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-neutral-400">
            Already have an account?{' '}
            <a href="/login" className="text-white hover:underline">
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>

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
