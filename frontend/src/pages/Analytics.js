import React, { useEffect, useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { transactionsAPI } from "../services/api";
import { formatCurrency } from "../components/TransactionItem";

const COLORS = [
  "#00E5A0", "#3B82F6", "#A855F7", "#F59E0B",
  "#EF4444", "#06B6D4", "#10B981", "#F97316",
  "#8B5CF6", "#EC4899",
];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-600 border border-dark-500 rounded-xl px-4 py-3 shadow-card text-sm">
        <p className="text-slate-300 font-medium">{payload[0].name}</p>
        <p className="text-white font-mono font-bold mt-1">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const BarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-600 border border-dark-500 rounded-xl px-4 py-3 shadow-card text-sm">
        <p className="text-slate-400 mb-2">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} className="font-mono font-bold" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await transactionsAPI.getAll();
        setTransactions(res.data);
      } catch (err) {
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // Category breakdown for pie chart
  const categoryData = useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const cat = t.category.charAt(0).toUpperCase() + t.category.slice(1);
        map[cat] = (map[cat] || 0) + t.amount;
      });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Monthly income vs expense bar chart
  const monthlyData = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!map[key]) {
        map[key] = {
          month: MONTH_NAMES[date.getMonth()] + " " + date.getFullYear(),
          sortKey: date.getFullYear() * 100 + date.getMonth(),
          income: 0,
          expense: 0,
        };
      }
      if (t.type === "income") map[key].income += t.amount;
      else map[key].expense += t.amount;
    });

    return Object.values(map)
      .sort((a, b) => a.sortKey - b.sortKey)
      .slice(-6); // Last 6 months
  }, [transactions]);

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-center mt-12">{error}</p>;
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-1">Visual breakdown of your financial activity</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-xs text-slate-400 mb-2">Total Income</p>
          <p className="text-xl font-bold text-accent-green font-mono">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-400 mb-2">Total Expenses</p>
          <p className="text-xl font-bold text-red-400 font-mono">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-400 mb-2">Savings Rate</p>
          <p className={`text-xl font-bold font-mono ${savingsRate >= 0 ? "text-accent-blue" : "text-yellow-400"}`}>
            {savingsRate}%
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-slate-400">No data to analyze yet</p>
          <p className="text-slate-500 text-sm mt-1">Add transactions to see your analytics</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Expense Breakdown */}
          <div className="card">
            <h2 className="text-base font-semibold text-white mb-5">Expense Breakdown</h2>
            {categoryData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
                No expense data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: "#94a3b8", fontSize: "12px" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar Chart - Monthly */}
          <div className="card">
            <h2 className="text-base font-semibold text-white mb-5">Monthly Overview</h2>
            {monthlyData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
                No monthly data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2535" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="income" name="Income" fill="#00E5A0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Expense Categories */}
          <div className="card lg:col-span-2">
            <h2 className="text-base font-semibold text-white mb-5">Top Spending Categories</h2>
            {categoryData.length === 0 ? (
              <p className="text-slate-500 text-sm">No expense data yet</p>
            ) : (
              <div className="space-y-3">
                {categoryData.slice(0, 6).map((cat, i) => {
                  const pct = totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-slate-300">{cat.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">{pct.toFixed(1)}%</span>
                          <span className="text-sm font-mono font-medium text-white">{formatCurrency(cat.value)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-dark-500 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
