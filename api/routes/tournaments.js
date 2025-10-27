import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// Get all tournaments
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get tournament by ID
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data)
      return res.status(404).json({ error: "Tournament not found" });
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create tournament (admin only)
router.post("/", authenticateJWT, authorizeRoles("admin"), async (req, res) => {
  try {
    const tournamentData = req.body;
    const { data, error } = await supabase
      .from("tournaments")
      .insert(tournamentData)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({
      success: true,
      message: "Tournament created",
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update tournament (admin only)
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const { data, error } = await supabase
        .from("tournaments")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      res.json({
        success: true,
        message: "Tournament updated successfully",
        data,
      });
    } catch (error) {
      console.error("Update tournament error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete tournament (admin only)
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // First, check if tournament exists
      const { data: tournament, error: fetchError } = await supabase
        .from("tournaments")
        .select("name")
        .eq("id", id)
        .single();

      if (fetchError || !tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }

      // Delete the tournament
      const { error } = await supabase
        .from("tournaments")
        .delete()
        .eq("id", id);

      if (error) throw error;

      res.json({
        success: true,
        message: `Tournament "${tournament.name}" deleted successfully`,
      });
    } catch (error) {
      console.error("Delete tournament error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Get tournament with related data (teams, matches, standings)
router.get("/:id/full", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const [tournamentRes, teamsRes, matchesRes, standingsRes] =
      await Promise.all([
        supabase.from("tournaments").select("*").eq("id", id).single(),
        supabase
          .from("tournament_teams")
          .select("team:teams(*)")
          .eq("tournament_id", id),
        supabase
          .from("matches")
          .select(
            `
          *,
          home_team:home_team_id(*),
          away_team:away_team_id(*),
          venue:venues(*)
        `
          )
          .eq("tournament_id", id)
          .order("match_date", { ascending: false }),
        supabase
          .from("team_standings")
          .select(
            `
          *,
          team:teams(*)
        `
          )
          .eq("tournament_id", id)
          .order("points", { ascending: false }),
      ]);

    if (tournamentRes.error) throw tournamentRes.error;

    res.json({
      success: true,
      data: {
        tournament: tournamentRes.data,
        teams: teamsRes.data?.map((t) => t.team) || [],
        matches: matchesRes.data || [],
        standings: standingsRes.data || [],
      },
    });
  } catch (error) {
    console.error("Get tournament full error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update tournament status (admin only)
router.patch(
  "/:id/status",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["upcoming", "active", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const { data, error } = await supabase
        .from("tournaments")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        message: `Tournament status updated to ${status}`,
        data,
      });
    } catch (error) {
      console.error("Update status error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
