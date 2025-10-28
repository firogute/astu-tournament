import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { supabase } from "../lib/supabaseClient.js";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// Universal login route for all roles
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if user is active
    if (!data.is_active) {
      return res.status(403).json({ error: "Account is deactivated" });
    }

    // If role is specified, verify user has that role
    if (role && data.role !== role) {
      return res.status(403).json({
        error: `Access denied. ${role} privileges required.`,
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, data.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last login
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", data.id);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: data.id,
        email: data.email,
        role: data.role,
        team_id: data.team_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        team_id: data.team_id,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Register route for all roles
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, team_id } = req.body;

    console.log("Register user with data:", { name, email, role, team_id });

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const allowedRoles = ["admin", "manager", "commentator"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Check user error:", checkError);
      return res.status(400).json({ error: checkError.message });
    }

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const { data, error: insertError } = await supabase
      .from("users")
      .insert({
        name,
        email,
        password_hash: hash,
        role,
        team_id: team_id || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return res.status(400).json({ error: insertError.message });
    }

    if (!data || data.length === 0) {
      return res.status(500).json({ error: "User creation failed" });
    }

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: data[0],
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// Create default users for all roles (Admin only)
router.post(
  "/create-default-users",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const defaultUsers = [
        {
          name: "System Administrator",
          email: "admin@astu.edu.et",
          password: "Admin123!",
          role: "admin",
          team_id: null,
        },
        {
          name: "Team Manager",
          email: "manager@astu.edu.et",
          password: "Manager123!",
          role: "manager",
          team_id: null,
        },
        {
          name: "Match Commentator",
          email: "commentator@astu.edu.et",
          password: "Commentator123!",
          role: "commentator",
          team_id: null,
        },
      ];

      const results = [];

      for (const userData of defaultUsers) {
        const { name, email, password, role, team_id } = userData;

        // Check if user already exists
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          results.push({
            email,
            status: "error",
            error: checkError.message,
          });
          continue;
        }

        if (existingUser) {
          results.push({
            email,
            status: "exists",
            user: existingUser,
          });
          continue;
        }

        // Create user
        const hash = await bcrypt.hash(password, 10);

        const { data, error: insertError } = await supabase
          .from("users")
          .insert({
            name,
            email,
            password_hash: hash,
            role,
            team_id,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();

        if (insertError) {
          results.push({
            email,
            status: "error",
            error: insertError.message,
          });
        } else if (!data || data.length === 0) {
          results.push({
            email,
            status: "error",
            error: "User created but verification failed",
          });
        } else {
          results.push({
            email,
            status: "created",
            user: data[0],
          });
        }
      }

      res.json({
        success: true,
        message: "Default users creation completed",
        results,
      });
    } catch (err) {
      console.error("Create default users error:", err);
      res.status(500).json({ error: "Server error: " + err.message });
    }
  }
);

// Verify token (using middleware)
router.get("/verify", authenticateJWT, async (req, res) => {
  try {
    // User is already verified by middleware, just get fresh data
    const { data, error } = await supabase
      .from("users")
      .select("id, name, role, is_active, team_id")
      .eq("id", req.user.id)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: "User not found" });
    }

    if (!data.is_active) {
      return res.status(403).json({ error: "Account deactivated" });
    }

    res.json({
      success: true,
      valid: true,
      user: {
        id: data.id,
        name: data.name,
        role: data.role,
        team_id: data.team_id,
      },
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Get user profile (using middleware)
router.get("/profile", authenticateJWT, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        id,
        name,
        email,
        role,
        team_id,
        created_at,
        last_login,
        is_active,
        teams (
          id,
          name,
          short_name
        )
      `
      )
      .eq("id", req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: data,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create a specific user manually (Admin only)
router.post("/create-user", async (req, res) => {
  try {
    const { name, email, password, role, team_id } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const allowedRoles = ["admin", "manager", "commentator"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      return res.status(400).json({ error: checkError.message });
    }

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const { data, error: insertError } = await supabase
      .from("users")
      .insert({
        name,
        email,
        password_hash: hash,
        role,
        team_id: team_id || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (insertError) {
      return res.status(400).json({ error: insertError.message });
    }

    if (!data || data.length === 0) {
      return res.status(500).json({ error: "User creation failed" });
    }

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: data[0],
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// Get all users (Admin only)
router.get(
  "/users",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          `
        id,
        name,
        email,
        role,
        team_id,
        is_active,
        created_at,
        last_login,
        teams (
          id,
          name,
          short_name
        )
      `
        )
        .order("created_at", { ascending: false });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({
        success: true,
        users: data || [],
      });
    } catch (err) {
      console.error("Get users error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update user (Admin only)
router.put(
  "/users/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, role, team_id, is_active } = req.body;

      const updateData = {
        updated_at: new Date().toISOString(),
      };

      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (team_id !== undefined) updateData.team_id = team_id;
      if (is_active !== undefined) updateData.is_active = is_active;

      const { data, error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        success: true,
        message: "User updated successfully",
        user: data[0],
      });
    } catch (err) {
      console.error("Update user error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get current user (for any authenticated user)
router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        id,
        name,
        email,
        role,
        team_id,
        is_active,
        created_at,
        last_login
      `
      )
      .eq("id", req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: data,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
