import React, { useEffect, useState } from "react";
import { transactionsAPI } from "../services/api";
import AddTransactionForm from "../components/AddTransactionForm";
import TransactionItem, { formatCurrency } from "../components/TransactionItem";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const handleAdd = (newTransaction) => {
    setTransactions((prev) => [newTransaction, ...prev]);
  };

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

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Transactions</h1>
        <p className="text-slate-400 mt-1">Manage your income and expenses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Transaction Form */}
        <div className="lg:col-span-1">
          <AddTransactionForm onAdd={handleAdd} />

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="card py-4">
              <p className="text-xs text-slate-400 mb-1">Income</p>
              <p className="text-sm font-bold text-accent-green font-mono">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="card py-4">
              <p className="text-xs text-slate-400 mb-1">Expenses</p>
              <p className="text-sm font-bold text-red-400 font-mono">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">All Transactions</h2>
              <span className="text-xs text-slate-500 bg-dark-600 px-3 py-1 rounded-full">
                {transactions.length} total
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <p className="text-red-400 text-sm text-center py-8">{error}</p>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-slate-400 text-sm">No transactions yet</p>
                <p className="text-slate-500 text-xs mt-1">Use the form to add your first one</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {transactions.map((t) => (
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
      </div>
    </div>
  );
};

export default Transactions;
