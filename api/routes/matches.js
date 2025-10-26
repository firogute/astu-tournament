import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// Get all matches with populated team data
router.get("/", async (req, res) => {
  try {
    const { data: matches, error } = await supabase.from("matches").select(`
        *,
        home_team:home_team_id (*),
        away_team:away_team_id (*),
        venue:venue_id (*)
      `);

    if (error) return res.status(400).json({ error: error.message });

    // Transform the data to match frontend expectations
    const transformedMatches = matches.map((match) => ({
      id: match.id,
      tournament_id: match.tournament_id,
      match_date: match.match_date,
      match_time: match.match_time,
      status: match.status,
      minute: match.minute,
      home_score: match.home_score,
      away_score: match.away_score,
      home_penalty_score: match.home_penalty_score,
      away_penalty_score: match.away_penalty_score,
      referee: match.referee,
      attendance: match.attendance,
      weather_conditions: match.weather_conditions,
      created_at: match.created_at,
      updated_at: match.updated_at,
      // Transform to match frontend expected structure
      homeTeam: match.home_team
        ? {
            id: match.home_team.id,
            name: match.home_team.name,
            logo: match.home_team.logo,
            color_primary: match.home_team.color_primary,
            short_name: match.home_team.short_name,
          }
        : null,
      awayTeam: match.away_team
        ? {
            id: match.away_team.id,
            name: match.away_team.name,
            logo: match.away_team.logo,
            color_primary: match.away_team.color_primary,
            short_name: match.away_team.short_name,
          }
        : null,
      venue: match.venue ? match.venue.name : "Unknown Venue",
    }));

    res.json(transformedMatches); // Return array directly, not nested object
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single match by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: match, error } = await supabase
      .from("matches")
      .select(
        `
        *,
        home_team:home_team_id (*),
        away_team:away_team_id (*),
        venue:venue_id (*)
      `
      )
      .eq("id", id)
      .single();

    if (error || !match)
      return res.status(404).json({ error: "Match not found" });

    // Transform the data
    const transformedMatch = {
      id: match.id,
      tournament_id: match.tournament_id,
      match_date: match.match_date,
      match_time: match.match_time,
      status: match.status,
      minute: match.minute,
      home_score: match.home_score,
      away_score: match.away_score,
      home_penalty_score: match.home_penalty_score,
      away_penalty_score: match.away_penalty_score,
      referee: match.referee,
      attendance: match.attendance,
      weather_conditions: match.weather_conditions,
      created_at: match.created_at,
      updated_at: match.updated_at,
      homeTeam: match.home_team
        ? {
            id: match.home_team.id,
            name: match.home_team.name,
            logo: match.home_team.logo,
            color_primary: match.home_team.color_primary,
            short_name: match.home_team.short_name,
          }
        : null,
      awayTeam: match.away_team
        ? {
            id: match.away_team.id,
            name: match.away_team.name,
            logo: match.away_team.logo,
            color_primary: match.away_team.color_primary,
            short_name: match.away_team.short_name,
          }
        : null,
      venue: match.venue ? match.venue.name : "Unknown Venue",
    };

    res.json(transformedMatch);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new match (admin or manager only)
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin", "manager"),
  async (req, res) => {
    try {
      const matchData = req.body;

      const { data, error } = await supabase
        .from("matches")
        .insert(matchData)
        .select(
          `
          *,
          home_team:home_team_id (*),
          away_team:away_team_id (*)
        `
        )
        .single();

      if (error) return res.status(400).json({ error: error.message });

      // Transform the created match
      const transformedMatch = {
        ...data,
        homeTeam: data.home_team
          ? {
              id: data.home_team.id,
              name: data.home_team.name,
              logo: data.home_team.logo,
              color_primary: data.home_team.color_primary,
              short_name: data.home_team.short_name,
            }
          : null,
        awayTeam: data.away_team
          ? {
              id: data.away_team.id,
              name: data.away_team.name,
              logo: data.away_team.logo,
              color_primary: data.away_team.color_primary,
              short_name: data.away_team.short_name,
            }
          : null,
      };

      res.status(201).json(transformedMatch);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
