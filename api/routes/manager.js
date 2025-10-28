// routes/manager.js - UPDATED WITH LINEUP SUPPORT
import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// Get manager's team info
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
        return res.status(404).json({ error: "Team not found" });
      }

      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select(
          `
          *,
          players:players(*, player_match_stats(*)),
          coach:users(id, name, email)
        `
        )
        .eq("id", user.team_id)
        .single();

      if (teamError) {
        return res.status(400).json({ error: teamError.message });
      }

      res.json({ success: true, team });
    } catch (err) {
      console.error(err);
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

      let stats = {
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        cleanSheets: 0,
        topScorer: null,
      };

      if (tournament) {
        // Get standings
        const { data: standing } = await supabase
          .from("team_standings")
          .select("*")
          .eq("tournament_id", tournament.id)
          .eq("team_id", user.team_id)
          .single();

        if (standing) {
          stats = {
            matchesPlayed: standing.matches_played,
            wins: standing.wins,
            draws: standing.draws,
            losses: standing.losses,
            goalsFor: standing.goals_for,
            goalsAgainst: standing.goals_against,
            goalDifference: standing.goal_difference,
            points: standing.points,
            form: standing.form,
          };
        }

        // Get top scorer
        const { data: topScorer } = await supabase
          .from("players")
          .select(
            `
            name,
            player_match_stats!inner(goals)
          `
          )
          .eq("team_id", user.team_id)
          .eq(
            "player_match_stats.match_id.in",
            supabase
              .from("matches")
              .select("id")
              .eq("tournament_id", tournament.id)
          )
          .order("goals", {
            foreignTable: "player_match_stats",
            ascending: false,
          })
          .limit(1)
          .single();

        if (topScorer) {
          stats.topScorer = topScorer;
        }
      }

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
          *,
          home_team:home_team_id(*),
          away_team:away_team_id(*),
          venue:venues(*),
          tournament:tournaments(*)
        `
        )
        .or(`home_team_id.eq.${user.team_id},away_team_id.eq.${user.team_id}`)
        .in("status", ["scheduled", "first_half", "half_time", "second_half"])
        .order("match_date", { ascending: true })
        .order("match_time", { ascending: true })
        .limit(5);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ success: true, matches: matches || [] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get recent results
router.get(
  "/recent-results",
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
          *,
          home_team:home_team_id(*),
          away_team:away_team_id(*),
          venue:venues(*),
          match_stats(*)
        `
        )
        .or(`home_team_id.eq.${user.team_id},away_team_id.eq.${user.team_id}`)
        .in("status", ["full_time", "extra_time", "penalties"])
        .order("match_date", { ascending: false })
        .order("match_time", { ascending: false })
        .limit(5);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ success: true, matches: matches || [] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get manager's available formations
router.get(
  "/formations",
  authenticateJWT,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const { data: user } = await supabase
        .from("users")
        .select("team_id")
        .eq("id", req.user.id)
        .single();

      const { data: formations, error } = await supabase
        .from("team_formations")
        .select("*")
        .eq("team_id", user.team_id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ success: true, formations: formations || [] });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Save lineup for a match
router.post(
  "/lineups",
  authenticateJWT,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const { match_id, formation_id, formation_structure, players } = req.body;

      const { data: user } = await supabase
        .from("users")
        .select("team_id")
        .eq("id", req.user.id)
        .single();

      // Start transaction
      const { data: lineup, error: lineupError } = await supabase
        .from("match_lineups")
        .upsert({
          match_id,
          team_id: user.team_id,
          formation_id,
          formation_structure,
          created_by: req.user.id,
          is_confirmed: true,
        })
        .select()
        .single();

      if (lineupError) {
        return res.status(400).json({ error: lineupError.message });
      }

      // Delete existing lineup players
      await supabase.from("lineup_players").delete().eq("lineup_id", lineup.id);

      // Insert new lineup players
      const lineupPlayers = players.map((player, index) => ({
        lineup_id: lineup.id,
        player_id: player.id,
        position: player.position,
        jersey_number: player.jersey_number,
        is_starter: true,
        position_order: index,
      }));

      const { error: playersError } = await supabase
        .from("lineup_players")
        .insert(lineupPlayers);

      if (playersError) {
        return res.status(400).json({ error: playersError.message });
      }

      res.json({
        success: true,
        message: "Lineup saved successfully",
        lineup,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get saved lineups for manager's team
router.get(
  "/lineups",
  authenticateJWT,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const { data: user } = await supabase
        .from("users")
        .select("team_id")
        .eq("id", req.user.id)
        .single();

      const { data: lineups, error } = await supabase
        .from("match_lineups")
        .select(
          `
          *,
          match:matches(
            id,
            match_date,
            match_time,
            home_team:home_team_id(name, short_name),
            away_team:away_team_id(name, short_name)
          ),
          formation:team_formations(*),
          players:lineup_players(
            player:players(
              id,
              name,
              jersey_number,
              position,
              photo
            ),
            position,
            is_starter
          )
        `
        )
        .eq("team_id", user.team_id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ success: true, lineups: lineups || [] });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get lineup for specific match
router.get(
  "/lineups/match/:matchId",
  authenticateJWT,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const { matchId } = req.params;
      const { data: user } = await supabase
        .from("users")
        .select("team_id")
        .eq("id", req.user.id)
        .single();

      const { data: lineup, error } = await supabase
        .from("match_lineups")
        .select(
          `
          *,
          formation:team_formations(*),
          players:lineup_players(
            player:players(
              id,
              name,
              jersey_number,
              position,
              rating,
              photo
            ),
            position,
            is_starter
          )
        `
        )
        .eq("match_id", matchId)
        .eq("team_id", user.team_id)
        .single();

      if (error && error.code !== "PGRST116") {
        return res.status(400).json({ error: error.message });
      }

      res.json({ success: true, lineup: lineup || null });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Create new formation
router.post(
  "/formations",
  authenticateJWT,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const { formation_name, formation_structure, description } = req.body;

      const { data: user } = await supabase
        .from("users")
        .select("team_id")
        .eq("id", req.user.id)
        .single();

      const { data: formation, error } = await supabase
        .from("team_formations")
        .insert({
          team_id: user.team_id,
          formation_name,
          formation_structure,
          description,
          created_by: req.user.id,
        })
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({
        success: true,
        message: "Formation created successfully",
        formation,
      });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
