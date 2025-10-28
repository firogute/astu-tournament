// routes/manager.js
import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// Get manager's team data
router.get(
  "/my-team",
  authenticateJWT,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("team_id")
        .eq("id", req.user.id)
        .single();

      if (userError || !user.team_id) {
        return res
          .status(404)
          .json({ error: "Team not found for this manager" });
      }

      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("id", user.team_id)
        .single();

      if (teamError) {
        return res.status(404).json({ error: "Team not found" });
      }

      res.json({ success: true, team });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get manager's players
router.get(
  "/my-players",
  authenticateJWT,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const { data: user } = await supabase
        .from("users")
        .select("team_id")
        .eq("id", req.user.id)
        .single();

      const { data: players, error } = await supabase
        .from("players")
        .select("*")
        .eq("team_id", user.team_id)
        .eq("is_active", true)
        .order("jersey_number");

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ success: true, players: players || [] });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get team statistics
router.get(
  "/team-stats",
  authenticateJWT,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const { data: user } = await supabase
        .from("users")
        .select("team_id")
        .eq("id", req.user.id)
        .single();

      // Get current tournament
      const { data: tournament } = await supabase
        .from("tournaments")
        .select("id")
        .eq("status", "active")
        .single();

      if (!tournament) {
        return res.json({ success: true, stats: defaultStats });
      }

      // Get team standings
      const { data: standing } = await supabase
        .from("team_standings")
        .select("*")
        .eq("tournament_id", tournament.id)
        .eq("team_id", user.team_id)
        .single();

      // Get player count
      const { count: squadSize } = await supabase
        .from("players")
        .select("*", { count: "exact", head: true })
        .eq("team_id", user.team_id)
        .eq("is_active", true);

      // Get recent matches
      const { data: matches } = await supabase
        .from("matches")
        .select(
          "id, home_score, away_score, home_team_id, away_team_id, status"
        )
        .or(`home_team_id.eq.${user.team_id},away_team_id.eq.${user.team_id}`)
        .in("status", ["full_time", "first_half", "second_half", "half_time"])
        .order("match_date", { ascending: false })
        .limit(10);

      const stats = {
        squadSize: squadSize || 0,
        matchesPlayed: standing?.matches_played || 0,
        wins: standing?.wins || 0,
        points: standing?.points || 0,
        goalsScored: standing?.goals_for || 0,
        goalsConceded: standing?.goals_against || 0,
        form: standing?.form || "",
      };

      res.json({ success: true, stats });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get upcoming matches
router.get(
  "/upcoming-matches",
  authenticateJWT,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const { data: user } = await supabase
        .from("users")
        .select("team_id")
        .eq("id", req.user.id)
        .single();

      const { data: matches, error } = await supabase
        .from("matches")
        .select(
          `
        id,
        match_date,
        match_time,
        status,
        venue:venue_id(name),
        home_team:home_team_id(id, name, short_name),
        away_team:away_team_id(id, name, short_name),
        tournament:tournament_id(name)
      `
        )
        .or(`home_team_id.eq.${user.team_id},away_team_id.eq.${user.team_id}`)
        .eq("status", "scheduled")
        .order("match_date", { ascending: true })
        .limit(5);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      const formattedMatches = matches.map((match) => ({
        id: match.id,
        date: match.match_date,
        time: match.match_time,
        venue: match.venue?.name || "TBD",
        opponent:
          match.home_team_id === user.team_id
            ? match.away_team
            : match.home_team,
        isHome: match.home_team_id === user.team_id,
        tournament: match.tournament?.name,
      }));

      res.json({ success: true, matches: formattedMatches });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
