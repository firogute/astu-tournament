import { Router } from "express";
import { supabase } from "../lib/supabaseClient.ts";
import {
  authenticateJWT,
  authorizeRoles,
  AuthRequest,
} from "../middleware/auth.ts";

const router: Router = Router();

// Get all tournaments
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const { data, error } = await supabase.from("tournaments").select("*");
    if (error) return res.status(400).json({ error: error.message });
    res.json({ tournaments: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get tournament by ID
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data)
      return res.status(404).json({ error: "Tournament not found" });
    res.json({ tournament: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create tournament (admin only)
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req: AuthRequest, res) => {
    try {
      const tournamentData = req.body;
      const { data, error } = await supabase
        .from("tournaments")
        .insert(tournamentData, { returning: "representation" });
      if (error) return res.status(400).json({ error: error.message });
      res
        .status(201)
        .json({ message: "Tournament created", tournament: data[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
