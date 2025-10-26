import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// GET /:tournamentId - fetch full standings with team info and player count
router.get("/:tournamentId", async (req, res) => {
  try {
    const { tournamentId } = req.params;
    console.log("Fetching standings for tournament:", tournamentId);

    // 1. Fetch all tournament teams with team info
    const { data: tournamentTeams, error: teamsError } = await supabase
      .from("tournament_teams")
      .select(
        `
        team_id,
        team:teams (
          id,
          name,
          short_name,
          logo,
          color_primary,
          color_secondary
        )
      `
      )
      .eq("tournament_id", tournamentId);

    if (teamsError) return res.status(400).json({ error: teamsError.message });
    if (!tournamentTeams || tournamentTeams.length === 0)
      return res
        .status(404)
        .json({ error: "No teams found for this tournament" });

    const teamIds = tournamentTeams.map((t) => t.team_id);

    // 2. Fetch player counts for each team separately
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("team_id")
      .in("team_id", teamIds);

    if (playersError) {
      console.warn("Could not fetch player counts:", playersError.message);
    }

    // Count players per team
    const playerCounts = new Map();
    if (players) {
      players.forEach((player) => {
        playerCounts.set(
          player.team_id,
          (playerCounts.get(player.team_id) || 0) + 1
        );
      });
    }

    // 3. Fetch standings for these teams
    const { data: standings, error: standingsError } = await supabase
      .from("team_standings")
      .select("*")
      .in("team_id", teamIds)
      .eq("tournament_id", tournamentId);

    if (standingsError)
      return res.status(400).json({ error: standingsError.message });

    // 4. Merge standings with team info and player count
    const fullStandings = tournamentTeams.map((t) => {
      const s = standings?.find((st) => st.team_id === t.team_id);
      const playerCount = playerCounts.get(t.team_id) || 0;

      return {
        id: t.team.id,
        name: t.team.name,
        short_name: t.team.short_name || t.team.name,
        logo: t.team.logo || "",
        color_primary: t.team.color_primary || "#000000",
        color_secondary: t.team.color_secondary || "#FFFFFF",
        played: s?.matches_played || 0,
        won: s?.wins || 0,
        drawn: s?.draws || 0,
        lost: s?.losses || 0,
        goalsFor: s?.goals_for || 0,
        goalsAgainst: s?.goals_against || 0,
        goalDifference: s?.goal_difference || 0,
        points: s?.points || 0,
        form: s?.form || "",
        winPercentage: s?.matches_played
          ? Math.round((s.wins / s.matches_played) * 100)
          : 0,
        goalsPerGame: s?.matches_played
          ? (s.goals_for / s.matches_played).toFixed(1)
          : "0.0",
        playersCount: playerCount,
      };
    });

    // 5. Sort by points, goal difference, then goalsFor
    fullStandings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    // Add position numbers
    const standingsWithPosition = fullStandings.map((standing, index) => ({
      ...standing,
      position: index + 1,
    }));

    res.json(standingsWithPosition);
  } catch (err) {
    console.error("Standings fetch error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Alternative simpler version without player counts
router.get("/:tournamentId/simple", async (req, res) => {
  try {
    const { tournamentId } = req.params;

    // Single query with proper joins
    const { data: standings, error } = await supabase
      .from("team_standings")
      .select(
        `
        *,
        team:teams (
          id,
          name,
          short_name,
          logo,
          color_primary,
          color_secondary
        )
      `
      )
      .eq("tournament_id", tournamentId)
      .order("points", { ascending: false })
      .order("goal_difference", { ascending: false })
      .order("goals_for", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    if (!standings || standings.length === 0)
      return res.status(404).json({ error: "No standings found" });

    // Transform to frontend format
    const transformedStandings = standings.map((standing, index) => ({
      id: standing.team_id,
      position: index + 1,
      name: standing.team?.name || "Unknown Team",
      short_name: standing.team?.short_name || standing.team?.name || "UNK",
      logo: standing.team?.logo || "",
      color_primary: standing.team?.color_primary || "#000000",
      color_secondary: standing.team?.color_secondary || "#FFFFFF",
      played: standing.matches_played,
      won: standing.wins,
      drawn: standing.draws,
      lost: standing.losses,
      goalsFor: standing.goals_for,
      goalsAgainst: standing.goals_against,
      goalDifference: standing.goal_difference,
      points: standing.points,
      form: standing.form || "",
      winPercentage:
        standing.matches_played > 0
          ? Math.round((standing.wins / standing.matches_played) * 100)
          : 0,
      goalsPerGame:
        standing.matches_played > 0
          ? (standing.goals_for / standing.matches_played).toFixed(1)
          : "0.0",
      playersCount: 0, // Not available in this query
    }));

    res.json(transformedStandings);
  } catch (err) {
    console.error("Simple standings error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /refresh/:tournamentId - recalculate standings (admin/manager only)
router.post(
  "/refresh/:tournamentId",
  authenticateJWT,
  authorizeRoles("admin", "manager"),
  async (req, res) => {
    try {
      const { tournamentId } = req.params;
      const { recalculateForm = true } = req.body;

      console.log(`Refreshing standings for tournament: ${tournamentId}`);

      // Fetch completed matches
      const { data: matches, error: matchesError } = await supabase
        .from("matches")
        .select(
          "id, home_team_id, away_team_id, home_score, away_score, status, match_date"
        )
        .eq("tournament_id", tournamentId)
        .eq("status", "finished");

      if (matchesError)
        return res.status(400).json({ error: matchesError.message });
      if (!matches || matches.length === 0)
        return res.status(404).json({ error: "No completed matches found" });

      // Fetch tournament teams
      const { data: tournamentTeams, error: teamsError } = await supabase
        .from("tournament_teams")
        .select("team_id")
        .eq("tournament_id", tournamentId);

      if (teamsError)
        return res.status(400).json({ error: teamsError.message });

      // Initialize standings map
      const standingsMap = new Map();
      tournamentTeams.forEach(({ team_id }) => {
        standingsMap.set(team_id, {
          matches_played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goals_for: 0,
          goals_against: 0,
          points: 0,
          recent_matches: [],
        });
      });

      // Process each match
      matches.forEach((match) => {
        const home = standingsMap.get(match.home_team_id);
        const away = standingsMap.get(match.away_team_id);
        if (!home || !away) return;

        const homeScore = match.home_score || 0;
        const awayScore = match.away_score || 0;

        home.matches_played++;
        away.matches_played++;
        home.goals_for += homeScore;
        home.goals_against += awayScore;
        away.goals_for += awayScore;
        away.goals_against += homeScore;

        if (recalculateForm) {
          home.recent_matches.push({
            opponent: match.away_team_id,
            result:
              homeScore > awayScore ? "W" : homeScore < awayScore ? "L" : "D",
            date: match.match_date,
          });
          away.recent_matches.push({
            opponent: match.home_team_id,
            result:
              awayScore > homeScore ? "W" : awayScore < homeScore ? "L" : "D",
            date: match.match_date,
          });
        }

        if (homeScore > awayScore) {
          home.wins++;
          home.points += 3;
          away.losses++;
        } else if (homeScore < awayScore) {
          away.wins++;
          away.points += 3;
          home.losses++;
        } else {
          home.draws++;
          away.draws++;
          home.points++;
          away.points++;
        }
      });

      // Calculate last 5 matches form
      if (recalculateForm) {
        standingsMap.forEach((team) => {
          team.form = team.recent_matches
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .slice(0, 5)
            .map((m) => m.result)
            .join("");
        });
      }

      // Prepare data to upsert
      const updateData = Array.from(standingsMap.entries()).map(
        ([team_id, stats]) => ({
          tournament_id: tournamentId,
          team_id,
          matches_played: stats.matches_played,
          wins: stats.wins,
          draws: stats.draws,
          losses: stats.losses,
          goals_for: stats.goals_for,
          goals_against: stats.goals_against,
          goal_difference: stats.goals_for - stats.goals_against,
          points: stats.points,
          form: stats.form || "",
          updated_at: new Date().toISOString(),
        })
      );

      const { error: updateError } = await supabase
        .from("team_standings")
        .upsert(updateData, { onConflict: "tournament_id,team_id" });

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }

      res.json({
        message: "Standings refreshed successfully",
        teamsUpdated: updateData.length,
        matchesProcessed: matches.length,
      });
    } catch (err) {
      console.error("Refresh standings error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
