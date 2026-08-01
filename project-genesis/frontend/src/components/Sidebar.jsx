import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  BookOpen, 
  FolderGit, 
  MessageSquare, 
  DollarSign, 
  Activity, 
  Smile, 
  BarChart2, 
  ShieldAlert, 
  LogOut,
  Sparkles
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/study', label: 'Study Planner', icon: BookOpen },
    { to: '/notes', label: 'AI Notes', icon: Sparkles },
    { to: '/brain', label: 'Doc Brain', icon: FolderGit },
    { to: '/chat', label: 'Chat Assistant', icon: MessageSquare },
    { to: '/finance', label: 'Finance', icon: DollarSign },
    { to: '/habits', label: 'Habits', icon: Activity },
    { to: '/mood', label: 'Mood Journal', icon: Smile },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  ];

  if (user && user.role === 'admin') {
    navItems.push({ to: '/admin', label: 'Admin Panel', icon: ShieldAlert });
  }

  return (
    <aside className="w-64 glass-panel border-r border-cyber-border h-screen sticky top-0 flex flex-col justify-between py-6 px-4 z-40">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-violet to-cyber-teal flex items-center justify-center shadow-lg shadow-cyber-glow">
            <span className="font-outfit font-extrabold text-xl text-cyber-dark">G</span>
          </div>
          <div>
            <h1 className="font-outfit font-bold text-lg leading-tight tracking-wider bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">GENESIS</h1>
            <span className="text-[10px] text-cyber-teal font-medium tracking-widest uppercase">AI Life OS</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyber-violet/25 to-cyber-teal/5 text-white border-l-4 border-cyber-violet shadow-inner' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Footer block */}
      <div className="pt-4 border-t border-cyber-border flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-cyber-violet flex items-center justify-center font-bold font-outfit text-white text-sm">
            {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : user?.email[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-white truncate">{user?.full_name || 'OS User'}</h4>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-900/30 text-xs font-semibold tracking-wider uppercase transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit System</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
