import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Users, FileText, Trash2, Activity, Database } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, logsRes, statsRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/logs'),
        axios.get('/api/admin/stats'),
      ]);
      setUsers(usersRes.data);
      setLogs(logsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to clear all system logs? This cannot be undone.')) return;
    try {
      await axios.delete('/api/admin/logs');
      setLogs([]);
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
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-900/40 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h1 className="text-3xl font-outfit font-extrabold text-white">Admin Control Panel</h1>
          <p className="text-sm text-gray-400 mt-0.5">System administration, user management, and audit logs.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cyber-border gap-6">
        {['overview', 'users', 'logs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold tracking-wider uppercase border-b-2 transition-all capitalize ${
              activeTab === tab ? 'border-red-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-cyber-teal' },
            { label: 'Tasks Logged', value: stats.total_tasks_logged, icon: Activity, color: 'text-cyber-violet' },
            { label: 'Files Uploaded', value: stats.total_files_uploaded, icon: Database, color: 'text-cyber-pink' },
            { label: 'Notes Created', value: stats.total_notes_created, icon: FileText, color: 'text-cyber-mint' },
          ].map((item) => (
            <GlassCard key={item.label} className="flex flex-col justify-between p-5">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{item.label}</span>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <h2 className={`text-4xl font-outfit font-extrabold mt-4 ${item.color}`}>{item.value}</h2>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <GlassCard className="space-y-4">
          <h3 className="font-outfit font-bold text-white text-lg border-b border-cyber-border pb-2">
            Registered Users ({users.length})
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
            {users.map((user) => (
              <div key={user.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-cyber-violet flex items-center justify-center font-bold text-sm text-white font-outfit">
                    {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">{user.full_name || 'No Name'}</h4>
                    <p className="text-xs text-gray-400">{user.email}</p>
                    <div className="flex gap-2 mt-1">
                      {(user.interests || []).slice(0, 3).map((i) => (
                        <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">{i}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    user.role === 'admin' ? 'bg-red-950/40 text-red-400 border border-red-900/30' : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}>
                    {user.role}
                  </span>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <GlassCard className="space-y-4">
          <div className="flex justify-between items-center border-b border-cyber-border pb-2">
            <h3 className="font-outfit font-bold text-white text-lg">System Audit Logs ({logs.length})</h3>
            <button
              onClick={handleClearLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 text-red-400 text-xs font-semibold uppercase tracking-wider transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Logs</span>
            </button>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 no-scrollbar font-mono">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex gap-4 items-start text-xs">
                  <span className="text-gray-600 flex-shrink-0 w-32 truncate">
                    {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                  <span className="text-cyber-teal font-bold w-36 flex-shrink-0 truncate">{log.action}</span>
                  <span className="text-gray-400 truncate">{log.details || '—'}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-gray-500">No system logs available.</div>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default AdminPanel;
