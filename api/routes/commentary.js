import { Router } from "express";
import { supabase } from "../lib/supabaseClient";
import {
  authenticateJWT,
  authorizeRoles,
  AuthRequest,
} from "../middleware/auth.ts";

const router = Router();

// Get commentary for a match
router.get("/:matchId", authenticateJWT, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { data, error } = await supabase
      .from("commentary")
      .select("*")
      .eq("match_id", matchId)
      .order("minute", { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ commentary: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add commentary (admin/manager/commentator)
router.post(
  "/:matchId",
  authenticateJWT,
  authorizeRoles("admin", "manager", "commentator"),
  async (req, res) => {
    try {
      const { matchId } = req.params;
      const commentaryData = {
        ...req.body,
        match_id: matchId,
        created_by: req.user.id,
      };
      const { data, error } = await supabase
        .from("commentary")
        .insert(commentaryData, { returning: "representation" });

      if (error) return res.status(400).json({ error: error.message });
      res
        .status(201)
        .json({ message: "Commentary added", commentary: data[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update commentary (admin only)
router.put(
  "/:commentId",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { commentId } = req.params;
      const { data, error } = await supabase
        .from("commentary")
        .update(req.body)
        .eq("id", commentId)
        .select();
      if (error || !data)
        return res
          .status(400)
          .json({ error: error?.message ?? "Update failed" });
      res.json({ message: "Commentary updated", commentary: data[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete commentary (admin only)
router.delete(
  "/:commentId",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { commentId } = req.params;
      const { error } = await supabase
        .from("commentary")
        .delete()
        .eq("id", commentId);
      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: "Commentary deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
