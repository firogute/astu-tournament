import { Router } from "express";
import { supabase } from "../lib/supabaseClient.ts";
import {
  authenticateJWT,
  authorizeRoles,
  AuthRequest,
} from "../middleware/auth.ts";

const router: Router = Router();

// Get all events for a match
router.get("/:matchId", authenticateJWT, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { data, error } = await supabase
      .from("match_events")
      .select("*")
      .eq("match_id", matchId)
      .order("minute", { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ events: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new match event (admin/manager only)
router.post(
  "/:matchId",
  authenticateJWT,
  authorizeRoles("admin", "manager"),
  async (req: AuthRequest, res) => {
    try {
      const { matchId } = req.params;
      const eventData = { ...req.body, match_id: matchId };
      const { data, error } = await supabase
        .from("match_events")
        .insert(eventData, { returning: "representation" });

      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json({ message: "Event added", event: data[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update a match event (admin only)
router.put(
  "/:eventId",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req: AuthRequest, res) => {
    try {
      const { eventId } = req.params;
      const { data, error } = await supabase
        .from("match_events")
        .update(req.body)
        .eq("id", eventId)
        .select();

      if (error || !data)
        return res
          .status(400)
          .json({ error: error?.message ?? "Update failed" });
      res.json({ message: "Event updated", event: data[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete a match event (admin only)
router.delete(
  "/:eventId",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const { error } = await supabase
        .from("match_events")
        .delete()
        .eq("id", eventId);
      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: "Event deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
