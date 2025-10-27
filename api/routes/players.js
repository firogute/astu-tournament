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

    console.log(`Returning ${topScorers.length} top scorers`);

    res.json({
      topScorers: topScorers,
      count: topScorers.length,
    });
  } catch (err) {
    console.error("Server error:", err);
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
        .insert(playerData, { returning: "representation" });

      if (error) return res.status(400).json({ error: error.message });

      res.status(201).json({ message: "Player created", player: data[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
