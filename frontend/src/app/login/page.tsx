'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { API_URL } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_name', response.data.name || email.split('@')[0]);
        if (email === 'sarkardiganta04@gmail.com') {
          localStorage.setItem('user_role', 'admin');
        } else {
          localStorage.setItem('user_role', 'user');
        }
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-neutral-950 px-4">
      <Card className="w-full max-w-sm dark bg-neutral-900 border-neutral-800 text-neutral-50">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription className="text-neutral-400">
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
              Sign in
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-neutral-400">
            Don't have an account?{' '}
            <a href="/register" className="text-white hover:underline">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
