import { Router } from "express";
import { supabase } from "../../lib/supabaseClient.js";
import { authenticateJWT, authorizeRoles } from "../../middleware/auth.js";

const router = Router();

// GET ALL USERS
router.get("/", authenticateJWT, authorizeRoles("admin"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        *,
        team:teams(name, short_name)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET USER BY ID
router.get(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from("users")
        .select(
          `
        *,
        team:teams(*)
      `
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ success: true, data });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// CREATE USER
router.post("/", authenticateJWT, authorizeRoles("admin"), async (req, res) => {
  try {
    const { email, role, team_id, is_active = true } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Create user (password will be set via email invitation)
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email,
          role: role || "commentator",
          team_id: team_id || null,
          is_active,
          password_hash: "temp_password_needs_reset", // User will reset via email
        },
      ])
      .select(
        `
        *,
        team:teams(name)
      `
      )
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "User created successfully. Password reset required.",
      data,
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE USER
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { email, role, team_id, is_active } = req.body;

      // Check if user exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", id)
        .single();

      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check email uniqueness if changing email
      if (email && email !== existingUser.email) {
        const { data: emailUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .single();

        if (emailUser) {
          return res.status(400).json({ error: "Email already in use" });
        }
      }

      const { data, error } = await supabase
        .from("users")
        .update({
          email,
          role,
          team_id: team_id || null,
          is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(
          `
        *,
        team:teams(name)
      `
        )
        .single();

      if (error) throw error;

      res.json({
        success: true,
        message: "User updated successfully",
        data,
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE USER
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (req.user.id === id) {
        return res
          .status(400)
          .json({ error: "Cannot delete your own account" });
      }

      // Check if user exists
      const { data: user } = await supabase
        .from("users")
        .select("email, role")
        .eq("id", id)
        .single();

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from("users")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      res.json({
        success: true,
        message: `User ${user.email} deactivated successfully`,
      });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// REACTIVATE USER
router.patch(
  "/:id/reactivate",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const { data: user } = await supabase
        .from("users")
        .select("email")
        .eq("id", id)
        .single();

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { error } = await supabase
        .from("users")
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      res.json({
        success: true,
        message: `User ${user.email} reactivated successfully`,
      });
    } catch (error) {
      console.error("Reactivate user error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
