import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import playersRoutes from "./routes/players";
import matchesRoutes from "./routes/matches";
import teamsRoutes from "./routes/teams";
import tournamentsRoutes from "./routes/tournaments";
import matchStatsRoutes from "./routes/matchStats";
import playerMatchStatsRoutes from "./routes/playerMatchStats";
import matchEventsRoutes from "./routes/matchEvents";
import commentaryRoutes from "./routes/commentary";
import teamStandingsRoutes from "./routes/teamStandings";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/players", playersRoutes);
app.use("/api/matches", matchesRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/tournaments", tournamentsRoutes);
app.use("/api/match-stats", matchStatsRoutes);
app.use("/api/player-match-stats", playerMatchStatsRoutes);
app.use("/api/match-events", matchEventsRoutes);
app.use("/api/commentary", commentaryRoutes);
app.use("/api/team/standings", teamStandingsRoutes);

// Example route
app.get("/", (req, res) => {
  res.send("API is running");
});

// TODO: Add your auth, matches, players routes here

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
