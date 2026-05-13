import React, { useEffect, useState, useMemo } from "react";
import { transactionsAPI } from "../services/api";
import TransactionItem, { formatCurrency } from "../components/TransactionItem";

const CATEGORIES = [
  "all", "salary", "freelance", "investment", "business",
  "food", "transport", "shopping", "entertainment",
  "health", "education", "utilities", "rent", "travel", "other",
];

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [deleteId, setDeleteId] = useState(null);

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

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        !search ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        t.note?.toLowerCase().includes(search.toLowerCase());

      const matchesType = filterType === "all" || t.type === filterType;
      const matchesCategory = filterCategory === "all" || t.category === filterCategory;

      const tDate = new Date(t.date);
      const matchesFrom = !filterDateFrom || tDate >= new Date(filterDateFrom);
      const matchesTo = !filterDateTo || tDate <= new Date(filterDateTo + "T23:59:59");

      return matchesSearch && matchesType && matchesCategory && matchesFrom && matchesTo;
    });
  }, [transactions, search, filterType, filterCategory, filterDateFrom, filterDateTo]);

  const handleDelete = async (id) => {
    setDeleteId(id);
    try {
      await transactionsAPI.delete(id);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete transaction.");
    } finally {
      setDeleteId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterType("all");
    setFilterCategory("all");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const filteredIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const filteredExpenses = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Transaction History</h1>
        <p className="text-slate-400 mt-1">Search, filter, and review all your transactions</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="input-field pl-9"
            />
          </div>

          {/* Type filter */}
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field">
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {/* Category filter */}
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input-field capitalize">
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>

          {/* Clear filters button */}
          <button onClick={clearFilters} className="btn-secondary text-sm">
            Clear Filters
          </button>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">From</label>
            <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">To</label>
            <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="input-field" />
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card py-3 text-center">
          <p className="text-xs text-slate-400 mb-1">Results</p>
          <p className="text-lg font-bold text-white">{filtered.length}</p>
        </div>
        <div className="card py-3 text-center">
          <p className="text-xs text-slate-400 mb-1">Income</p>
          <p className="text-sm font-bold text-accent-green font-mono">{formatCurrency(filteredIncome)}</p>
        </div>
        <div className="card py-3 text-center">
          <p className="text-xs text-slate-400 mb-1">Expenses</p>
          <p className="text-sm font-bold text-red-400 font-mono">{formatCurrency(filteredExpenses)}</p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-400 text-sm text-center py-8">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-slate-400 text-sm">No transactions match your filters</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((t) => (
              <div
                key={t._id}
                className={`transition-opacity duration-300 ${deleteId === t._id ? "opacity-40" : "opacity-100"}`}
              >
                <TransactionItem
                  transaction={t}
                  onDelete={deleteId ? null : handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
