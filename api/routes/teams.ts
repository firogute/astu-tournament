import { Router } from "express";
import { supabase } from "../lib/supabaseClient.ts";
import {
  authenticateJWT,
  authorizeRoles,
  type AuthRequest,
} from "../middleware/auth.ts";

const router: Router = Router();

// Get all teams
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("teams").select("*");
    if (error) return res.status(400).json({ error: error.message });
    res.json({ teams: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get team by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data)
      return res.status(404).json({ error: "Team not found" });
    res.json({ team: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new team (admin/manager only)
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin", "manager"),
  async (req: AuthRequest, res) => {
    try {
      const teamData = req.body;
      const { data, error } = await supabase
        .from("teams")
        .insert(teamData, { returning: "representation" });
      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json({ message: "Team created", team: data[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
