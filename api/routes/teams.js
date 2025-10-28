import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// GET routes:
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("teams").select("*");
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data)
      return res.status(404).json({ error: "Team not found" });
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET players by team ID - ADD THIS ROUTE
router.get("/:id/players", async (req, res) => {
  try {
    const { id } = req.params;

    // Get players for the team
    const { data: players, error } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", id)
      .eq("is_active", true)
      .order("jersey_number", { ascending: true });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ success: true, data: players || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new team (admin/manager only)
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin", "manager"),
  async (req, res) => {
    try {
      const teamData = req.body;
      const { data, error } = await supabase
        .from("teams")
        .insert(teamData, { returning: "representation" });
      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json({ message: "Team created", team: data[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update team (admin/manager only)
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin", "manager"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const { data, error } = await supabase
        .from("teams")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        message: "Team updated successfully",
        data,
      });
    } catch (error) {
      console.error("Update team error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete team (admin only)
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // First, check if team exists
      const { data: team, error: fetchError } = await supabase
        .from("teams")
        .select("name")
        .eq("id", id)
        .single();

      if (fetchError || !team) {
        return res.status(404).json({ error: "Team not found" });
      }

      // Check if team has players
      const { data: players, error: playersError } = await supabase
        .from("players")
        .select("id")
        .eq("team_id", id)
        .limit(1);

      if (playersError) throw playersError;

      if (players && players.length > 0) {
        return res.status(400).json({
          error:
            "Cannot delete team with players. Please transfer or delete players first.",
        });
      }

      // Check if team has matches
      const { data: matches, error: matchesError } = await supabase
        .from("matches")
        .select("id")
        .or(`home_team_id.eq.${id},away_team_id.eq.${id}`)
        .limit(1);

      if (matchesError) throw matchesError;

      if (matches && matches.length > 0) {
        return res.status(400).json({
          error:
            "Cannot delete team with scheduled matches. Please update matches first.",
        });
      }

      // Delete the team
      const { error } = await supabase.from("teams").delete().eq("id", id);

      if (error) throw error;

      res.json({
        success: true,
        message: `Team "${team.name}" deleted successfully`,
      });
    } catch (error) {
      console.error("Delete team error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
