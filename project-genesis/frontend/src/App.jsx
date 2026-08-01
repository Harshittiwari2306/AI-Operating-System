import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Sidebar from './components/Sidebar';
import VoiceButton from './components/VoiceButton';

// Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Tasks from './pages/Tasks';
import StudyPlanner from './pages/StudyPlanner';
import Notes from './pages/Notes';
import DocumentBrain from './pages/DocumentBrain';
import ChatAssistant from './pages/ChatAssistant';
import Finance from './pages/Finance';
import Habits from './pages/Habits';
import MoodJournal from './pages/MoodJournal';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';

// Protected layout wrapper: renders sidebar + outlet
const AppLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyber-violet to-cyber-teal flex items-center justify-center shadow-xl shadow-cyber-glow">
            <span className="font-outfit font-black text-3xl text-cyber-dark">G</span>
          </div>
          <div className="w-10 h-10 rounded-full border-4 border-cyber-violet border-t-transparent animate-spin"></div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Initializing Genesis OS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Fixed sidebar navigation */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto py-8 px-6 min-h-screen">
        <Outlet />
      </main>

      {/* Floating voice assistant button */}
      <VoiceButton />
    </div>
  );
};

// Public route: redirects logged-in users to dashboard
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

// Admin-only route guard
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            }
          />

          {/* Protected App Routes (with sidebar layout) */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/study" element={<StudyPlanner />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/brain" element={<DocumentBrain />} />
            <Route path="/chat" element={<ChatAssistant />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/mood" element={<MoodJournal />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
