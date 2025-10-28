// routes/manager.js - UPDATED WITH LINEUP SUPPORT
import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// Get manager's players
router.get(
  "/my-players",
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

      const { data: players, error } = await supabase
        .from("players")
        .select(
          `
          *,
          player_match_stats(
            goals,
            assists,
            minutes_played,
            rating
          )
        `
        )
        .eq("team_id", user.team_id)
        .eq("is_active", true)
        .order("position", { ascending: true })
        .order("jersey_number", { ascending: true });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Transform players data to include calculated stats
      const transformedPlayers = players.map((player) => {
        const stats = player.player_match_stats || [];
        const totalGoals = stats.reduce(
          (sum, stat) => sum + (stat.goals || 0),
          0
        );
        const totalAssists = stats.reduce(
          (sum, stat) => sum + (stat.assists || 0),
          0
        );
        const totalMinutes = stats.reduce(
          (sum, stat) => sum + (stat.minutes_played || 0),
          0
        );
        const avgRating =
          stats.length > 0
            ? stats.reduce((sum, stat) => sum + (stat.rating || 0), 0) /
              stats.length
            : 65; // Default rating for new players

        // Calculate form (simplified - in real app this would be more complex)
        const recentMatches = stats.slice(0, 5);
        const recentForm =
          recentMatches.length > 0
            ? recentMatches.reduce((sum, stat) => sum + (stat.rating || 0), 0) /
              recentMatches.length
            : 3.0;
        const form = Math.min(5.0, Math.max(1.0, recentForm / 20)); // Convert 0-100 rating to 1-5 form

        return {
          id: player.id,
          name: player.name,
          jersey_number: player.jersey_number,
          position: player.position,
          rating: Math.round(avgRating),
          form: parseFloat(form.toFixed(1)),
          goals: totalGoals,
          assists: totalAssists,
          is_active: player.is_active,
          photo: player.photo,
          nationality: player.nationality,
          date_of_birth: player.date_of_birth,
          preferred_foot: player.preferred_foot,
          height_cm: player.height_cm,
          total_minutes: totalMinutes,
        };
      });

      res.json({ success: true, players: transformedPlayers });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get manager's team info
// Get manager's team info (UPDATED)
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

      // Get team basic info
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("id", user.team_id)
        .single();

      if (teamError) {
        return res.status(400).json({ error: teamError.message });
      }

      // Get coach info separately to avoid complex nested queries
      const { data: coach } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("team_id", user.team_id)
        .eq("role", "manager")
        .single();

      res.json({
        success: true,
        team: {
          ...team,
          coach: coach || null,
        },
      });
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

// Add new player
router.post(
  "/players",
  authenticateJWT,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const { data: user } = await supabase
        .from("users")
        .select("team_id")
        .eq("id", req.user.id)
        .single();

      const { data: player, error } = await supabase
        .from("players")
        .insert({
          ...req.body,
          team_id: user.team_id,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({
        success: true,
        message: "Player added successfully",
        player,
      });
    } catch (err) {
      console.error(err);
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
