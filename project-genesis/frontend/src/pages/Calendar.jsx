import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Check, 
  Trash2,
  Sparkles 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion } from 'framer-motion';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [conflictCheck, setConflictCheck] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/calendar/');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyTime = async () => {
    if (!title || !startTime || !endTime) {
      alert("Please fill in the title, start time, and end time to verify.");
      return;
    }
    setLoading(true);
    setConflictCheck(null);
    try {
      const res = await axios.post('/api/calendar/suggest-time', {
        title,
        description,
        start_time: startTime,
        end_time: endTime
      });
      setConflictCheck(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = () => {
    if (conflictCheck && conflictCheck.suggested_start) {
      // Convert backend datetime ISO string to local datetime-local format
      // ISO: "2026-07-16T15:30:00.000Z" -> "2026-07-16T15:30"
      const formatLocal = (isoStr) => {
        const d = new Date(isoStr);
        const pad = (num) => String(num).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };
      
      setStartTime(formatLocal(conflictCheck.suggested_start));
      setEndTime(formatLocal(conflictCheck.suggested_end));
      setConflictCheck(null);
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) return;
    try {
      await axios.post('/api/calendar/', {
        title,
        description,
        start_time: startTime,
        end_time: endTime
      });
      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
      setConflictCheck(null);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm("Are you sure you want to cancel this event?")) return;
    try {
      await axios.delete(`/api/calendar/${eventId}`);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-2">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-outfit font-extrabold text-white">Smart Scheduler</h1>
        <p className="text-sm text-gray-400 mt-1">
          Coordinate calendar events, detect scheduling overlaps, and apply optimized reschedule suggestions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Creation Form Panel */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="font-outfit font-bold text-white text-lg border-b border-cyber-border pb-2 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-cyber-violet" />
              <span>Schedule Event</span>
            </h3>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brainstorming Machine Learning"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  placeholder="Goals or agenda..."
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full glass-input text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full glass-input text-sm text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">End Time</label>
                <input
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full glass-input text-sm text-gray-300"
                />
              </div>

              {/* Conflict Verification Prompt */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleVerifyTime}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-xs uppercase tracking-wider font-semibold border border-cyber-violet/50 hover:bg-cyber-violet/10 text-cyber-violet rounded-lg transition-all"
                >
                  {loading ? 'Analyzing...' : 'Verify Overlap'}
                </button>
                <button
                  type="submit"
                  className="flex-1 cyber-btn-teal py-2 text-xs uppercase tracking-wider font-bold"
                >
                  Save Event
                </button>
              </div>
            </form>
          </GlassCard>

          {/* AI Reschedule Suggestion Alert Box */}
          {conflictCheck && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-5 rounded-2xl border ${
                conflictCheck.conflict_detected 
                  ? 'bg-amber-950/20 border-amber-900/40 text-amber-300' 
                  : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400'
              }`}
            >
              <div className="flex items-start gap-3">
                {conflictCheck.conflict_detected ? (
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500 mt-0.5" />
                ) : (
                  <Check className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5" />
                )}
                <div>
                  <h4 className="font-outfit font-bold text-sm mb-1 text-white">
                    {conflictCheck.conflict_detected ? 'Schedule Overlap Detected' : 'Time Slot Open'}
                  </h4>
                  <p className="text-xs text-gray-300 leading-normal">{conflictCheck.message}</p>
                  
                  {conflictCheck.conflict_detected && (
                    <div className="mt-4 pt-3 border-t border-amber-900/20 space-y-3">
                      <p className="text-[11px] text-gray-400">
                        Suggested Alternative: <br />
                        <span className="font-semibold text-white">
                          {new Date(conflictCheck.suggested_start).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </p>
                      <button
                        onClick={handleApplySuggestion}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-cyber-dark text-[10px] uppercase tracking-wider font-bold transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Accept Shift</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Calendar Events List Panel */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="h-[550px] flex flex-col">
            <h3 className="font-outfit font-bold text-white text-lg border-b border-cyber-border pb-3 mb-4">
              Scheduled Core Calendar ({events.length})
            </h3>

            <div className="overflow-y-auto pr-2 space-y-4 flex-1 no-scrollbar">
              {events.length > 0 ? (
                events.map((event) => {
                  const start = new Date(event.start_time);
                  const end = new Date(event.end_time);
                  const dateStr = start.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                  const startStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const endStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div 
                      key={event.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyber-violet/30 hover:bg-white/10 transition-all flex justify-between items-center gap-4"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="px-3 py-2 rounded-xl bg-cyber-violet/10 text-cyber-violet border border-cyber-violet/20 text-center min-w-[80px]">
                          <span className="text-[10px] font-semibold block uppercase tracking-wider">Date</span>
                          <span className="text-sm font-outfit font-bold">{dateStr.split(',')[0]}</span>
                        </div>
                        <div>
                          <h4 className="font-outfit font-bold text-white text-base">{event.title}</h4>
                          {event.description && <p className="text-xs text-gray-400 mt-0.5">{event.description}</p>}
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-2 font-medium">
                            <Clock className="w-3.5 h-3.5 text-cyber-teal" />
                            <span>{startStr} - {endStr} ({((end - start)/3600000).toFixed(1)} hours)</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="w-8 h-8 rounded-xl bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 text-red-400 hover:text-red-300 flex items-center justify-center transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                  <CalendarIcon className="w-12 h-12 text-cyber-border mb-3" />
                  <p className="text-sm">Your schedule is currently blank.</p>
                  <p className="text-xs text-gray-500 mt-1">Submit an event or log one via speech recognition.</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
