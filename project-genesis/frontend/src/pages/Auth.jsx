import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Mail, Lock, User, PlusCircle, CheckCircle, Sparkles } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [interests, setInterests] = useState('');
  const [dailyGoal, setDailyGoal] = useState('4.0');
  
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMode, setForgotMode] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/');
      } else {
        const interestsArr = interests.split(',').map(i => i.trim()).filter(Boolean);
        await signup(email, password, fullName, interestsArr, dailyGoal);
        setSuccess('Signup successful! Please sign in with your credentials.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'An error occurred. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email: forgotEmail });
      setSuccess(res.data.message);
      setForgotMode(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Email lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background ambient light bubbles */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-cyber-violet/20 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyber-teal/15 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md">
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyber-violet to-cyber-teal items-center justify-center shadow-lg shadow-cyber-glow mb-4">
            <Sparkles className="w-8 h-8 text-cyber-dark" />
          </div>
          <h2 className="font-outfit font-extrabold text-3xl tracking-wide bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            PROJECT GENESIS
          </h2>
          <p className="text-xs text-cyber-teal font-medium tracking-widest uppercase mt-1">
            Artificial Intelligence Operating System for Life
          </p>
        </div>

        <GlassCard hover={false}>
          {forgotMode ? (
            // Forgot Password Screen
            <div>
              <h3 className="font-outfit font-bold text-xl text-white mb-2">Restore Access</h3>
              <p className="text-sm text-gray-400 mb-6">Enter your registered email address. We will simulate a password recovery pipeline in the log files.</p>
              
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full glass-input pl-11 text-sm"
                    />
                  </div>
                </div>

                {error && <div className="text-xs text-red-400 font-medium bg-red-950/20 border border-red-900/30 p-3 rounded-lg">{error}</div>}

                <button type="submit" disabled={loading} className="w-full cyber-btn-violet py-2.5 text-sm uppercase tracking-wider font-bold">
                  {loading ? 'Processing...' : 'Send Recovery Link'}
                </button>

                <div className="text-center mt-4">
                  <button type="button" onClick={() => setForgotMode(false)} className="text-xs text-cyber-teal hover:underline bg-transparent border-none">
                    Back to Login
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // Login / Signup Screen
            <div>
              {/* Header Tabs */}
              <div className="flex border-b border-cyber-border mb-6">
                <button
                  onClick={() => { setIsLogin(true); setError(''); }}
                  className={`flex-1 pb-3 text-sm font-semibold tracking-wider uppercase transition-all duration-200 border-b-2 ${
                    isLogin ? 'border-cyber-violet text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setIsLogin(false); setError(''); }}
                  className={`flex-1 pb-3 text-sm font-semibold tracking-wider uppercase transition-all duration-200 border-b-2 ${
                    !isLogin ? 'border-cyber-violet text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Status Alert Windows */}
              {error && <div className="text-xs text-red-400 font-medium bg-red-950/20 border border-red-900/30 p-3 rounded-lg mb-4">{error}</div>}
              {success && <div className="text-xs text-cyber-mint font-medium bg-cyber-mint/10 border border-cyber-mint/30 p-3 rounded-lg mb-4">{success}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          placeholder="Tony Stark"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full glass-input pl-11 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Interests (Comma separated)</label>
                      <div className="relative">
                        <PlusCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="AI, Physics, Coding, Design"
                          value={interests}
                          onChange={(e) => setInterests(e.target.value)}
                          className="w-full glass-input pl-11 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Daily Study Goal (Hours)</label>
                      <div className="relative">
                        <CheckCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="24"
                          value={dailyGoal}
                          onChange={(e) => setDailyGoal(e.target.value)}
                          className="w-full glass-input pl-11 text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full glass-input pl-11 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full glass-input pl-11 text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button type="button" onClick={() => setForgotMode(true)} className="text-[11px] text-cyber-teal hover:underline bg-transparent border-none">
                    Forgot Password?
                  </button>
                </div>

                <button type="submit" disabled={loading} className="w-full cyber-btn-teal py-2.5 text-sm uppercase tracking-wider font-bold mt-2">
                  {loading ? 'Processing...' : (isLogin ? 'Initialize Session' : 'Activate Core Account')}
                </button>
              </form>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default Auth;
