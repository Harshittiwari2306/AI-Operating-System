import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart2, 
  Flame, 
  TrendingUp, 
  Activity, 
  Calendar 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { BarChart, LineChart } from '../components/Charts';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/api/productivity/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-12 h-12 rounded-full border-4 border-cyber-violet border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Bar Chart: Category Hours
  const barCategories = analytics?.distribution ? Object.keys(analytics.distribution) : ['Study', 'Coding', 'Reading', 'Exercise'];
  const barValues = analytics?.distribution ? Object.values(analytics.distribution) : [12, 8, 4, 5];

  const categoryBarData = {
    labels: barCategories,
    datasets: [{
      label: 'Hours Spent',
      data: barValues,
      backgroundColor: ['#9F7AEA', '#00F2FE', '#FF007A', '#00F5A0'],
      borderWidth: 0,
      borderRadius: 6
    }]
  };

  // Line Chart: Weekly Trend
  const trendDays = analytics?.daily_trend ? analytics.daily_trend.map(t => t.day) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const trendScores = analytics?.daily_trend ? analytics.daily_trend.map(t => t.score) : [60, 65, 75, 70, 80, 85, 90];

  const trendLineData = {
    labels: trendDays,
    datasets: [{
      label: 'Productivity Index',
      data: trendScores,
      fill: true,
      borderColor: '#00F2FE',
      backgroundColor: 'rgba(0, 242, 254, 0.08)',
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 6
    }]
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-2">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-outfit font-extrabold text-white">Productivity Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">
          Review core activity hours, daily velocity indexes, and a 30-day system usage heatmap.
        </p>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly split */}
        <GlassCard className="h-[340px] flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2 border-b border-cyber-border mb-3">
            <h4 className="font-outfit font-bold text-white text-base">Weekly Activity Hours</h4>
            <span className="text-[10px] text-gray-500 font-semibold font-outfit uppercase">By Category</span>
          </div>
          <div className="flex-1 relative">
            <BarChart data={categoryBarData} options={{ scales: { x: { grid: { display: false } } } }} />
          </div>
        </GlassCard>

        {/* Daily Trend */}
        <GlassCard className="h-[340px] flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2 border-b border-cyber-border mb-3">
            <h4 className="font-outfit font-bold text-white text-base">Productivity Score Trend</h4>
            <span className="text-[10px] text-gray-500 font-semibold font-outfit uppercase">Daily index</span>
          </div>
          <div className="flex-1 relative">
            <LineChart data={trendLineData} />
          </div>
        </GlassCard>
      </div>

      {/* 30-Day Activity Heatmap */}
      <GlassCard className="space-y-4">
        <h3 className="font-outfit font-bold text-white text-lg border-b border-cyber-border pb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyber-teal" />
          <span>30-Day Activity Heatmap</span>
        </h3>
        
        <div className="p-4 bg-white/[0.01] rounded-2xl border border-cyber-border flex flex-wrap gap-2.5 items-center justify-center">
          {analytics?.heatmap?.slice().reverse().map((day, idx) => {
            // Determine color matching activity count
            // Count 0 = white/5
            // Count 1-2 = teal/20
            // Count 3-4 = teal/40
            // Count 5+ = teal/70
            const val = day.value;
            let bgColor = 'bg-white/5 border border-white/10';
            if (val >= 5) {
              bgColor = 'bg-cyber-mint border border-cyber-mint/40 shadow-sm shadow-cyber-mint/20';
            } else if (val >= 3) {
              bgColor = 'bg-cyber-teal/60 border border-cyber-teal/40';
            } else if (val >= 1) {
              bgColor = 'bg-cyber-teal/20 border border-cyber-teal/20';
            }

            return (
              <div 
                key={idx}
                title={`${day.date}: ${val} logs`}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold font-outfit transition-all duration-200 hover:scale-110 cursor-pointer ${bgColor} ${
                  val >= 5 ? 'text-cyber-dark' : 'text-slate-400'
                }`}
              >
                {val}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-6 pt-2 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-white/5 border border-white/10"></div>
            <span>0 Logs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-cyber-teal/20"></div>
            <span>1-2 Logs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-cyber-teal/60"></div>
            <span>3-4 Logs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-cyber-mint"></div>
            <span>5+ Logs</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Analytics;
