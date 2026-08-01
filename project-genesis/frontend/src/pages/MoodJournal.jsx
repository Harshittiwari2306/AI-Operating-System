import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Smile, 
  BookOpen, 
  Trash2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  Sparkles,
  BarChart as BarIcon
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { DoughnutChart } from '../components/Charts';
import { motion } from 'framer-motion';

const MoodJournal = () => {
  const [entry, setEntry] = useState('');
  const [moods, setMoods] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMoodData();
  }, []);

  const fetchMoodData = async () => {
    try {
      const listRes = await axios.get('/api/mood/');
      setMoods(listRes.data);

      const analyticsRes = await axios.get('/api/mood/analytics');
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogMood = async (e) => {
    e.preventDefault();
    if (!entry.trim()) return;
    setSubmitting(true);
    try {
      await axios.post('/api/mood/', { entry });
      setEntry('');
      await fetchMoodData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Setup sentiment Chart data
  const sentimentLabels = analytics?.sentiment_counts ? Object.keys(analytics.sentiment_counts) : ['Positive', 'Neutral', 'Negative'];
  const sentimentValues = analytics?.sentiment_counts ? Object.values(analytics.sentiment_counts) : [0, 0, 0];

  const sentimentChartData = {
    labels: sentimentLabels,
    datasets: [{
      data: sentimentValues,
      backgroundColor: ['#00F5A0', '#00F2FE', '#FF007A'],
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)'
    }]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-12 h-12 rounded-full border-4 border-cyber-violet border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-2">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-outfit font-extrabold text-white">Mood Journal</h1>
        <p className="text-sm text-gray-400 mt-1">
          Log daily journal entries. Genesis OS automatically runs sentiment analysis, detects core emotions, and generates mental health reports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Diary Form */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="font-outfit font-bold text-white text-lg border-b border-cyber-border pb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyber-violet" />
              <span>Log Journal Entry</span>
            </h3>

            <form onSubmit={handleLogMood} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">How was your day?</label>
                <textarea
                  required
                  placeholder="I coded for 4 hours and finalized the database, feeling highly accomplished and motivated but slightly tired..."
                  rows="5"
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  className="w-full glass-input text-sm leading-relaxed p-3.5 resize-none"
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full cyber-btn-violet py-2 text-xs uppercase tracking-wider font-bold"
              >
                {submitting ? 'Analyzing Sentiment...' : 'Save Journal Entry'}
              </button>
            </form>
          </GlassCard>

          {/* AI Insights Alert */}
          {analytics && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl bg-cyber-violet/10 border border-cyber-violet/30 space-y-2"
            >
              <div className="flex items-center gap-2 text-cyber-violet">
                <Sparkles className="w-4.5 h-4.5" />
                <h4 className="font-outfit font-bold text-sm text-white">Mood Insights</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{analytics.insight}"
              </p>
            </motion.div>
          )}
        </div>

        {/* Right Diary logs and analytics charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sentiment split */}
            <GlassCard className="h-[240px] flex flex-col justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-cyber-border mb-2">Sentiment Split</h4>
              <div className="flex-1 relative">
                {moods.length > 0 ? (
                  <DoughnutChart data={sentimentChartData} />
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-500">Log entries to review chart</div>
                )}
              </div>
            </GlassCard>

            {/* Average Mood card */}
            <GlassCard className="h-[240px] flex flex-col justify-between p-5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-cyber-border mb-2">Mental Stats</h4>
              <div className="my-auto text-center space-y-1">
                <span className="text-5xl font-outfit font-extrabold text-cyber-violet">
                  {analytics?.average_score || '5.0'}
                </span>
                <span className="text-[10px] text-gray-500 block font-semibold uppercase tracking-wider">Average Monthly Score</span>
              </div>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-cyber-border text-center">
                Scale ranges from 1 (Extreme Fatigue) to 10 (Maximum Motivation)
              </div>
            </GlassCard>
          </div>

          {/* History Ledger list */}
          <GlassCard className="h-[270px] flex flex-col">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-cyber-border mb-3">Diary Archive</h4>
            <div className="overflow-y-auto pr-1 space-y-3.5 flex-1 no-scrollbar">
              {moods.length > 0 ? (
                moods.map((m) => (
                  <div key={m.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          m.sentiment === 'Positive' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : (m.sentiment === 'Negative' ? 'bg-red-950/40 text-red-400 border border-red-900/30' : 'bg-blue-950/40 text-blue-400 border border-blue-900/30')
                        }`}>
                          {m.sentiment}
                        </span>
                        <span className="text-[10px] text-gray-500 ml-3">{new Date(m.date).toLocaleDateString([], { dateStyle: 'medium' })}</span>
                      </div>
                      <span className="text-xs font-bold text-cyber-violet">Score: {m.mood_score}/10</span>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed font-medium">"{m.entry}"</p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.emotions.map((e) => (
                        <span key={e} className="text-[8px] px-2 py-0.2 rounded bg-white/5 border border-white/10 text-slate-400 font-semibold uppercase">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-gray-500">
                  Diary archive is empty. How was your day?
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default MoodJournal;
