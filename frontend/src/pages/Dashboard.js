import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { transactionsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import TransactionItem, { formatCurrency } from "../components/TransactionItem";

const StatCard = ({ label, value, change, icon, color }) => (
  <div className="stat-card">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-bold text-white font-mono">{value}</p>
    <p className="text-sm text-slate-400 mt-1">{label}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await transactionsAPI.getAll();
        setTransactions(res.data);
      } catch (err) {
        setError("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;

  const recentTransactions = transactions.slice(0, 5);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          {getGreeting()}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1">Here's your financial overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 stagger-children">
        <StatCard
          label="Total Income"
          value={formatCurrency(totalIncome)}
          color="bg-accent-green/10"
          icon={
            <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          }
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(totalExpenses)}
          color="bg-red-500/10"
          icon={
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          }
        />
        <StatCard
          label="Net Savings"
          value={formatCurrency(Math.abs(netSavings))}
          color={netSavings >= 0 ? "bg-accent-blue/10" : "bg-yellow-500/10"}
          icon={
            <svg className={`w-5 h-5 ${netSavings >= 0 ? "text-accent-blue" : "text-yellow-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Savings bar */}
      {totalIncome > 0 && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-300">Savings Rate</span>
            <span className="text-sm font-semibold text-accent-green font-mono">
              {Math.max(0, Math.round((netSavings / totalIncome) * 100))}%
            </span>
          </div>
          <div className="h-2 bg-dark-500 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-green rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, (netSavings / totalIncome) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-500">Expenses: {formatCurrency(totalExpenses)}</span>
            <span className="text-xs text-slate-500">Income: {formatCurrency(totalIncome)}</span>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Recent Transactions</h2>
          <Link to="/history" className="text-sm text-accent-green hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-400 text-sm text-center py-8">{error}</p>
        ) : recentTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-slate-400 text-sm">No transactions yet</p>
            <Link to="/transactions" className="text-accent-green text-sm hover:underline mt-2 inline-block">
              Add your first transaction →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((t) => (
              <TransactionItem key={t._id} transaction={t} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
