import React, { useState } from "react";
import { transactionsAPI } from "../services/api";

const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Business", "Other"];
const EXPENSE_CATEGORIES = [
  "Food", "Transport", "Shopping", "Entertainment",
  "Health", "Education", "Utilities", "Rent", "Travel", "Other",
];

const AddTransactionForm = ({ onAdd }) => {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    date: today,
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const categories = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Reset category when type changes
      ...(name === "type" ? { category: "" } : {}),
    }));
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) {
      setError("Amount, category, and date are required.");
      return;
    }
    if (isNaN(form.amount) || Number(form.amount) <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    setLoading(true);
    try {
      const res = await transactionsAPI.create(form);
      onAdd(res.data);
      setForm({ type: "expense", amount: "", category: "", date: today, note: "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-base font-semibold text-white mb-5">Add Transaction</h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-accent-green/10 border border-accent-green/20 text-accent-green text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Transaction added successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Type</label>
          <div className="grid grid-cols-2 gap-2">
            {["income", "expense"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleChange({ target: { name: "type", value: t } })}
                className={`py-2.5 rounded-xl text-sm font-medium capitalize transition-all duration-200
                  ${form.type === t
                    ? t === "income"
                      ? "bg-accent-green text-dark-900"
                      : "bg-red-500 text-white"
                    : "bg-dark-600 text-slate-400 hover:bg-dark-500"
                  }`}
              >
                {t === "income" ? "↑ Income" : "↓ Expense"}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount (₹)</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            className="input-field font-mono"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select category...</option>
            {categories.map((cat) => (
              <option key={cat} value={cat.toLowerCase()}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Note <span className="text-slate-500">(optional)</span>
          </label>
          <input
            type="text"
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Add a note..."
            className="input-field"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
              Adding...
            </span>
          ) : (
            "+ Add Transaction"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddTransactionForm;
