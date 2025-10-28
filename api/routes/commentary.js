import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.js";

const router = Router();

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
    // Get match details
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
        updateData = { away_score: match.away_score + 1 };
      } else {
        updateData = { home_score: match.home_score + 1 };
      }
    } else {
      // Normal goal
      if (teamId === match.home_team_id) {
        updateData = { home_score: match.home_score + 1 };
      } else {
        updateData = { away_score: match.away_score + 1 };
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

  // Update match stats for events like corners, fouls, offsides
  await updateMatchStats(match_id, team_id, event_type);
};

// Update match statistics - USING YOUR EXACT match_stats TABLE FIELDS
const updateMatchStats = debounce(async (matchId, teamId, statType) => {
  try {
    // Get current match to determine home/away
    const { data: match } = await supabase
      .from("matches")
      .select("home_team_id, away_team_id")
      .eq("id", matchId)
      .single();

    if (!match) return;

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
    if (!statField) return;

    // Get current stats
    const { data: currentStats } = await supabase
      .from("match_stats")
      .select("*")
      .eq("match_id", matchId)
      .single();

    const updates = {
      [statField]: (currentStats?.[statField] || 0) + 1,
      updated_at: new Date().toISOString(),
    };

    if (currentStats) {
      await supabase
        .from("match_stats")
        .update(updates)
        .eq("match_id", matchId);
    } else {
      await supabase
        .from("match_stats")
        .insert([{ match_id: matchId, ...updates }]);
    }
  } catch (error) {
    console.error("Error updating match stats:", error);
  }
}, 1000); // Debounce for 1 second

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

// Add match event with comprehensive database updates - USING YOUR SCHEMA
router.post(
  "/:matchId/event",
  authenticateJWT,
  authorizeRoles("admin", "manager", "commentator"),
  async (req, res) => {
    try {
      const { matchId } = req.params;
      const {
        event_type,
        minute,
        player_id,
        related_player_id, // USING YOUR SCHEMA FIELD NAME
        team_id,
        description,
        goal_type, // Using your additional field
        is_penalty_scored, // Using your additional field
        event_data, // Using your JSONB field
      } = req.body;

      // Validate required fields
      if (!event_type || minute === undefined || !team_id) {
        return res.status(400).json({
          error: "Event type, minute, and team ID are required",
        });
      }

      // Validate event_type matches your schema constraints
      const validEventTypes = [
        "goal",
        "own_goal",
        "penalty_goal",
        "penalty_miss",
        "yellow_card",
        "red_card",
        "second_yellow",
        "substitution_in",
        "substitution_out",
        "injury",
        "var_decision",
        "corner",
        "free_kick",
        "offside",
      ];

      if (!validEventTypes.includes(event_type)) {
        return res.status(400).json({
          error: `Invalid event type. Must be one of: ${validEventTypes.join(
            ", "
          )}`,
        });
      }

      const eventData = {
        match_id: matchId,
        event_type,
        minute,
        player_id: player_id || null,
        related_player_id: related_player_id || null, // USING YOUR FIELD NAME
        team_id,
        description: description || `${event_type} at ${minute}'`,
        goal_type: goal_type || null, // Your additional field
        is_penalty_scored: is_penalty_scored || null, // Your additional field
        event_data: event_data || null, // Your JSONB field
        created_at: new Date().toISOString(),
      };

      // Start transaction-like process
      const { data: event, error: eventError } = await supabase
        .from("match_events")
        .insert([eventData])
        .select(
          `
          *,
          player:player_id(name, jersey_number),
          team:team_id(name, short_name),
          related_player:related_player_id(name, jersey_number)
        `
        )
        .single();

      if (eventError) {
        return res.status(400).json({ error: eventError.message });
      }

      // Handle the event with all database updates
      await handleMatchEvent(eventData);

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
        const autoCommentary = generateAutoCommentary(event);
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
      }

      res.status(201).json({
        message: "Event logged successfully",
        event: event,
        autoCommentary: [
          "goal",
          "own_goal",
          "penalty_goal",
          "red_card",
          "penalty_miss",
        ].includes(event_type),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

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

// Add these routes to your commentary.js file:

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

export default router;
