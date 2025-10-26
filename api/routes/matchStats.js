import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// Get match stats for a match
router.get("/:matchId", authenticateJWT, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { data, error } = await supabase
      .from("match_stats")
      .select("*")
      .eq("match_id", matchId)
      .single();
    if (error || !data)
      return res.status(404).json({ error: "Stats not found" });
    res.json({ stats: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update match stats (admin/manager only)
router.put(
  "/:matchId",
  authenticateJWT,
  authorizeRoles("admin", "manager"),
  async (req, res) => {
    try {
      const { matchId } = req.params;
      const updateData = req.body;
      const { data, error } = await supabase
        .from("match_stats")
        .update(updateData)
        .eq("match_id", matchId)
        .select();
      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: "Stats updated", stats: data[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
