import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  CheckSquare, 
  Calendar, 
  AlertCircle, 
  DollarSign, 
  Flame, 
  Smile, 
  BookOpen, 
  ExternalLink,
  Bell,
  Check
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { DoughnutChart } from '../components/Charts';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const dashRes = await axios.get('/api/dashboard/');
      setData(dashRes.data);
      
      // Fetch recommendations based on live score
      const recsRes = await axios.get('/api/recommendations/');
      setRecs(recsRes.data);
    } catch (err) {
      console.error("Dashboard loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId, currentCompleted) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { completed: !currentCompleted });
      // Reload dashboard stats
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadNotification = async (notifId) => {
    try {
      await axios.put(`/api/notifications/${notifId}/read`);
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-12 h-12 rounded-full border-4 border-cyber-violet border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Pre-aggregate data values for gauge
  const score = data?.productivity_score || 0;
  const completedStudyHours = data?.study_progress?.completed_hours || 0;
  const targetStudyHours = data?.study_progress?.target_hours || 4;
  const remainingStudyHours = Math.max(0, targetStudyHours - completedStudyHours);

  // Study Progress Chart configuration
  const studyChartData = {
    labels: ['Study Completed', 'Remaining Target'],
    datasets: [{
      data: [completedStudyHours, remainingStudyHours],
      backgroundColor: ['#00F5A0', 'rgba(255, 255, 255, 0.05)'],
      borderColor: ['rgba(0, 245, 160, 0.2)', 'rgba(255, 255, 255, 0.05)'],
      borderWidth: 1,
    }]
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-2">
      {/* Welcome Banner */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-outfit font-extrabold text-white">
            Genesis OS: Active
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Welcome back, <span className="text-cyber-violet font-semibold">{user?.full_name || 'Operator'}</span>. System status is optimal.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyber-card border border-cyber-border text-xs text-cyber-mint font-semibold font-outfit uppercase tracking-widest shadow-inner shadow-cyber-glow">
          <div className="w-2.5 h-2.5 rounded-full bg-cyber-mint animate-ping"></div>
          <span>AI Sync Active</span>
        </div>
      </div>

      {/* Grid: 4 Core Gauges (Top Row) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Productivity Index */}
        <GlassCard className="flex flex-col items-center text-center justify-between min-h-[220px]">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Productivity Score</h3>
          <div className="relative w-28 h-28 my-2 flex items-center justify-center">
            {/* SVG circle meter */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
              <motion.circle 
                cx="50" cy="50" r="40" 
                stroke="url(#grad-violet)" strokeWidth="8" fill="transparent" 
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * score) / 100 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="grad-violet" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9F7AEA" />
                  <stop offset="100%" stopColor="#00F2FE" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-outfit font-extrabold text-white">{score}</span>
              <span className="text-[10px] text-gray-500 block">INDEX</span>
            </div>
          </div>
          <span className="text-[11px] text-cyber-teal font-medium mt-1">
            {score > 80 ? '⚡ Maximum efficiency' : (score > 50 ? '📈 Good velocity' : '🧘 Time to refocus')}
          </span>
        </GlassCard>

        {/* Study Planner progress */}
        <GlassCard className="flex flex-col items-center justify-between min-h-[220px]">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center">Study Progress</h3>
          <div className="w-28 h-28 my-2 relative">
            <DoughnutChart data={studyChartData} options={{ plugins: { legend: { display: false } } }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-outfit font-extrabold text-white">{completedStudyHours}h</span>
              <span className="text-[9px] text-gray-500 font-semibold block uppercase">Of {targetStudyHours}h</span>
            </div>
          </div>
          <span className="text-[11px] text-cyber-mint font-medium text-center">
            {remainingStudyHours > 0 ? `${remainingStudyHours.toFixed(1)}h remaining today` : '🎉 Daily goal achieved!'}
          </span>
        </GlassCard>

        {/* Expense widget */}
        <GlassCard className="flex flex-col justify-between min-h-[220px]">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Monthly Budget</h3>
          <div className="my-3">
            <div className="flex items-center gap-1.5 text-cyber-pink mb-1">
              <DollarSign className="w-8 h-8 flex-shrink-0" />
              <span className="text-4xl font-outfit font-extrabold text-white">
                {data?.expenses_summary?.total_expenses_month?.toFixed(2) || '0.00'}
              </span>
            </div>
            <p className="text-xs text-gray-500">Total expense this month</p>
          </div>
          <div className="pt-2 border-t border-cyber-border text-xs flex justify-between items-center text-slate-400">
            <span>Forecast status:</span>
            <span className="text-cyber-pink font-semibold">Active</span>
          </div>
        </GlassCard>

        {/* Mood state */}
        <GlassCard className="flex flex-col justify-between min-h-[220px]">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Logged Mood</h3>
          {data?.latest_mood ? (
            <div className="my-3 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyber-violet/20 border border-cyber-violet/40 flex items-center justify-center text-2xl">
                  {data.latest_mood.sentiment === 'Positive' ? '😊' : (data.latest_mood.sentiment === 'Negative' ? '😞' : '😐')}
                </div>
                <div>
                  <h4 className="font-outfit font-bold text-white text-base leading-tight">
                    {data.latest_mood.sentiment}
                  </h4>
                  <span className="text-xs text-gray-500">Score: {data.latest_mood.mood_score}/10</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {data.latest_mood.emotions.map((e) => (
                  <span key={e} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="my-3 py-2 text-center text-xs text-gray-500">
              No mood journal logged today.
            </div>
          )}
          <div className="pt-2 border-t border-cyber-border text-xs flex justify-between items-center text-slate-400">
            <span>Insights check:</span>
            <span className="text-cyber-teal font-semibold">Ready</span>
          </div>
        </GlassCard>
      </div>

      {/* Grid: Tasks, Schedule, Notifications (Second Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Tasks */}
        <GlassCard className="h-[380px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-cyber-border">
              <div className="flex items-center gap-2 text-cyber-teal">
                <CheckSquare className="w-5 h-5" />
                <h3 className="font-outfit font-bold text-white text-lg">Today's Tasks</h3>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyber-teal/10 text-cyber-teal border border-cyber-teal/20 font-semibold font-outfit uppercase">
                {data?.today_tasks?.length || 0} Open
              </span>
            </div>

            <div className="overflow-y-auto max-h-[240px] pr-1 space-y-3 no-scrollbar">
              {data?.today_tasks && data.today_tasks.length > 0 ? (
                data.today_tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-cyber-teal/30 hover:bg-white/10 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox"
                        checked={false} // since today_tasks has only open ones
                        onChange={() => handleToggleTask(task.id, false)}
                        className="w-4 h-4 rounded border-cyber-border bg-cyber-dark text-cyber-teal focus:ring-cyber-teal cursor-pointer"
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-white">{task.title}</h4>
                        <span className="text-[10px] text-gray-500">{task.category}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                      task.priority === 'High' ? 'bg-red-950/40 text-red-400 border border-red-900/30' : (task.priority === 'Medium' ? 'bg-yellow-950/40 text-yellow-500 border border-yellow-900/30' : 'bg-green-950/40 text-green-400 border border-green-900/30')
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-gray-500">
                  No tasks scheduled for today. Create some!
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/tasks'} 
            className="w-full text-center text-xs text-cyber-teal font-semibold hover:underline bg-transparent border-none mt-2"
          >
            Manage Tasks Panel &rarr;
          </button>
        </GlassCard>

        {/* Today's Schedule */}
        <GlassCard className="h-[380px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-cyber-border">
              <div className="flex items-center gap-2 text-cyber-violet">
                <Calendar className="w-5 h-5" />
                <h3 className="font-outfit font-bold text-white text-lg">Today's Schedule</h3>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyber-violet/10 text-cyber-violet border border-cyber-violet/20 font-semibold font-outfit uppercase">
                {data?.today_events?.length || 0} Slots
              </span>
            </div>

            <div className="overflow-y-auto max-h-[240px] pr-1 space-y-3 no-scrollbar">
              {data?.today_events && data.today_events.length > 0 ? (
                data.today_events.map((event) => {
                  const startStr = new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const endStr = new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={event.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex gap-3 items-center">
                      <div className="text-center px-2 py-1.5 rounded-lg bg-cyber-violet/10 text-cyber-violet border border-cyber-violet/20 min-w-[70px]">
                        <span className="text-[10px] font-semibold block uppercase">Time</span>
                        <span className="text-xs font-bold font-outfit">{startStr}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{event.title}</h4>
                        <p className="text-[10px] text-gray-500">{startStr} - {endStr}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-gray-500">
                  Calendar clear for today. Focus session scheduled?
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/calendar'} 
            className="w-full text-center text-xs text-cyber-violet font-semibold hover:underline bg-transparent border-none mt-2"
          >
            Launch Smart Scheduler &rarr;
          </button>
        </GlassCard>

        {/* Notifications and Budget alerts */}
        <GlassCard className="h-[380px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-cyber-border">
              <div className="flex items-center gap-2 text-cyber-pink">
                <Bell className="w-5 h-5" />
                <h3 className="font-outfit font-bold text-white text-lg">System Alerts</h3>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyber-pink/10 text-cyber-pink border border-cyber-pink/20 font-semibold font-outfit uppercase">
                {data?.notifications?.length || 0} Alerts
              </span>
            </div>

            <div className="overflow-y-auto max-h-[240px] pr-1 space-y-3 no-scrollbar">
              {data?.notifications && data.notifications.length > 0 ? (
                data.notifications.map((notif) => (
                  <div key={notif.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className={`w-3.5 h-3.5 ${notif.type === 'Budget' ? 'text-cyber-pink' : (notif.type === 'Exam' ? 'text-cyber-violet' : 'text-yellow-500')}`} />
                        <h4 className="text-xs font-semibold text-white">{notif.title}</h4>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">{notif.message}</p>
                    </div>
                    <button 
                      onClick={() => handleReadNotification(notif.id)} 
                      className="w-6 h-6 rounded-md bg-white/5 hover:bg-cyber-mint/20 border border-white/10 flex items-center justify-center text-gray-400 hover:text-cyber-mint transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-gray-500">
                  All alerts clear. Systems operational.
                </div>
              )}
            </div>
          </div>
          <p className="text-[10px] text-gray-500 text-center italic mt-2">Notifications auto-refresh upon tasks updates.</p>
        </GlassCard>
      </div>

      {/* Row 3: AI Recommendations Section */}
      <GlassCard className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-cyber-border text-cyber-violet">
          <BookOpen className="w-6 h-6" />
          <h3 className="font-outfit font-extrabold text-white text-xl">AI Curriculum Suggestions</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recs && recs.length > 0 ? (
            recs.map((rec, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded-2xl bg-gradient-to-tr from-white/[0.02] to-white/[0.04] border border-white/5 hover:border-cyber-violet/30 transition-all duration-300 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-violet/20 text-cyber-violet border border-cyber-violet/30 font-semibold font-outfit uppercase tracking-wider">
                      {rec.resource_type}
                    </span>
                  </div>
                  <h4 className="font-outfit font-bold text-white text-base leading-snug">{rec.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{rec.description}</p>
                </div>
                
                <div className="pt-2 border-t border-cyber-border/40 space-y-3">
                  <p className="text-[10px] text-cyber-teal leading-normal italic">
                    💡 Reason: {rec.reasoning}
                  </p>
                  {rec.url && (
                    <a 
                      href={rec.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1.5 text-xs text-white hover:text-cyber-teal font-semibold font-outfit"
                    >
                      <span>Explore Source</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center text-xs text-gray-500">
              No learning recommendations available. Try updating your profile interests or starting tasks.
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default Dashboard;
