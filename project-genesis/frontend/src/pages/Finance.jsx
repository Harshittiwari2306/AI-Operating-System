import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  PieChart as PieIcon,
  Calendar
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { DoughnutChart, BarChart } from '../components/Charts';
import { motion, AnimatePresence } from 'framer-motion';

const Finance = () => {
  const [txs, setTxs] = useState([]);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      const txsRes = await axios.get('/api/finance/');
      setTxs(txsRes.data);
      
      const forecastRes = await axios.get('/api/finance/forecast');
      setForecast(forecastRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    try {
      await axios.post('/api/finance/', {
        amount: parseFloat(amount),
        type,
        category,
        description
      });
      setAmount('');
      setDescription('');
      fetchFinanceData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTransaction = async (txId) => {
    try {
      await axios.delete(`/api/finance/${txId}`);
      fetchFinanceData();
    } catch (err) {
      console.error(err);
    }
  };

  // Compile calculations
  const totalIncome = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const savings = Math.max(0, totalIncome - totalExpense);

  // Group expenses by category
  const expenseCategories = {};
  txs.filter(t => t.type === 'expense').forEach(t => {
    expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
  });

  const doughnutData = {
    labels: Object.keys(expenseCategories),
    datasets: [{
      data: Object.values(expenseCategories),
      backgroundColor: ['#FF007A', '#9F7AEA', '#00F2FE', '#FFB800', '#00F5A0', '#4FACFE'],
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)'
    }]
  };

  const summaryBarData = {
    labels: ['Total Income', 'Total Expense', 'Savings Balance'],
    datasets: [{
      label: 'Amount ($)',
      data: [totalIncome, totalExpense, savings],
      backgroundColor: ['#00F5A0', '#FF007A', '#00F2FE'],
      borderWidth: 0,
      borderRadius: 8
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
        <h1 className="text-3xl font-outfit font-extrabold text-white">Finance Module</h1>
        <p className="text-sm text-gray-400 mt-1">
          Monitor your income, expenses, and savings balance while leveraging statistical linear forecasting to predict upcoming bills.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="flex flex-col justify-between p-5">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Total Income</span>
          <h2 className="text-2xl font-outfit font-extrabold text-cyber-mint mt-2">${totalIncome.toFixed(2)}</h2>
          <span className="text-[10px] text-gray-500 block mt-1">All recorded income channels</span>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between p-5">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Total Expenses</span>
          <h2 className="text-2xl font-outfit font-extrabold text-cyber-pink mt-2">${totalExpense.toFixed(2)}</h2>
          <span className="text-[10px] text-gray-500 block mt-1">All recorded expense channels</span>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between p-5">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Savings Balance</span>
          <h2 className="text-2xl font-outfit font-extrabold text-cyber-teal mt-2">${savings.toFixed(2)}</h2>
          <span className="text-[10px] text-gray-500 block mt-1">Income minus expenses</span>
        </GlassCard>

        {/* AI Forecast card */}
        <GlassCard className="flex flex-col justify-between p-5 border-cyber-pink/20">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Spend Prediction</span>
          {forecast?.forecast ? (
            <div className="mt-2 space-y-1">
              <h2 className="text-2xl font-outfit font-extrabold text-white">
                ${forecast.forecast.predicted_next_month?.toFixed(2)}
              </h2>
              <div className="flex justify-between items-center text-[9px] text-gray-500 pt-1">
                <span>Trend: <strong className="text-cyber-pink font-semibold">{forecast.forecast.trend}</strong></span>
                <span>Confidence: {forecast.forecast.confidence}</span>
              </div>
            </div>
          ) : (
            <h2 className="text-2xl font-outfit font-extrabold text-gray-500 mt-2">$0.00</h2>
          )}
        </GlassCard>
      </div>

      {/* Budget Deficit Warnings */}
      {forecast?.alert_triggered && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-cyber-pink/10 border border-cyber-pink/30 text-cyber-pink flex items-center gap-3.5"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-xs font-medium leading-normal">
            <strong>Budget Deficit Forecast Alert:</strong> Your projected spending next month (${forecast.forecast?.predicted_next_month}) represents over 90% of your current income. Consider cutting back on luxury purchases!
          </p>
        </motion.div>
      )}

      {/* Grid: Transaction Logger vs Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logger form */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="font-outfit font-bold text-white text-lg border-b border-cyber-border pb-2 flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyber-teal" />
              <span>Log Transaction</span>
            </h3>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="24.99"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Type</label>
                  <select
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value);
                      setCategory(e.target.value === 'income' ? 'Salary' : 'Food');
                    }}
                    className="w-full glass-input text-sm text-gray-300"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  {type === 'expense' ? (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full glass-input text-sm text-gray-300"
                    >
                      <option value="Food">Food & Dining</option>
                      <option value="Rent">Rent & Living</option>
                      <option value="Bills">Bills & Utilities</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Travel">Travel</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full glass-input text-sm text-gray-300"
                    >
                      <option value="Salary">Salary</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Investment">Investment</option>
                      <option value="Other">Other</option>
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly grocery shopping"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full glass-input text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full cyber-btn-teal py-2 text-xs uppercase tracking-wider font-bold"
              >
                Log Transaction
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Charts & Transaction Index */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category split Doughnut */}
            <GlassCard className="h-[250px] flex flex-col justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-cyber-border mb-2">Expense Divisions</h4>
              <div className="flex-1 relative">
                {Object.keys(expenseCategories).length > 0 ? (
                  <DoughnutChart data={doughnutData} />
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-500">Log expenses to review splits</div>
                )}
              </div>
            </GlassCard>

            {/* Income vs expense Bar */}
            <GlassCard className="h-[250px] flex flex-col justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-cyber-border mb-2">Finance Overview</h4>
              <div className="flex-1 relative">
                <BarChart data={summaryBarData} options={{ scales: { x: { grid: { display: false } } } }} />
              </div>
            </GlassCard>
          </div>

          {/* Ledger History List */}
          <GlassCard className="h-[260px] flex flex-col">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-cyber-border mb-3">Transaction Ledger</h4>
            <div className="overflow-y-auto pr-1 space-y-2 flex-1 no-scrollbar">
              {txs.length > 0 ? (
                txs.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center text-sm">
                    <div className="flex gap-3 items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        t.type === 'income' ? 'bg-cyber-mint/15 text-cyber-mint' : 'bg-cyber-pink/15 text-cyber-pink'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{t.description || t.category}</h4>
                        <span className="text-[10px] text-gray-500 block uppercase mt-0.5">{t.category} • {new Date(t.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-outfit font-extrabold text-base ${
                        t.type === 'income' ? 'text-cyber-mint' : 'text-cyber-pink'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleDeleteTransaction(t.id)}
                        className="w-7 h-7 rounded-lg bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 text-red-400 flex items-center justify-center transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-gray-500">
                  Ledger history is clean. Log a transaction!
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Finance;
