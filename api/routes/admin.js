import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.js";

const router = Router();
router.use(authenticateJWT);
router.use(authorizeRoles("admin"));

// GET ALL DATA FOR ADMIN DASHBOARD
router.get("/master-data", async (req, res) => {
  try {
    const [
      tournamentsRes,
      teamsRes,
      playersRes,
      matchesRes,
      venuesRes,
      usersRes,
      standingsRes,
    ] = await Promise.all([
      supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("teams").select("*").order("name"),
      supabase.from("players").select("*, team:teams(name)").order("name"),
      supabase
        .from("matches")
        .select(
          `
        *,
        home_team:home_team_id(*),
        away_team:away_team_id(*),
        tournament:tournaments(*),
        venue:venues(*),
        match_events(*),
        match_stats(*)
      `
        )
        .order("match_date", { ascending: false })
        .limit(50),
      supabase.from("venues").select("*"),
      supabase
        .from("users")
        .select("*, team:teams(name)")
        .eq("is_active", true),
      supabase.from("team_standings").select("*, team:teams(*)"),
    ]);

    res.json({
      success: true,
      data: {
        tournaments: tournamentsRes.data || [],
        teams: teamsRes.data || [],
        players: playersRes.data || [],
        matches: matchesRes.data || [],
        venues: venuesRes.data || [],
        users: usersRes.data || [],
        standings: standingsRes.data || [],
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// COMPLETE TOURNAMENT CREATION WITH TEAMS AND MANAGERS
router.post("/tournaments/create-complete", async (req, res) => {
  try {
    const { tournament, teams, managers, venues, schedule } = req.body;

    // 1. Create Tournament
    const { data: tournamentData, error: tournamentError } = await supabase
      .from("tournaments")
      .insert([tournament])
      .select()
      .single();

    if (tournamentError) throw tournamentError;

    // 2. Create Teams
    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .insert(teams)
      .select();

    if (teamsError) throw teamsError;

    // 3. Create Managers (Users)
    const managersWithTeam = managers.map((manager) => ({
      ...manager,
      team_id: teamsData.find((t) => t.short_name === manager.team_short)?.id,
    }));

    const { data: managersData, error: managersError } = await supabase
      .from("users")
      .insert(managersWithTeam)
      .select();

    if (managersError) throw managersError;

    // 4. Add Teams to Tournament
    const tournamentTeams = teamsData.map((team) => ({
      tournament_id: tournamentData.id,
      team_id: team.id,
    }));

    const { error: tournamentTeamsError } = await supabase
      .from("tournament_teams")
      .insert(tournamentTeams);

    if (tournamentTeamsError) throw tournamentTeamsError;

    // 5. Create Initial Standings
    const standings = teamsData.map((team) => ({
      tournament_id: tournamentData.id,
      team_id: team.id,
      matches_played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
    }));

    const { error: standingsError } = await supabase
      .from("team_standings")
      .insert(standings);

    if (standingsError) throw standingsError;

    res.json({
      success: true,
      tournament: tournamentData,
      teams: teamsData,
      managers: managersData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// BULK TEAM AND PLAYER CREATION
router.post("/teams/create-with-players", async (req, res) => {
  try {
    const { tournament_id, teams } = req.body;

    const results = [];

    for (const teamData of teams) {
      const { team, players, manager } = teamData;

      // Create Team
      const { data: teamRecord, error: teamError } = await supabase
        .from("teams")
        .insert([team])
        .select()
        .single();

      if (teamError) throw teamError;

      // Add to Tournament
      const { error: tournamentError } = await supabase
        .from("tournament_teams")
        .insert([{ tournament_id, team_id: teamRecord.id }]);

      if (tournamentError) throw tournamentError;

      // Create Manager
      const { data: managerRecord, error: managerError } = await supabase
        .from("users")
        .insert([{ ...manager, team_id: teamRecord.id }])
        .select()
        .single();

      if (managerError) throw managerError;

      // Create Players
      const playersWithTeam = players.map((player) => ({
        ...player,
        team_id: teamRecord.id,
      }));

      const { data: playersRecords, error: playersError } = await supabase
        .from("players")
        .insert(playersWithTeam)
        .select();

      if (playersError) throw playersError;

      // Create Initial Standing
      const { error: standingError } = await supabase
        .from("team_standings")
        .insert([
          {
            tournament_id,
            team_id: teamRecord.id,
            matches_played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goals_for: 0,
            goals_against: 0,
            goal_difference: 0,
            points: 0,
          },
        ]);

      if (standingError) throw standingError;

      results.push({
        team: teamRecord,
        manager: managerRecord,
        players: playersRecords,
      });
    }

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADVANCED MATCH SCHEDULING WITH EVENTS
router.post("/matches/schedule-advanced", async (req, res) => {
  try {
    const { matches } = req.body;

    const scheduledMatches = [];

    for (const matchData of matches) {
      const { match, events, stats } = matchData;

      // Create Match
      const { data: matchRecord, error: matchError } = await supabase
        .from("matches")
        .insert([match])
        .select(
          `
          *,
          home_team:home_team_id(*),
          away_team:away_team_id(*),
          tournament:tournaments(*),
          venue:venues(*)
        `
        )
        .single();

      if (matchError) throw matchError;

      // Create Match Events if provided
      if (events && events.length > 0) {
        const eventsWithMatch = events.map((event) => ({
          ...event,
          match_id: matchRecord.id,
        }));

        const { error: eventsError } = await supabase
          .from("match_events")
          .insert(eventsWithMatch);

        if (eventsError) throw eventsError;
      }

      // Create Match Stats if provided
      if (stats) {
        const { error: statsError } = await supabase
          .from("match_stats")
          .insert([{ ...stats, match_id: matchRecord.id }]);

        if (statsError) throw statsError;
      }

      scheduledMatches.push(matchRecord);
    }

    res.json({ success: true, matches: scheduledMatches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// COMPLETE MATCH EDITING WITH EVENTS AND STATS
router.put("/matches/:id/update-complete", async (req, res) => {
  try {
    const { id } = req.params;
    const { match, events, stats, player_stats } = req.body;

    // Update Match
    const { data: matchRecord, error: matchError } = await supabase
      .from("matches")
      .update(match)
      .eq("id", id)
      .select(
        `
        *,
        home_team:home_team_id(*),
        away_team:away_team_id(*),
        tournament:tournaments(*)
      `
      )
      .single();

    if (matchError) throw matchError;

    // Update/Insert Events
    if (events) {
      // Delete existing events
      await supabase.from("match_events").delete().eq("match_id", id);

      // Insert new events
      if (events.length > 0) {
        const eventsWithMatch = events.map((event) => ({
          ...event,
          match_id: id,
        }));

        const { error: eventsError } = await supabase
          .from("match_events")
          .insert(eventsWithMatch);

        if (eventsError) throw eventsError;
      }
    }

    // Update Stats
    if (stats) {
      const { error: statsError } = await supabase
        .from("match_stats")
        .upsert({ ...stats, match_id: id });

      if (statsError) throw statsError;
    }

    // Update Player Stats
    if (player_stats) {
      for (const playerStat of player_stats) {
        const { error: playerStatError } = await supabase
          .from("player_match_stats")
          .upsert({ ...playerStat, match_id: id });

        if (playerStatError) throw playerStatError;
      }
    }

    // Update Standings if match is completed
    if (match.status === "full_time") {
      await updateTournamentStandings(match.tournament_id);
    }

    res.json({ success: true, match: matchRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE TOURNAMENT STANDINGS
const updateTournamentStandings = async (tournament_id) => {
  const { data: matches } = await supabase
    .from("matches")
    .select("home_team_id, away_team_id, home_score, away_score, status")
    .eq("tournament_id", tournament_id)
    .eq("status", "full_time");

  const { data: teams } = await supabase
    .from("tournament_teams")
    .select("team_id")
    .eq("tournament_id", tournament_id);

  const standings = {};

  // Initialize standings
  teams.forEach((team) => {
    standings[team.team_id] = {
      matches_played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
    };
  });

  // Calculate standings from matches
  matches.forEach((match) => {
    const home = standings[match.home_team_id];
    const away = standings[match.away_team_id];

    home.matches_played++;
    away.matches_played++;

    home.goals_for += match.home_score;
    home.goals_against += match.away_score;
    away.goals_for += match.away_score;
    away.goals_against += match.home_score;

    home.goal_difference = home.goals_for - home.goals_against;
    away.goal_difference = away.goals_for - away.goals_against;

    if (match.home_score > match.away_score) {
      home.wins++;
      home.points += 3;
      away.losses++;
    } else if (match.home_score < match.away_score) {
      away.wins++;
      away.points += 3;
      home.losses++;
    } else {
      home.draws++;
      away.draws++;
      home.points += 1;
      away.points += 1;
    }
  });

  // Update database
  for (const [team_id, standing] of Object.entries(standings)) {
    await supabase
      .from("team_standings")
      .update(standing)
      .eq("tournament_id", tournament_id)
      .eq("team_id", team_id);
  }
};

// BULK OPERATIONS
router.post("/bulk/update-standings", async (req, res) => {
  try {
    const { standings } = req.body;

    const updates = standings.map((standing) =>
      supabase
        .from("team_standings")
        .update(standing)
        .eq("tournament_id", standing.tournament_id)
        .eq("team_id", standing.team_id)
    );

    await Promise.all(updates);
    res.json({
      success: true,
      message: `${standings.length} standings updated`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/bulk/update-players", async (req, res) => {
  try {
    const { players } = req.body;

    const updates = players.map((player) =>
      supabase.from("players").update(player).eq("id", player.id)
    );

    await Promise.all(updates);
    res.json({ success: true, message: `${players.length} players updated` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add these routes to your existing admin routes

// Create tournament
router.post("/tournaments/create", async (req, res) => {
  try {
    const { name, season, start_date, end_date, rules, points_system } =
      req.body;

    const { data, error } = await supabase
      .from("tournaments")
      .insert([
        {
          name,
          season,
          start_date,
          end_date,
          rules,
          points_system,
          status: "upcoming",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create team with tournament assignment
router.post("/teams/create", async (req, res) => {
  try {
    const { team, tournament_id } = req.body;

    // Create team
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .insert([team])
      .select()
      .single();

    if (teamError) throw teamError;

    // Add to tournament
    if (tournament_id) {
      const { error: tournamentError } = await supabase
        .from("tournament_teams")
        .insert([{ tournament_id, team_id: teamData.id }]);

      if (tournamentError) throw tournamentError;
    }

    res.json({ success: true, data: teamData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Schedule match
router.post("/matches/schedule", async (req, res) => {
  try {
    const {
      tournament_id,
      home_team_id,
      away_team_id,
      venue_id,
      match_date,
      match_time,
    } = req.body;

    const { data, error } = await supabase
      .from("matches")
      .insert([
        {
          tournament_id,
          home_team_id,
          away_team_id,
          venue_id,
          match_date,
          match_time,
          status: "scheduled",
        },
      ])
      .select(
        `
        *,
        home_team:home_team_id(*),
        away_team:away_team_id(*),
        tournament:tournaments(*),
        venue:venues(*)
      `
      )
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
