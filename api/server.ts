import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.ts";
import playersRoutes from "./routes/players.ts";
import matchesRoutes from "./routes/matches.ts";
import teamsRoutes from "./routes/teams.ts";
import tournamentsRoutes from "./routes/tournaments.ts";
import matchStatsRoutes from "./routes/matchstats.ts";
import playerMatchStatsRoutes from "./routes/playerMatchStats.ts";

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

// Example route
app.get("/", (req, res) => {
  res.send("API is running");
});

// TODO: Add your auth, matches, players routes here

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
