import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  Sparkles, 
  Award, 
  Flag,
  ArrowRight
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion } from 'framer-motion';

const StudyPlanner = () => {
  const [subjects, setSubjects] = useState('');
  const [examDate, setExamDate] = useState('');
  const [availableHours, setAvailableHours] = useState('2.0');

  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetchLatestPlan();
  }, []);

  const fetchLatestPlan = async () => {
    try {
      const res = await axios.get('/api/study/latest');
      setActivePlan(res.data);
    } catch (err) {
      console.log("No study plan generated yet.");
    } finally {
      setPageLoading(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!subjects || !examDate) return;
    setLoading(true);
    try {
      const subjectsArr = subjects.split(',').map(s => s.trim()).filter(Boolean);
      const res = await axios.post('/api/study/', {
        subjects: subjectsArr,
        exam_date: new Date(examDate).toISOString(),
        available_hours: parseFloat(availableHours)
      });
      setActivePlan(res.data);
      setSubjects('');
      setExamDate('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
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
        <h1 className="text-3xl font-outfit font-extrabold text-white">AI Study Planner</h1>
        <p className="text-sm text-gray-400 mt-1">
          Input your subjects and target exam date, and let the AI build custom daily focus blocks and weekly study goals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Input parameters */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="font-outfit font-bold text-white text-lg border-b border-cyber-border pb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyber-violet" />
              <span>Generate Curriculum</span>
            </h3>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Subjects (Comma separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calculus, Machine Learning, UI Design"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  className="w-full glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Exam Date
                </label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full glass-input text-sm text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Daily Available Study Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  required
                  value={availableHours}
                  onChange={(e) => setAvailableHours(e.target.value)}
                  className="w-full glass-input text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full cyber-btn-violet py-2.5 text-xs uppercase tracking-wider font-bold"
              >
                {loading ? 'Synthesizing...' : 'Generate Study Plan'}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right: Plan Display */}
        <div className="lg:col-span-2 space-y-6">
          {activePlan ? (
            <div className="space-y-6">
              {/* Plan Metadata header */}
              <GlassCard className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-cyber-teal/10 border border-cyber-teal/30 flex items-center justify-center text-cyber-teal">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-extrabold text-white text-lg">Active Study Plan</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Exam Target: {new Date(activePlan.exam_date).toLocaleDateString([], { dateStyle: 'long' })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {activePlan.subjects.map((sub) => (
                    <span key={sub} className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyber-violet/20 text-cyber-violet border border-cyber-violet/30 font-semibold font-outfit uppercase">
                      {sub}
                    </span>
                  ))}
                </div>
              </GlassCard>

              {/* Grid: Daily schedule vs Weekly Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Timeline */}
                <GlassCard className="space-y-4">
                  <h4 className="font-outfit font-bold text-white text-base border-b border-cyber-border pb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyber-teal" />
                    <span>Daily Study Blocks</span>
                  </h4>
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                    {activePlan.schedule.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                        <span className="text-[10px] font-bold text-cyber-teal font-outfit uppercase">{item.time}</span>
                        <h5 className="font-semibold text-sm text-white">{item.subject}</h5>
                        <p className="text-xs text-gray-400 leading-normal">{item.activity}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Weekly Focus */}
                <GlassCard className="space-y-4">
                  <h4 className="font-outfit font-bold text-white text-base border-b border-cyber-border pb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyber-violet" />
                    <span>Weekly Milestones</span>
                  </h4>
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                    {activePlan.revision_plan.weekly_schedule?.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-gradient-to-r from-cyber-violet/5 to-white/0 border border-cyber-border/40 space-y-1.5">
                        <span className="text-[10px] font-bold text-cyber-violet font-outfit uppercase">{item.week}</span>
                        <h5 className="font-semibold text-xs text-gray-300 leading-snug">Focus: {item.focus}</h5>
                        <p className="text-[11px] text-gray-500 leading-normal italic">🎯 Goal: {item.milestone}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Revision Milestones */}
              {activePlan.revision_plan.revision_milestones && (
                <GlassCard className="space-y-4">
                  <h4 className="font-outfit font-bold text-white text-base border-b border-cyber-border pb-2 flex items-center gap-2">
                    <Flag className="w-4 h-4 text-cyber-pink" />
                    <span>Exam Revision Checkpoints</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activePlan.revision_plan.revision_milestones.map((checkpoint, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-3.5 items-start">
                        <div className="px-2.5 py-1.5 rounded-lg bg-cyber-pink/10 text-cyber-pink border border-cyber-pink/20 font-outfit font-extrabold text-sm text-center min-w-[50px]">
                          {checkpoint.days_left}d
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm text-white">{checkpoint.title}</h5>
                          <p className="text-xs text-gray-400 mt-0.5 leading-normal">{checkpoint.goal}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>
          ) : (
            <div className="h-[400px] glass-panel rounded-2xl flex flex-col items-center justify-center text-center text-slate-500 p-8">
              <BookOpen className="w-16 h-16 text-cyber-border mb-4" />
              <h3 className="font-outfit font-bold text-white text-lg">No Study Plan Active</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1 leading-normal">
                Submit your current subjects and timeline in the left panel to compile an AI-optimized schedule.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;
