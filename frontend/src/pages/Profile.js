import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { transactionsAPI } from "../services/api";
import { formatCurrency } from "../components/TransactionItem";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await transactionsAPI.getAll();
        const transactions = res.data;
        const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const expenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        setStats({
          total: transactions.length,
          income,
          expenses,
          net: income - expenses,
          firstTransaction: transactions.length > 0
            ? new Date(transactions[transactions.length - 1].date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
            : null,
        });
      } catch {
        // silently fail - stats not critical
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 mt-1">Your account information and stats</p>
      </div>

      {/* Profile Card */}
      <div className="card mb-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-green rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-slate-400 mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="bg-accent-green/10 text-accent-green text-xs font-medium px-3 py-1 rounded-full">
                Active Account
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-600 mt-5 pt-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs mb-1">Full Name</p>
            <p className="text-slate-200">{user?.name}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">Email Address</p>
            <p className="text-slate-200 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="card mb-6">
        <h3 className="text-base font-semibold text-white mb-5">Financial Summary</h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-accent-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stats ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-600 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Total Transactions</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="bg-dark-600 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Net Balance</p>
                <p className={`text-xl font-bold font-mono ${stats.net >= 0 ? "text-accent-green" : "text-red-400"}`}>
                  {stats.net >= 0 ? "+" : ""}{formatCurrency(stats.net)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-600 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Total Income</p>
                <p className="text-base font-bold text-accent-green font-mono">{formatCurrency(stats.income)}</p>
              </div>
              <div className="bg-dark-600 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Total Expenses</p>
                <p className="text-base font-bold text-red-400 font-mono">{formatCurrency(stats.expenses)}</p>
              </div>
            </div>

            {stats.firstTransaction && (
              <p className="text-xs text-slate-500 text-center pt-2">
                Tracking since {stats.firstTransaction}
              </p>
            )}
          </div>
        ) : (
          <p className="text-slate-500 text-sm text-center py-4">Unable to load stats</p>
        )}
      </div>

      {/* Account Actions */}
      <div className="card">
        <h3 className="text-base font-semibold text-white mb-4">Account</h3>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
            bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-sm
            hover:bg-red-500/20 transition-all duration-200 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
