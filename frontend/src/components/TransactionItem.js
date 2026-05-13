import React from "react";

const CATEGORY_ICONS = {
  salary: "💼",
  freelance: "💻",
  investment: "📈",
  business: "🏢",
  food: "🍔",
  transport: "🚗",
  shopping: "🛍️",
  entertainment: "🎬",
  health: "🏥",
  education: "📚",
  utilities: "⚡",
  rent: "🏠",
  travel: "✈️",
  other: "📦",
};

const getCategoryIcon = (category) => {
  const lower = category.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "💳";
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const TransactionItem = ({ transaction, onDelete, compact = false }) => {
  const isIncome = transaction.type === "income";

  return (
    <div className={`flex items-center gap-4 p-4 bg-dark-600 rounded-xl 
      hover:bg-dark-500 transition-all duration-200 group
      ${compact ? "py-3" : "py-4"}`}>
      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg
        ${isIncome ? "bg-accent-green/10" : "bg-red-500/10"}`}>
        {getCategoryIcon(transaction.category)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate capitalize">
          {transaction.category}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium
            ${isIncome ? "bg-accent-green/10 text-accent-green" : "bg-red-500/10 text-red-400"}`}>
            {transaction.type}
          </span>
          {transaction.note && (
            <span className="text-xs text-slate-500 truncate">{transaction.note}</span>
          )}
        </div>
      </div>

      {/* Amount & Date */}
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-semibold font-mono
          ${isIncome ? "text-accent-green" : "text-red-400"}`}>
          {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{formatDate(transaction.date)}</p>
      </div>

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={() => onDelete(transaction._id)}
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
            text-slate-600 hover:text-red-400 hover:bg-red-500/10
            opacity-0 group-hover:opacity-100 transition-all duration-200"
          title="Delete transaction"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
};

export { formatCurrency, formatDate, getCategoryIcon };
export default TransactionItem;
