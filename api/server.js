import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import playersRoutes from "./routes/players.js";
import matchesRoutes from "./routes/matches.js";
import teamsRoutes from "./routes/teams.js";
import tournamentsRoutes from "./routes/tournaments.js";
import matchStatsRoutes from "./routes/matchStats.js";
import playerMatchStatsRoutes from "./routes/playerMatchStats.js";
import matchEventsRoutes from "./routes/matchEvents.js";
import commentaryRoutes from "./routes/commentary.js";
import teamStandingsRoutes from "./routes/teamStandings.js";
import adminRoutes from "./routes/admin.js";
import venuesRoutes from "./routes/venues.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

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
app.use("/api/admin", adminRoutes);
app.use("/api/venues", venuesRoutes);

// Example route
app.get("/", (req, res) => {
  res.send("API is running");
});

// TODO: Add your auth, matches, players routes here

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
