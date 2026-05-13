require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Validate env vars before loading anything else
const required = ["SUPABASE_URL", "SUPABASE_SERVICE_KEY", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ FATAL: Missing environment variables: ${missing.join(", ")}`);
  console.error("   Copy .env.example to .env and fill in all values.");
  process.exit(1);
}

const supabase = require("./supabase");
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

// Health check — also tests Supabase connection
app.get("/api/health", async (req, res) => {
  try {
    const { error } = await supabase.from("users").select("id").limit(1);
    if (error) throw error;
    res.json({ status: "OK", database: "Supabase connected" });
  } catch (err) {
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 MoneyMap server running on port ${PORT}`);
  console.log(`🔌 Testing Supabase connection...`);

  try {
    const { error } = await supabase.from("users").select("id").limit(1);
    if (error) throw error;
    console.log("✅ Supabase connected successfully");
  } catch (err) {
    console.error("❌ Supabase connection test failed:", err.message);
    console.error("   Check your SUPABASE_URL and SUPABASE_SERVICE_KEY in .env");
    console.error("   Also make sure you ran the SQL setup script in Supabase.");
  }
});
