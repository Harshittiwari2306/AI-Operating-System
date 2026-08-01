import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Activity, 
  Flame, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Check, 
  Award,
  Sparkles 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Coding');
  const [targetFrequency, setTargetFrequency] = useState('1');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHabitData();
  }, []);

  const fetchHabitData = async () => {
    try {
      const habitsRes = await axios.get('/api/habits/');
      setHabits(habitsRes.data);

      const predRes = await axios.get('/api/habits/predictions');
      setPredictions(predRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!name) return;
    try {
      await axios.post('/api/habits/', {
        name,
        category,
        target_frequency: parseInt(targetFrequency)
      });
      setName('');
      fetchHabitData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteHabit = async (habitId) => {
    try {
      await axios.post(`/api/habits/${habitId}/complete`);
      fetchHabitData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!confirm("Are you sure you want to stop tracking this habit?")) return;
    try {
      await axios.delete(`/api/habits/${habitId}`);
      fetchHabitData();
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-2">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-outfit font-extrabold text-white">Habit Tracker</h1>
        <p className="text-sm text-gray-400 mt-1">
          Stay consistent in coding, reading, and meditation. Genesis OS predicts completion probabilities based on streaks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form Panel */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="font-outfit font-bold text-white text-lg border-b border-cyber-border pb-2 flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyber-mint" />
              <span>Track New Habit</span>
            </h3>

            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Habit Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read 15 pages of philosophy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full glass-input text-sm text-gray-300"
                  >
                    <option value="Coding">Coding</option>
                    <option value="Reading">Reading</option>
                    <option value="Meditation">Meditation</option>
                    <option value="Exercise">Exercise</option>
                    <option value="Water">Water Intake</option>
                    <option value="Sleep">Sleep Hygiene</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Times / Day</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={targetFrequency}
                    onChange={(e) => setTargetFrequency(e.target.value)}
                    className="w-full glass-input text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full cyber-btn-teal py-2 text-xs uppercase tracking-wider font-bold"
              >
                Start Tracking
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Habits Tracker List and Predictions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active list */}
          <GlassCard className="space-y-4">
            <h3 className="font-outfit font-bold text-white text-lg pb-2 border-b border-cyber-border">Active Habit Loops</h3>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
              {habits.length > 0 ? (
                habits.map((habit) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isChecked = (habit.completions || []).includes(todayStr);

                  return (
                    <div 
                      key={habit.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center hover:border-cyber-mint/30 transition-all gap-4"
                    >
                      <div className="flex gap-4 items-center">
                        <button
                          onClick={() => handleCompleteHabit(habit.id)}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-cyber-mint text-cyber-dark border-cyber-mint shadow-lg shadow-cyber-mint/20'
                              : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/30'
                          }`}
                          disabled={isChecked}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <div>
                          <h4 className="font-outfit font-bold text-white text-base leading-snug">{habit.name}</h4>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-semibold font-outfit uppercase">
                              {habit.category}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-cyber-pink font-bold font-outfit">
                              <Flame className="w-3.5 h-3.5 fill-cyber-pink" />
                              <span>{habit.streak} DAY STREAK</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="w-8 h-8 rounded-xl bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 text-red-400 hover:text-red-300 flex items-center justify-center transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-xs text-gray-500">
                  No habits logged. Set your first goal!
                </div>
              )}
            </div>
          </GlassCard>

          {/* AI consistency predictions */}
          {predictions.length > 0 && (
            <GlassCard className="space-y-4">
              <h3 className="font-outfit font-bold text-white text-base border-b border-cyber-border pb-2 flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-cyber-violet" />
                <span>AI Completion Predictions</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictions.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-outfit font-bold text-sm text-white">{p.name}</h4>
                        <span className="text-[9px] text-gray-500 block uppercase mt-0.5">{p.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-cyber-mint">{p.prediction_rate}%</span>
                        <span className="text-[8px] text-gray-500 block font-semibold uppercase">Prob</span>
                      </div>
                    </div>

                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-cyber-mint h-full" style={{ width: `${p.prediction_rate}%` }}></div>
                    </div>

                    <p className="text-[10px] text-cyber-teal leading-normal italic">
                      💡 AI: {p.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default Habits;
