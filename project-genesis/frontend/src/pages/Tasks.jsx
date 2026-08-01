import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckSquare, 
  Trash2, 
  Clock, 
  HelpCircle, 
  Sparkles, 
  Plus, 
  AlertTriangle,
  Play
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Study');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');

  const [suggestedTask, setSuggestedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('open'); // open, completed

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks/');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title) return;
    try {
      await axios.post('/api/tasks/', {
        title,
        description,
        category,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : null
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCompleted = async (taskId, currentCompleted) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { completed: !currentCompleted });
      if (suggestedTask && suggestedTask.id === taskId) {
        setSuggestedTask(null);
      }
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      if (suggestedTask && suggestedTask.id === taskId) {
        setSuggestedTask(null);
      }
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGetSuggestion = async () => {
    setSuggestedTask(null);
    try {
      const res = await axios.get('/api/tasks/suggest-next');
      setSuggestedTask(res.data);
    } catch (err) {
      alert("All tasks are completed! Enjoy your day.");
    }
  };

  const openTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-2">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-outfit font-extrabold text-white">Smart Tasks</h1>
        <p className="text-sm text-gray-400 mt-1">
          Add items, review predicted completion dates, and ask AI what you should work on next.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Task Form and AI Prioritizer Button */}
        <div className="lg:col-span-1 space-y-6">
          {/* Form */}
          <GlassCard className="space-y-4">
            <h3 className="font-outfit font-bold text-white text-lg border-b border-cyber-border pb-2 flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyber-teal" />
              <span>Create Task</span>
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Code database migrations"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  placeholder="Details of task..."
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full glass-input text-sm resize-none"
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
                    <option value="Study">Study</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full glass-input text-sm text-gray-300"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Due Date</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full glass-input text-sm text-gray-300"
                />
              </div>

              <button
                type="submit"
                className="w-full cyber-btn-teal py-2 text-xs uppercase tracking-wider font-bold"
              >
                Log Task
              </button>
            </form>
          </GlassCard>

          {/* AI Suggestion Box */}
          <GlassCard className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-outfit font-bold text-white text-base">Next Action Engine</h3>
              <button
                onClick={handleGetSuggestion}
                className="flex items-center gap-1 text-[10px] uppercase font-bold text-cyber-teal hover:underline bg-transparent border-none"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>
            </div>
            
            <AnimatePresence mode="wait">
              {suggestedTask ? (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-xl bg-cyber-violet/10 border border-cyber-violet/25 space-y-3"
                >
                  <div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-cyber-violet/20 text-cyber-violet border border-cyber-violet/30 font-bold uppercase tracking-wider">
                      Suggested Focus
                    </span>
                    <h4 className="font-outfit font-bold text-white text-sm mt-2">{suggestedTask.title}</h4>
                    {suggestedTask.description && <p className="text-xs text-gray-400 mt-1 leading-normal">{suggestedTask.description}</p>}
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 border-t border-cyber-border/40">
                    <span>Priority: {suggestedTask.priority}</span>
                    <button
                      onClick={() => handleToggleCompleted(suggestedTask.id, false)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyber-teal text-cyber-dark font-bold font-outfit uppercase tracking-wider"
                    >
                      <Play className="w-2.5 h-2.5 fill-cyber-dark" />
                      <span>Complete</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-gray-500 py-6">
                  Click 'Ask AI' to analyze your backlog and suggest the next task.
                </div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>

        {/* Right: Task Board */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="h-[550px] flex flex-col">
            {/* Tabs */}
            <div className="flex justify-between items-center border-b border-cyber-border pb-3 mb-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('open')}
                  className={`text-sm font-semibold tracking-wider uppercase pb-1.5 border-b-2 transition-all ${
                    activeTab === 'open' ? 'border-cyber-teal text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Open ({openTasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`text-sm font-semibold tracking-wider uppercase pb-1.5 border-b-2 transition-all ${
                    activeTab === 'completed' ? 'border-cyber-teal text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Completed ({completedTasks.length})
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto pr-2 space-y-4 flex-1 no-scrollbar">
              {activeTab === 'open' ? (
                openTasks.length > 0 ? (
                  openTasks.map((task) => (
                    <div 
                      key={task.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyber-teal/30 hover:bg-white/10 transition-all flex justify-between items-center gap-4"
                    >
                      <div className="flex gap-3 items-center">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => handleToggleCompleted(task.id, false)}
                          className="w-5 h-5 rounded border-cyber-border bg-cyber-dark text-cyber-teal focus:ring-cyber-teal cursor-pointer"
                        />
                        <div>
                          <h4 className="font-outfit font-bold text-white text-base">{task.title}</h4>
                          {task.description && <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>}
                          
                          {/* Metadatas */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-[10px] text-gray-500 font-medium">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">{task.category}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-cyber-teal" />
                              <span>Due: {task.due_date ? new Date(task.due_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Flexible'}</span>
                            </span>
                            {task.predicted_due_date && (
                              <span className="flex items-center gap-1 text-cyber-violet">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>AI Forecasted: {new Date(task.predicted_due_date).toLocaleDateString()}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="w-8 h-8 rounded-xl bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 text-red-400 hover:text-red-300 flex items-center justify-center transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                    <CheckSquare className="w-12 h-12 text-cyber-border mb-3" />
                    <p className="text-sm">Congratulations! Your backlog is empty.</p>
                  </div>
                )
              ) : (
                completedTasks.length > 0 ? (
                  completedTasks.map((task) => (
                    <div 
                      key={task.id}
                      className="p-4 rounded-2xl bg-white/2 border border-white/5 opacity-70 flex justify-between items-center gap-4"
                    >
                      <div className="flex gap-3 items-center">
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={() => handleToggleCompleted(task.id, true)}
                          className="w-5 h-5 rounded border-cyber-border bg-cyber-dark text-cyber-teal focus:ring-cyber-teal cursor-pointer"
                        />
                        <div>
                          <h4 className="font-outfit font-bold text-gray-300 text-base line-through">{task.title}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-500 inline-block mt-1">{task.category}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="w-8 h-8 rounded-xl bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 text-red-400 hover:text-red-300 flex items-center justify-center transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                    <CheckSquare className="w-12 h-12 text-cyber-border mb-3" />
                    <p className="text-sm">No completed tasks yet.</p>
                  </div>
                )
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
