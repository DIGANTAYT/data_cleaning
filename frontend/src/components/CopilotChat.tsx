'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { API_URL } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function CopilotChat({ datasetId }: { datasetId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your AI Data Copilot. Ask me anything about your dataset.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Check credits first
    const storedCredits = localStorage.getItem('user_credits');
    const credits = storedCredits ? Number(storedCredits) : 500;
    
    if (credits < 200) {
      setMessages(prev => [
        ...prev, 
        { role: 'user', content: input.trim() },
        { role: 'assistant', content: '⚠️ **Credit Limit Reached:** You have run out of AI compute credits! Please go back to the Home page and upgrade to the Analyst Lite or Data Scientist Pro tier to get fresh credits.' }
      ]);
      setInput('');
      return;
    }
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const apiKey = localStorage.getItem('user_openai_key');
      
      const response = await axios.post(`${API_URL}/api/datasets/${datasetId}/copilot`, { 
        query: userMsg,
        apiKey: apiKey || undefined 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Deduct credits and update
      localStorage.setItem('user_credits', String(credits - 200));
      window.dispatchEvent(new Event('credits-updated'));
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.answer }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error while processing your request.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="dark flex flex-col h-[600px] bg-neutral-900 border-neutral-800 text-neutral-50">
      <CardHeader className="border-b border-neutral-800 pb-4">
        <CardTitle className="text-lg flex items-center">
          <Bot className="w-5 h-5 mr-2 text-blue-400" />
          AI Analytics Copilot
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-neutral-700 ml-2' : 'bg-blue-600 mr-2'}`}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
                <div className={`p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-neutral-800 text-neutral-100' : 'bg-neutral-950 text-neutral-300 border border-neutral-800'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex flex-row">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 mr-2 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="p-3 rounded-xl text-sm bg-neutral-950 text-neutral-300 border border-neutral-800 flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Thinking...
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/50">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for insights, trends, or cleaning..."
              className="flex-1 bg-neutral-900 border-neutral-800 text-neutral-50"
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || loading} className="bg-blue-600 hover:bg-blue-500 shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
