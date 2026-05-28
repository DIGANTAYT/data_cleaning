'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Key, Save, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('user_openai_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('user_openai_key', apiKey.trim());
      toast.success('API Key saved successfully. It is stored locally in your browser.');
    } else {
      localStorage.removeItem('user_openai_key');
      toast.info('API Key removed. The system will fall back to the default server key.');
    }
  };

  return (
    <div className="bg-neutral-950 text-neutral-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-neutral-400">Manage your account and integration preferences.</p>
        </div>

        <Card className="dark bg-neutral-900 border-neutral-800 text-neutral-50">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Key className="w-5 h-5 mr-2 text-blue-400" />
              OpenAI API Key
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Provide your own OpenAI API key to power the AI Analytics Copilot. This key is stored securely in your browser's local storage and sent directly to our backend during analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-yellow-500/80 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
              <Shield className="w-4 h-4 shrink-0" />
              <p>We do not store your API key in our database. It remains strictly on your device.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Secret Key (sk-...)</label>
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-neutral-950 border-neutral-800"
              />
            </div>
            
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
