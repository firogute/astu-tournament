import { Router } from "express";
import { supabase } from "../lib/supabaseClient.ts";
import {
  authenticateJWT,
  authorizeRoles,
  AuthRequest,
} from "../middleware/auth.ts";

const router: Router = Router();

// Get all players (accessible to all logged-in users)
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const { data, error } = await supabase.from("players").select("*");

    if (error) return res.status(400).json({ error: error.message });

    res.json({ players: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single player by ID
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data)
      return res.status(404).json({ error: "Player not found" });

    res.json({ player: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new player (admin or manager only)
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin", "manager"),
  async (req: AuthRequest, res) => {
    try {
      const playerData = req.body;

      const { data, error } = await supabase
        .from("players")
        .insert(playerData, { returning: "representation" });

      if (error) return res.status(400).json({ error: error.message });

      res.status(201).json({ message: "Player created", player: data[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
