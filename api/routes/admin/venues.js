import { Router } from "express";
import { supabase } from "../../lib/supabaseClient.js";
import { authenticateJWT, authorizeRoles } from "../../middleware/auth.js";

const router = Router();

// GET ALL VENUES
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .order("name");

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, data: data || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET VENUE BY ID
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data)
      return res.status(404).json({ error: "Venue not found" });
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// CREATE VENUE (ADMIN ONLY)
router.post("/", authenticateJWT, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, location, capacity, facilities } = req.body;

    // Validate required fields
    if (!name || !location) {
      return res.status(400).json({ error: "Name and location are required" });
    }

    const { data, error } = await supabase
      .from("venues")
      .insert([
        {
          name,
          location,
          capacity: capacity || 0,
          facilities: facilities || { seats: "metal", lighting: true },
        },
      ])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({
      success: true,
      message: "Venue created successfully",
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE VENUE (ADMIN ONLY)
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, location, capacity, facilities } = req.body;

      // Check if venue exists
      const { data: existingVenue } = await supabase
        .from("venues")
        .select("id")
        .eq("id", id)
        .single();

      if (!existingVenue) {
        return res.status(404).json({ error: "Venue not found" });
      }

      const { data, error } = await supabase
        .from("venues")
        .update({
          name,
          location,
          capacity,
          facilities,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        message: "Venue updated successfully",
        data,
      });
    } catch (error) {
      console.error("Update venue error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE VENUE (ADMIN ONLY)
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // First, check if venue exists
      const { data: venue, error: fetchError } = await supabase
        .from("venues")
        .select("name")
        .eq("id", id)
        .single();

      if (fetchError || !venue) {
        return res.status(404).json({ error: "Venue not found" });
      }

      // Check if venue has matches scheduled
      const { data: matches, error: matchesError } = await supabase
        .from("matches")
        .select("id")
        .eq("venue_id", id)
        .limit(1);

      if (matchesError) throw matchesError;

      if (matches && matches.length > 0) {
        return res.status(400).json({
          error:
            "Cannot delete venue with scheduled matches. Please reassign matches first.",
        });
      }

      // Delete the venue
      const { error } = await supabase.from("venues").delete().eq("id", id);

      if (error) throw error;

      res.json({
        success: true,
        message: `Venue "${venue.name}" deleted successfully`,
      });
    } catch (error) {
      console.error("Delete venue error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// GET VENUE WITH MATCHES
router.get("/:id/matches", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("matches")
      .select(
        `
        *,
        home_team:home_team_id(name, short_name),
        away_team:away_team_id(name, short_name),
        tournament:tournaments(name, season)
      `
      )
      .eq("venue_id", id)
      .order("match_date", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Get venue matches error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
