import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// Background service to auto-increment minutes for live matches
const startMinuteService = () => {
  setInterval(async () => {
    try {
      const { data: liveMatches } = await supabase
        .from("matches")
        .select("id, minute, status")
        .in("status", ["first_half", "second_half", "extra_time"]);

      if (liveMatches && liveMatches.length > 0) {
        for (const match of liveMatches) {
          await supabase
            .from("matches")
            .update({
              minute: Math.min(match.minute + 1, 120),
              updated_at: new Date().toISOString(),
            })
            .eq("id", match.id);
        }
      }
    } catch (error) {
      console.error("Minute service error:", error);
    }
  }, 60000); // Every minute
};

// Start the service when server starts
startMinuteService();

// Debounce utility to prevent frequent updates
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Helper function to update player stats - MATCHES YOUR SCHEMA
const updatePlayerStats = async (
  matchId,
  playerId,
  teamId,
  updates,
  minute
) => {
  try {
    // Check if player stats exist
    const { data: existingStats } = await supabase
      .from("player_match_stats")
      .select("*")
      .eq("match_id", matchId)
      .eq("player_id", playerId)
      .single();

    const baseData = {
      match_id: matchId,
      player_id: playerId,
      team_id: teamId,
      minutes_played: minute,
      updated_at: new Date().toISOString(),
    };

    if (existingStats) {
      // Update existing stats - ONLY USE FIELDS THAT EXIST IN YOUR SCHEMA
      const newStats = { ...baseData };
      Object.keys(updates).forEach((key) => {
        if (key === "minutes_played") {
          newStats[key] = Math.max(existingStats[key] || 0, minute);
        } else {
          newStats[key] = (existingStats[key] || 0) + (updates[key] || 0);
        }
      });

      const { error } = await supabase
        .from("player_match_stats")
        .update(newStats)
        .eq("match_id", matchId)
        .eq("player_id", playerId);

      if (error) throw error;
    } else {
      // Insert new stats - ONLY USE FIELDS THAT EXIST IN YOUR SCHEMA
      const { error } = await supabase
        .from("player_match_stats")
        .insert([{ ...baseData, ...updates }]);

      if (error) throw error;
    }
  } catch (error) {
    console.error("Error updating player stats:", error);
    throw error;
  }
};

// Helper function to update match score - MATCHES YOUR SCHEMA
const updateMatchScore = async (matchId, teamId, isOwnGoal = false) => {
  try {
    // Get match details - use explicit table references
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("home_team_id, away_team_id, home_score, away_score")
      .eq("id", matchId)
      .single();

    if (matchError) throw matchError;

    let updateData = {};

    if (isOwnGoal) {
      // Own goal: goal goes to opposite team
      if (teamId === match.home_team_id) {
        updateData = { away_score: (match.away_score || 0) + 1 };
      } else {
        updateData = { home_score: (match.home_score || 0) + 1 };
      }
    } else {
      // Normal goal
      if (teamId === match.home_team_id) {
        updateData = { home_score: (match.home_score || 0) + 1 };
      } else {
        updateData = { away_score: (match.away_score || 0) + 1 };
      }
    }

    const { error } = await supabase
      .from("matches")
      .update(updateData)
      .eq("id", matchId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating match score:", error);
    throw error;
  }
};

// Helper function to handle match events - USING YOUR EXACT EVENT TYPES
const handleMatchEvent = async (eventData) => {
  const {
    match_id,
    team_id,
    player_id,
    related_player_id,
    event_type,
    minute,
  } = eventData;

  switch (event_type) {
    case "goal":
      await handleGoalEvent(eventData);
      break;
    case "own_goal":
      await handleOwnGoalEvent(eventData);
      break;
    case "penalty_goal":
      await handlePenaltyGoalEvent(eventData);
      break;
    case "penalty_miss":
      await handlePenaltyMissEvent(eventData);
      break;
    case "yellow_card":
      await handleCardEvent(eventData, "yellow");
      break;
    case "red_card":
      await handleCardEvent(eventData, "red");
      break;
    case "second_yellow":
      await handleSecondYellowEvent(eventData);
      break;
    case "substitution_in":
      await handleSubstitutionEvent(eventData);
      break;
    case "substitution_out":
      // Handle substitution out (player leaving)
      await updatePlayerStats(
        match_id,
        player_id,
        team_id,
        {
          minutes_played: minute,
        },
        minute
      );
      break;
    case "corner":
    case "free_kick":
    case "offside":
    case "var_decision":
    case "injury":
      await handleGenericEvent(eventData);
      break;
    default:
      console.log(`Unhandled event type: ${event_type}`);
  }
};

// Specific event handlers - USING YOUR SCHEMA FIELDS
const handleGoalEvent = async (eventData) => {
  const { match_id, team_id, player_id, related_player_id, minute } = eventData;

  // Update scorer stats - ONLY EXISTING FIELDS
  await updatePlayerStats(
    match_id,
    player_id,
    team_id,
    {
      goals: 1,
      shots: 1,
      shots_on_target: 1,
    },
    minute
  );

  // Update assist if provided - using related_player_id from your schema
  if (related_player_id) {
    await updatePlayerStats(
      match_id,
      related_player_id,
      team_id,
      {
        assists: 1,
      },
      minute
    );
  }

  // Update match score
  await updateMatchScore(match_id, team_id, false);

  // Update match stats for shots
  await updateMatchStats(match_id, team_id, "shot");
  await updateMatchStats(match_id, team_id, "shot_on_target");
};

const handleOwnGoalEvent = async (eventData) => {
  const { match_id, team_id, player_id, minute } = eventData;

  // Update player stats (own goal counts as goal against)
  // Note: own_goals field doesn't exist in your schema, so we don't track it separately
  await updatePlayerStats(
    match_id,
    player_id,
    team_id,
    {
      // No positive goal count for own goals
      shots: 1, // Count as a shot against their own team
    },
    minute
  );

  // Update match score (goal goes to opposite team)
  await updateMatchScore(match_id, team_id, true);
};

const handlePenaltyGoalEvent = async (eventData) => {
  const { match_id, team_id, player_id, minute } = eventData;

  await updatePlayerStats(
    match_id,
    player_id,
    team_id,
    {
      goals: 1,
      shots: 1,
      shots_on_target: 1,
    },
    minute
  );

  await updateMatchScore(match_id, team_id, false);
  await updateMatchStats(match_id, team_id, "shot");
  await updateMatchStats(match_id, team_id, "shot_on_target");
};

const handlePenaltyMissEvent = async (eventData) => {
  const { match_id, team_id, player_id, minute } = eventData;

  await updatePlayerStats(
    match_id,
    player_id,
    team_id,
    {
      shots: 1,
      // penalties_missed field doesn't exist in your schema
    },
    minute
  );

  await updateMatchStats(match_id, team_id, "shot");
};

const handleCardEvent = async (eventData, cardType) => {
  const { match_id, team_id, player_id, minute } = eventData;

  const updateField = cardType === "yellow" ? "yellow_cards" : "red_cards";
  await updatePlayerStats(
    match_id,
    player_id,
    team_id,
    {
      [updateField]: 1,
    },
    minute
  );

  await updateMatchStats(match_id, team_id, `${cardType}_card`);
};

const handleSecondYellowEvent = async (eventData) => {
  const { match_id, team_id, player_id, minute } = eventData;

  // Second yellow = red card
  await updatePlayerStats(
    match_id,
    player_id,
    team_id,
    {
      yellow_cards: 1, // This makes it 2 total
      red_cards: 1,
    },
    minute
  );

  await updateMatchStats(match_id, team_id, "red_card");
};

const handleSubstitutionEvent = async (eventData) => {
  const { match_id, team_id, player_id, related_player_id, minute } = eventData;

  // Record substitution using your match_substitutions table
  const { error: subError } = await supabase
    .from("match_substitutions")
    .insert([
      {
        match_id,
        team_id,
        player_out_id: related_player_id, // player coming out
        player_in_id: player_id, // player coming in
        minute,
      },
    ]);

  if (subError) throw subError;

  // Update minutes for player coming out
  await updatePlayerStats(
    match_id,
    related_player_id,
    team_id,
    {
      minutes_played: minute,
    },
    minute
  );

  // Initialize stats for player coming in
  await updatePlayerStats(
    match_id,
    player_id,
    team_id,
    {
      minutes_played: minute,
    },
    minute
  );
};

const handleGenericEvent = async (eventData) => {
  const { match_id, team_id, event_type, minute } = eventData;

  try {
    await updateMatchStats(match_id, team_id, event_type);
  } catch (error) {
    console.error("Error in handleGenericEvent:", error);
  }
};

// FIXED: updateMatchStats function - completely rewritten to avoid joins
const updateMatchStats = debounce(async (matchId, teamId, statType) => {
  try {
    // Get current match to determine home/away - NO JOINS, just direct query
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("home_team_id, away_team_id")
      .eq("id", matchId)
      .single();

    if (matchError) {
      console.error("Error fetching match:", matchError);
      return;
    }

    if (!match) {
      console.error("Match not found:", matchId);
      return;
    }

    // Use explicit property access
    const isHomeTeam = teamId === match.home_team_id;
    const teamPrefix = isHomeTeam ? "home" : "away";

    // Map event types to your exact match_stats columns
    const statMapping = {
      goal: "shots_on_target_" + teamPrefix,
      penalty_goal: "shots_on_target_" + teamPrefix,
      corner: "corners_" + teamPrefix,
      foul: "fouls_" + teamPrefix,
      offside: "offsides_" + teamPrefix,
      yellow_card: "yellow_cards_" + teamPrefix,
      red_card: "red_cards_" + teamPrefix,
      second_yellow: "red_cards_" + teamPrefix,
      shot: "shots_" + teamPrefix,
      shot_on_target: "shots_on_target_" + teamPrefix,
    };

    const statField = statMapping[statType];
    if (!statField) {
      console.log(`No stat mapping for: ${statType}`);
      return;
    }

    // Get current stats - direct query, no joins
    const { data: currentStats, error: statsError } = await supabase
      .from("match_stats")
      .select("*")
      .eq("match_id", matchId)
      .single();

    if (statsError && statsError.code !== "PGRST116") {
      // PGRST116 = no rows
      console.error("Error fetching match stats:", statsError);
      return;
    }

    const updates = {
      [statField]: (currentStats?.[statField] || 0) + 1,
      updated_at: new Date().toISOString(),
    };

    if (currentStats) {
      // Update existing stats
      const { error: updateError } = await supabase
        .from("match_stats")
        .update(updates)
        .eq("match_id", matchId);

      if (updateError) {
        console.error("Error updating match stats:", updateError);
      }
    } else {
      // Insert new stats
      const { error: insertError } = await supabase.from("match_stats").insert([
        {
          match_id: matchId,
          ...updates,
          // Initialize all stats to avoid null issues
          possession_home: 50,
          possession_away: 50,
          shots_home: 0,
          shots_away: 0,
          shots_on_target_home: 0,
          shots_on_target_away: 0,
          passes_home: 0,
          passes_away: 0,
          pass_accuracy_home: 0.0,
          pass_accuracy_away: 0.0,
          fouls_home: 0,
          fouls_away: 0,
          corners_home: 0,
          corners_away: 0,
          offsides_home: 0,
          offsides_away: 0,
          yellow_cards_home: 0,
          yellow_cards_away: 0,
          red_cards_home: 0,
          red_cards_away: 0,
          saves_home: 0,
          saves_away: 0,
        },
      ]);

      if (insertError) {
        console.error("Error inserting match stats:", insertError);
      }
    }
  } catch (error) {
    console.error("Error in updateMatchStats:", error);
  }
}, 1000);

// Get commentary for a match
router.get("/:matchId", authenticateJWT, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { data: commentary, error } = await supabase
      .from("commentary")
      .select(
        `
        *,
        user:created_by(
          id, email, role
        )
      `
      )
      .eq("match_id", matchId)
      .order("minute", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    // Get match events for comprehensive timeline
    const { data: events, error: eventsError } = await supabase
      .from("match_events")
      .select(
        `
        *,
        player:player_id(name, jersey_number),
        team:team_id(name, short_name, color_primary),
        related_player:related_player_id(name, jersey_number)
      `
      )
      .eq("match_id", matchId)
      .order("minute", { ascending: false });

    if (eventsError)
      return res.status(400).json({ error: eventsError.message });

    res.json({
      commentary: commentary || [],
      events: events || [],
      matchId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add commentary entry
router.post(
  "/:matchId/comment",
  authenticateJWT,
  authorizeRoles("admin", "manager", "commentator"),
  async (req, res) => {
    try {
      const { matchId } = req.params;
      const { minute, commentary_text, is_important, event_type } = req.body;

      const commentaryData = {
        match_id: matchId,
        minute: minute || 0,
        commentary_text,
        is_important: is_important || false,
        event_type: event_type || null,
        created_by: req.user.id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("commentary")
        .insert([commentaryData])
        .select(
          `
          *,
          user:created_by(
            id, email, role
          )
        `
        )
        .single();

      if (error) return res.status(400).json({ error: error.message });

      res.status(201).json({
        message: "Commentary added successfully",
        commentary: data,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Add match event with comprehensive database updates
router.post(
  "/:matchId/event",
  authenticateJWT,
  authorizeRoles("admin", "manager", "commentator"),
  async (req, res) => {
    try {
      console.log("Event data received:", req.body);

      const { matchId } = req.params;
      const {
        event_type,
        minute,
        player_id,
        related_player_id,
        team_id,
        description,
        goal_type,
        is_penalty_scored,
        event_data,
      } = req.body;

      // Validate required fields
      if (!event_type || minute === undefined || !team_id) {
        return res.status(400).json({
          error: "Event type, minute, and team ID are required",
        });
      }

      const eventData = {
        match_id: matchId,
        event_type,
        minute,
        player_id: player_id || null,
        related_player_id: related_player_id || null,
        team_id,
        description:
          description || `${event_type.replace("_", " ")} at ${minute}'`,
        goal_type: goal_type || null,
        is_penalty_scored: is_penalty_scored || null,
        event_data: event_data || null,
        created_at: new Date().toISOString(),
      };

      console.log("Inserting event:", eventData);

      // Insert with proper relationships
      const { data: event, error: eventError } = await supabase
        .from("match_events")
        .insert([eventData])
        .select(
          `
          *,
          player:player_id(*),
          team:team_id(*),
          related_player:related_player_id(*)
        `
        )
        .single();

      if (eventError) {
        console.error("Error inserting event:", eventError);
        return res.status(400).json({ error: eventError.message });
      }

      console.log("Event inserted successfully:", event);

      // Handle the event with all database updates
      try {
        await handleMatchEvent(eventData);
        console.log("Event handling completed");
      } catch (handleError) {
        console.error("Error in handleMatchEvent:", handleError);
        // Don't fail the request if event handling fails
      }

      // Auto-generate commentary for important events
      if (
        [
          "goal",
          "own_goal",
          "penalty_goal",
          "red_card",
          "penalty_miss",
        ].includes(event_type)
      ) {
        try {
          // Get player and team names for commentary
          const playerName = player_id
            ? await getPlayerName(player_id)
            : "Player";
          const teamName = await getTeamName(team_id);

          const autoCommentary = generateAutoCommentary({
            event_type,
            player: { name: playerName },
            team: { name: teamName },
            minute,
          });

          const commentaryData = {
            match_id: matchId,
            minute,
            commentary_text: autoCommentary,
            is_important: true,
            event_type,
            created_by: req.user.id,
            created_at: new Date().toISOString(),
          };

          await supabase.from("commentary").insert([commentaryData]);
          console.log("Auto commentary generated");
        } catch (commentaryError) {
          console.error("Error generating auto commentary:", commentaryError);
        }
      }

      res.status(201).json({
        message: "Event logged successfully",
        event: event,
      });
    } catch (err) {
      console.error("Unexpected error in event route:", err);
      res.status(500).json({ error: "Server error: " + err.message });
    }
  }
);

// Helper functions to get player and team names
async function getPlayerName(playerId) {
  try {
    const { data: player } = await supabase
      .from("players")
      .select("name")
      .eq("id", playerId)
      .single();
    return player?.name || "Player";
  } catch (error) {
    return "Player";
  }
}

async function getTeamName(teamId) {
  try {
    const { data: team } = await supabase
      .from("teams")
      .select("name")
      .eq("id", teamId)
      .single();
    return team?.name || "Team";
  } catch (error) {
    return "Team";
  }
}

// Generate automatic commentary for events
const generateAutoCommentary = (event) => {
  const { event_type, player, team, minute, goal_type } = event;

  switch (event_type) {
    case "goal":
      return `${player?.name} scores for ${team?.name} at ${minute}'!`;
    case "own_goal":
      return `OWN GOAL! ${player?.name} accidentally scores for the opposition at ${minute}'.`;
    case "penalty_goal":
      return `${player?.name} converts the penalty for ${team?.name} at ${minute}'!`;
    case "penalty_miss":
      return `${player?.name} misses the penalty for ${team?.name} at ${minute}'.`;
    case "red_card":
      return `RED CARD! ${player?.name} sent off for ${team?.name} at ${minute}'.`;
    case "second_yellow":
      return `SECOND YELLOW! ${player?.name} receives a second yellow and is sent off at ${minute}'.`;
    default:
      return `${event_type.replace("_", " ")} at ${minute}'`;
  }
};

// Get match lineup (starting XI and substitutes) - USING YOUR LINEUP TABLES
router.get("/:matchId/lineup/:teamId", authenticateJWT, async (req, res) => {
  try {
    const { matchId, teamId } = req.params;

    const { data: lineup, error } = await supabase
      .from("match_lineups")
      .select(
        `
        *,
        lineup_players(
          *,
          player:player_id(*)
        ),
        formation:formation_id(*)
      `
      )
      .eq("match_id", matchId)
      .eq("team_id", teamId)
      .single();

    if (error) return res.status(400).json({ error: error.message });

    if (!lineup) {
      return res.status(404).json({ error: "Lineup not found" });
    }

    // Separate starters and substitutes using your is_starter field
    const starters = lineup.lineup_players.filter((p) => p.is_starter);
    const substitutes = lineup.lineup_players.filter((p) => !p.is_starter);

    res.json({
      lineup: {
        ...lineup,
        starters,
        substitutes,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update commentary
router.put(
  "/comment/:commentId",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { commentId } = req.params;
      const { data, error } = await supabase
        .from("commentary")
        .update({
          ...req.body,
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId)
        .select(
          `
          *,
          user:created_by(
            id, email, role
          )
        `
        )
        .single();

      if (error || !data) {
        return res.status(400).json({
          error: error?.message || "Update failed",
        });
      }

      res.json({
        message: "Commentary updated successfully",
        commentary: data,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete commentary
router.delete(
  "/comment/:commentId",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { commentId } = req.params;
      const { error } = await supabase
        .from("commentary")
        .delete()
        .eq("id", commentId);

      if (error) return res.status(400).json({ error: error.message });

      res.json({ message: "Commentary deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get match summary with all events and commentary
router.get("/:matchId/summary", authenticateJWT, async (req, res) => {
  try {
    const { matchId } = req.params;

    // Get match details
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select(
        `
        *,
        home_team:home_team_id(*),
        away_team:away_team_id(*),
        venue:venue_id(*),
        match_stats(*)
      `
      )
      .eq("id", matchId)
      .single();

    if (matchError) return res.status(400).json({ error: matchError.message });

    // Get all events
    const { data: events } = await supabase
      .from("match_events")
      .select(
        `
        *,
        player:player_id(*),
        team:team_id(*),
        related_player:related_player_id(*)
      `
      )
      .eq("match_id", matchId)
      .order("minute", { ascending: true });

    // Get all commentary
    const { data: commentary } = await supabase
      .from("commentary")
      .select(
        `
        *,
        user:created_by(*)
      `
      )
      .eq("match_id", matchId)
      .order("minute", { ascending: true });

    // Get substitutions from your match_substitutions table
    const { data: substitutions } = await supabase
      .from("match_substitutions")
      .select(
        `
        *,
        player_out:player_out_id(*),
        player_in:player_in_id(*),
        team:team_id(*)
      `
      )
      .eq("match_id", matchId)
      .order("minute", { ascending: true });

    res.json({
      match,
      events: events || [],
      commentary: commentary || [],
      substitutions: substitutions || [],
      timeline: generateTimeline(events, commentary),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Generate combined timeline of events and commentary
const generateTimeline = (events = [], commentary = []) => {
  const timeline = [];

  // Add events to timeline
  events.forEach((event) => {
    timeline.push({
      type: "event",
      id: event.id,
      minute: event.minute,
      data: event,
      timestamp: event.created_at,
    });
  });

  // Add commentary to timeline
  commentary.forEach((comment) => {
    timeline.push({
      type: "commentary",
      id: comment.id,
      minute: comment.minute,
      data: comment,
      timestamp: comment.created_at,
    });
  });

  // Sort by minute and timestamp
  return timeline.sort((a, b) => {
    if (a.minute !== b.minute) return a.minute - b.minute;
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
};

// Get live matches for commentary
router.get("/matches", authenticateJWT, async (req, res) => {
  try {
    const { data: matches, error } = await supabase
      .from("matches")
      .select(
        `
        *,
        home_team:home_team_id(*),
        away_team:away_team_id(*),
        venue:venue_id(*)
      `
      )
      .in("status", [
        "scheduled",
        "first_half",
        "half_time",
        "second_half",
        "extra_time",
        "penalties",
      ])
      .order("match_date", { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update match status
router.patch(
  "/:matchId/status",
  authenticateJWT,
  authorizeRoles("admin", "manager", "commentator"),
  async (req, res) => {
    try {
      const { matchId } = req.params;
      const { status, minute } = req.body;

      const { data, error } = await supabase
        .from("matches")
        .update({
          status,
          minute: minute !== undefined ? minute : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", matchId)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      res.json({
        message: "Match status updated successfully",
        match: data,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get live matches (alternative endpoint)
router.get("/matches/live", authenticateJWT, async (req, res) => {
  try {
    const { data: matches, error } = await supabase
      .from("matches")
      .select(
        `
        *,
        home_team:home_team_id(*),
        away_team:away_team_id(*),
        venue:venue_id(*)
      `
      )
      .in("status", [
        "scheduled",
        "first_half",
        "half_time",
        "second_half",
        "extra_time",
        "penalties",
      ])
      .order("match_date", { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start commentary - sets match to live with current date/time
// In your commentary routes - Fix the start endpoint
router.post(
  "/:matchId/start",
  authenticateJWT,
  authorizeRoles("admin", "manager", "commentator"),
  async (req, res) => {
    try {
      const { matchId } = req.params;
      const now = new Date();

      console.log("Starting commentary for match:", matchId);

      // Update match to live status with minute 0
      const { data: match, error } = await supabase
        .from("matches")
        .update({
          status: "first_half", // CRITICAL: Change to first_half, not live
          minute: 0, // CRITICAL: Start from 0, not 1
          match_date: now.toISOString().split("T")[0],
          match_time: now.toTimeString().split(" ")[0],
          updated_at: now.toISOString(),
        })
        .eq("id", matchId)
        .select()
        .single();

      if (error) {
        console.error("Error starting commentary:", error);
        throw error;
      }

      console.log("Match updated successfully:", match);

      res.json({
        message: "Commentary started successfully",
        match: match,
      });
    } catch (err) {
      console.error("Start commentary error:", err);
      res.status(500).json({ error: "Server error: " + err.message });
    }
  }
);

// Pause commentary
router.post(
  "/:matchId/pause",
  authenticateJWT,
  authorizeRoles("admin", "manager", "commentator"),
  async (req, res) => {
    try {
      const { matchId } = req.params;

      const { data: match, error } = await supabase
        .from("matches")
        .update({
          status: "half_time",
          updated_at: new Date().toISOString(),
        })
        .eq("id", matchId)
        .select()
        .single();

      if (error) throw error;

      res.json({ message: "Commentary paused", match });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Resume commentary
router.post(
  "/:matchId/resume",
  authenticateJWT,
  authorizeRoles("admin", "manager", "commentator"),
  async (req, res) => {
    try {
      const { matchId } = req.params;

      const { data: match, error } = await supabase
        .from("matches")
        .update({
          status: "second_half",
          updated_at: new Date().toISOString(),
        })
        .eq("id", matchId)
        .select()
        .single();

      if (error) throw error;

      res.json({ message: "Commentary resumed", match });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Auto-increment minute (for offline mode)
router.post(
  "/:matchId/increment-minute",
  authenticateJWT,
  authorizeRoles("admin", "manager", "commentator"),
  async (req, res) => {
    try {
      const { matchId } = req.params;
      const { increment = 1 } = req.body;

      // Get current match
      const { data: match, error: fetchError } = await supabase
        .from("matches")
        .select("minute, status")
        .eq("id", matchId)
        .single();

      if (fetchError) throw fetchError;

      let newMinute = Math.min((match.minute || 0) + increment, 90);
      let newStatus = match.status;

      // Auto-update status based on minute
      if (newMinute > 45 && match.status === "first_half") {
        newStatus = "half_time";
      } else if (newMinute > 90 && match.status === "second_half") {
        newStatus = "full_time";
      }

      const { data: updatedMatch, error } = await supabase
        .from("matches")
        .update({
          minute: newMinute,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", matchId)
        .select()
        .single();

      if (error) throw error;

      res.json({
        message: "Minute incremented",
        match: updatedMatch,
      });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// End match (set to full_time)
router.post(
  "/:matchId/end",
  authenticateJWT,
  authorizeRoles("admin", "manager", "commentator"),
  async (req, res) => {
    try {
      const { matchId } = req.params;

      const { data: match, error } = await supabase
        .from("matches")
        .update({
          status: "full_time",
          minute: 90,
          updated_at: new Date().toISOString(),
        })
        .eq("id", matchId)
        .select()
        .single();

      if (error) throw error;

      res.xjson({ message: "Match ended", match });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
