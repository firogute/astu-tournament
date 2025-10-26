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
    const limit = parseInt(req.query.limit) || 10;

    const { data, error } = await supabase.from("player_match_stats").select(`
        player_id,
        goals,
        assists,
        players (
          name,
          jersey_number,
          position,
          teams (name, short_name)
        )
      `);

    if (error) return res.status(400).json({ error: error.message });

    if (!data || data.length === 0) {
      return res.json({
        success: true,
        data: [],
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
          jersey_number: stat.players?.jersey_number || 0,
          position: stat.players?.position || "Unknown",
          team_name: stat.players?.teams?.name || "Unknown Team",
          team_short_name: stat.players?.teams?.short_name || "UNK",
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
      success: true,
      data: topScorers,
      count: topScorers.length,
    });
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
