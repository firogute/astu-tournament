import { Router } from "express";
import { supabase } from "../lib/supabaseClient.ts";
import {
  authenticateJWT,
  authorizeRoles,
  AuthRequest,
} from "../middleware/auth.ts";

const router: Router = Router();

// Get standings for a tournament
router.get("/:tournamentId", authenticateJWT, async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { data, error } = await supabase
      .from("team_standings")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("points", { ascending: false })
      .order("goal_difference", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ standings: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Refresh standings (admin/manager only)
router.post(
  "/refresh/:tournamentId",
  authenticateJWT,
  authorizeRoles("admin", "manager"),
  async (req: AuthRequest, res) => {
    try {
      const { tournamentId } = req.params;

      // Fetch matches of the tournament
      const { data: matches, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .eq("tournament_id", tournamentId);

      if (matchesError)
        return res.status(400).json({ error: matchesError.message });

      const standingsMap: any = {};

      for (const match of matches) {
        const homeId = match.home_team_id;
        const awayId = match.away_team_id;
        const homeScore = match.home_score || 0;
        const awayScore = match.away_score || 0;

        if (!standingsMap[homeId])
          standingsMap[homeId] = {
            matches_played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goals_for: 0,
            goals_against: 0,
            points: 0,
          };
        if (!standingsMap[awayId])
          standingsMap[awayId] = {
            matches_played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goals_for: 0,
            goals_against: 0,
            points: 0,
          };

        standingsMap[homeId].matches_played++;
        standingsMap[awayId].matches_played++;

        standingsMap[homeId].goals_for += homeScore;
        standingsMap[homeId].goals_against += awayScore;
        standingsMap[awayId].goals_for += awayScore;
        standingsMap[awayId].goals_against += homeScore;

        if (homeScore > awayScore) {
          standingsMap[homeId].wins++;
          standingsMap[homeId].points += 3;
          standingsMap[awayId].losses++;
        } else if (homeScore < awayScore) {
          standingsMap[awayId].wins++;
          standingsMap[awayId].points += 3;
          standingsMap[homeId].losses++;
        } else {
          standingsMap[homeId].draws++;
          standingsMap[awayId].draws++;
          standingsMap[homeId].points++;
          standingsMap[awayId].points++;
        }
      }

      // Upsert standings in DB
      for (const teamId in standingsMap) {
        const standing = standingsMap[teamId];
        await supabase.from("team_standings").upsert(
          {
            tournament_id: tournamentId,
            team_id: teamId,
            ...standing,
            goal_difference: standing.goals_for - standing.goals_against,
          },
          { onConflict: ["tournament_id", "team_id"] }
        );
      }

      res.json({ message: "Standings refreshed" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
