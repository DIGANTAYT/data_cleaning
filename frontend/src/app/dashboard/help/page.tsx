'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { HelpCircle, Search, FileText, BadgeCheck, MessageSquare, ChevronDown, CheckCircle, ArrowRight, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface GuideStage {
  stage: number;
  title: string;
  description: string;
  details: string;
  badge: string;
}

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<number | null>(1);
  const [userPlan, setUserPlan] = useState('Developer Sandbox');
  
  // Support ticket form
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketSent, setTicketSent] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserPlan(localStorage.getItem('user_plan') || 'Developer Sandbox');
    }
  }, []);

  const getSLA = () => {
    if (userPlan === 'Data Scientist Pro') return { hours: '1 Hour', queue: 'Elite High-Performance SLA Queue' };
    if (userPlan === 'Data Analyst Lite') return { hours: '12 Hours', queue: 'Priority Business Queue' };
    return { hours: '48 Hours', queue: 'Standard Community Queue' };
  };

  const sla = getSLA();

  const stages: GuideStage[] = [
    {
      stage: 1,
      title: 'Ingestion & Profiling Engine',
      description: 'Pandas memory parsing, shape profiling & datatype checks.',
      details: 'When you upload a dataset, our FastAPI AI engine streams the CSV or Excel file directly into memory using optimized chunking parameters. It assesses overall shape dimensions and determines whether columns contain Numeric metrics or Categorical strings using advanced statistical inferences.',
      badge: 'Blue Stream Ingest'
    },
    {
      stage: 2,
      title: 'Quality Integrity Engine',
      description: 'IQR mathematical outlier calculation & health indexing.',
      details: 'Next, the Quality Engine calculates duplicate row vectors and runs the Interquartile Range (IQR) algorithm on numeric features to flag values residing outside 1.5 * IQR bounds. It aggregates these findings into a unified, weighted quality Grade A-D score.',
      badge: 'IQR Anomalies Isolated'
    },
    {
      stage: 3,
      title: 'Run-Rate Aggregations',
      description: 'Linear trends OLS, growth run-rates & category profiles.',
      details: 'This stage solves a Least Squares regression formula to project historical vectors, plots cumulative growth curves in Recharts area grids, and compiles category bar aggregations sorted by metric weight.',
      badge: 'Ordinary Least Squares'
    },
    {
      stage: 4,
      title: 'AutoML RandomForest Predictor',
      description: 'Train-test splits, ensemble trees fitting & importance weight.',
      details: 'The AutoML Prediction Studio isolates your selected target column, applies categorical one-hot encoding, partitions vectors into an 80/20 train-test split, and fits 100 Decision Trees. It returns prediction accuracy alongside feature driver weights.',
      badge: 'Ensemble Learning'
    }
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      const ticketId = 'TCK-' + Math.floor(100000 + Math.random() * 900000);
      setTicketSent({
        id: ticketId,
        subject: subject,
        sla: sla.hours,
        queue: sla.queue,
        date: new Date().toLocaleDateString()
      });
      setSubmitting(false);
      setSubject('');
      setMessage('');
      toast.success('Support ticket submitted successfully!');
    }, 1500);
  };

  const filteredStages = stages.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-neutral-950 text-neutral-50 p-8 space-y-8 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-8 h-8 text-blue-400" />
            Support Center & Guides
          </h1>
          <p className="text-neutral-400">Search interactive guides, learn about pipeline stages, and contact developer support.</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-lg">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
          <Input
            type="text"
            placeholder="Search guides, stages, mathematical formulas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900 border-neutral-800 text-xs rounded-xl pl-10 pr-3 py-3"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Interactive Guides */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="dark bg-neutral-900 border-neutral-800 text-neutral-50 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-neutral-850 pb-4">
                <CardTitle className="text-md flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Interactive Pipeline Guide
                </CardTitle>
                <CardDescription className="text-neutral-400 text-xs">
                  Click on any stage below to inspect its mathematical execution and backend pipelines.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {filteredStages.length === 0 ? (
                  <p className="text-neutral-500 text-xs text-center py-6">No matching stages found.</p>
                ) : (
                  filteredStages.map((s) => {
                    const isSelected = selectedStage === s.stage;
                    return (
                      <div key={s.stage} className="border border-neutral-850 rounded-xl overflow-hidden transition-all duration-300">
                        <button
                          onClick={() => setSelectedStage(isSelected ? null : s.stage)}
                          className={`w-full flex justify-between items-center p-4 text-left cursor-pointer transition-all ${
                            isSelected ? 'bg-neutral-850/50' : 'hover:bg-neutral-850/20'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-blue-400 uppercase font-mono tracking-wider font-bold">Stage {s.stage}</span>
                            <h4 className="text-xs font-bold text-white flex items-center gap-2">{s.title}</h4>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isSelected && (
                          <div className="p-4 bg-neutral-950/40 border-t border-neutral-850 text-xs text-neutral-300 leading-relaxed space-y-3">
                            <p>{s.details}</p>
                            <div className="inline-flex items-center space-x-1.5 bg-neutral-900 border border-neutral-850 px-2.5 py-1 rounded text-[10px] text-neutral-400 font-mono">
                              <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />
                              <span>{s.badge}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Support SLA Ticket Submission */}
          <div className="space-y-6">
            <Card className="dark bg-neutral-900 border-neutral-800 text-neutral-50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  Plan Support Desk
                </CardTitle>
                <CardDescription className="text-neutral-400 text-xs">
                  Submit tickets directly. Your SLA is verified dynamically based on your plan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Active SLA Card */}
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15 space-y-1">
                  <span className="text-[8px] text-neutral-500 uppercase tracking-widest font-bold">Active Subscribed Plan</span>
                  <div className="text-xs font-bold text-white font-mono flex items-center gap-1">
                    {userPlan}
                  </div>
                  <p className="text-[10px] text-purple-400 leading-normal font-mono pt-1">
                    ⚡ Guaranteed Response: <strong>{sla.hours}</strong> <br/>
                    📁 Queue: {sla.queue}
                  </p>
                </div>

                {!ticketSent ? (
                  <form onSubmit={handleTicketSubmit} className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Subject</label>
                      <Input
                        type="text"
                        placeholder="FastAPI database sync timeout..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        className="bg-neutral-950 border-neutral-800 text-xs placeholder-neutral-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Message Description</label>
                      <textarea
                        placeholder="Detail your request or integration question..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={4}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={submitting || !subject.trim() || !message.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 rounded-lg"
                    >
                      {submitting ? 'Transmitting Ticket...' : 'Transmit Support Request'}
                    </Button>
                  </form>
                ) : (
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15 space-y-3.5 text-center">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto" />
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white">Ticket Created successfully!</h4>
                      <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded font-mono font-bold">
                        {ticketSent.id}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-450 leading-normal">
                      Your ticket has been prioritized inside our **{ticketSent.queue}** with a guaranteed review time of **{ticketSent.sla}**.
                    </p>
                    <Button 
                      variant="ghost" 
                      onClick={() => setTicketSent(null)}
                      className="text-[10px] hover:text-white"
                    >
                      Create Another Ticket <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
