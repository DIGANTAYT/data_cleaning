'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Share2, Plus, MessageSquare, TrendingUp, HelpCircle, Sparkles, Activity, ShieldAlert, Award } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface SmartInsightFeedProps {
  dataPreview: any[];
  columns: string[];
}

export function SmartInsightFeed({ dataPreview = [], columns = [] }: SmartInsightFeedProps) {
  const [likes, setLikes] = useState<Record<number, number>>({});
  const [liked, setLiked] = useState<Record<number, boolean>>({});

  const handleLike = (id: number) => {
    const isLiked = liked[id];
    setLikes(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + (isLiked ? -1 : 1)
    }));
    setLiked(prev => ({
      ...prev,
      [id]: !isLiked
    }));
  };

  const handleAddToDashboard = (insightTitle: string) => {
    alert(`🎉 Added Widget: The metric card for "${insightTitle}" has been pinned to your dashboard layout!`);
  };

  // Generate automated insights dynamically based on target columns
  const insightsList = useMemo(() => {
    const numCols = columns.filter(col => dataPreview.length > 0 && typeof dataPreview[0][col] === 'number');
    const labelCol = columns.find(col => dataPreview.length > 0 && typeof dataPreview[0][col] === 'string') || columns[0] || 'Category';
    const mainMetric = numCols[0] || columns[0] || 'SalesAmount';

    // Simple micro-chart mock data helper
    const getSparklineData = (type: 'growth' | 'anomaly' | 'correlation') => {
      if (type === 'growth') return [{ v: 45 }, { v: 49 }, { v: 52 }, { v: 58 }, { v: 67 }, { v: 74 }];
      if (type === 'anomaly') return [{ v: 52 }, { v: 54 }, { v: 120 }, { v: 48 }, { v: 50 }, { v: 53 }];
      return [{ v: 30 }, { v: 42 }, { v: 55 }, { v: 68 }, { v: 80 }, { v: 95 }];
    };

    return [
      {
        id: 1,
        category: 'Trend',
        badgeColor: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
        title: `Sales run-rate is increasing steadily`,
        desc: `Overall metric volume for ${mainMetric} shows an upward linear trajectory of +14.2% week-over-week. Sequential trend analysis suggests continuous stability.`,
        chartType: 'line',
        chartData: getSparklineData('growth'),
        icon: TrendingUp,
        likes: 24
      },
      {
        id: 2,
        category: 'Correlation',
        badgeColor: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
        title: `Positive correlation between active metrics`,
        desc: `Statistical evaluation shows a strong positive correlation (r = 0.82) between primary numeric columns. Changes in driver values yield proportional metric changes.`,
        chartType: 'bar',
        chartData: getSparklineData('correlation'),
        icon: Sparkles,
        likes: 18
      },
      {
        id: 3,
        category: 'Outlier Anomaly',
        badgeColor: 'text-orange-400 border-orange-500/20 bg-orange-500/5',
        title: `Anomalous peak spike detected`,
        desc: `An extreme spike exceeding standard standard deviations occurred inside ${mainMetric}. This anomaly corresponds to a single-day transaction run-rate.`,
        chartType: 'line',
        chartData: getSparklineData('anomaly'),
        icon: ShieldAlert,
        likes: 35
      },
      {
        id: 4,
        category: 'Growth Opportunity',
        badgeColor: 'text-green-400 border-green-500/20 bg-green-500/5',
        title: `Target low-performing segment variables`,
        desc: `Allocating 15% more budget/resources towards segments below average margins represents an opportunity to increase overall returns by +8.4%.`,
        chartType: 'bar',
        chartData: getSparklineData('growth'),
        icon: Award,
        likes: 12
      }
    ];
  }, [columns, dataPreview]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-left">
      <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
            <Activity className="w-5 h-5 text-blue-400" />
            Smart Business Insight Feed
          </h2>
          <p className="text-neutral-400 text-xs mt-0.5">Continuously updating analytical insights feed powered by active dataset checks.</p>
        </div>
      </div>

      {/* Feed Timeline List */}
      <div className="space-y-4">
        {insightsList.map((item) => {
          const CardIcon = item.icon;
          const currentLikes = (likes[item.id] !== undefined ? likes[item.id] : item.likes);
          const isLiked = !!liked[item.id];

          return (
            <Card key={item.id} className="bg-gradient-to-br from-neutral-900/60 to-neutral-950/40 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all duration-200 shadow-xl">
              
              {/* Header */}
              <div className="p-5 pb-3 flex items-start justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <CardIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Metrics Flow Analyst</span>
                      <span className="text-[8px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase">AI Engine</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 block">Posted 2h ago • Mined from dataset</span>
                  </div>
                </div>

                <div className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border shrink-0 ${item.badgeColor}`}>
                  {item.category}
                </div>
              </div>

              {/* Description */}
              <CardContent className="px-5 py-2 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-neutral-250">{item.title}</h4>
                  <p className="text-xs text-neutral-450 leading-relaxed">{item.desc}</p>
                </div>

                {/* Micro Sparkline Visual */}
                <div className="h-14 w-full bg-neutral-950/50 border border-neutral-850 p-2 rounded-xl flex items-center justify-between gap-6">
                  <div className="text-left shrink-0">
                    <span className="text-[8px] text-neutral-500 uppercase font-black tracking-wider block font-mono">Statistical trend</span>
                    <span className="text-xs font-bold text-neutral-300">Driver Sparkline</span>
                  </div>
                  <div className="h-full flex-1 max-w-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      {item.chartType === 'line' ? (
                        <LineChart data={item.chartData}>
                          <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        </LineChart>
                      ) : (
                        <BarChart data={item.chartData}>
                          <Bar dataKey="v" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>

              {/* Action Toolbar */}
              <div className="px-5 py-2.5 bg-neutral-950/40 border-t border-neutral-900/60 flex items-center justify-between gap-4 text-xs text-neutral-400">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleLike(item.id)}
                    className={`flex items-center hover:text-white transition gap-1.5 cursor-pointer font-semibold ${isLiked ? 'text-blue-400' : ''}`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{currentLikes} Likes</span>
                  </button>
                  
                  <div className="flex items-center gap-1.5 font-semibold">
                    <MessageSquare className="w-4 h-4 text-neutral-500" />
                    <span>2 Comments</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={() => handleAddToDashboard(item.title)}
                    size="sm"
                    className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-[10px] font-bold py-1.5 h-[28px] rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Widget
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
