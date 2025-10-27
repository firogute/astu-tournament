import { Router } from "express";
import { supabase } from "../../lib/supabaseClient.js";
import { authenticateJWT, authorizeRoles } from "../../middleware/auth.js";

const router = Router();

// GET ALL SETTINGS
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const { data, error } = await supabase.from("system_settings").select("*");

    if (error) throw error;

    // Convert to key-value object
    const settings = {};
    data?.forEach((setting) => {
      settings[setting.key] = setting.value;
    });

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE SETTINGS
router.put("/", authenticateJWT, authorizeRoles("admin"), async (req, res) => {
  try {
    const { settings } = req.body;
    const userId = req.user.id;

    if (!settings || typeof settings !== "object") {
      return res.status(400).json({ error: "Settings object is required" });
    }

    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    }));

    // Upsert all settings
    const { error } = await supabase.from("system_settings").upsert(updates);

    if (error) throw error;

    res.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET SPECIFIC SETTING
router.get("/:key", authenticateJWT, async (req, res) => {
  try {
    const { key } = req.params;

    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .eq("key", key)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Setting not found" });
      }
      throw error;
    }

    res.json({
      success: true,
      data: data.value,
    });
  } catch (error) {
    console.error("Get setting error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
