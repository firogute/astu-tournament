import { Router } from "express";
import { supabase } from "../lib/supabaseClient.ts";
import {
  authenticateJWT,
  authorizeRoles,
  AuthRequest,
} from "../middleware/auth.ts";

const router = Router();

// Get stats for a player in a match
router.get("/:matchId/:playerId", authenticateJWT, async (req, res) => {
  try {
    const { matchId, playerId } = req.params;
    const { data, error } = await supabase
      .from("player_match_stats")
      .select("*")
      .eq("match_id", matchId)
      .eq("player_id", playerId)
      .single();
    if (error || !data)
      return res.status(404).json({ error: "Player stats not found" });
    res.json({ stats: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update player stats (admin/manager only)
router.put(
  "/:matchId/:playerId",
  authenticateJWT,
  authorizeRoles("admin", "manager"),
  async (req, res) => {
    try {
      const { matchId, playerId } = req.params;
      const updateData = req.body;
      const { data, error } = await supabase
        .from("player_match_stats")
        .update(updateData)
        .eq("match_id", matchId)
        .eq("player_id", playerId)
        .select();
      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: "Player stats updated", stats: data[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
