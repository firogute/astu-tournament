import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("players").select("*");

    if (error) return res.status(400).json({ error: error.message });

    res.json({ players: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/top-assists", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const { data, error } = await supabase.from("player_match_stats").select(`
        player_id,
        goals,
        assists,
        minutes_played,
        players (
          name,
          team_id,
          teams (name)
        )
      `);

    if (error) {
      console.error("Database error:", error);
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.json({
        topAssists: [],
        count: 0,
      });
    }

    const playerStats = {};

    data.forEach((stat) => {
      const playerId = stat.player_id;

      if (!playerStats[playerId]) {
        playerStats[playerId] = {
          player_id: playerId,
          name: stat.players?.name || "Unknown Player",
          team_id: stat.players?.team_id || "",
          team: stat.players?.teams?.name || "Unknown Team",
          goals: 0,
          assists: 0,
          minutes_played: 0,
          appearances: 0,
        };
      }

      playerStats[playerId].goals += stat.goals || 0;
      playerStats[playerId].assists += stat.assists || 0;
      playerStats[playerId].minutes_played += stat.minutes_played || 0;
      playerStats[playerId].appearances += 1;
    });

    const topAssists = Object.values(playerStats)
      .filter((player) => player.assists > 0)
      .sort((a, b) => {
        if (b.assists !== a.assists) return b.assists - a.assists;
        return b.goals - a.goals;
      })
      .slice(0, limit);

    res.json({
      topAssists: topAssists,
      count: topAssists.length,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/top-scorers", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const { data, error } = await supabase.from("player_match_stats").select(`
        player_id,
        goals,
        assists,
        players (
          name,
          team_id,
          teams (name)
        )
      `);

    if (error) {
      console.error("Database error:", error);
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.json({
        topScorers: [],
        count: 0,
      });
    }

    const playerStats = {};

    data.forEach((stat) => {
      const playerId = stat.player_id;

      if (!playerStats[playerId]) {
        playerStats[playerId] = {
          player_id: playerId,
          name: stat.players?.name || "Unknown Player",
          team_id: stat.players?.team_id || "",
          team: stat.players?.teams?.name || "Unknown Team",
          goals: 0,
          assists: 0,
        };
      }

      playerStats[playerId].goals += stat.goals || 0;
      playerStats[playerId].assists += stat.assists || 0;
    });

    const topScorers = Object.values(playerStats)
      .filter((player) => player.goals > 0)
      .sort((a, b) => {
        if (b.goals !== a.goals) return b.goals - a.goals;
        return b.assists - a.assists;
      })
      .slice(0, limit);

    res.json({
      topScorers: topScorers,
      count: topScorers.length,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/team/:teamId", async (req, res) => {
  try {
    const { teamId } = req.params;

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", teamId)
      .order("jersey_number", { ascending: true });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data)
      return res.status(404).json({ error: "Player not found" });

    res.json({ player: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin", "manager"),
  async (req, res) => {
    try {
      const playerData = req.body;

      const { data, error } = await supabase
        .from("players")
        .insert(playerData)
        .select()
        .single(); // ensures one object, not array

      if (error) {
        console.error("Supabase insert error:", error);
        return res.status(400).json({ success: false, error: error.message });
      }

      if (!data) {
        return res.status(500).json({ success: false, error: "Insert failed" });
      }

      // Always return valid JSON and 201 status
      return res.status(201).json({
        success: true,
        message: "Player created successfully",
        player: data,
      });
    } catch (err) {
      console.error("Unexpected server error:", err);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  }
);

export default router;
