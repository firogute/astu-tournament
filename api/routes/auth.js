import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { supabase } from "../lib/supabaseClient.js";

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
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: data.id,
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
    const { email, password, role, team_id } = req.body;

    const allowedRoles = ["admin", "manager", "commentator"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase.from("users").insert(
      {
        email,
        password_hash: hash,
        role,
        team_id: team_id || null,
        is_active: true,
      },
      { returning: "representation" }
    );

    if (error || !data || data.length === 0) {
      return res.status(400).json({
        error: error?.message ?? "Failed to create user",
      });
    }

    res.json({
      success: true,
      message: "User created successfully",
      user: data[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create default users for all roles
router.post("/create-default-users", async (req, res) => {
  try {
    const defaultUsers = [
      {
        email: "admin@astu.edu.et",
        password: "Admin123!",
        role: "admin",
        team_id: null,
      },
      {
        email: "manager@astu.edu.et",
        password: "Manager123!",
        role: "manager",
        team_id: null, // You can set a specific team_id here
      },
      {
        email: "commentator@astu.edu.et",
        password: "Commentator123!",
        role: "commentator",
        team_id: null,
      },
    ];

    const results = [];

    for (const userData of defaultUsers) {
      const { email, password, role, team_id } = userData;

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

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

      const { data, error } = await supabase.from("users").insert(
        {
          email,
          password_hash: hash,
          role,
          team_id,
          is_active: true,
        },
        { returning: "representation" }
      );

      if (error) {
        results.push({
          email,
          status: "error",
          error: error.message,
        });
      } else {
        results.push({
          email,
          status: "created",
          user: data[0],
          password: password, // Only for demo purposes
        });
      }
    }

    res.json({
      success: true,
      message: "Default users creation completed",
      results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Verify token
router.get("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists and is active
    const { data, error } = await supabase
      .from("users")
      .select("id, role, is_active, team_id")
      .eq("id", decoded.id)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: "Invalid token" });
    }

    if (!data.is_active) {
      return res.status(403).json({ error: "Account deactivated" });
    }

    res.json({
      valid: true,
      user: {
        id: data.id,
        role: data.role,
        team_id: data.team_id,
      },
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data, error } = await supabase
      .from("users")
      .select(
        `
        id,
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
      .eq("id", decoded.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: data,
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
