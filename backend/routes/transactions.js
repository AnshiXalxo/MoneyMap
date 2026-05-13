const express = require("express");
const router = express.Router();
const supabase = require("../supabase");
const protect = require("../middleware/auth");

// All routes below are protected
router.use(protect);

// ─── GET /api/transactions ───────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", req.user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Get transactions error:", err.message);
    res.status(500).json({ message: "Failed to fetch transactions." });
  }
});

// ─── POST /api/transactions ──────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { amount, type, category, date, note } = req.body;

    if (!amount || !type || !category) {
      return res.status(400).json({ message: "Amount, type, and category are required." });
    }
    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Type must be 'income' or 'expense'." });
    }
    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number." });
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: req.user.id,
        amount: Number(amount),
        type,
        category: category.trim().toLowerCase(),
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        note: note ? note.trim() : "",
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error("Create transaction error:", err.message);
    res.status(500).json({ message: "Failed to create transaction." });
  }
});

// ─── DELETE /api/transactions/:id ───────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    // First verify the transaction belongs to this user
    const { data: existing, error: findError } = await supabase
      .from("transactions")
      .select("id")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .single();

    if (findError || !existing) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.user.id);

    if (error) throw error;

    res.json({ message: "Transaction deleted successfully." });
  } catch (err) {
    console.error("Delete transaction error:", err.message);
    res.status(500).json({ message: "Failed to delete transaction." });
  }
});

module.exports = router;
