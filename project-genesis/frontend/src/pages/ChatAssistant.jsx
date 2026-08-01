import React, { useState } from 'react';
import axios from 'axios';
import { 
  MessageSquare, 
  Sparkles, 
  User, 
  Send,
  HelpCircle,
  Clock,
  CheckSquare
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion } from 'framer-motion';

const ChatAssistant = () => {
  const [query, setQuery] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'ai', text: "🌌 Greetings, operator! I am Genesis OS Companion. I have access to your profile parameters, recent notes, and active tasks. Ask me to structure study blocks, summarize notebooks, or prioritize backlogs." }
  ]);
  const [loading, setLoading] = useState(false);

  const shortcutPrompts = [
    { label: "What should I study today?", icon: Clock },
    { label: "What task is most important?", icon: CheckSquare },
    { label: "Summarize my notes.", icon: MessageSquare },
    { label: "Explain machine learning.", icon: Sparkles }
  ];

  const handleSend = async (messageText) => {
    if (!messageText.trim()) return;

    setChatLog(prev => [...prev, { sender: 'user', text: messageText }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await axios.post('/api/chat/', { query: messageText });
      setChatLog(prev => [...prev, { sender: 'ai', text: res.data.answer }]);
    } catch (err) {
      console.error(err);
      setChatLog(prev => [...prev, { sender: 'ai', text: "Error syncing with digital landscape. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-2">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-outfit font-extrabold text-white">AI Chat Assistant</h1>
        <p className="text-sm text-gray-400 mt-1 font-medium">
          A personal agent companion that answers queries by scanning active tasks, calendar slots, notes, and profile parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Query Shortcuts */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="font-outfit font-bold text-white text-base border-b border-cyber-border pb-2 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyber-teal" />
              <span>Helper Prompts</span>
            </h3>
            <div className="space-y-2.5">
              {shortcutPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.label)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:border-cyber-teal/30 hover:bg-cyber-teal/5 transition-all text-xs font-semibold text-gray-300 flex items-center gap-2.5 leading-snug cursor-pointer"
                >
                  <p.icon className="w-4 h-4 text-cyber-teal flex-shrink-0" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Panel: Interactive Chat box */}
        <div className="lg:col-span-3">
          <GlassCard className="h-[520px] flex flex-col justify-between">
            {/* Box Header */}
            <div className="flex justify-between items-center pb-2 border-b border-cyber-border">
              <div className="flex items-center gap-2 text-cyber-violet">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-outfit font-bold text-white text-base">Conversational Assistant</h3>
              </div>
              <span className="text-[10px] text-gray-500 font-semibold font-outfit tracking-widest uppercase">
                Genesis OS Chat v1.0
              </span>
            </div>

            {/* scrolling logs */}
            <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-4 no-scrollbar">
              {chatLog.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[80%] items-start ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold font-outfit ${
                      msg.sender === 'user' ? 'bg-cyber-violet text-white' : 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                    }`}>
                      {msg.sender === 'user' ? 'U' : 'AI'}
                    </div>
                    <div className={`rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-cyber-violet/20 border border-cyber-violet/30 text-white'
                        : 'bg-white/5 border border-white/5 text-slate-300'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 items-center text-sm text-gray-400">
                    <div className="w-8 h-8 rounded-full bg-cyber-teal/20 border border-cyber-teal/30 flex items-center justify-center text-xs text-cyber-teal font-semibold font-outfit">AI</div>
                    <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="w-2 h-2 rounded-full bg-cyber-teal animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-cyber-teal animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-cyber-teal animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat form */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(query); }}
              className="flex gap-3 pt-3 border-t border-cyber-border/40"
            >
              <input
                type="text"
                required
                placeholder="Ask anything..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full glass-input text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="cyber-btn-teal px-5 py-2 text-xs uppercase tracking-wider font-bold flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
